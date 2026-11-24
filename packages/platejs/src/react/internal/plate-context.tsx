import React from 'react';

import { getEditorDOMRoot } from '../../dom/plite-dom.internal';
import {
  getCarriedCaretEditor,
  getEditorRuntimeOwner,
  getViewPresentation,
  markRootViewUsed,
  readCaretViewIn,
  readRootViewUse,
  readShownViewUse,
  subscribeCaretTarget,
  subscribeEditorViewState,
  subscribeShownViewUse,
} from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import type { NodeComponent } from '../../lib/plugin/PluginDefinition';
import type { Editor } from '../editor/Editor';
import { useEditorRootElement } from '../plite-react';
import { trackEditableFocus } from '../stores/plate-controller/document-focus.internal';
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
  fixed?: PlateTarget | null;
  views?: AreaViews;
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

export const useFixedScope = (target: PlateTarget | null): PlateScope => {
  const [server] = React.useState(() => target && readServerFacts(target));
  return React.useMemo(() => {
    if (!target) return noTarget;
    const read = () => target;
    return {
      fixed: target,
      getServerSnapshot: read,
      getSnapshot: read,
      server,
      subscribe: subscribeNothing,
    };
  }, [server, target]);
};

const createAreaViews = () => {
  const views = new Set<PlateTarget>();
  const listeners = new Set<() => void>();
  const changed = () => listeners.forEach((listener) => listener());

  return {
    hold(view: PlateTarget) {
      views.add(view);
      changed();
      return () => {
        views.delete(view);
        changed();
      };
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    usedLast() {
      let latest: PlateTarget | null = null;

      for (const view of views) {
        if (
          !latest ||
          readRootViewUse(view.editor) > readRootViewUse(latest.editor)
        ) {
          latest = view;
        }
      }

      return latest;
    },
  };
};

type AreaViews = ReturnType<typeof createAreaViews>;

export const useAreaScope = (around: PlateScope): PlateScope => {
  const [views] = React.useState(createAreaViews);
  const model = React.use(PlateModelContext);
  return React.useMemo(
    () => ({
      getServerSnapshot: around.getServerSnapshot,
      getSnapshot: () => views.usedLast() ?? around.getSnapshot(),
      server: around.server,
      subscribe: (listener) => {
        const stops = [
          views.subscribe(listener),
          around.subscribe(listener),
          model
            ? subscribeShownViewUse(
                getEditorRuntimeOwner(model.editor),
                listener
              )
            : stopNothing,
        ];
        return () => stops.forEach((stop) => stop());
      },
      views,
    }),
    [around, model, views]
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

const targetOf = (
  editor: Editor,
  containerRef: PlateTarget['containerRef']
): PlateTarget => {
  let target = targets.get(editor);
  if (!target) {
    target = {
      editor,
      containerRef,
      editableRef: {
        get current() {
          return editor.api.dom.editable();
        },
      },
    };
    targets.set(editor, target);
  }
  return target;
};

const createCaretScope = (
  view: Editor,
  containerRef: PlateTarget['containerRef']
): PlateScope => {
  const getSnapshot = () =>
    targetOf(
      getCarriedCaretEditor(view) ??
        failInvariant('Expected a mounted editor root'),
      containerRef
    );
  const first = getSnapshot();
  return {
    getServerSnapshot: () => first,
    getSnapshot,
    server: readServerFacts(first),
    subscribe: (listener) =>
      subscribeCaretTarget(getEditorRuntimeOwner(view), listener),
  };
};

const createCaretSlotScope = (own: PlateTarget) => {
  const owner = getEditorRuntimeOwner(own.editor);
  return {
    getServerSnapshot: () => own,
    getSnapshot: () => {
      const view = readCaretViewIn(own.editor);
      return view && view !== own.editor
        ? targetOf(view, own.containerRef)
        : own;
    },
    server: readServerFacts(own),
    subscribe: (listener: () => void) => {
      const stops = [
        subscribeCaretTarget(owner, listener),
        subscribeShownViewUse(owner, listener),
      ];
      return () => stops.forEach((stop) => stop());
    },
  };
};

export const PlateScopeContext = React.createContext(outsideEveryProvider);
type PlateModel = Readonly<{
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
}>;
export const PlateModelContext = React.createContext<PlateModel | null>(null);
export const PlateReadOnlyContext = React.createContext(false);
export const PlateEditorPlaceholderContext = React.createContext(false);

export type PlateRootOutside = Readonly<{
  model: PlateModel;
  scope: PlateScope;
  rootView: Editor;
}>;

export const createPlateController = () => {
  const primaryOf = new Map<PlateRootOutside, boolean>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const pickLastUsedRoot = () => {
    let picked: PlateRootOutside | null = null;
    let pickedAt = 0;

    for (const [entry, isPrimary] of primaryOf) {
      const usedAt = readShownViewUse(
        getEditorRuntimeOwner(entry.rootView),
        getViewPresentation(entry.rootView)
      );
      if (usedAt === null) continue;

      if (usedAt > pickedAt) {
        picked = entry;
        pickedAt = usedAt;
      } else if (!picked && isPrimary) picked = entry;
    }

    return picked;
  };

  return {
    getSnapshot: pickLastUsedRoot,
    join(entry: PlateRootOutside, isPrimary: boolean) {
      primaryOf.set(entry, isPrimary);
      const stop = subscribeShownViewUse(
        getEditorRuntimeOwner(entry.rootView),
        notify
      );
      notify();
      return () => {
        stop();
        primaryOf.delete(entry);
        notify();
      };
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const PlateControllerContext = React.createContext<ReturnType<
  typeof createPlateController
> | null>(null);
export const PlatePickedContext = React.createContext<PlateRootOutside | null>(
  null
);
export const underController: PlateScope = { ...noTarget };

export const usePickedRoot = () =>
  React.use(PlateScopeContext) === underController
    ? React.use(PlatePickedContext)
    : null;

export const usePlateScope = () =>
  usePickedRoot()?.scope ?? React.use(PlateScopeContext);

export function usePlateModel() {
  const model = React.useContext(PlateModelContext);
  if (!model) throw new Error('EditorContent requires an EditorRoot.');
  return model;
}

export const useScopeTarget = (scope: PlateScope) =>
  React.useSyncExternalStore(
    scope.subscribe,
    scope.getSnapshot,
    scope.getServerSnapshot
  );

export const usePlateTarget = () => useScopeTarget(usePlateScope());

/**
 * Give an `EditorRoot`'s children outside every editing area the editor of the
 * caret's root, and join the controller around the `EditorRoot` with it.
 */
export function PlateCaretScope({
  children,
  primary,
}: {
  children: React.ReactNode;
  primary: boolean;
}) {
  const model = usePlateModel();
  const view = useEditorContext();
  const outside = React.useMemo(
    () => ({
      model,
      scope: createCaretScope(view, model.containerRef),
      rootView: view,
    }),
    [model, view]
  );
  const controller = React.use(PlateControllerContext);

  React.useLayoutEffect(
    () => controller?.join(outside, primary),
    [controller, outside, primary]
  );

  return (
    <PlateScopeContext value={outside.scope}>{children}</PlateScopeContext>
  );
}

export function PlateCaretSlots({
  slots,
}: {
  slots: ReadonlyArray<{ Caret: NodeComponent; name: string }>;
}) {
  const own =
    React.use(PlateScopeContext).fixed ??
    failInvariant('Expected a mounted editing area');
  const scope = React.useMemo(() => createCaretSlotScope(own), [own]);
  const target = React.useSyncExternalStore(
    scope.subscribe,
    scope.getSnapshot,
    scope.getServerSnapshot
  );

  return (
    <PlateScopeContext value={scope}>
      {slots.map(({ Caret, name }) => (
        <Caret editableRef={target.editableRef} key={name} />
      ))}
    </PlateScopeContext>
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
  const { server } = usePlateScope();
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
  const area = React.useContext(PlateScopeContext).views;
  const target = React.useMemo(() => {
    const value = { editor, containerRef: model.containerRef, editableRef };
    targets.set(editor, value);
    return value;
  }, [editableRef, editor, model.containerRef]);
  const scope = useFixedScope(target);
  React.useLayoutEffect(() => {
    const root = getEditorDOMRoot(editor);
    if (!root) return undefined;
    const release = area?.hold(target);
    // A focus inside a portal from outside the Editable reaches only this
    // native listener.
    const removeFocus = trackEditableFocus(root, () =>
      markRootViewUsed(editor)
    );
    return () => {
      removeFocus();
      release?.();
    };
  }, [area, editor, element, target]);
  return <PlateScopeContext value={scope}>{children}</PlateScopeContext>;
}
