import { isDOMElement, isDOMNode } from '../../dom';
import type { EditableHandlerContext } from '../components/editable';

type ExternalHostOwner = Readonly<{
  root: () => HTMLElement | null;
  focus: () => void;
  blur: (relatedTarget: EventTarget | null) => void;
  keyDown: (
    event: Readonly<{
      defaultPrevented: boolean;
      key?: string;
      shiftKey?: boolean;
    }>
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
  const editor = element?.closest('[data-editor="true"]');
  if (editor && editor !== root) return 'nested-editor' as const;
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

/** Keep every React event family outside the outer editing pipeline. */
export const guardExternalTextEvents = <T extends object>(
  handlers: T,
  activate: () => void
): T =>
  Object.fromEntries(
    Object.entries(handlers).map(([name, handler]) => {
      if (!/^on[A-Z]/.test(name) || typeof handler !== 'function') {
        return [name, handler];
      }
      return [
        name,
        (event: {
          currentTarget: HTMLElement;
          defaultPrevented: boolean;
          key?: string;
          relatedTarget?: EventTarget | null;
          shiftKey?: boolean;
          target: EventTarget | null;
        }) => {
          // React bubbles a portal's events through its React parents, so a
          // popover an element renders reaches here from outside the editor.
          if (
            isDOMNode(event.target) &&
            !event.currentTarget.contains(event.target)
          ) {
            return undefined;
          }
          const external = getExternalTextHostOwner(event.target);
          if (external && event.currentTarget.contains(external.host)) {
            if (external.owner.root() === event.currentTarget) {
              if (name === 'onFocusCapture') {
                activate();
                external.owner.focus();
              } else if (name === 'onBlurCapture') {
                external.owner.blur(event.relatedTarget ?? null);
              } else if (name === 'onKeyDown') {
                external.owner.keyDown(event);
              } else if (name === 'onMouseDownCapture') activate();
            }
            return undefined;
          }
          return handler(event);
        },
      ];
    })
  ) as T;
