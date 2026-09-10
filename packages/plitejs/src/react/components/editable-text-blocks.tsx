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
  PathApi,
  RangeApi,
  type RootKey,
  type NodeKey,
  type Element as PliteElementNode,
  type Range as PliteRange,
  type Text as PliteTextNode,
} from '../..';
import {
  type DOMCoverageBoundary,
  type DOMCoverageCopyPolicy,
  type DOMCoverageFindPolicy,
  type DOMCoverageReason,
  type DOMCoverageSelectionPolicy,
  type DOMCoverageSession,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  IS_NODE_MAP_DIRTY,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
} from '../../dom/internal';
import {
  ElementContext,
  PliteContentRootOwnerContext,
  PliteDOMStrategyVirtualOffsetContext,
  PliteEditableRootContext,
} from '../context';
import { useRegisterPliteDecorationSource } from '../decoration-context';
import type { DOMStrategyOptions } from '../dom-strategy/create-segment-plan';
import { DOMStrategySegmentPlaceholder } from '../dom-strategy/segment-placeholder';
import {
  getVirtualizerScrollElement,
  useVirtualizedRootPlan,
} from '../dom-strategy/use-virtualized-root-plan';
import { DOMStrategyVirtualizedRangeBoundary } from '../dom-strategy/virtualized-range-boundary';
import { canSkipRendererForRetainedTextFlow } from '../dom-text-sync';
import { assertExternalTextElement } from '../editable/external-text-binding';
import { useRootInteractionController } from '../editable/root-interaction-controller';
import {
  useInternalSegmentDOMStrategyRootSources,
  usePlaceholderValue,
  useRootDocumentEpoch,
  useSelectionPaths,
  useTopLevelSelectionIndex,
} from '../editable/root-selector-sources';
import {
  type Editor,
  failInvariant,
  isEditor as editorIsEditor,
  isInline as editorIsInline,
  point as editorPoint,
  toInternalRoot,
} from '../editable/runtime-editor-api';
import { readRuntimeNode } from '../editable/runtime-live-state';
import { writeRuntimeSelection } from '../editable/runtime-mutation-state';
import type { ExternalTextOptions } from '../external-text';
import { useEditableDOMRuntime } from '../hooks/use-claim-editable-dom-commit';
import { useEditorComposing } from '../hooks/use-editor-composing';
import { useEditorContext } from '../hooks/use-editor-context';
import { useEditorReadOnly } from '../hooks/use-editor-read-only';
import { useEditorSelection } from '../hooks/use-editor-selection';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { useMountedNodeRenderSelector } from '../hooks/use-node-selector';
import { usePliteContentRoot } from '../hooks/use-plite-content-root';
import {
  getDOMTextRenderRevision,
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
import { recordPliteReactRender } from '../render-profiler';
import {
  type DOMCoverageBoundaryMaterializePayload,
  DOMCoverageBoundaryRange,
  DOMCoverageSelfBoundary,
} from './dom-coverage-boundary';
import {
  type EditableDOMBeforeInputHandler,
  EditableDOMRoot,
  type EditableDOMStrategyMetrics,
  type EditableDOMStrategyMetricsBase,
  type EditableKeyDownHandler,
} from './editable';
import {
  isEditableTextNode,
  readEditableDescendantBinding,
} from './editable-descendant-binding';
import {
  getDOMStrategyCohort,
  getDOMStrategyType,
  getInternalPartialDOMStrategyOptions,
  getInternalSegmentDOMStrategyConfig,
  getSnapshotPathKey,
  getVirtualizedDOMStrategyConfig,
  getVirtualizedDOMStrategyOptions,
  INTERNAL_PARTIAL_DOM_SEGMENT_SIZE,
  ROOT_GROUP_THRESHOLD,
} from './editable-dom-strategy-helpers';
import { EditableExternalText } from './editable-external-text';
import { sameDescendantBinding, sameNodeKeys } from './editable-node-equality';
import { getEditableElementRenderer } from './editable-rendered-element';
import {
  createRootGroupRenderItems,
  createRootGroups,
  createVirtualizedTopLevelItemGroups,
  EditableRootGroupPlaceholder,
  getActiveRootGroupIds,
  getRootGroupIdsForBoundary,
  getRootGroupPlanKey,
  useMountedRootGroupIds,
} from './editable-root-groups';
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
import { Plite } from './plite';
import { PliteElement } from './plite-element';
import { PliteSpacer } from './plite-spacer';
import { PliteInlineVoidShell, PliteVoidShell } from './plite-void-shell';

export { isPliteReactDevelopmentEnvironment } from './editable-rendered-element';

const subscribeClientDOM = () => () => {};
const getClientDOMSnapshot = () => true;
const getServerDOMSnapshot = () => false;

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
  findPolicy?: DOMCoverageFindPolicy;
  mounted?: boolean;
  onMaterialize?: (payload: DOMCoverageBoundaryMaterializePayload) => void;
  reason?: DOMCoverageReason;
  renderPlaceholder?: (
    context: EditableDOMCoverageBoundaryPlaceholderContext
  ) => ReactNode;
  scope: EditableDOMCoverageBoundaryScope;
  selectionPolicy?: DOMCoverageSelectionPolicy;
};

export type EditableContentRootSlotOptions = {
  ariaLabel?: string;
  className?: string;
  disableDefaultStyles?: boolean;
  domStrategy?: DOMStrategyOptions | null;
  id?: string;
  placeholder?: ReactNode;
  readOnly?: boolean;
  spellCheck?: TextareaHTMLAttributes<HTMLDivElement>['spellCheck'];
  style?: CSSProperties;
  tabIndex?: number;
};

type EditableContentRootSlotRenderers<
  TElement extends PliteElementNode = PliteElementNode,
> = {
  renderElement?: RenderElementRenderer<TElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  renderVoid?: RenderVoidRenderer<TElement>;
};

export type EditableElementSlots = {
  children: (range?: { from?: number; to?: number }) => ReactNode;
  /** Delegate one exact-one-Text block to an adapter while Plite owns its value. */
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

const createEditableElementSlots = <
  TElement extends PliteElementNode = PliteElementNode,
>(
  editor: ReturnType<typeof useEditorContext>,
  props: {
    coverage: DOMCoverageSession | undefined;
    element: TElement;
    renderElement?: RenderElementRenderer<TElement>;
    renderChildren: (from?: number, to?: number) => ReactNode;
    elementKey: NodeKey;
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
    findPolicy,
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
          findPolicy={findPolicy}
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
        findPolicy={findPolicy}
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
        throw new Error('Plite externalText requires a nonempty ariaLabel.');
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
          {childCount > 0
            ? renderContentBoundary({
                boundaryId: `content-root:${props.nodeKey}:${slot}`,
                copyPolicy: 'exclude',
                findPolicy: 'native',
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
  ownerPath,
  renderers,
  slot,
}: {
  element: PliteElementNode;
  options: EditableContentRootSlotOptions;
  ownerPath: Path;
  renderers: EditableContentRootSlotRenderers;
  slot: string;
}) {
  const ownerEditor = useEditorContext();
  const ownerRoot = toInternalRoot(
    ownerEditor.read((state) => state.view.root())
  );
  const { root } = usePliteContentRoot(element, { slot });
  const inheritedReadOnly = useEditorReadOnly();
  const readOnly = Boolean(options.readOnly || inheritedReadOnly);
  const contentRootOwner = React.useMemo(
    () => ({
      childRoot: root,
      ownerPath,
      ownerRoot,
    }),
    [ownerPath, ownerRoot, root]
  );

  return (
    <PliteContentRootOwnerContext value={contentRootOwner}>
      <Plite readOnly={readOnly} root={root}>
        <EditableContentRootView
          options={options}
          ownerPath={ownerPath}
          ownerRoot={ownerRoot}
          renderers={renderers}
          root={root}
          slot={slot}
        />
      </Plite>
    </PliteContentRootOwnerContext>
  );
}

function EditableContentRootView({
  options,
  ownerPath,
  ownerRoot,
  renderers,
  root,
  slot,
}: {
  options: EditableContentRootSlotOptions;
  ownerPath: Path;
  ownerRoot: RootKey;
  renderers: EditableContentRootSlotRenderers;
  root: RootKey;
  slot: string;
}) {
  const {
    ariaLabel,
    className,
    disableDefaultStyles,
    domStrategy,
    id,
    placeholder,
    spellCheck,
    style,
    tabIndex = 0,
  } = options;
  const {
    renderElement,
    renderLeaf,
    renderPlaceholder,
    renderText,
    renderVoid,
  } = renderers;
  const editor = useEditorContext();
  const inheritedReadOnly = useEditorReadOnly();
  const readOnly = Boolean(options.readOnly || inheritedReadOnly);
  const {
    getLastSelectionForRoot,
    getMountedViewEditor,
    registerContentRootOwner,
    setActiveViewEditor,
  } = useRequiredPliteRuntimeContext();
  useIsomorphicLayoutEffect(
    () =>
      registerContentRootOwner(editor, {
        childRoot: root,
        ownerPath,
        ownerRoot,
      }),
    [editor, ownerPath, ownerRoot, registerContentRootOwner, root]
  );
  const activateRootView = React.useCallback(() => {
    setActiveViewEditor(editor, root);
  }, [editor, root, setActiveViewEditor]);
  const externalMouseGestureRef = React.useRef(false);
  const rootInteraction = useRootInteractionController({
    disabled: readOnly,
    editor,
    getLastSelectionForRoot,
    getMountedViewEditor,
    root,
    selection: 'restore',
  });
  const onMouseDownCapture = React.useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(
    (event) => {
      externalMouseGestureRef.current = event.defaultPrevented;

      if (!externalMouseGestureRef.current) {
        activateRootView();
        rootInteraction.onMouseDownCapture(event);
      }
    },
    [activateRootView, rootInteraction]
  );
  const onMouseUpCapture = React.useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(
    (event) => {
      if (!externalMouseGestureRef.current) {
        activateRootView();
        rootInteraction.onMouseUpCapture(event);
      }
      externalMouseGestureRef.current = false;
    },
    [activateRootView, rootInteraction]
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
  const onFocusCapture = React.useCallback<
    React.FocusEventHandler<HTMLDivElement>
  >(() => {
    activateRootView();
  }, [activateRootView]);

  return (
    <div
      contentEditable={false}
      data-plite-content-root-owner-path={ownerPath.join(',')}
      data-plite-content-root-owner-root={ownerRoot}
      data-plite-content-root-slot={slot}
      onFocusCapture={onFocusCapture}
      onMouseDownCapture={onMouseDownCapture}
      onMouseMoveCapture={onMouseMoveCapture}
      onMouseUpCapture={onMouseUpCapture}
      suppressContentEditableWarning
    >
      <EditableInner
        aria-label={ariaLabel}
        className={className}
        disableDefaultStyles={disableDefaultStyles}
        domStrategy={domStrategy}
        id={id}
        placeholder={placeholder}
        readOnly={readOnly}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        renderText={renderText}
        renderVoid={renderVoid}
        spellCheck={spellCheck}
        style={style}
        tabIndex={tabIndex}
      />
    </div>
  );
}

export type RenderElementProps<
  TElement extends PliteElementNode = PliteElementNode,
> = TElement extends PliteElementNode
  ? {
      attributes: {
        'data-plite-inline'?: true;
        'data-plite-node': 'element';
        'data-plite-path': string;
        'data-plite-node-key': string;
        'data-plite-void'?: true;
        ref: React.RefCallback<HTMLElement>;
      };
      children: ReactNode;
      element: TElement;
      isInline: boolean;
      slots: EditableElementSlots;
    }
  : never;

export type RenderElementRenderer<
  TElement extends PliteElementNode = PliteElementNode,
> = (props: RenderElementProps<TElement>) => ReactNode;

export type RenderVoidProps<
  TElement extends PliteElementNode = PliteElementNode,
> = {
  element: TElement;
};

export type RenderVoidRenderer<
  TElement extends PliteElementNode = PliteElementNode,
> = (props: RenderVoidProps<TElement>) => ReactNode;

const EditableRenderedVoid = <
  TElement extends PliteElementNode = PliteElementNode,
>({
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
    <PliteInlineVoidShell content={content}>{children}</PliteInlineVoidShell>
  ) : (
    <PliteVoidShell content={content}>{children}</PliteVoidShell>
  );
};

const resolveTextZeroWidth = ({
  editor,
  node,
  path,
}: {
  editor: Editor;
  node: PliteTextNode;
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

export type EditableProps<
  TElement extends PliteElementNode = PliteElementNode,
  TRoot extends RootKey = RootKey,
> = {
  autoFocus?: boolean;
  className?: string;
  disableDefaultStyles?: boolean;
  id?: string;
  ignoreBlankEditableRootClicks?: boolean;
  /**
   * DOM strategy for large documents. `virtualized` is experimental and
   * must use the object form: `{ type: 'virtualized', ... }`.
   */
  domStrategy?: DOMStrategyOptions | null;
  onBeforeInput?: React.FormEventHandler<HTMLDivElement>;
  onDOMBeforeInput?: EditableDOMBeforeInputHandler;
  onKeyDown?: EditableKeyDownHandler;
  onDOMStrategyMetrics?: (metrics: EditableDOMStrategyMetrics) => void;
  onPaste?: React.ClipboardEventHandler<HTMLDivElement>;
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
} & Omit<
  TextareaHTMLAttributes<HTMLDivElement>,
  | 'autoFocus'
  | 'children'
  | 'className'
  | 'id'
  | 'onKeyDown'
  | 'onPaste'
  | 'placeholder'
  | 'readOnly'
  | 'spellCheck'
  | 'style'
>;

const EditableDescendantNodeInner = <TElement extends PliteElementNode>({
  placeholder,
  placeholderRef,
  renderElement,
  renderLeaf,
  renderPlaceholder,
  renderText,
  renderVoid,
  nodeKey,
}: {
  placeholder?: ReactNode;
  placeholderRef?: React.RefCallback<HTMLElement>;
  renderElement?: RenderElementRenderer<TElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  renderVoid?: RenderVoidRenderer<TElement>;
  nodeKey: NodeKey;
}) => {
  const editor = useEditorContext();
  const editableRuntime = useEditableDOMRuntime();
  const coverage = editableRuntime?.domCoverage;
  const nodeKeyDOMValue = usePliteNodeKeyDOMValue(nodeKey);

  const binding = useMountedNodeRenderSelector(
    ({ editor: editorValue, node, path }) =>
      readEditableDescendantBinding({
        editor: editorValue,
        node,
        path,
        renderLeaf,
        renderText,
      }),
    sameDescendantBinding,
    { nodeKey }
  );

  const {
    childNodeKeys,
    directTextChildNodes,
    isInline: inline,
    isVoid: voidNode,
    node,
    path,
    renderRevision,
  } = binding;
  const hasClientDOM = React.useSyncExternalStore(
    subscribeClientDOM,
    getClientDOMSnapshot,
    getServerDOMSnapshot
  );
  const isComposing = useEditorComposing();
  const compositionPath = editableRuntime?.compositionPath ?? null;
  const ownsComposition =
    isComposing &&
    (!compositionPath ||
      (path !== null &&
        (PathApi.equals(path, compositionPath) ||
          PathApi.isAncestor(path, compositionPath))));
  const canRenderImperativeTextFlow =
    React.useContext(ImperativeTextFlowContext) &&
    hasClientDOM &&
    !ownsComposition;
  const bindNodeRef = usePliteNodeRef(nodeKey, { path, pliteNode: node });

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

    return (
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
        pliteNode={node}
        text={node.text}
        zeroWidth={resolveTextZeroWidth({ editor, node, path })}
      />
    );
  }

  const attributes = {
    'data-plite-inline': inline ? (true as const) : undefined,
    'data-plite-node': 'element' as const,
    'data-plite-path': path.join(','),
    'data-plite-node-key': nodeKeyDOMValue,
    'data-plite-void': voidNode ? (true as const) : undefined,
    ref: bindNodeRef as React.RefCallback<HTMLElement>,
  };
  const renderDirectTextChild = (
    childNodeKey: NodeKey,
    child: Descendant | undefined,
    index: number
  ) => {
    if (!child || !isEditableTextNode(child) || renderLeaf || renderText) {
      return null;
    }

    const childPath = [...path, index] as Path;
    const { text: _text, ...marks } = child;

    NODE_TO_INDEX.set(child, index);
    NODE_TO_PARENT.set(child, node);
    IS_NODE_MAP_DIRTY.set(editor, false);

    return (
      <EditableText
        isLast={index === node.children.length - 1}
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
        pliteNode={child}
        text={child.text}
        zeroWidth={resolveTextZeroWidth({
          editor,
          node: child,
          path: childPath,
        })}
      />
    );
  };
  const renderChild = (childNodeKey: NodeKey, index: number) =>
    renderDirectTextChild(childNodeKey, node.children[index], index) ?? (
      <EditableDescendantNode
        key={`${childNodeKey}:${getDOMTextRenderRevision(editor, [
          childNodeKey,
        ])}`}
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
        const childPath = [...path, index] as Path;

        NODE_TO_INDEX.set(textNode, index);
        NODE_TO_PARENT.set(textNode, node);
        entries.push({
          isLast: index === node.children.length - 1,
          node: textNode,
          nodeKey: childNodeKey,
          path: childPath,
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
  const renderChildren = (from = 0, to = childNodeKeys.length - 1) =>
    renderChildrenContent(from, to);
  if (voidNode && renderVoid) {
    if (!path) {
      return null;
    }

    const children = renderChildren();

    return (
      <ElementContext key={nodeKey} value={{ element: node, nodeKey, path }}>
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
          <PliteSpacer>{children}</PliteSpacer>
        ) : (
          children
        );
      },
      isInline: inline,
      slots: createEditableElementSlots(editor, {
        ...renderElementPropsBase,
        coverage,
        elementKey: nodeKey,
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
      <ElementContext key={nodeKey} value={{ element: node, nodeKey, path }}>
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
      <ElementContext key={nodeKey} value={{ element: node, nodeKey, path }}>
        <EditableRenderedVoid element={node as TElement} isInline={inline}>
          {children}
        </EditableRenderedVoid>
      </ElementContext>
    );
  }

  return (
    <ElementContext key={nodeKey} value={{ element: node, nodeKey, path }}>
      <PliteElement
        style={{ position: 'relative' }}
        as={inline ? 'span' : 'div'}
        isInline={inline}
      >
        {renderChildren()}
      </PliteElement>
    </ElementContext>
  );
};

const EditableDescendantNode = React.memo(
  EditableDescendantNodeInner
) as typeof EditableDescendantNodeInner;

const EditableRootGroupInner = <TElement extends PliteElementNode>({
  endIndex,
  placeholder,
  placeholderRef,
  renderElement,
  renderLeaf,
  renderPlaceholder,
  renderText,
  renderVoid,
  nodeKeys,
  startIndex,
}: {
  endIndex: number;
  groupId: string;
  placeholder?: ReactNode;
  placeholderRef?: React.RefCallback<HTMLElement>;
  renderElement?: RenderElementRenderer<TElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  renderVoid?: RenderVoidRenderer<TElement>;
  nodeKeys: readonly NodeKey[];
  startIndex: number;
}) => {
  recordPliteReactRender({
    id: `${startIndex}-${endIndex}`,
    kind: 'group',
  });

  return (
    <>
      {nodeKeys.map((nodeKey) => (
        <EditableDescendantNode
          key={nodeKey}
          placeholder={placeholder}
          placeholderRef={placeholderRef}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          renderPlaceholder={renderPlaceholder}
          renderText={renderText}
          renderVoid={renderVoid}
          nodeKey={nodeKey}
        />
      ))}
    </>
  );
};

const EditableRootGroup = React.memo(
  EditableRootGroupInner,
  (previous, next) =>
    previous.endIndex === next.endIndex &&
    previous.groupId === next.groupId &&
    previous.placeholder === next.placeholder &&
    previous.placeholderRef === next.placeholderRef &&
    previous.renderElement === next.renderElement &&
    previous.renderLeaf === next.renderLeaf &&
    previous.renderPlaceholder === next.renderPlaceholder &&
    previous.renderText === next.renderText &&
    previous.renderVoid === next.renderVoid &&
    previous.startIndex === next.startIndex &&
    sameNodeKeys(previous.nodeKeys, next.nodeKeys)
) as typeof EditableRootGroupInner;

const EditableCoverageMaterializer = ({
  materialize,
}: {
  materialize: (boundary: DOMCoverageBoundary, range?: PliteRange) => boolean;
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

const EditableInner = <TElement extends PliteElementNode>({
  autoFocus,
  className,
  disableDefaultStyles = false,
  enableVirtualizedRendering = false,
  id,
  ignoreBlankEditableRootClicks = false,
  domStrategy,
  onBeforeInput,
  onBlurCapture,
  onDOMBeforeInput,
  onFocusCapture,
  onKeyDown,
  onDOMStrategyMetrics,
  onPaste,
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
  ...attributes
}: EditableProps<TElement> & {
  enableVirtualizedRendering?: boolean;
}) => {
  const domStrategyOptions = domStrategy;
  const editor = useEditorContext();
  const editableRoot = toInternalRoot(
    editor.read((state) => state.view.root())
  );
  const inheritedReadOnly = useEditorReadOnly();
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
        `plite-inactive-selection:${inactiveSelectionSourceId}`
      ),
    [editor, inactiveSelectionSourceId, inactiveSelectionStore]
  );
  useRegisterPliteDecorationSource(inactiveSelectionDecorationSource);
  const [promotedSegmentIndex, setPromotedSegmentIndex] = React.useState<
    number | null
  >(null);
  const [promotedSegmentOverscan, setPromotedSegmentOverscan] = React.useState<
    number | null
  >(null);
  const [promotedSegmentWindowStartIndex, setPromotedSegmentWindowStartIndex] =
    React.useState<number | null>(null);
  const [placeholderHeight, setPlaceholderHeight] = React.useState<
    number | null
  >(null);
  const [domStrategyRootElement, setDOMStrategyRootElement] =
    React.useState<HTMLDivElement | null>(null);
  const inactiveSelectionEditableRef = React.useRef<HTMLDivElement | null>(
    null
  );
  const [
    promotedVirtualizedTopLevelIndex,
    setPromotedVirtualizedTopLevelIndex,
  ] = React.useState<number | null>(null);
  const cancelPromotedSegmentOverscanRestoreRef = React.useRef<
    (() => void) | null
  >(null);
  const placeholderResizeObserverRef = React.useRef<ResizeObserver | null>(
    null
  );
  const domStrategyType = getDOMStrategyType(domStrategyOptions);
  const internalPartialDOMStrategyOptions =
    getInternalPartialDOMStrategyOptions(domStrategyOptions);
  const virtualizedDOMStrategyOptions =
    getVirtualizedDOMStrategyOptions(domStrategyOptions);
  const internalPartialDOMStrategyOverscan =
    internalPartialDOMStrategyOptions?.overscan ?? 0;
  const internalPartialDOMStrategySegmentSize =
    internalPartialDOMStrategyOptions?.segmentSize ??
    INTERNAL_PARTIAL_DOM_SEGMENT_SIZE;
  const internalPartialDOMStrategyPreviewChars =
    internalPartialDOMStrategyOptions?.previewChars ?? 96;
  const internalPartialDOMStrategyThreshold =
    internalPartialDOMStrategyOptions?.threshold ?? 2000;
  const domStrategyVirtualizedEstimatedBlockSize =
    virtualizedDOMStrategyOptions?.estimatedBlockSize ?? 32;
  const domStrategyVirtualizedOverscan =
    virtualizedDOMStrategyOptions?.overscan ?? 2;
  const domStrategyVirtualizedThreshold =
    virtualizedDOMStrategyOptions?.threshold ?? 25_000;
  const internalSegmentDOMStrategyConfig = React.useMemo(
    () =>
      getInternalSegmentDOMStrategyConfig({
        domStrategyType,
        overscan: internalPartialDOMStrategyOverscan,
        previewChars: internalPartialDOMStrategyPreviewChars,
        segmentSize: internalPartialDOMStrategySegmentSize,
        threshold: internalPartialDOMStrategyThreshold,
      }),
    [
      domStrategyType,
      internalPartialDOMStrategyOverscan,
      internalPartialDOMStrategyPreviewChars,
      internalPartialDOMStrategySegmentSize,
      internalPartialDOMStrategyThreshold,
    ]
  );
  const virtualizedDOMStrategyConfig = React.useMemo(
    () =>
      getVirtualizedDOMStrategyConfig({
        domStrategyType,
        estimatedBlockSize: domStrategyVirtualizedEstimatedBlockSize,
        overscan: domStrategyVirtualizedOverscan,
        threshold: domStrategyVirtualizedThreshold,
      }),
    [
      domStrategyType,
      domStrategyVirtualizedEstimatedBlockSize,
      domStrategyVirtualizedOverscan,
      domStrategyVirtualizedThreshold,
    ]
  );
  const editableRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      inactiveSelectionEditableRef.current = node;

      if (virtualizedDOMStrategyConfig) {
        setDOMStrategyRootElement(node);
      }

      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, virtualizedDOMStrategyConfig]
  );
  const {
    segmentPlan,
    mountedTopLevelRanges,
    mountedTopLevelNodeKeys,
    topLevelNodeKeys,
  } = useInternalSegmentDOMStrategyRootSources({
    internalSegmentDOMStrategyConfig,
    promotedSegmentIndex,
    promotedSegmentOverscan,
    promotedWindowStartIndex: promotedSegmentWindowStartIndex,
  });
  const selectedVirtualizedTopLevelIndex = useTopLevelSelectionIndex(
    virtualizedDOMStrategyConfig != null
  );
  const selectedDOMStrategyPaths = useSelectionPaths(
    virtualizedDOMStrategyConfig != null || domStrategyType === 'staged'
  );
  const virtualizedScrollElement = React.useMemo(
    () => getVirtualizerScrollElement(domStrategyRootElement),
    [domStrategyRootElement]
  );
  const virtualizedScrollRootReady =
    virtualizedDOMStrategyConfig != null && virtualizedScrollElement != null;
  const virtualizedPageItems = virtualizedDOMStrategyOptions?.layout?.pageItems;
  const visibleVirtualizedPageItems =
    virtualizedDOMStrategyOptions?.layout?.visiblePageItems;
  const virtualizedLayoutItems =
    virtualizedDOMStrategyOptions?.layout?.topLevelItems;
  const virtualizedPlan = useVirtualizedRootPlan({
    config: enableVirtualizedRendering ? virtualizedDOMStrategyConfig : null,
    enabled: enableVirtualizedRendering && virtualizedScrollRootReady,
    pageLayoutItems: virtualizedPageItems,
    promotedTopLevelIndex: promotedVirtualizedTopLevelIndex,
    rootElement: domStrategyRootElement,
    scrollElement: virtualizedScrollElement,
    selectionPaths: selectedDOMStrategyPaths,
    selectedTopLevelIndex: selectedVirtualizedTopLevelIndex,
    topLevelLayoutItems: virtualizedLayoutItems,
    topLevelNodeKeys,
    visiblePageLayoutItems: visibleVirtualizedPageItems,
  });
  const internalSegmentDOMStrategySize =
    internalSegmentDOMStrategyConfig?.segmentSize ?? null;
  const internalSegmentDOMStrategyOverscan =
    internalSegmentDOMStrategyConfig?.overscan ?? 0;
  const rootDocumentEpoch = useRootDocumentEpoch();
  const shouldUseStagedFallback =
    domStrategyType === 'virtualized' && virtualizedPlan == null;
  const rootGroups = React.useMemo(() => {
    if (
      (domStrategyType !== 'staged' && !shouldUseStagedFallback) ||
      segmentPlan ||
      topLevelNodeKeys.length < ROOT_GROUP_THRESHOLD
    ) {
      return null;
    }

    recordPliteReactRender({
      id: 'staged-root-groups',
      kind: 'root-plan',
    });

    return createRootGroups(topLevelNodeKeys);
  }, [domStrategyType, segmentPlan, shouldUseStagedFallback, topLevelNodeKeys]);
  const rootGroupPlanKey = React.useMemo(
    () =>
      rootGroups
        ? getRootGroupPlanKey(topLevelNodeKeys, rootDocumentEpoch)
        : null,
    [rootDocumentEpoch, rootGroups, topLevelNodeKeys]
  );
  const selectedRootGroupIndex = useTopLevelSelectionIndex(rootGroups != null);
  const selectedRootGroupFocusIndex = React.useMemo(() => {
    const focusIndex = selectedDOMStrategyPaths?.[1]?.[0];

    return typeof focusIndex === 'number' ? focusIndex : selectedRootGroupIndex;
  }, [selectedDOMStrategyPaths, selectedRootGroupIndex]);
  const activeRootGroupIds = React.useMemo(
    () => getActiveRootGroupIds(rootGroups, selectedRootGroupFocusIndex),
    [rootGroups, selectedRootGroupFocusIndex]
  );
  const { activeGroupIds, mountedGroupIds, mountGroupIds } =
    useMountedRootGroupIds({
      activeGroupIds: activeRootGroupIds,
      documentEpoch: rootDocumentEpoch,
      groups: rootGroups,
      planKey: rootGroupPlanKey,
    });
  const materializeRootGroupBoundary = React.useCallback(
    (boundary: DOMCoverageBoundary, targetRange?: PliteRange) => {
      const groupIds = getRootGroupIdsForBoundary(
        rootGroups,
        boundary,
        targetRange
      );

      if (groupIds.length === 0) {
        return false;
      }

      mountGroupIds(groupIds);
      return true;
    },
    [mountGroupIds, rootGroups]
  );

  const scrollVirtualizedPathIntoView = React.useCallback(
    (path: Path, align: 'auto' | 'center' | 'end' | 'start' = 'center') => {
      const targetIndex = path[0];

      if (typeof targetIndex === 'number') {
        setPromotedVirtualizedTopLevelIndex(targetIndex);
      }

      return virtualizedPlan?.scrollToPath(path, align) ?? false;
    },
    [virtualizedPlan]
  );
  const materializeVirtualizedBoundary = React.useCallback(
    (boundary: DOMCoverageBoundary, targetRange?: PliteRange) => {
      const targetIndex =
        targetRange?.anchor.path[0] ?? boundary.coveredPathRanges[0]?.anchor[0];

      if (typeof targetIndex !== 'number') {
        return false;
      }

      setPromotedVirtualizedTopLevelIndex(targetIndex);
      if (
        targetRange &&
        scrollVirtualizedPathIntoView(targetRange.anchor.path)
      ) {
        return true;
      }

      virtualizedPlan?.scrollToTopLevelIndex(targetIndex, 'center');

      return true;
    },
    [scrollVirtualizedPathIntoView, virtualizedPlan]
  );

  const lastVirtualizedScrollPathKeyRef = React.useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    const anchorPath = selectedDOMStrategyPaths?.[0];

    if (!virtualizedPlan || !anchorPath) {
      lastVirtualizedScrollPathKeyRef.current = null;
      return;
    }

    const anchorPathKey = getSnapshotPathKey(anchorPath);
    const lastCommit = editor.read((state) => state.lastCommit());

    if (lastCommit?.changed.hasAny('text')) {
      return;
    }

    const node = editor.read((state) => state.nodes.get(anchorPath)?.[0]);

    if (node && editor.api.dom.resolveDOMNode(node)) {
      lastVirtualizedScrollPathKeyRef.current = anchorPathKey;
      return;
    }

    if (lastVirtualizedScrollPathKeyRef.current === anchorPathKey) {
      return;
    }

    if (virtualizedPlan.scrollToPath(anchorPath, 'center')) {
      lastVirtualizedScrollPathKeyRef.current = anchorPathKey;
    }
  }, [selectedDOMStrategyPaths, virtualizedPlan]);
  const renderedRootGroups = React.useMemo(() => {
    if (!rootGroups) {
      return null;
    }

    return rootGroups.map((group) => ({
      ...group,
      isMounted:
        activeGroupIds.has(group.groupId) || mountedGroupIds.has(group.groupId),
    }));
  }, [activeGroupIds, mountedGroupIds, rootGroups]);
  const domPresentMountedGroups = React.useMemo(
    () => renderedRootGroups?.filter((group) => group.isMounted) ?? null,
    [renderedRootGroups]
  );
  const domPresentMountedTopLevelNodeKeys = React.useMemo(
    () =>
      domPresentMountedGroups
        ? new Set(
            domPresentMountedGroups.flatMap((group) => [...group.nodeKeys])
          )
        : null,
    [domPresentMountedGroups]
  );
  const domPresentMountedTopLevelRanges = React.useMemo(
    () =>
      domPresentMountedGroups?.map((group) => ({
        endIndex: group.endIndex,
        startIndex: group.startIndex,
      })) ?? null,
    [domPresentMountedGroups]
  );
  const renderedRootGroupItems = React.useMemo(
    () =>
      renderedRootGroups
        ? createRootGroupRenderItems(renderedRootGroups)
        : null,
    [renderedRootGroups]
  );
  const handlePromoteSegment = React.useCallback(
    (
      segmentIndex: number,
      options: { select?: boolean; startIndex?: number } = {}
    ) => {
      cancelPromotedSegmentOverscanRestoreRef.current?.();
      cancelPromotedSegmentOverscanRestoreRef.current = null;

      const startIndex =
        options.startIndex ??
        (internalSegmentDOMStrategySize == null
          ? null
          : segmentIndex * internalSegmentDOMStrategySize);

      if (options.select && internalSegmentDOMStrategySize != null) {
        try {
          const start = editorPoint(
            editor,
            [startIndex ?? failInvariant('Expected value to be defined')],
            {
              edge: 'start',
            }
          );
          writeRuntimeSelection(editor, { anchor: start, focus: start });
        } catch {
          // Leave selection unchanged for non-text-startable segments.
        }
      }

      const restoreOverscan = () => {
        cancelPromotedSegmentOverscanRestoreRef.current = null;
        setPromotedSegmentOverscan(null);
      };

      setPromotedSegmentIndex(segmentIndex);
      setPromotedSegmentWindowStartIndex(startIndex);

      if (internalSegmentDOMStrategyOverscan > 0) {
        setPromotedSegmentOverscan(0);

        if (typeof window.requestIdleCallback === 'function') {
          const idleHandle = window.requestIdleCallback(restoreOverscan, {
            timeout: 120,
          });
          cancelPromotedSegmentOverscanRestoreRef.current = () => {
            window.cancelIdleCallback(idleHandle);
          };
        } else {
          const timeoutHandle = window.setTimeout(restoreOverscan, 120);
          cancelPromotedSegmentOverscanRestoreRef.current = () => {
            window.clearTimeout(timeoutHandle);
          };
        }
      } else {
        setPromotedSegmentOverscan(null);
      }
    },
    [editor, internalSegmentDOMStrategyOverscan, internalSegmentDOMStrategySize]
  );

  React.useEffect(
    () => () => {
      cancelPromotedSegmentOverscanRestoreRef.current?.();
      cancelPromotedSegmentOverscanRestoreRef.current = null;
    },
    []
  );
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
  const domStrategyMetrics = React.useMemo(() => {
    const documentSize = topLevelNodeKeys.length;
    const mountedTopLevelCount = virtualizedPlan
      ? virtualizedPlan.mountedTopLevelNodeKeys.size
      : segmentPlan
        ? segmentPlan.segments.reduce(
            (total, segment) => total + segment.mountedNodeKeys.length,
            0
          )
        : domPresentMountedTopLevelNodeKeys
          ? domPresentMountedTopLevelNodeKeys.size
          : documentSize;
    const partialDOMCount =
      segmentPlan?.segments.filter((segment) => !segment.isActive).length ?? 0;
    const virtualizedBoundaryCount = virtualizedPlan?.missingRanges.length ?? 0;
    const rootGroupCount = rootGroups?.length ?? 0;
    const mountedGroupCount = renderedRootGroups
      ? renderedRootGroups.filter((group) => group.isMounted).length
      : virtualizedPlan
        ? virtualizedPlan.mountedTopLevelRanges.length
        : segmentPlan
          ? segmentPlan.segments.filter((segment) => segment.isActive).length
          : rootGroupCount;
    const pendingGroupCount = renderedRootGroups
      ? renderedRootGroups.length - mountedGroupCount
      : virtualizedPlan
        ? virtualizedBoundaryCount
        : partialDOMCount;
    const effectiveStrategy = virtualizedPlan
      ? 'virtualized'
      : segmentPlan
        ? 'partial-dom'
        : rootGroups
          ? 'staged'
          : domStrategyType === 'full'
            ? 'full'
            : 'plain';
    const nativeSurfaceComplete =
      effectiveStrategy === 'staged'
        ? pendingGroupCount === 0
        : effectiveStrategy !== 'partial-dom' &&
          effectiveStrategy !== 'virtualized';
    const degradationMode =
      effectiveStrategy === 'partial-dom'
        ? 'partial-dom'
        : effectiveStrategy === 'virtualized'
          ? 'virtualized'
          : effectiveStrategy === 'staged' && !nativeSurfaceComplete
            ? 'staged-warmup'
            : 'none';
    const requestedStrategy =
      domStrategyType === 'partial-dom'
        ? 'internal-partial-dom'
        : domStrategyType;

    return {
      activeSegmentIndex:
        segmentPlan?.activeSegmentIndex ??
        selectedVirtualizedTopLevelIndex ??
        null,
      overscan:
        internalSegmentDOMStrategyConfig?.overscan ??
        virtualizedDOMStrategyConfig?.overscan ??
        null,
      cohort: getDOMStrategyCohort(documentSize),
      degradationMode,
      documentSize,
      effectiveStrategy,
      estimatedBlockSize:
        virtualizedDOMStrategyConfig?.estimatedBlockSize ?? null,
      segmentSize: internalSegmentDOMStrategyConfig?.segmentSize ?? null,
      mountedGroupCount,
      mountedTopLevelCount,
      nativeSurfaceComplete,
      pendingGroupCount,
      pendingTopLevelCount: Math.max(0, documentSize - mountedTopLevelCount),
      requestedStrategy,
      threshold:
        internalSegmentDOMStrategyConfig?.threshold ??
        virtualizedDOMStrategyConfig?.threshold ??
        ROOT_GROUP_THRESHOLD,
      virtualizerMeasuredCount:
        virtualizedPlan?.virtualizerMeasuredCount ?? null,
    } satisfies EditableDOMStrategyMetricsBase;
  }, [
    domPresentMountedTopLevelNodeKeys,
    virtualizedPlan,
    segmentPlan,
    internalSegmentDOMStrategyConfig,
    virtualizedDOMStrategyConfig,
    domStrategyType,
    renderedRootGroups,
    rootGroups,
    selectedVirtualizedTopLevelIndex,
    topLevelNodeKeys.length,
  ]);
  const virtualizedItemGroups = virtualizedPlan
    ? createVirtualizedTopLevelItemGroups(virtualizedPlan.virtualItems)
    : null;

  return (
    <PliteEditableRootContext value={editableRoot}>
      <EditableDOMRoot
        autoFocus={autoFocus}
        {...attributes}
        className={className}
        deferNativeTextInputRepair={domStrategyType === 'virtualized'}
        disableDefaultStyles={disableDefaultStyles}
        domStrategyMetrics={domStrategyMetrics}
        domStrategyRuntime={
          virtualizedPlan
            ? {
                mountedTopLevelNodeKeys:
                  virtualizedPlan.mountedTopLevelNodeKeys,
                mountedTopLevelRanges:
                  virtualizedPlan.mountedTopLevelRanges ?? undefined,
                scrollToPath: scrollVirtualizedPathIntoView,
                type: 'virtualized',
              }
            : segmentPlan
              ? {
                  mountedTopLevelNodeKeys,
                  mountedTopLevelRanges: mountedTopLevelRanges ?? undefined,
                  type: 'partial-dom',
                }
              : rootGroups
                ? {
                    mountedTopLevelNodeKeys: domPresentMountedTopLevelNodeKeys,
                    mountedTopLevelRanges:
                      domPresentMountedTopLevelRanges ?? undefined,
                    type: 'staged',
                  }
                : null
        }
        id={id}
        ignoreBlankEditableRootClicks={
          ignoreBlankEditableRootClicks ||
          virtualizedDOMStrategyOptions?.layout != null
        }
        onBeforeInput={onBeforeInput}
        onBlurCapture={handleBlurCapture}
        onDOMBeforeInput={onDOMBeforeInput}
        onDOMStrategyMetrics={onDOMStrategyMetrics}
        onFocusCapture={handleFocusCapture}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        readOnly={effectiveReadOnly}
        ref={editableRootRef}
        scrollSelectionIntoView={scrollSelectionIntoView}
        spellCheck={spellCheck}
        style={rootStyle}
      >
        {rootGroups && (
          <EditableCoverageMaterializer
            materialize={materializeRootGroupBoundary}
          />
        )}
        {virtualizedPlan && (
          <EditableCoverageMaterializer
            materialize={materializeVirtualizedBoundary}
          />
        )}
        {virtualizedPlan ? (
          <div
            data-plite-dom-strategy-virtualizer="true"
            style={{
              height: virtualizedPlan.totalSize,
              position: 'relative',
              width: '100%',
            }}
          >
            {virtualizedPlan.missingRanges.map((range) => (
              <DOMStrategyVirtualizedRangeBoundary
                anchorNodeKey={range.anchorNodeKey}
                boundaryId={range.boundaryId}
                endIndex={range.endIndex}
                focusNodeKey={range.focusNodeKey}
                key={range.boundaryId}
                startIndex={range.startIndex}
              />
            ))}
            {(
              virtualizedItemGroups ??
              failInvariant('Expected value to be defined')
            ).map((group) => (
              <div
                data-plite-dom-strategy-virtual-row-group="true"
                key={group.groupId}
                style={{
                  left: 0,
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: 0,
                  transform: `translateY(${group.start}px)`,
                  width: '100%',
                }}
              >
                {group.items.map((item) => {
                  const hasInlineBounds =
                    typeof item.left === 'number' &&
                    typeof item.width === 'number';

                  return (
                    <div
                      data-index={item.index}
                      data-plite-dom-strategy-virtual-row="true"
                      key={String(item.key)}
                      ref={virtualizedPlan.measureElement}
                      style={{
                        minHeight: item.size,
                        pointerEvents: 'none',
                        position: 'relative',
                        width: '100%',
                      }}
                    >
                      <PliteDOMStrategyVirtualOffsetContext value={item.start}>
                        <div
                          style={{
                            marginLeft: hasInlineBounds ? item.left : undefined,
                            minHeight: item.size,
                            pointerEvents: hasInlineBounds ? 'none' : 'auto',
                            position: hasInlineBounds ? 'static' : 'relative',
                            width: hasInlineBounds ? item.width : '100%',
                          }}
                        >
                          <EditableDescendantNode
                            placeholder={placeholderValue}
                            placeholderRef={placeholderRef}
                            renderElement={renderElement}
                            renderLeaf={renderLeaf}
                            renderPlaceholder={renderPlaceholder}
                            renderText={renderText}
                            renderVoid={renderVoid}
                            nodeKey={item.nodeKey}
                          />
                        </div>
                      </PliteDOMStrategyVirtualOffsetContext>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : segmentPlan ? (
          segmentPlan.segments.map((segment) =>
            segment.isActive ? (
              <React.Fragment key={`partial-dom-${segment.segmentIndex}`}>
                {segment.mountedStartIndex != null &&
                segment.mountedStartIndex > segment.startIndex ? (
                  <DOMStrategySegmentPlaceholder
                    boundaryId={`partial-dom-aggressive:${segment.segmentIndex}:before`}
                    coverageReason={
                      domStrategyType === 'virtualized'
                        ? 'viewport-virtualization'
                        : 'partial-dom-aggressive'
                    }
                    dataSegment={`${segment.segmentIndex}:before`}
                    endIndex={segment.mountedStartIndex - 1}
                    onPromote={handlePromoteSegment}
                    previewChars={
                      (
                        internalSegmentDOMStrategyConfig ??
                        failInvariant('Expected value to be defined')
                      ).previewChars
                    }
                    nodeKeys={segment.nodeKeys.slice(
                      0,
                      segment.mountedStartIndex - segment.startIndex
                    )}
                    segmentIndex={segment.segmentIndex}
                    startIndex={segment.startIndex}
                  />
                ) : null}
                {segment.mountedNodeKeys.map((nodeKey) => (
                  <EditableDescendantNode
                    key={nodeKey}
                    placeholder={placeholderValue}
                    placeholderRef={placeholderRef}
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    renderPlaceholder={renderPlaceholder}
                    renderText={renderText}
                    renderVoid={renderVoid}
                    nodeKey={nodeKey}
                  />
                ))}
                {segment.mountedEndIndex != null &&
                segment.mountedEndIndex < segment.endIndex ? (
                  <DOMStrategySegmentPlaceholder
                    boundaryId={`partial-dom-aggressive:${segment.segmentIndex}:after`}
                    coverageReason={
                      domStrategyType === 'virtualized'
                        ? 'viewport-virtualization'
                        : 'partial-dom-aggressive'
                    }
                    dataSegment={`${segment.segmentIndex}:after`}
                    endIndex={segment.endIndex}
                    onPromote={handlePromoteSegment}
                    previewChars={
                      (
                        internalSegmentDOMStrategyConfig ??
                        failInvariant('Expected value to be defined')
                      ).previewChars
                    }
                    nodeKeys={segment.nodeKeys.slice(
                      segment.mountedEndIndex - segment.startIndex + 1
                    )}
                    segmentIndex={segment.segmentIndex}
                    startIndex={segment.mountedEndIndex + 1}
                  />
                ) : null}
              </React.Fragment>
            ) : (
              <DOMStrategySegmentPlaceholder
                coverageReason={
                  domStrategyType === 'virtualized'
                    ? 'viewport-virtualization'
                    : 'partial-dom-aggressive'
                }
                endIndex={segment.endIndex}
                key={`partial-dom-${segment.segmentIndex}`}
                onPromote={handlePromoteSegment}
                previewChars={
                  (
                    internalSegmentDOMStrategyConfig ??
                    failInvariant('Expected value to be defined')
                  ).previewChars
                }
                nodeKeys={segment.nodeKeys}
                segmentIndex={segment.segmentIndex}
                startIndex={segment.startIndex}
              />
            )
          )
        ) : renderedRootGroupItems ? (
          renderedRootGroupItems.map((item) =>
            item.kind === 'mounted' ? (
              <EditableRootGroup
                endIndex={item.group.endIndex}
                groupId={item.group.groupId}
                key={item.group.groupId}
                placeholder={placeholderValue}
                placeholderRef={placeholderRef}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                renderPlaceholder={renderPlaceholder}
                renderText={renderText}
                renderVoid={renderVoid}
                nodeKeys={item.group.nodeKeys}
                startIndex={item.group.startIndex}
              />
            ) : (
              <EditableRootGroupPlaceholder
                anchorNodeKey={item.anchorNodeKey}
                endIndex={item.endIndex}
                focusNodeKey={item.focusNodeKey}
                groupId={item.groupId}
                key={item.groupId}
                startIndex={item.startIndex}
              />
            )
          )
        ) : (
          topLevelNodeKeys.map((nodeKey) => (
            <EditableDescendantNode
              key={nodeKey}
              placeholder={placeholderValue}
              placeholderRef={placeholderRef}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              renderPlaceholder={renderPlaceholder}
              renderText={renderText}
              renderVoid={renderVoid}
              nodeKey={nodeKey}
            />
          ))
        )}
        <PliteInactiveSelectionCaret
          editableRef={inactiveSelectionEditableRef}
          store={inactiveSelectionStore}
        />
      </EditableDOMRoot>
    </PliteEditableRootContext>
  );
};

const PliteInactiveSelectionCaret = ({
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

  return <PliteInactiveSelectionCaretSelection editableRef={editableRef} />;
};

const PliteInactiveSelectionCaretSelection = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const selection = useEditorSelection();

  if (!selection || !RangeApi.isCollapsed(selection)) return null;

  return <PliteInactiveSelectionCaretGeometry editableRef={editableRef} />;
};

const PliteInactiveSelectionCaretGeometry = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const geometry = useSelectionGeometry({ editableRef });

  if (!geometry?.focusRect) return null;

  const rect = geometry.focusRect;

  return (
    <span
      aria-hidden="true"
      contentEditable={false}
      data-plite-inactive-selection-caret=""
      data-plite-root-chrome-ignore="true"
      style={{
        height: Math.max(rect.height, 1),
        left: rect.left,
        pointerEvents: 'none',
        position: 'fixed',
        top: rect.top,
      }}
    />
  );
};

const EditableVirtualized = <TElement extends PliteElementNode>(
  props: EditableProps<TElement>
) => <EditableInner {...props} enableVirtualizedRendering />;

const EditableNonVirtualized = <TElement extends PliteElementNode>(
  props: EditableProps<TElement>
) => <EditableInner {...props} />;

/**
 * Render the editable content area for one Plite root.
 *
 * `Editable` owns DOM strategy, renderers, events, selection sync, and optional
 * root scoping. Pass `root` to mount the editor surface for a specific root.
 * When focus moves to an element or composed ancestor with
 * `data-plite-keep-selection-visible`, that exact Editable paints its live
 * canonical selection through `data-plite-inactive-selection` or
 * `data-plite-inactive-selection-caret` until focus returns or moves elsewhere.
 */
export const Editable = <
  TElement extends PliteElementNode,
  const TRoot extends RootKey = RootKey,
>(
  props: EditableProps<TElement, TRoot>
) => {
  const { root, ...editableProps } = props;

  if (root === 'main') {
    throw new Error('[Plite] Omit root to render the primary editable.');
  }
  const inheritedReadOnly = useEditorReadOnly();
  const rootReadOnly = props.readOnly || inheritedReadOnly;
  const editable =
    getDOMStrategyType(props.domStrategy) === 'virtualized' ? (
      <EditableVirtualized {...editableProps} />
    ) : (
      <EditableNonVirtualized {...editableProps} />
    );

  return root === undefined ? (
    editable
  ) : (
    <Plite readOnly={rootReadOnly} root={root}>
      {editable}
    </Plite>
  );
};
