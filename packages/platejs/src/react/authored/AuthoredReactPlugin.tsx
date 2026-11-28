import * as React from 'react';

import { AuthoredPlugin, type AuthoredView } from '../../authored';
import {
  getViewPresentation,
  isDocumentView,
  type ViewPresentation,
} from '../../facade';
import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';
import { getEditorViewStore } from '../../internal/plugin/pluginStore';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import { type PluginConfiguration, toReactPlugin } from '../core';
import type { Editor } from '../editor';
import { redrawBlocks } from '../internal/block-redraws';
import { useEditorContext } from '../internal/plite-components';
import type { InternalReactPluginAdapterResult } from '../plugin/toReactPlugin';
import { useEditorSelector } from '../stores/plate/useEditorSelector';
import { createAnnotationPointerHandlers } from '../utils/annotationPointer.internal';

/** Per-presentation review interaction state owned by `AuthoredReactPlugin`. */
export type AuthoredReactViewState = Readonly<{
  activeId: string | null;
}>;

const findAuthoredElement = (target: EventTarget | null) => {
  const element =
    target instanceof globalThis.Element
      ? target
      : target instanceof globalThis.Node
        ? target.parentElement
        : null;

  return element?.closest('[data-editor-authored-change]') ?? null;
};

const authoredGroupIdAt = (event: {
  currentTarget: Element;
  target: EventTarget | null;
}) => {
  const element = findAuthoredElement(event.target);

  if (!element || !event.currentTarget.contains(element)) return null;

  return (
    element.getAttribute('data-editor-authored-groups')?.split(' ')[0] || null
  );
};

const viewKey = (view: AuthoredView) =>
  'intent' in view ? view.intent : `preview:${view.preview}`;

const getAuthoredViewStore = (editor: Editor) => {
  if (isDocumentView(editor) || !editor.plugin(AuthoredReactPlugin).installed) {
    return null;
  }

  const compiled = getCompiledPlatePlugin(editor, AuthoredPlugin.name);

  return compiled ? getEditorViewStore(editor, compiled) : null;
};

export const setActiveAuthoredId = (
  editor: Editor,
  activeId: string | null
) => {
  const store = getAuthoredViewStore(editor);

  if (!store || store.public.get('activeId') === activeId) return;

  store.public.set({ activeId });
};

const PRESENTATION_MOUNTS = new WeakMap<ViewPresentation, number>();

function AuthoredViewObserver({ children }: { children: React.ReactNode }) {
  const editor = useEditorContext();
  const view = useEditorSelector(
    editor,
    (current) => viewKey(current.plugin(AuthoredPlugin).read.view()),
    { dependsOn: 'authored' }
  );
  const previousViewRef = React.useRef<{ editor: Editor; view: string } | null>(
    null
  );

  React.useEffect(() => {
    const presentation = getViewPresentation(editor);
    const nextCount = (PRESENTATION_MOUNTS.get(presentation) ?? 0) + 1;

    PRESENTATION_MOUNTS.set(presentation, nextCount);

    return () => {
      const remaining = (PRESENTATION_MOUNTS.get(presentation) ?? 1) - 1;

      if (remaining <= 0) {
        PRESENTATION_MOUNTS.delete(presentation);
        setActiveAuthoredId(editor, null);
      } else {
        PRESENTATION_MOUNTS.set(presentation, remaining);
      }
    };
  }, [editor]);

  React.useEffect(() => {
    const previous = previousViewRef.current;

    previousViewRef.current = { editor, view };
    if (previous && previous.editor === editor && previous.view !== view) {
      setActiveAuthoredId(editor, null);
    }
  }, [editor, view]);

  React.useEffect(() => {
    const authored = editor.plugin(AuthoredPlugin);

    return authored.api.subscribeChanges(({ blocks, removed }) => {
      const store = getAuthoredViewStore(editor);
      const activeId = store
        ? (store.public.get('activeId') as string | null)
        : null;

      if (activeId && removed.includes(activeId)) {
        store?.public.set({ activeId: null });
      }
      redrawBlocks(editor, blocks);
    });
  }, [editor]);

  return children;
}

type AuthoredPluginDefinition = InternalPluginDefinitionOf<
  typeof AuthoredPlugin
>;
type AuthoredReactAdapter = Readonly<{
  initialViewState: () => AuthoredReactViewState;
  on: NonNullable<PluginConfiguration<AuthoredPluginDefinition>['on']>;
  slots: NonNullable<PluginConfiguration<AuthoredPluginDefinition>['slots']>;
}>;

const authoredReactAdapter: AuthoredReactAdapter = {
  initialViewState: (): AuthoredReactViewState => ({ activeId: null }),
  on: createAnnotationPointerHandlers({
    clear: (editor) => setActiveAuthoredId(editor, null),
    keyAt: authoredGroupIdAt,
    select: ({ editor, event }) =>
      setActiveAuthoredId(editor, authoredGroupIdAt(event)),
  }),
  slots: { wrapRoot: AuthoredViewObserver },
};

/** React interaction for pending authored changes in the mounted editor view. */
export const AuthoredReactPlugin: InternalReactPluginAdapterResult<
  typeof AuthoredPlugin,
  AuthoredReactAdapter
> = toReactPlugin(AuthoredPlugin, authoredReactAdapter);
