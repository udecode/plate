import React from 'react';

import { getEditorDOMRoot } from '../../dom/plite-dom.internal';
import {
  markRootViewUsed,
  readRootViewUse,
  subscribeEditorViewState,
  subscribeRootViewUse,
} from '../../facade';
import type { Editor } from '../editor/Editor';
import { useEditorRootElement } from '../plite-react';
import { trackEditableFocus } from '../stores/plate-controller/document-focus.internal';
import { createPlateTargetScope } from './createPlateTargetScope';
import { useEditorContext, useOptionalEditorContext } from './plite-components';

export type PlateTarget = {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
  editableRef: React.RefObject<HTMLElement | null>;
};

export type ViewFact = 'composing' | 'focused' | 'readOnly';

type ServerFacts = Readonly<Record<ViewFact | 'mounted', boolean>>;

export type PlateScope = Readonly<{
  getServerSnapshot: () => PlateTarget | null;
  getSnapshot: () => PlateTarget | null;
  server: ServerFacts | null;
  subscribe: (listener: () => void) => () => void;
  fallback?: PlateTarget | null;
  fixed?: PlateTarget | null;
}>;

const stopNothing = () => {};
export const subscribeNothing = () => stopNothing;

const readNothing = () => null;
const readTrue = () => true;
const readFalse = () => false;
export const readBoolean = (value: boolean) => (value ? readTrue : readFalse);

const readViewFact: Record<ViewFact, (editor: Editor) => boolean> = {
  composing: (editor) => editor.read.view.isComposing(),
  focused: (editor) => editor.read.view.isFocused(),
  readOnly: (editor) => editor.read.view.isReadOnly(),
};

const readServerFacts = ({ editor }: PlateTarget): ServerFacts => ({
  composing: readViewFact.composing(editor),
  focused: readViewFact.focused(editor),
  mounted: editor.api.dom.root() != null,
  readOnly: readViewFact.readOnly(editor),
});

const noTarget: PlateScope = {
  fixed: null,
  getServerSnapshot: readNothing,
  getSnapshot: readNothing,
  server: null,
  subscribe: subscribeNothing,
};

export const useFixedScope = (
  target: PlateTarget | null,
  answersForRoot = false
): PlateScope => {
  const [server] = React.useState(() => target && readServerFacts(target));
  return React.useMemo(() => {
    if (!target) return noTarget;
    const read = () => target;
    return {
      fallback: answersForRoot ? target : null,
      fixed: target,
      getServerSnapshot: read,
      getSnapshot: read,
      server,
      subscribe: subscribeNothing,
    };
  }, [answersForRoot, server, target]);
};

export const createPlateScope = () =>
  createPlateTargetScope<PlateTarget>((target) =>
    readRootViewUse(target.editor)
  );

export type PlateTargetScope = ReturnType<typeof createPlateScope>;

export const useLastUsedViewScope = (
  picker: PlateTargetScope,
  fallback: PlateTarget | null
): PlateScope => {
  const [server] = React.useState(() => fallback && readServerFacts(fallback));
  return React.useMemo(
    () => ({
      fallback,
      getServerSnapshot: () => fallback,
      getSnapshot: () => picker.getSnapshot() ?? fallback,
      server,
      subscribe: picker.subscribe,
    }),
    [fallback, picker, server]
  );
};

export const outsideEveryProvider: PlateScope = {
  fixed: null,
  getServerSnapshot: readNothing,
  getSnapshot: readNothing,
  server: null,
  subscribe: subscribeNothing,
};

const targets = new WeakMap<object, PlateTarget>();
export const getPlateTarget = (editor: Editor) => targets.get(editor);
export const PlateScopeContext = React.createContext(outsideEveryProvider);
export const PlateControllerContext =
  React.createContext<PlateTargetScope | null>(null);
export const PlateModelContext = React.createContext<{
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
  primary: boolean;
  readOnly: boolean;
  scope: PlateTargetScope;
} | null>(null);

export function usePlateModel() {
  const model = React.useContext(PlateModelContext);
  if (!model) throw new Error('EditorContent requires an EditorRoot.');
  return model;
}

export function usePlateTarget() {
  const scope = React.useContext(PlateScopeContext);
  return React.useSyncExternalStore(
    scope.subscribe,
    scope.getSnapshot,
    scope.getServerSnapshot
  );
}

const viewStateReaders = new WeakMap<
  Editor,
  { listeners: Set<() => void>; stop: () => void }
>();

const subscribeSharedViewState = (editor: Editor, listener: () => void) => {
  let readers = viewStateReaders.get(editor);
  if (!readers) {
    const listeners = new Set<() => void>();
    const stop = subscribeEditorViewState(editor, () => {
      for (const notify of listeners) notify();
    });
    readers = { listeners, stop };
    viewStateReaders.set(editor, readers);
  }
  const shared = readers;
  shared.listeners.add(listener);
  return () => {
    shared.listeners.delete(listener);
    if (shared.listeners.size > 0) return;
    shared.stop();
    viewStateReaders.delete(editor);
  };
};

export const useTargetViewState = (
  target: PlateTarget | null,
  fact: ViewFact,
  withoutEditor: boolean
) => {
  const { server } = React.useContext(PlateScopeContext);
  const editor = target?.editor;
  const readFact = React.useCallback(
    () => (editor ? readViewFact[fact](editor) : withoutEditor),
    [editor, fact, withoutEditor]
  );
  return React.useSyncExternalStore(
    React.useCallback(
      (listener: () => void) =>
        editor ? subscribeSharedViewState(editor, listener) : stopNothing,
      [editor]
    ),
    readFact,
    readBoolean(server?.[fact] ?? withoutEditor)
  );
};

/** Bind node renderers to the native view that owns their snapshot. */
export function usePlateRenderContext(fallbackEditor: Editor) {
  const nativeEditor = useOptionalEditorContext();
  const editor = nativeEditor ?? fallbackEditor;
  const inherited = React.useContext(PlateScopeContext).fixed ?? null;
  const emptyRef = React.useRef<HTMLDivElement | null>(null);
  const target = React.useMemo(
    () =>
      inherited?.editor === editor
        ? null
        : {
            editor,
            containerRef: inherited?.containerRef ?? emptyRef,
            editableRef: emptyRef,
          },
    [editor, inherited]
  );
  const scope = useFixedScope(target);

  return {
    editor,
    wrap: (children: React.ReactNode) =>
      !nativeEditor || !target ? (
        children
      ) : (
        <PlateScopeContext value={scope}>{children}</PlateScopeContext>
      ),
  };
}

export function PlateMountedView({
  children,
  editableRef,
}: {
  children: React.ReactNode;
  editableRef: React.RefObject<HTMLDivElement | null>;
}) {
  const model = usePlateModel();
  const editor = useEditorContext();
  const element = useEditorRootElement(editor);
  const controller = React.useContext(PlateControllerContext);
  const target = React.useMemo(() => {
    const value = { editor, containerRef: model.containerRef, editableRef };
    targets.set(editor, value);
    return value;
  }, [editableRef, editor, model.containerRef]);
  const scope = useFixedScope(target);
  const { primary } = model;
  React.useLayoutEffect(() => {
    const root = getEditorDOMRoot(editor);
    if (!root) return undefined;
    const removeLocal = model.scope.register(target, true);
    const removeController = controller?.register(target, false);
    const removeUse = subscribeRootViewUse(editor, () => {
      model.scope.used(target);
      controller?.used(target);
    });
    // A focus inside a portal from outside the Editable reaches only this
    // native listener.
    const removeFocus = trackEditableFocus(root, () =>
      markRootViewUsed(editor)
    );
    return () => {
      removeFocus();
      removeUse();
      removeController?.();
      removeLocal();
    };
  }, [controller, editor, element, model.scope, target]);
  React.useLayoutEffect(() => {
    controller?.setPrimary(target, primary);
  }, [controller, element, primary, target]);
  return <PlateScopeContext value={scope}>{children}</PlateScopeContext>;
}
