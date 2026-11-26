import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import type { RootKey } from '../..';
import { getSelection, isDOMElement, isDOMNode, isDOMText } from '../../dom';
import { findDOMRootRuntime } from '../../dom/internal';
import { isDOMHTMLElement } from '../../dom/utils/dom';
import type {
  EditableHandlerContext,
  EditableKeyDownHandler,
} from '../components/editable';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { applyUserKeyDownHandler } from './keyboard-input-strategy';
import { getEditorRuntimeOwner, toInternalRoot } from './runtime-editor-api';

type ExternalHostOwner = Readonly<{
  root: () => HTMLElement | null;
  focus: () => void;
  blur: (relatedTarget: EventTarget | null) => void;
  keyDown: (
    event: Readonly<{
      defaultPrevented: boolean;
      key: string;
      nativeEvent: KeyboardEvent;
      shiftKey: boolean;
    }>,
    deliver: () => void
  ) => void;
}>;

const EXTERNAL_HOSTS = new WeakMap<HTMLElement, ExternalHostOwner>();

export const registerExternalTextHost = (
  host: HTMLElement,
  owner: ExternalHostOwner
) => {
  if (EXTERNAL_HOSTS.has(host)) {
    throw new Error('The external text host already has an owner.');
  }
  EXTERNAL_HOSTS.set(host, owner);
  return () => {
    if (EXTERNAL_HOSTS.get(host) === owner) EXTERNAL_HOSTS.delete(host);
  };
};

export const getExternalTextHostOwner = (target: EventTarget | null) => {
  let node = target && 'nodeType' in target ? (target as Node) : null;
  while (node) {
    if (node.nodeType === 1) {
      const host = node as HTMLElement;
      const owner = EXTERNAL_HOSTS.get(host);
      if (owner && owner.root()?.contains(host)) return { host, owner };
    }
    node =
      node.parentNode ?? ('host' in node ? (node as ShadowRoot).host : null);
  }
  return null;
};

export type NestedEditable =
  | Readonly<{
      element: HTMLElement;
      kind: 'view';
      root: RootKey;
      view: ReactRuntimeEditor;
    }>
  | Readonly<{ element: HTMLElement; kind: 'foreign' }>;

export const findNestedEditable = (
  editorElement: Element,
  target: EventTarget | null
): NestedEditable | null => {
  const element = isDOMElement(target)
    ? target
    : isDOMText(target)
      ? target.parentElement
      : null;
  const nested = element?.closest('[data-editor="true"]');

  if (
    !isDOMHTMLElement(nested) ||
    nested === editorElement ||
    !editorElement.contains(nested)
  ) {
    return null;
  }

  const runtime = findDOMRootRuntime(nested);
  const own = findDOMRootRuntime(editorElement);

  if (
    runtime?.rootRef.current !== nested ||
    !own ||
    getEditorRuntimeOwner(runtime.editor) !== getEditorRuntimeOwner(own.editor)
  ) {
    return { element: nested, kind: 'foreign' };
  }

  const view = runtime.editor as ReactRuntimeEditor;

  return {
    element: nested,
    kind: 'view',
    root: toInternalRoot(view.read((state) => state.view.root())),
    view,
  };
};

export const findSelectionNestedEditable = (editorElement: HTMLElement) => {
  const selection = getSelection(
    editorElement.getRootNode() as Document | ShadowRoot
  );
  const anchor = findNestedEditable(
    editorElement,
    selection?.anchorNode ?? null
  );

  return anchor &&
    anchor.element ===
      findNestedEditable(editorElement, selection?.focusNode ?? null)?.element
    ? anchor
    : null;
};

/** Registration, not a spoofable DOM attribute, grants foreign input ownership. */
export const getEditableInteractionOwner = (
  root: Element | null,
  target: EventTarget | null
) => {
  if (!root || !target || !('nodeType' in target)) return 'outside' as const;
  const external = getExternalTextHostOwner(target);
  if (external?.owner.root() === root) return 'external-text' as const;
  const node = target as Node;
  const element = node.nodeType === 1 ? (node as Element) : node.parentElement;
  if (!root.contains(node)) return 'outside' as const;
  if (findNestedEditable(root, node)) return 'nested-editor' as const;
  const within = (owner: Element | null | undefined) =>
    !!owner && owner !== root && root.contains(owner);
  if (
    within(element?.closest('input,textarea,select,button,[role="button"]'))
  ) {
    return 'control' as const;
  }
  if (within(element?.closest('[contenteditable="false"]'))) {
    return 'chrome' as const;
  }
  return 'editor' as const;
};

export const isDOMHandler = (name: string, value: unknown) =>
  /^on[A-Z]/.test(name) && typeof value === 'function';

type ViewHandler = (
  event: Readonly<{
    currentTarget: EventTarget | null;
    target: EventTarget | null;
  }>,
  context?: EditableHandlerContext
) => unknown;

type ViewHandlers<T> = {
  [K in keyof T]: K extends `on${string}`
    ? NonNullable<T[K]> extends (event: infer E, context: infer C) => infer R
      ? (event: E, context?: C) => R
      : T[K]
    : T[K];
};

export const createViewHandlerBinder = (context: EditableHandlerContext) => {
  const bound = new WeakMap<ViewHandler, ViewHandler>();

  return <T extends object>(props: T): ViewHandlers<T> =>
    Object.fromEntries(
      Object.entries(props).map(([name, value]) => {
        if (!isDOMHandler(name, value)) return [name, value];
        const handler = value as ViewHandler;
        let viewHandler = bound.get(handler);

        if (!viewHandler) {
          viewHandler = (event, handlerContext) =>
            isDOMElement(event.currentTarget) &&
            getEditableInteractionOwner(event.currentTarget, event.target) ===
              'nested-editor'
              ? undefined
              : handler(event, handlerContext ?? context);
          bound.set(handler, viewHandler);
        }
        return [name, viewHandler];
      })
    ) as ViewHandlers<T>;
};

type GuardedEvent = Readonly<{
  currentTarget: HTMLElement;
  defaultPrevented: boolean;
  relatedTarget?: EventTarget | null;
  target: EventTarget | null;
}>;

const routeExternalEvent = (
  event: GuardedEvent
): ExternalHostOwner | 'drop' | 'outer' => {
  // React bubbles a portal's events through its React parents, so a
  // popover an element renders reaches here from outside the editor.
  if (isDOMNode(event.target) && !event.currentTarget.contains(event.target)) {
    return 'drop';
  }
  const external = getExternalTextHostOwner(event.target);
  if (!external || !event.currentTarget.contains(external.host)) return 'outer';
  return external.owner.root() === event.currentTarget
    ? external.owner
    : 'drop';
};

/** Keep every React event family outside the outer editing pipeline. */
export const guardExternalTextEvents = <T extends object>(
  handlers: T,
  activate: () => void,
  yielded?: Readonly<{
    editor: EditableHandlerContext['editor'];
    onKeyDown?: EditableKeyDownHandler;
  }>
): T =>
  Object.fromEntries(
    Object.entries(handlers).map(([name, handler]) => {
      if (!/^on[A-Z]/.test(name) || typeof handler !== 'function') {
        return [name, handler];
      }
      if (name === 'onKeyDown') {
        return [
          name,
          (event: ReactKeyboardEvent<HTMLDivElement>) => {
            const route = routeExternalEvent(event);
            if (route === 'outer') return handler(event);
            if (route !== 'drop') {
              route.keyDown(event, () => {
                if (!yielded) return;
                applyUserKeyDownHandler({
                  editor: yielded.editor,
                  event,
                  handler: yielded.onKeyDown,
                });
              });
            }
            return undefined;
          },
        ];
      }
      return [
        name,
        (event: GuardedEvent) => {
          const route = routeExternalEvent(event);
          if (route === 'outer') return handler(event);
          if (route === 'drop') return undefined;
          if (name === 'onFocusCapture') {
            activate();
            route.focus();
          } else if (name === 'onBlurCapture') {
            route.blur(event.relatedTarget ?? null);
          } else if (name === 'onMouseDownCapture' && !event.defaultPrevented) {
            activate();
          }
          return undefined;
        },
      ];
    })
  ) as T;
