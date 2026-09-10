import React from 'react';

import type { Editor } from '../editor/Editor';
import { useEditorRootElement, useEditorViewState } from '../plite-react';
import { bindDocumentFocus } from '../stores/plate-controller/document-focus.internal';
import type { createPlateTargetScope } from './createPlateTargetScope';
import { useEditorContext } from './plite-components';

export type PlateTarget = {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
  editableRef: React.RefObject<HTMLDivElement | null>;
};

export type PlateTargetScope = ReturnType<
  typeof createPlateTargetScope<PlateTarget>
>;

const targets = new WeakMap<object, PlateTarget>();
export const getPlateTarget = (editor: Editor) => targets.get(editor);
export const PlateEditorContext = React.createContext<PlateTarget | null>(null);
export const PlateControllerContext =
  React.createContext<PlateTargetScope | null>(null);
export const PlateModelContext = React.createContext<{
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
  primary: boolean;
  readOnly: boolean;
  scope: PlateTargetScope;
} | null>(null);
export const PlateViewFactsContext = React.createContext({
  composing: false,
  focused: false,
  mounted: false,
  readOnly: false,
});

export function usePlateModel() {
  const model = React.useContext(PlateModelContext);
  if (!model) throw new Error('PlateContent requires a Plate provider.');
  return model;
}

type PlateViewFacts = React.ContextType<typeof PlateViewFactsContext>;

export function PlateTargetProvider({
  children,
  readOnly,
  target,
}: {
  children: React.ReactNode;
  readOnly?: boolean;
  target: PlateTarget | null;
}) {
  const [snapshot, setSnapshot] = React.useState<{
    target: PlateTarget;
    facts: PlateViewFacts;
  } | null>(null);
  const observedFacts = React.useMemo(
    () =>
      snapshot?.target === target
        ? snapshot.facts
        : {
            composing: target?.editor.read.view.isComposing() ?? false,
            focused: target?.editor.read.view.isFocused() ?? false,
            mounted: target?.editor.api.dom.root() != null,
            readOnly: target?.editor.read.view.isReadOnly() ?? true,
          },
    [snapshot, target]
  );
  const facts = React.useMemo(
    () =>
      readOnly === undefined ? observedFacts : { ...observedFacts, readOnly },
    [observedFacts, readOnly]
  );
  return (
    <PlateEditorContext value={target}>
      <PlateViewFactsContext value={facts}>
        {target && <PlateTargetFacts target={target} onChange={setSnapshot} />}
        {children}
      </PlateViewFactsContext>
    </PlateEditorContext>
  );
}

function PlateTargetFacts({
  onChange,
  target,
}: {
  onChange: (snapshot: { target: PlateTarget; facts: PlateViewFacts }) => void;
  target: PlateTarget;
}) {
  const facts = useEditorViewState(
    target.editor,
    (view) => ({
      composing: view.isComposing(),
      focused: view.isFocused(),
      readOnly: view.isReadOnly(),
    }),
    {
      equalityFn: (a, b) =>
        a?.composing === b.composing &&
        a.focused === b.focused &&
        a.readOnly === b.readOnly,
    }
  );
  const element = useEditorRootElement(target.editor);
  React.useLayoutEffect(() => {
    // oxlint-disable-next-line react-doctor/no-prop-callback-in-effect -- [P1 local-invariant] Bridge Plite's non-null view selectors into a nullable provider without remounting its editor descendants.
    onChange({ target, facts: { ...facts, mounted: element !== null } });
  }, [element, facts, onChange, target]);
  return null;
}

export function PlateScopeProvider({
  children,
  fallback = null,
  fallbackReadOnly,
  scope,
}: {
  children: React.ReactNode;
  fallback?: PlateTarget | null;
  fallbackReadOnly?: boolean;
  scope: PlateTargetScope;
}) {
  const target = React.useSyncExternalStore(
    scope.subscribe,
    scope.getSnapshot,
    () => null
  );
  return (
    <PlateTargetProvider
      target={target ?? fallback}
      readOnly={target ? undefined : fallbackReadOnly}
    >
      {children}
    </PlateTargetProvider>
  );
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
  const { primary } = model;
  React.useLayoutEffect(() => {
    if (!element) return undefined;
    const removeLocal = model.scope.register(target, true);
    const removeController = controller?.register(target, false);
    const removeFocus = bindDocumentFocus(editor, element, () => {
      model.scope.focus(target);
      controller?.focus(target);
    });
    return () => {
      removeFocus();
      removeController?.();
      removeLocal();
    };
  }, [controller, editor, element, model.scope, target]);
  React.useLayoutEffect(() => {
    controller?.setPrimary(target, primary);
  }, [controller, element, primary, target]);
  return <PlateTargetProvider target={target}>{children}</PlateTargetProvider>;
}
