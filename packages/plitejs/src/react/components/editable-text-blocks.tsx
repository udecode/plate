import React, {
  type TextareaHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  type Ancestor,
  type Descendant,
  type NamedRootKey,
  NodeApi,
  type Path,
  RangeApi,
  type RootKey,
  type NodeKey,
  type Element as ElementNode,
  type Range as ModelRange,
  type Text as TextNode,
} from '../..';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { flushEditorViewState } from '../../core/public-state';
import { markRootViewInteraction } from '../../core/root-target';
import { isDOMElement, isDOMNode, isDOMText } from '../../dom';
import {
  type DOMCoverageBoundary,
  type DOMCoverageCopyPolicy,
  type DOMCoverageReason,
  type DOMCoverageSelectionPolicy,
  type DOMCoverageSession,
  createDOMGeometryKernel,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  IS_NODE_MAP_DIRTY,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  setEditableRootReveal,
} from '../../dom/internal';
import {
  ElementContext,
  PliteContentRootInstanceContext,
  PliteContentRootOwnerContext,
  PliteEditableRootContext,
  PliteEditingAreaContext,
} from '../context';
import {
  DecorationContext,
  DecorationSourcesContext,
  type PliteDecorationStore,
  useRegisterPliteDecorationSource,
} from '../decoration-context';
import { canSkipRendererForRetainedTextFlow } from '../dom-text-sync';
import {
  type EditableDropResult,
  type EditableHistoryReplayEvent,
  type EditablePasteResult,
  type EditablePointerSelectionEndHandler,
  findMountedEditableDOMRuntime,
  type NodeSelectionFocus,
} from '../editable/editable-dom-runtime';
import { assertExternalTextElement } from '../editable/external-text-binding';
import {
  createViewHandlerBinder,
  isDOMHandler,
} from '../editable/interaction-owner';
import { useRootInteractionController } from '../editable/root-interaction-controller';
import {
  useDescendantCaretOwnerPaths,
  usePlaceholderValue,
  useRootNodeKeys,
  useSelectionPaths,
} from '../editable/root-selector-sources';
import {
  type Editor,
  isEditor as editorIsEditor,
  isInline as editorIsInline,
  toInternalRoot,
} from '../editable/runtime-editor-api';
import {
  readPathByNodeKey,
  readRuntimeNode,
} from '../editable/runtime-live-state';
import { resolveViewBoundaryDOMPoint } from '../editable/selection-projected-dom';
import { type ViewLines, ViewLinesContext } from '../editable/view-lines';
import type { ExternalTextOptions } from '../external-text';
import {
  useEditableDOMRuntime,
  useClaimEditableDOMCommit,
} from '../hooks/use-claim-editable-dom-commit';
import { useEditorContext } from '../hooks/use-editor-context';
import { useEditorFocused } from '../hooks/use-editor-focused';
import { useInheritedReadOnly } from '../hooks/use-editor-read-only';
import { useEditorSelection } from '../hooks/use-editor-selection';
import { useOptionalEditorViewState } from '../hooks/use-editor-view-state';
import { useHydrated } from '../hooks/use-hydrated';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { useMountedNodeRenderSelector } from '../hooks/use-node-selector';
import { useContentRoot } from '../hooks/use-plite-content-root';
import {
  getDOMTextRenderRevision,
  recordDrawnBlockDirection,
  usePliteNodeKeyDOMValue,
  usePliteNodeRef,
} from '../hooks/use-plite-node-ref';
import { useRequiredPliteRuntimeContext } from '../hooks/use-plite-runtime';
import { useSelectionGeometry } from '../hooks/use-selection-geometry';
import {
  createPliteInactiveSelectionDecorationSource,
  createPliteInactiveSelectionStore,
  registerPliteInactiveSelectionFocus,
  resolvePliteInactiveSelectionBlur,
  setPliteInactiveSelectionVisible,
} from '../inactive-selection';
import {
  createRangeGeometryOwner,
  type ViewportRect,
  useRangeGeometryOwner,
} from '../range-geometry';
import {
  buildContentRootInstanceKey,
  createContentRootSlotKey,
} from '../slot-arrival';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  subscribePliteViewSelection,
} from '../view-selection';
import { EditableViewportBoundary } from '../viewport-boundary';
import {
  createEditableViewportPlan,
  type EditableViewportPlan,
} from '../viewport-plan';
import {
  type DOMCoverageBoundaryMaterializePayload,
  DOMCoverageBoundaryRange,
  DOMCoverageSelfBoundary,
} from './dom-coverage-boundary';
import {
  type EditableDOMBeforeInputHandler,
  EditableDOMRoot,
  type EditableHandlerContext,
  type EditableKeyDownHandler,
} from './editable';
import {
  isEditableTextNode,
  readEditableDescendantBinding,
} from './editable-descendant-binding';
import {
  type EditableElementLayout,
  EditableElementLayoutsProvider,
  useEditableElementPlacementRef,
} from './editable-element-placement';
import { EditableExternalText } from './editable-external-text';
import { sameDescendantBinding, sameNodeKeys } from './editable-node-equality';
import { getEditableElementRenderer } from './editable-rendered-element';
import {
  EditableText,
  type RenderLeafProps,
  type RenderPlaceholderProps,
  type RenderTextProps,
} from './editable-text';
import {
  EditableTextFlow,
  type EditableTextFlowEntry,
  ImperativeTextFlowContext,
} from './editable-text-flow';
import { SurfaceRoot } from './plite';
import { EditorElement } from './plite-element';
import { EditorSpacer } from './plite-spacer';
import { InlineVoidShell, VoidShell } from './plite-void-shell';

export { isPliteReactDevelopmentEnvironment } from './editable-rendered-element';

const OwnerHandlersContext = React.createContext<Partial<EditorContentProps>>(
  {}
);

const useStableOwnerHandlers = (props: object) => {
  const handlers: Partial<EditorContentProps> = Object.fromEntries(
    Object.entries(props).filter(([name, value]) => isDOMHandler(name, value))
  );
  const [kept, setKept] = React.useState(handlers);
  const keptHandlers: Partial<Record<string, unknown>> = kept;
  const changed =
    Object.keys(keptHandlers).length !== Object.keys(handlers).length ||
    Object.entries(handlers).some(
      ([name, handler]) => keptHandlers[name] !== handler
    );

  if (changed) setKept(handlers);

  return changed ? handlers : kept;
};

export type EditableDOMCoverageBoundaryScope =
  | {
      from: number;
      to?: number;
      type: 'children';
    }
  | {
      type: 'self';
    };

export type EditableDOMCoverageBoundaryPlaceholderContext = {
  materialize: () => void;
};

export type EditableDOMCoverageBoundaryMaterializePayload =
  DOMCoverageBoundaryMaterializePayload;

export type EditableDOMCoverageBoundaryProps = {
  boundaryId?: string;
  children?: ReactNode;
  copyPolicy?: DOMCoverageCopyPolicy;
  mounted?: boolean;
  onMaterialize?: (payload: DOMCoverageBoundaryMaterializePayload) => void;
  reason?: DOMCoverageReason;
  renderPlaceholder?: (
    context: EditableDOMCoverageBoundaryPlaceholderContext
  ) => ReactNode;
  scope: EditableDOMCoverageBoundaryScope;
  selectionPolicy?: DOMCoverageSelectionPolicy;
};

type EditableContentRootViewport = {
  /**
   * The root's top-level blocks in view, such as the shapes a camera shows.
   * The slot also mounts the blocks the selection's ends are in, and hides
   * each run of the others behind a boundary whose copy reads the model.
   */
  mountedKeys: ReadonlySet<NodeKey>;
  /**
   * Brings `path` into view, such as when the selection moves into a block
   * outside `mountedKeys`. `editor.api.dom.scrollIntoView` calls it with
   * `align` `'auto'` for a mounted path, point or range in this root, and
   * `'auto'` leaves a block already in view where it is. It adds the block at
   * `path[0]` to `mountedKeys` before or on the next render, and returns false
   * when it cannot.
   */
  reveal: (path: Path, align?: 'auto' | 'center' | 'end' | 'start') => boolean;
};

export type EditableContentRootSlotOptions = {
  ariaLabel?: string;
  className?: string;
  disableDefaultStyles?: boolean;
  id?: string;
  /**
   * The element that takes focus in place of this root's editable when the
   * editor moves focus here, as after an undo, on a click that selects an
   * object or on a call to `editor.api.dom.focus()`. It takes focus only while
   * no range is shown into this root and the root's own selection is none or
   * a node selection of its top-level blocks, including a node selection the
   * root kept while the caret was in another root. Once the element holds
   * focus, that kept node selection becomes the selection again, so a key the
   * element handles acts on it. It does not come back when the element's focus
   * handler leaves focus on another element, asks for focus elsewhere or
   * changes the selection. A focus call made inside an update or a read focuses
   * the editable instead, as on a root without this element. When the render
   * that follows a focus call replaces the element, focus falls to the page.
   * Give the element `contentEditable={false}`: one that inherits editing runs
   * the editable's own focus handler, which in Firefox moves focus to the
   * editable. Unless the element is a control, such as a button, the editor
   * reads no keys from it, so it must handle the keys it needs, such as undo
   * and redo.
   */
  nodeSelectionFocus?: NodeSelectionFocus;
  placeholder?: ReactNode;
  readOnly?: boolean;
  spellCheck?: TextareaHTMLAttributes<HTMLDivElement>['spellCheck'];
  style?: CSSProperties;
  tabIndex?: number;
  /** Mount only some of the root's top-level blocks, such as a board's shapes in view. */
  viewport?: EditableContentRootViewport;
};

type EditableContentRootSlotRenderers<
  TElement extends ElementNode = ElementNode,
> = {
  renderElement?: RenderElementRenderer<TElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  renderVoid?: RenderVoidRenderer<TElement>;
};

export type EditableElementSlots = {
  children: (range?: { from?: number; to?: number }) => ReactNode;
  /** Delegate one exact-one-Text block to an adapter while the editor owns its value. */
  externalText: <TConfig = undefined>(
    options: ExternalTextOptions<TConfig>
  ) => ReactNode;
  /**
   * Renders model-present content whose editable DOM may be intentionally
   * absent, such as closed accordion bodies or inactive tab panels.
   */
  contentBoundary: (props: EditableDOMCoverageBoundaryProps) => ReactNode;
  contentRoot: (
    slot: string,
    options?: EditableContentRootSlotOptions
  ) => ReactNode;
};

const createContentBoundaryId = (
  nodeKey: string,
  scope: EditableDOMCoverageBoundaryScope
) => {
  if (scope.type === 'self') {
    return `content-boundary:${nodeKey}:self`;
  }

  return `content-boundary:${nodeKey}:children:${scope.from}:${
    scope.to ?? scope.from
  }`;
};

const createEditableElementSlots = <TElement extends ElementNode = ElementNode>(
  editor: ReturnType<typeof useEditorContext>,
  props: {
    coverage: DOMCoverageSession | undefined;
    element: TElement;
    renderElement?: RenderElementRenderer<TElement>;
    renderChildren: (from?: number, to?: number) => ReactNode;
    elementKey: NodeKey;
    isVoid: boolean;
    renderLeaf?: (props: RenderLeafProps) => ReactNode;
    renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
    renderText?: (props: RenderTextProps) => ReactNode;
    renderVoid?: RenderVoidRenderer<TElement>;
    ownerPath: Path;
    nodeKey: string;
  }
): EditableElementSlots => {
  const renderContentBoundary = ({
    boundaryId,
    children,
    copyPolicy,
    mounted = true,
    onMaterialize,
    reason,
    renderPlaceholder,
    scope,
    selectionPolicy,
  }: EditableDOMCoverageBoundaryProps) => {
    const resolvedBoundaryId =
      boundaryId ?? createContentBoundaryId(props.nodeKey, scope);
    const materialize = () => {
      props.coverage?.materializeBoundary(resolvedBoundaryId, 'programmatic');
    };
    const placeholder = renderPlaceholder
      ? renderPlaceholder({ materialize })
      : children;
    const hidden = !mounted;

    if (scope.type === 'self') {
      const content = mounted ? (children ?? props.renderChildren()) : null;

      return (
        <DOMCoverageSelfBoundary
          boundaryId={resolvedBoundaryId}
          content={content}
          copyPolicy={copyPolicy}
          hidden={hidden}
          onMaterialize={onMaterialize}
          reason={reason}
          selectionPolicy={selectionPolicy}
        >
          {placeholder}
        </DOMCoverageSelfBoundary>
      );
    }

    const to = scope.to ?? scope.from;
    const content = mounted
      ? (children ?? props.renderChildren(scope.from, to))
      : null;

    return (
      <DOMCoverageBoundaryRange
        boundaryId={resolvedBoundaryId}
        content={content}
        copyPolicy={copyPolicy}
        from={scope.from}
        hidden={hidden}
        onMaterialize={onMaterialize}
        reason={reason}
        selectionPolicy={selectionPolicy}
        to={to}
      >
        {placeholder}
      </DOMCoverageBoundaryRange>
    );
  };

  return {
    children: (range = {}) =>
      props.renderChildren(range.from, range.to ?? range.from),
    externalText: <TConfig,>({
      adapter,
      ariaLabel,
      config,
    }: ExternalTextOptions<TConfig>) => {
      assertExternalTextElement(editor, props.element);
      if (!ariaLabel.trim()) {
        throw new Error('externalText requires a nonempty ariaLabel.');
      }
      return (
        <EditableExternalText
          adapter={adapter}
          ariaLabel={ariaLabel}
          config={config as TConfig}
          elementKey={props.elementKey}
          elementPath={props.ownerPath}
        />
      );
    },
    contentBoundary: renderContentBoundary,
    contentRoot: (slot, options = {}) => {
      const childCount = props.element.children.length;

      return (
        <>
          {childCount > 0 && !props.isVoid
            ? renderContentBoundary({
                boundaryId: `content-root:${props.nodeKey}:${slot}`,
                copyPolicy: 'exclude',
                mounted: false,
                reason: 'app-hidden',
                scope: {
                  from: 0,
                  to: childCount - 1,
                  type: 'children',
                },
                selectionPolicy: 'skip',
              })
            : null}
          <EditableContentRootSlot
            element={props.element}
            options={options}
            ownerKey={props.elementKey}
            ownerPath={props.ownerPath}
            renderers={
              {
                renderElement: props.renderElement,
                renderLeaf: props.renderLeaf,
                renderPlaceholder: props.renderPlaceholder,
                renderText: props.renderText,
                renderVoid: props.renderVoid,
              } as EditableContentRootSlotRenderers
            }
            slot={slot}
          />
        </>
      );
    },
  };
};

function EditableContentRootSlot({
  element,
  options,
  ownerKey,
  ownerPath,
  renderers,
  slot,
}: {
  element: ElementNode;
  options: EditableContentRootSlotOptions;
  ownerKey: NodeKey;
  ownerPath: Path;
  renderers: EditableContentRootSlotRenderers;
  slot: string;
}) {
  const ownerEditor = useEditorContext();
  const runtimeOwner = getEditorRuntimeOwner(ownerEditor);
  const ownerRoot = toInternalRoot(
    ownerEditor.read((state) => state.view.root())
  );
  const { root } = useContentRoot(element, { slot });
  const ownerSources = React.useContext(DecorationSourcesContext);
  const rawParentInstance = React.useContext(PliteContentRootInstanceContext);
  const parentInstance =
    rawParentInstance &&
    rawParentInstance.runtimeOwner === runtimeOwner &&
    rawParentInstance.childRoot === ownerRoot
      ? rawParentInstance
      : null;
  const ownerReadOnly = useInheritedReadOnly();
  const [slotMountId] = React.useState(createContentRootSlotKey);
  const contentRootOwner = React.useMemo(
    () => ({
      childRoot: root,
      ownerPath,
      ownerRoot,
    }),
    [ownerPath, ownerRoot, root]
  );
  const contentRootInstance = React.useMemo(() => {
    const paneKey = parentInstance?.paneKey ?? ownerRoot;
    const parentKey = parentInstance?.instanceKey ?? `${paneKey}:${ownerRoot}`;
    const hop = {
      ownerKey,
      ownerRoot,
      root,
      slot,
      slotMountId,
    };

    return {
      childRoot: root,
      hops: parentInstance ? [...parentInstance.hops, hop] : [hop],
      instanceKey: buildContentRootInstanceKey(parentKey, ownerKey, slot, root),
      paneKey,
      runtimeOwner,
    };
  }, [
    ownerKey,
    ownerRoot,
    parentInstance,
    root,
    runtimeOwner,
    slot,
    slotMountId,
  ]);

  return (
    <PliteContentRootOwnerContext value={contentRootOwner}>
      <PliteContentRootInstanceContext value={contentRootInstance}>
        <SurfaceRoot
          decorations={ownerSources}
          editor={ownerEditor}
          nested
          readOnly={Boolean(options.readOnly)}
          root={root}
        >
          <EditableContentRootView
            options={options}
            ownerEditor={ownerEditor}
            ownerKey={ownerKey}
            ownerPath={ownerPath}
            ownerReadOnly={ownerReadOnly}
            ownerRoot={ownerRoot}
            renderers={renderers}
            root={root}
            slot={slot}
          />
        </SurfaceRoot>
      </PliteContentRootInstanceContext>
    </PliteContentRootOwnerContext>
  );
}

function EditableContentRootView({
  options,
  ownerEditor,
  ownerKey,
  ownerPath,
  ownerReadOnly,
  ownerRoot,
  renderers,
  root,
  slot,
}: {
  options: EditableContentRootSlotOptions;
  ownerEditor: Editor;
  ownerKey: string;
  ownerPath: Path;
  ownerReadOnly: boolean;
  ownerRoot: RootKey;
  renderers: EditableContentRootSlotRenderers;
  root: RootKey;
  slot: string;
}) {
  const {
    ariaLabel,
    className,
    disableDefaultStyles,
    id,
    nodeSelectionFocus,
    placeholder,
    spellCheck,
    style,
    tabIndex,
    viewport,
  } = options;
  const {
    renderElement,
    renderLeaf,
    renderPlaceholder,
    renderText,
    renderVoid,
  } = renderers;
  const editor = useEditorContext();
  const ownerHandlers = React.useContext(OwnerHandlersContext);
  const viewReadOnly = useOptionalEditorViewState(
    editor,
    'readOnly',
    (view) => view.isReadOnly(),
    false,
    true
  );
  const surfaceReadOnly = Boolean(options.readOnly || ownerReadOnly);
  const readOnly = surfaceReadOnly || viewReadOnly;
  useIsomorphicLayoutEffect(() => {
    flushEditorViewState(editor);
  }, [editor, surfaceReadOnly]);
  const {
    getMountedContentViewEditor,
    registerContentRootOwner,
    registerHistoryStepSlot,
  } = useRequiredPliteRuntimeContext();
  const passesNodeSelectionFocus = nodeSelectionFocus !== undefined;
  const renderedBy = useEditableDOMRuntime();
  const stepSlot = React.useMemo(
    () => ({
      nodeSelectionFocus: passesNodeSelectionFocus,
      owner: ownerKey,
      parent: ownerEditor,
      renderedBy,
      slot,
    }),
    [ownerEditor, ownerKey, passesNodeSelectionFocus, renderedBy, slot]
  );
  // The step recorder reads this slot for an edit its content makes in a
  // layout effect on first mount, which runs before this view's own.
  React.useInsertionEffect(() => {
    registerHistoryStepSlot(editor, stepSlot);
  }, [editor, registerHistoryStepSlot, stepSlot]);
  useIsomorphicLayoutEffect(
    () =>
      registerContentRootOwner(
        editor,
        { childRoot: root, ownerPath, ownerRoot },
        stepSlot
      ),
    [editor, ownerPath, ownerRoot, registerContentRootOwner, root, stepSlot]
  );
  const externalMouseGestureRef = React.useRef(false);
  const getViewEditor = React.useCallback(
    (target: RootKey) =>
      target === root ? editor : getMountedContentViewEditor(target),
    [editor, getMountedContentViewEditor, root]
  );
  const rootInteraction = useRootInteractionController({
    disabled: readOnly,
    editor,
    getMountedViewEditor: getViewEditor,
    root,
    selection: 'restore',
  });
  const onMouseDownCapture = React.useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(
    (event) => {
      externalMouseGestureRef.current = event.defaultPrevented;

      if (!externalMouseGestureRef.current) {
        const targetNode = isDOMNode(event.target) ? event.target : null;
        const targetElement = isDOMElement(targetNode)
          ? targetNode
          : isDOMText(targetNode)
            ? targetNode.parentElement
            : null;
        const targetEditable = targetElement?.closest<HTMLElement>(
          '[data-editor="true"]'
        );
        const targetRuntime = targetEditable
          ? findMountedEditableDOMRuntime(targetEditable)
          : null;
        const isOwnTarget =
          !!targetNode &&
          event.currentTarget.contains(targetNode) &&
          (!targetRuntime ||
            getEditorRuntimeOwner(targetRuntime.editor) ===
              getEditorRuntimeOwner(editor));

        if (isOwnTarget) {
          markRootViewInteraction(editor);
        }
        rootInteraction.onMouseDownCapture(event);
      }
    },
    [editor, rootInteraction]
  );
  const onMouseUpCapture = React.useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(
    (event) => {
      if (!externalMouseGestureRef.current) {
        rootInteraction.onMouseUpCapture(event);
      }
      externalMouseGestureRef.current = false;
    },
    [rootInteraction]
  );
  const onMouseMoveCapture = React.useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(
    (event) => {
      if (!externalMouseGestureRef.current) {
        rootInteraction.onMouseMoveCapture(event);
      }
    },
    [rootInteraction]
  );
  const editableProps: EditorContentProps = {
    ...ownerHandlers,
    'aria-label': ariaLabel,
    className,
    disableDefaultStyles,
    id,
    placeholder,
    readOnly: surfaceReadOnly,
    renderElement,
    renderLeaf,
    renderPlaceholder,
    renderText,
    renderVoid,
    spellCheck,
    style,
    tabIndex: tabIndex ?? (readOnly ? undefined : 0),
  };

  return (
    <div
      contentEditable={false}
      data-editor-content-root-owner-path={ownerPath.join(',')}
      data-editor-content-root-owner-root={ownerRoot}
      data-editor-content-root-slot={slot}
      onMouseDownCapture={onMouseDownCapture}
      onMouseMoveCapture={onMouseMoveCapture}
      onMouseUpCapture={onMouseUpCapture}
      suppressContentEditableWarning
    >
      {viewport ? (
        <EditableContentRootWindow
          {...editableProps}
          nodeSelectionFocus={nodeSelectionFocus}
          viewport={viewport}
        />
      ) : (
        <EditableInner
          {...editableProps}
          nodeSelectionFocus={nodeSelectionFocus}
        />
      )}
    </div>
  );
}

function EditableContentRootWindow({
  viewport: { mountedKeys, reveal },
  ...props
}: EditorContentProps & {
  nodeSelectionFocus?: NodeSelectionFocus;
  viewport: EditableContentRootViewport;
}) {
  const topLevelNodeKeys = useRootNodeKeys();
  const selectionPaths = useSelectionPaths(true);
  const descendantCaretOwnerPaths = useDescendantCaretOwnerPaths(true);
  const viewportPlan = React.useMemo(
    () => ({
      ...createEditableViewportPlan({
        coordinateSpace: 'canvas',
        indexes: [
          ...topLevelNodeKeys.flatMap((key, index) =>
            mountedKeys.has(key) ? [index] : []
          ),
          ...(selectionPaths?.flatMap((path) => path.slice(0, 1)) ?? []),
          ...descendantCaretOwnerPaths.flatMap((path) => path.slice(0, 1)),
        ],
        scrollToPath: reveal,
        sizeAtIndex: () => 0,
        startAtIndex: () => 0,
        topLevelNodeKeys,
        totalSize: 0,
      }),
      revealMounted: reveal,
      shownTopLevelNodeKeys: mountedKeys,
    }),
    [
      descendantCaretOwnerPaths,
      mountedKeys,
      reveal,
      selectionPaths,
      topLevelNodeKeys,
    ]
  );

  return <EditableInner {...props} viewportPlan={viewportPlan} />;
}

export type RenderElementProps<TElement extends ElementNode = ElementNode> =
  TElement extends ElementNode
    ? {
        attributes: {
          'data-editor-inline'?: true;
          'data-editor-node': 'element';
          'data-editor-path': string;
          'data-editor-node-key': string;
          'data-editor-void'?: true;
          /** The direction of a text block's first letter, absent when none decides. */
          dir?: 'ltr' | 'rtl';
          /**
           * Binds and places the element. It changes when the node or its page
           * placement changes, so a ref merge must change with it and pass a
           * detach on as a call with `null`.
           */
          ref: React.RefCallback<HTMLElement>;
        };
        children: ReactNode;
        element: TElement;
        isInline: boolean;
        slots: EditableElementSlots;
      }
    : never;

export type RenderElementRenderer<TElement extends ElementNode = ElementNode> =
  (props: RenderElementProps<TElement>) => ReactNode;

export type RenderVoidProps<TElement extends ElementNode = ElementNode> = {
  element: TElement;
};

export type RenderVoidRenderer<TElement extends ElementNode = ElementNode> = (
  props: RenderVoidProps<TElement>
) => ReactNode;

const EditableRenderedVoid = <TElement extends ElementNode = ElementNode>({
  children,
  element,
  isInline,
  renderVoid,
}: {
  children: ReactNode;
  element: TElement;
  isInline: boolean;
  renderVoid?: RenderVoidRenderer<TElement>;
}) => {
  const content = renderVoid?.({ element }) ?? null;

  return isInline ? (
    <InlineVoidShell content={content}>{children}</InlineVoidShell>
  ) : (
    <VoidShell content={content}>{children}</VoidShell>
  );
};

const resolveTextZeroWidth = ({
  editor,
  node,
  path,
}: {
  editor: Editor;
  node: TextNode;
  path: Path | null;
}) => {
  if (!path) {
    return { isLineBreak: true };
  }

  const parent = readRuntimeNode(editor, path.slice(0, -1));

  if (parent && !editorIsEditor(parent) && editor.read.schema.isVoid(parent)) {
    return {
      isLineBreak: false,
      length: NodeApi.string(parent).length,
    };
  }

  if (node.text !== '') {
    return { isLineBreak: true };
  }

  if (
    parent &&
    !editorIsEditor(parent) &&
    NodeApi.isElement(parent) &&
    !editorIsInline(editor, parent) &&
    path.at(-1) === parent.children.length - 1 &&
    NodeApi.string(parent) === ''
  ) {
    return { isLineBreak: true };
  }

  return { isLineBreak: false };
};

type EditableDOMHandlers<TAttributes> = {
  [K in keyof TAttributes]: K extends `on${string}`
    ? NonNullable<TAttributes[K]> extends (event: infer E) => void
      ? (event: E, context: EditableHandlerContext) => void
      : TAttributes[K]
    : TAttributes[K];
};

/**
 * Each DOM handler gets an `EditableHandlerContext` after its event, whose
 * `editor` is the view whose editable runs it. An editable skips an event
 * inside a content root's editable, which runs the same handlers on the
 * content root's view.
 */
export type EditorContentProps<
  TElement extends ElementNode = ElementNode,
  TRoot extends RootKey = RootKey,
> = {
  autoFocus?: boolean;
  className?: string;
  disableDefaultStyles?: boolean;
  id?: string;
  ignoreBlankEditableRootClicks?: boolean;
  onDOMBeforeInput?: EditableDOMBeforeInputHandler;
  onHistoryReplay?: (event: EditableHistoryReplayEvent) => void;
  onKeyDown?: EditableKeyDownHandler;
  /**
   * Called once for each paste this editable handles through its built-in
   * formats: after the paste commits (`inserted: true`), or when no format
   * can insert it or a format claims it with an empty slice
   * (`inserted: false`). A diagnostic with `impact: 'lossy'` means pasted
   * content was left out.
   *
   * Not called when `onPaste` or a plugin command handles the paste without
   * the built-in formats, or when this editable unmounts before the paste
   * settles. An `onPaste` handler that inserts through
   * `editor.api.dom.clipboard.insertData` during the paste gets that
   * insertion's result.
   */
  onPasteResult?: (result: EditablePasteResult) => void;
  /**
   * Called once after a primary mouse press that began on this editable's own
   * text has its final text range: after the mouseup's import and every later
   * write of that press, such as a drag released outside the editable or a
   * click inside selected text that collapses it. Not called for a press on a
   * control, an external text host or a nested editor, for touch or pen, when
   * the press ends in a node selection, or when a key other than a modifier,
   * a composition, a native drag, a blur, another press or an unmount comes
   * first.
   */
  onPointerSelectionEnd?: EditablePointerSelectionEndHandler;
  /** Reports a drop this Editable lands: the transfer outcome, or the data it inserted. */
  onDropResult?: (result: EditableDropResult) => void;
  placeholder?: ReactNode;
  readOnly?: boolean;
  ref?: React.Ref<HTMLDivElement>;
  renderElement?: RenderElementRenderer<TElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  renderVoid?: RenderVoidRenderer<TElement>;
  root?: NamedRootKey<TRoot>;
  scrollSelectionIntoView?: (
    editor: Editor,
    domRange: globalThis.Range
  ) => void;
  spellCheck?: TextareaHTMLAttributes<HTMLDivElement>['spellCheck'];
  style?: CSSProperties;
} & EditableDOMHandlers<
  Omit<
    TextareaHTMLAttributes<HTMLDivElement>,
    | 'autoFocus'
    | 'children'
    | 'className'
    | 'id'
    | 'onKeyDown'
    | 'placeholder'
    | 'readOnly'
    | 'spellCheck'
    | 'style'
  >
>;

const EditableDescendantNodeInner = <TElement extends ElementNode>({
  placeholder,
  placeholderRef,
  renderElement,
  renderLeaf,
  renderPlaceholder,
  renderText,
  renderVoid,
  nodeKey,
  renderChildrenOverride,
}: {
  placeholder?: ReactNode;
  placeholderRef?: React.RefCallback<HTMLElement>;
  renderElement?: RenderElementRenderer<TElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  renderVoid?: RenderVoidRenderer<TElement>;
  nodeKey: NodeKey;
  renderChildrenOverride?: (from?: number, to?: number) => ReactNode;
}) => {
  const editor = useEditorContext();
  const editableRuntime = useEditableDOMRuntime();
  const coverage = editableRuntime?.domCoverage;
  const nodeKeyDOMValue = usePliteNodeKeyDOMValue(nodeKey);
  const lease = editableRuntime?.compositionLease;

  const binding = useMountedNodeRenderSelector(
    ({ editor: editorValue, node, path }) =>
      readEditableDescendantBinding({
        editor: editorValue,
        held: lease?.heldChildren(nodeKey) ?? null,
        node,
        path,
        renderLeaf,
        renderText,
      }),
    (drawn, next) =>
      (drawn !== null &&
        !!lease?.keepsDrawn(nodeKey) &&
        (next.node === null ||
          (drawn.ownRenderRevision === next.ownRenderRevision &&
            sameNodeKeys(drawn.childNodeKeys, next.childNodeKeys)))) ||
      sameDescendantBinding(drawn, next),
    { nodeKey }
  );

  const {
    childNodeKeys,
    direction,
    drawnChildren,
    directTextChildNodes,
    isInline: inline,
    isVoid: voidNode,
    node,
    ownRenderRevision,
    path,
    renderRevision,
  } = binding;
  const hasClientDOM = useHydrated();
  const canRenderImperativeTextFlow =
    React.useContext(ImperativeTextFlowContext) &&
    hasClientDOM &&
    !renderChildrenOverride;
  const bindNodeRef = usePliteNodeRef(nodeKey, { editorNode: node });
  const elementRef = useEditableElementPlacementRef(
    bindNodeRef,
    node && !isEditableTextNode(node) ? path : null
  );

  if (!node || !path) {
    return null;
  }

  if (path) {
    const parentPath = path.slice(0, -1) as Path;
    const parent =
      parentPath.length === 0
        ? editor
        : (readRuntimeNode(editor, parentPath) as Ancestor | undefined);

    if (parent && NodeApi.isAncestor(parent)) {
      NODE_TO_INDEX.set(node, path.at(-1) ?? 0);
      NODE_TO_PARENT.set(node, parent);
      IS_NODE_MAP_DIRTY.set(editor, false);
    }
  }

  if (isEditableTextNode(node)) {
    const { text: _text, ...marks } = node;
    const parent = readRuntimeNode(editor, path.slice(0, -1));
    const parentChildren =
      parent && NodeApi.isElement(parent) ? parent.children : null;
    const isLast =
      parentChildren != null && path.at(-1) === parentChildren.length - 1;

    const content = (
      <EditableText
        isLast={isLast}
        key={`${nodeKey}:${renderRevision}`}
        marks={marks}
        path={path}
        placeholder={placeholder}
        placeholderRef={placeholderRef}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        renderText={renderText}
        nodeKey={nodeKey}
        editorNode={node}
        text={node.text}
        zeroWidth={resolveTextZeroWidth({ editor, node, path })}
      />
    );
    return (
      <ElementContext
        value={
          parent && NodeApi.isElement(parent)
            ? {
                element: parent,
                nodeKey: editor.key(parent),
                path: path.slice(0, -1),
              }
            : null
        }
      >
        {content}
      </ElementContext>
    );
  }

  recordDrawnBlockDirection(editor, nodeKey, direction);

  const attributes = {
    'data-editor-inline': inline ? (true as const) : undefined,
    'data-editor-node': 'element' as const,
    'data-editor-path': path.join(','),
    'data-editor-node-key': nodeKeyDOMValue,
    'data-editor-void': voidNode ? (true as const) : undefined,
    dir: direction,
    ref: elementRef,
  };
  const held = drawnChildren !== node.children;
  const childPathAt = (childNodeKey: NodeKey, index: number) =>
    (held ? readPathByNodeKey(editor, childNodeKey) : null) ??
    ([...path, index] as Path);
  const isModelChildAt = (child: Descendant, index: number) =>
    node.children[index] === child;
  const renderDirectTextChild = (
    childNodeKey: NodeKey,
    child: Descendant | undefined,
    index: number
  ) => {
    if (!child || !isEditableTextNode(child) || renderLeaf || renderText) {
      return null;
    }

    const childPath = childPathAt(childNodeKey, index);
    const { text: _text, ...marks } = child;

    if (isModelChildAt(child, index)) {
      NODE_TO_INDEX.set(child, index);
      NODE_TO_PARENT.set(child, node);
      IS_NODE_MAP_DIRTY.set(editor, false);
    }

    return (
      <EditableText
        isLast={index === drawnChildren.length - 1}
        key={`${childNodeKey}:${getDOMTextRenderRevision(editor, [
          childNodeKey,
        ])}`}
        marks={marks}
        path={childPath}
        placeholder={placeholder}
        placeholderRef={placeholderRef}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        renderText={renderText}
        nodeKey={childNodeKey}
        editorNode={child}
        text={child.text}
        zeroWidth={resolveTextZeroWidth({
          editor,
          node: child,
          path: childPath,
        })}
      />
    );
  };
  const renderChild = (childNodeKey: NodeKey, index: number) => {
    const directText = renderDirectTextChild(
      childNodeKey,
      drawnChildren[index],
      index
    );
    return directText ? (
      <EditableDescendantNodeWithChildren
        nodeKey={childNodeKey}
        key={childNodeKey}
      >
        {directText}
      </EditableDescendantNodeWithChildren>
    ) : (
      <EditableDescendantNode
        key={childNodeKey}
        placeholder={placeholder}
        placeholderRef={placeholderRef}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        renderText={renderText}
        renderVoid={renderVoid}
        nodeKey={childNodeKey}
      />
    );
  };
  const canRenderDirectTextFlow = directTextChildNodes.every((textNode) => {
    if (!textNode) return false;

    const { text: _text, ...marks } = textNode;

    return (
      canSkipRendererForRetainedTextFlow(renderLeaf, { marks }) &&
      canSkipRendererForRetainedTextFlow(renderText, { marks })
    );
  });
  const renderChildrenContent = (from = 0, to = childNodeKeys.length - 1) => {
    if (childNodeKeys.length === 0 || to < from) {
      return null;
    }

    if (
      !canRenderImperativeTextFlow ||
      !canRenderDirectTextFlow ||
      directTextChildNodes.length !== childNodeKeys.length
    ) {
      return childNodeKeys
        .slice(from, to + 1)
        .map((childNodeKey, offset) =>
          renderChild(childNodeKey, from + offset)
        );
    }

    const children: ReactNode[] = [];
    let index = from;

    while (index <= to) {
      const child = directTextChildNodes[index];

      if (!child || child.text.length === 0) {
        children.push(renderChild(childNodeKeys[index], index));
        index += 1;
        continue;
      }

      const entries: EditableTextFlowEntry[] = [];
      const firstIndex = index;

      while (index <= to) {
        const textNode = directTextChildNodes[index];

        if (!textNode || textNode.text.length === 0) break;
        const childNodeKey = childNodeKeys[index];

        if (isModelChildAt(textNode, index)) {
          NODE_TO_INDEX.set(textNode, index);
          NODE_TO_PARENT.set(textNode, node);
        }
        entries.push({
          isLast: index === drawnChildren.length - 1,
          node: textNode,
          nodeKey: childNodeKey,
          path: childPathAt(childNodeKey, index),
        });
        index += 1;
      }
      IS_NODE_MAP_DIRTY.set(editor, false);
      const lastEntry = entries.at(-1);

      children.push(
        <EditableTextFlow
          entries={entries}
          key={`text-flow:${entries[0].nodeKey}:${lastEntry?.nodeKey}:${firstIndex}:${entries.length}`}
        />
      );
    }

    return children;
  };
  const renderChildren = (from?: number, to?: number) =>
    renderChildrenOverride
      ? renderChildrenOverride(from, to)
      : renderChildrenContent(from ?? 0, to ?? childNodeKeys.length - 1);
  if (voidNode && renderVoid) {
    if (!path) {
      return null;
    }

    const children = renderChildren();

    return (
      <ElementContext
        key={`${nodeKey}:${ownRenderRevision}`}
        value={{ element: node, nodeKey, path }}
      >
        <EditableRenderedVoid
          element={node as TElement}
          isInline={inline}
          renderVoid={renderVoid}
        >
          {children}
        </EditableRenderedVoid>
      </ElementContext>
    );
  }

  const nodeRenderElement = renderElement;

  if (nodeRenderElement) {
    if (!path) {
      return null;
    }
    const RenderedElement = getEditableElementRenderer(nodeRenderElement);

    const renderElementPropsBase = {
      attributes,
      element: node as TElement,
      isInline: inline,
    };
    const renderElementProps = {
      attributes,
      element: node as TElement,
      get children() {
        const children = renderChildren();

        return voidNode && !inline ? (
          <EditorSpacer>{children}</EditorSpacer>
        ) : (
          children
        );
      },
      isInline: inline,
      slots: createEditableElementSlots(editor, {
        ...renderElementPropsBase,
        coverage,
        elementKey: nodeKey,
        isVoid: voidNode,
        renderElement,
        renderChildren,
        renderLeaf,
        renderPlaceholder,
        renderText,
        renderVoid,
        ownerPath: path,
        nodeKey: nodeKeyDOMValue ?? nodeKey,
      }),
    } as unknown as RenderElementProps<TElement>;

    return (
      <ElementContext
        key={`${nodeKey}:${ownRenderRevision}`}
        value={{ element: node, nodeKey, path }}
      >
        {React.createElement(RenderedElement, {
          path,
          props: renderElementProps,
        })}
      </ElementContext>
    );
  }

  if (voidNode) {
    if (!path) {
      return null;
    }

    const children = renderChildren();

    return (
      <ElementContext
        key={`${nodeKey}:${ownRenderRevision}`}
        value={{ element: node, nodeKey, path }}
      >
        <EditableRenderedVoid element={node as TElement} isInline={inline}>
          {children}
        </EditableRenderedVoid>
      </ElementContext>
    );
  }

  return (
    <ElementContext
      key={`${nodeKey}:${ownRenderRevision}`}
      value={{ element: node, nodeKey, path }}
    >
      <EditorElement
        style={{ position: 'relative' }}
        as={inline ? 'span' : 'div'}
        dir={direction}
        isInline={inline}
      >
        {renderChildren()}
      </EditorElement>
    </ElementContext>
  );
};

const EditableDescendantContent = React.memo(
  EditableDescendantNodeInner
) as typeof EditableDescendantNodeInner;

const EditableDescendantNodeWithChildren = <TElement extends ElementNode>({
  children,
  nodeKey,
  ...props
}: Parameters<typeof EditableDescendantNodeInner<TElement>>[0] & {
  children?: ReactNode;
}) => {
  useClaimEditableDOMCommit();

  return children ?? <EditableDescendantContent {...props} nodeKey={nodeKey} />;
};

export const EditableDescendantNode = React.memo(
  EditableDescendantNodeWithChildren
) as typeof EditableDescendantNodeWithChildren;

const EditableCoverageMaterializer = ({
  materialize,
}: {
  materialize: (boundary: DOMCoverageBoundary, range?: ModelRange) => boolean;
}) => {
  const coverage = useEditableDOMRuntime()?.domCoverage;
  useIsomorphicLayoutEffect(
    () =>
      coverage?.registerMaterializeHandler((boundary, _reason, options) =>
        materialize(boundary, options.range)
      ),
    [coverage, materialize]
  );
  return null;
};

const EditableInner = <TElement extends ElementNode>({
  autoFocus,
  className,
  disableDefaultStyles = false,
  id,
  ignoreBlankEditableRootClicks = false,
  onHistoryReplay,
  onDropResult,
  onPasteResult,
  onPointerSelectionEnd,
  readOnly = false,
  placeholder,
  renderElement,
  renderLeaf,
  renderPlaceholder,
  renderText,
  renderVoid,
  ref: forwardedRef,
  scrollSelectionIntoView,
  spellCheck,
  style,
  elementLayouts,
  nodeSelectionFocus,
  viewLines = null,
  viewportPlan = null,
  ...callerProps
}: EditorContentProps<TElement> & {
  elementLayouts?: ReadonlyMap<string, EditableElementLayout>;
  nodeSelectionFocus?: NodeSelectionFocus;
  viewLines?: ViewLines | null;
  viewportPlan?: EditableViewportPlan | null;
}) => {
  const editor = useEditorContext();
  const editableRoot = toInternalRoot(
    editor.read((state) => state.view.root())
  );
  const inheritedReadOnly = useInheritedReadOnly();
  const effectiveReadOnly = readOnly || inheritedReadOnly;
  const inactiveSelectionStore = React.useMemo(
    () => createPliteInactiveSelectionStore(editor),
    [editor]
  );
  const inactiveSelectionSourceId = React.useId();
  const inactiveSelectionDecorationSource = React.useMemo(
    () =>
      createPliteInactiveSelectionDecorationSource(
        editor,
        inactiveSelectionStore,
        `core:inactive-selection:${inactiveSelectionSourceId}`
      ),
    [editor, inactiveSelectionSourceId, inactiveSelectionStore]
  );
  useRegisterPliteDecorationSource(inactiveSelectionDecorationSource);
  const inactiveSelectionEditableRef = React.useRef<HTMLDivElement | null>(
    null
  );
  const ownerHandlers = useStableOwnerHandlers(callerProps);
  const bindViewHandlers = React.useMemo(
    () => createViewHandlerBinder({ editor }),
    [editor]
  );
  const {
    onBeforeInput,
    onBlurCapture,
    onDOMBeforeInput,
    onFocusCapture,
    onKeyDown,
    onPaste,
    ...attributes
  } = bindViewHandlers(callerProps);
  const [placeholderHeight, setPlaceholderHeight] = React.useState<
    number | null
  >(null);
  const placeholderResizeObserverRef = React.useRef<ResizeObserver | null>(
    null
  );
  const selectedViewportPaths = useSelectionPaths(viewportPlan != null);
  const topLevelNodeKeys = useRootNodeKeys();
  const editableRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      inactiveSelectionEditableRef.current = node;

      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );
  const scrollViewportPathIntoView = React.useCallback(
    (path: Path, align: 'auto' | 'center' | 'end' | 'start' = 'center') => {
      const targetIndex = path[0];
      let requested = false;

      if (typeof targetIndex === 'number' && viewportPlan?.requestMount) {
        viewportPlan.requestMount(targetIndex, path);
        requested = true;
      }

      return (viewportPlan?.scrollToPath(path, align) ?? false) || requested;
    },
    [viewportPlan]
  );
  const revealMounted = viewportPlan?.revealMounted;
  const hasViewportPlan = Boolean(viewportPlan);

  useIsomorphicLayoutEffect(() => {
    const root = inactiveSelectionEditableRef.current;

    if (!root || (!revealMounted && !hasViewportPlan)) return undefined;

    return setEditableRootReveal(root, {
      revealCulled: revealMounted ?? scrollViewportPathIntoView,
      revealMounted,
    });
  }, [hasViewportPlan, revealMounted, scrollViewportPathIntoView]);
  const materializeViewportBoundary = React.useCallback(
    (boundary: DOMCoverageBoundary, targetRange?: ModelRange) => {
      const path = targetRange?.anchor.path;
      const targetIndex = path?.[0] ?? boundary.coveredPathRanges[0]?.anchor[0];

      if (typeof targetIndex !== 'number' || !viewportPlan) return false;

      viewportPlan.requestMount?.(targetIndex, path);
      if (path) viewportPlan.scrollToPath(path, 'center');

      return true;
    },
    [viewportPlan]
  );
  const lastViewportScrollPathKeyRef = React.useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    const anchorPath = selectedViewportPaths?.[0];

    if (!viewportPlan || !anchorPath) {
      lastViewportScrollPathKeyRef.current = null;
      return;
    }

    const anchorPathKey = anchorPath.join('.');
    const lastCommit = editor.read((state) => state.lastCommit());

    if (lastCommit?.changed.hasAny('text')) return;

    const node = editor.read((state) => state.nodes.get(anchorPath)?.[0]);
    const shownKeys = viewportPlan.shownTopLevelNodeKeys;
    const anchorBlockKey = topLevelNodeKeys[anchorPath[0] ?? -1];
    const shown = shownKeys
      ? anchorBlockKey !== undefined && shownKeys.has(anchorBlockKey)
      : node && editor.api.dom.resolveDOMNode(node);

    if (shown) {
      lastViewportScrollPathKeyRef.current = anchorPathKey;
      return;
    }
    if (lastViewportScrollPathKeyRef.current === anchorPathKey) return;

    viewportPlan.requestMount?.(anchorPath[0] ?? 0, anchorPath);
    if (viewportPlan.scrollToPath(anchorPath, 'center')) {
      lastViewportScrollPathKeyRef.current = anchorPathKey;
    }
  }, [editor, selectedViewportPaths, topLevelNodeKeys, viewportPlan]);

  const placeholderValue = usePlaceholderValue(placeholder);
  const placeholderRef = React.useCallback(
    (placeholderElement: HTMLElement | null) => {
      placeholderResizeObserverRef.current?.disconnect();
      placeholderResizeObserverRef.current = null;

      if (!placeholderElement || !placeholderValue) {
        EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor);
        setPlaceholderHeight(null);
        return;
      }

      EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, placeholderElement);
      const measure = () => {
        const nextHeight = placeholderElement.getBoundingClientRect().height;
        setPlaceholderHeight(nextHeight > 0 ? nextHeight : null);
      };

      measure();
      if (typeof ResizeObserver !== 'undefined') {
        placeholderResizeObserverRef.current = new ResizeObserver(measure);
        placeholderResizeObserverRef.current.observe(placeholderElement);
      }
    },
    [editor, placeholderValue]
  );

  React.useEffect(
    () => () => {
      placeholderResizeObserverRef.current?.disconnect();
      placeholderResizeObserverRef.current = null;
      EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor);
    },
    [editor]
  );
  useIsomorphicLayoutEffect(() => {
    const document =
      inactiveSelectionEditableRef.current?.ownerDocument ??
      globalThis.document;

    if (!document) return undefined;

    return registerPliteInactiveSelectionFocus(
      document,
      inactiveSelectionStore
    );
  }, [inactiveSelectionStore]);
  const rootStyle =
    placeholderHeight && !disableDefaultStyles
      ? { minHeight: placeholderHeight, ...style }
      : style;
  const handleBlurCapture = React.useCallback<
    React.FocusEventHandler<HTMLDivElement>
  >(
    (event) => {
      resolvePliteInactiveSelectionBlur(
        event.currentTarget.ownerDocument,
        inactiveSelectionStore,
        event.relatedTarget
      );
      onBlurCapture?.(event);
    },
    [inactiveSelectionStore, onBlurCapture]
  );
  const handleFocusCapture = React.useCallback<
    React.FocusEventHandler<HTMLDivElement>
  >(
    (event) => {
      setPliteInactiveSelectionVisible(
        event.currentTarget.ownerDocument,
        inactiveSelectionStore,
        false
      );
      onFocusCapture?.(event);
    },
    [inactiveSelectionStore, onFocusCapture]
  );
  const descendant = (nodeKey: NodeKey) => (
    <EditableDescendantNode
      key={nodeKey}
      nodeKey={nodeKey}
      placeholder={placeholderValue}
      placeholderRef={placeholderRef}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      renderPlaceholder={renderPlaceholder}
      renderText={renderText}
      renderVoid={renderVoid}
    />
  );
  const missingBoundaries = viewportPlan?.missingRanges.map((range) => (
    <EditableViewportBoundary
      anchorNodeKey={range.anchorNodeKey}
      boundaryId={range.boundaryId}
      endIndex={range.endIndex}
      focusNodeKey={range.focusNodeKey}
      key={range.boundaryId}
      startIndex={range.startIndex}
    />
  ));
  const renderedNodes = viewportPlan ? (
    viewportPlan.coordinateSpace === 'flow' ? (
      <div
        data-editor-virtualized-viewport="true"
        style={{
          height: viewportPlan.totalSize,
          position: 'relative',
          width: '100%',
        }}
      >
        {missingBoundaries}
        {viewportPlan.items.map((item) => (
          <div
            data-index={item.index}
            data-editor-virtualized-row="true"
            key={item.nodeKey}
            ref={viewportPlan.measureElement}
            style={{
              left: 0,
              minHeight: item.size,
              pointerEvents: 'auto',
              position: 'absolute',
              top: 0,
              transform: `translateY(${item.start}px)`,
              width: '100%',
            }}
          >
            {descendant(item.nodeKey)}
          </div>
        ))}
      </div>
    ) : (
      <>
        {missingBoundaries}
        {viewportPlan.items.map((item) => descendant(item.nodeKey))}
      </>
    )
  ) : (
    topLevelNodeKeys.map(descendant)
  );

  return (
    <OwnerHandlersContext value={ownerHandlers}>
      <EditableElementLayoutsProvider layouts={elementLayouts ?? null}>
        <PliteEditingAreaContext value={true}>
          <PliteEditableRootContext value={editableRoot}>
            <ViewLinesContext value={viewLines}>
              <EditableDOMRoot
                autoFocus={autoFocus}
                {...attributes}
                className={className}
                deferNativeTextInputRepair={viewportPlan != null}
                disableDefaultStyles={disableDefaultStyles}
                viewportRuntime={
                  viewportPlan
                    ? {
                        mountedTopLevelNodeKeys:
                          viewportPlan.mountedTopLevelNodeKeys,
                        mountedTopLevelRanges:
                          viewportPlan.mountedTopLevelRanges,
                        scrollToPath: scrollViewportPathIntoView,
                        type: 'virtualized',
                      }
                    : null
                }
                id={id}
                ignoreBlankEditableRootClicks={ignoreBlankEditableRootClicks}
                nodeSelectionFocus={nodeSelectionFocus}
                onBeforeInput={onBeforeInput}
                onBlurCapture={handleBlurCapture}
                onDOMBeforeInput={onDOMBeforeInput}
                onFocusCapture={handleFocusCapture}
                onHistoryReplay={onHistoryReplay}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onDropResult={onDropResult}
                onPasteResult={onPasteResult}
                onPointerSelectionEnd={onPointerSelectionEnd}
                readOnly={effectiveReadOnly}
                ref={editableRootRef}
                scrollSelectionIntoView={scrollSelectionIntoView}
                spellCheck={spellCheck}
                style={rootStyle}
              >
                {viewportPlan && (
                  <EditableCoverageMaterializer
                    materialize={materializeViewportBoundary}
                  />
                )}
                {renderedNodes}
                <InactiveSelectionCaret
                  editableRef={inactiveSelectionEditableRef}
                  store={inactiveSelectionStore}
                />
                {!effectiveReadOnly && (
                  <ViewSelectionCaret
                    editableRef={inactiveSelectionEditableRef}
                  />
                )}
              </EditableDOMRoot>
            </ViewLinesContext>
          </PliteEditableRootContext>
        </PliteEditingAreaContext>
      </EditableElementLayoutsProvider>
    </OwnerHandlersContext>
  );
};

export const EditableViewportSurface = <
  TElement extends ElementNode = ElementNode,
>({
  decorationStore,
  elementLayouts,
  viewportPlan,
  ...props
}: EditorContentProps<TElement> & {
  decorationStore?: PliteDecorationStore | null;
  elementLayouts?: ReadonlyMap<string, EditableElementLayout>;
  viewLines?: ViewLines | null;
  viewportPlan: EditableViewportPlan | null;
}) => {
  const inheritedDecorationStore = React.useContext(DecorationContext);
  const content = (
    <EditableInner
      {...props}
      elementLayouts={elementLayouts}
      viewportPlan={viewportPlan}
    />
  );

  return decorationStore && decorationStore !== inheritedDecorationStore ? (
    <DecorationContext value={decorationStore}>{content}</DecorationContext>
  ) : (
    content
  );
};
const InactiveSelectionCaret = ({
  editableRef,
  store,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
  store: ReturnType<typeof createPliteInactiveSelectionStore>;
}) => {
  const visible = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => false
  );

  if (!visible) return null;

  return <InactiveSelectionCaretSelection editableRef={editableRef} />;
};

const ViewSelectionCaret = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const editor = useEditorContext();
  const focused = useEditorFocused();
  const readOnly = useInheritedReadOnly();
  const selection = React.useSyncExternalStore(
    React.useCallback(
      (notify) => subscribePliteViewSelection(editor, notify),
      [editor]
    ),
    React.useCallback(() => readPliteViewSelection(editor), [editor]),
    () => null
  );
  if (
    readOnly ||
    !focused ||
    !selection ||
    !isPliteViewSelectionCollapsed(selection)
  ) {
    return null;
  }
  return <ViewSelectionCaretGeometry editableRef={editableRef} />;
};

const ViewSelectionCaretGeometry = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const editor = useEditorContext();
  const owner = React.useMemo(
    () =>
      createRangeGeometryOwner(
        editor,
        {
          measure: (_view, editable) => {
            const selection = readPliteViewSelection(editor);
            if (!selection || !isPliteViewSelectionCollapsed(selection)) {
              return null;
            }
            const point = resolveViewBoundaryDOMPoint(editor, selection.focus);
            if (!point || !editable.contains(point[0])) return null;
            const rect = createDOMGeometryKernel({ root: editable }).pointRect(
              point,
              {
                association: selection.focus.affinity,
              }
            );
            if (!rect || rect.height <= 0) return null;
            return { boundingRect: rect, focusRect: rect, rects: [] };
          },
          subscribe: (_view, notify) =>
            subscribePliteViewSelection(editor, notify),
        },
        editableRef
      ),
    [editableRef, editor]
  );
  const geometry = useRangeGeometryOwner(owner);
  const rect = geometry?.focusRect;
  if (!rect || !geometry.visible?.focusRect || !geometry.clipRect) return null;
  return (
    <span
      aria-hidden="true"
      contentEditable={false}
      data-editor-view-selection-caret=""
      data-editor-root-chrome-ignore="true"
      style={{
        backgroundColor: 'currentColor',
        clipPath: clipToArea(rect, geometry.clipRect),
        height: rect.height,
        left: rect.left,
        pointerEvents: 'none',
        position: 'fixed',
        top: rect.top,
        width: 1,
      }}
    />
  );
};

const clipToArea = (
  origin: Readonly<{ left: number; top: number }>,
  area: ViewportRect
) =>
  `inset(${area.top - origin.top}px calc(100% - ${area.right - origin.left}px) calc(100% - ${area.bottom - origin.top}px) ${area.left - origin.left}px)`;

const InactiveSelectionCaretSelection = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const selection = useEditorSelection();

  if (!selection || !RangeApi.isCollapsed(selection)) return null;

  return <InactiveSelectionCaretGeometry editableRef={editableRef} />;
};

const InactiveSelectionCaretGeometry = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const geometry = useSelectionGeometry({ editableRef });
  const rect = geometry?.focusRect;

  if (!rect || !geometry.visible?.focusRect || !geometry.clipRect) return null;

  return (
    <span
      aria-hidden="true"
      contentEditable={false}
      data-editor-inactive-selection-caret=""
      data-editor-root-chrome-ignore="true"
      style={{
        clipPath: clipToArea(rect, geometry.clipRect),
        height: Math.max(rect.height, 1),
        left: rect.left,
        pointerEvents: 'none',
        position: 'fixed',
        top: rect.top,
      }}
    />
  );
};

/**
 * Render the editable content area for one Plite root.
 *
 * `EditorContent` renders the complete root DOM and owns renderers, events,
 * selection sync, and optional root scoping. Pass `root` to mount the editor
 * surface for a specific root.
 * When focus moves to an element or composed ancestor with
 * `data-editor-keep-selection-visible`, that exact `EditorContent` paints its
 * live canonical selection through `data-editor-inactive-selection` or
 * `data-editor-inactive-selection-caret` until focus returns or moves elsewhere.
 * A primary press on such an element counts as focus reaching it, for browsers
 * that do not focus a clicked button.
 */
export const EditorContent = <
  TElement extends ElementNode,
  const TRoot extends RootKey = RootKey,
>(
  props: EditorContentProps<TElement, TRoot>
) => {
  const { root, ...editableProps } = props;

  if (root === 'main') {
    throw new Error('Omit root to render the primary editable.');
  }
  const inheritedReadOnly = useInheritedReadOnly();
  const editor = useEditorContext();
  const rootReadOnly = props.readOnly || inheritedReadOnly;
  const editable = <EditableInner {...editableProps} />;

  return root === undefined ? (
    editable
  ) : (
    <SurfaceRoot editor={editor} readOnly={rootReadOnly} root={root}>
      {editable}
    </SurfaceRoot>
  );
};
