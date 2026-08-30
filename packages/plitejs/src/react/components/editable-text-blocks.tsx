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
  type RootKey,
  type NodeKey,
  type Element as PliteElementNode,
  type Range as PliteRange,
  type Text as PliteTextNode,
} from '../..';
import {
  DOMCoverage,
  type DOMCoverageBoundary,
  type DOMCoverageCopyPolicy,
  type DOMCoverageFindPolicy,
  type DOMCoverageReason,
  type DOMCoverageSelectionPolicy,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  IS_NODE_MAP_DIRTY,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
} from '../../dom/internal';
import {
  ElementContext,
  ElementPathContext,
  NodeKeyContext,
  PliteContentRootOwnerContext,
  PliteDOMStrategyVirtualOffsetContext,
  PliteEditableRootContext,
} from '../context';
import { registerEditorDecorationRefreshSource } from '../decoration-refresh';
import {
  composeProjectionSources,
  createDecorationSource,
  type PliteDecorationSourceReadContext,
  type PliteRangeDecoration,
  type PliteOverlayProjectionStore,
} from '../decoration-source';
import type { DOMStrategyOptions } from '../dom-strategy/create-segment-plan';
import { DOMStrategySegmentPlaceholder } from '../dom-strategy/segment-placeholder';
import {
  getVirtualizerScrollElement,
  useVirtualizedRootPlan,
} from '../dom-strategy/use-virtualized-root-plan';
import { DOMStrategyVirtualizedRangeBoundary } from '../dom-strategy/virtualized-range-boundary';
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
import { useEditorContext } from '../hooks/use-editor-context';
import { useEditorReadOnly } from '../hooks/use-editor-read-only';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { useMountedNodeRenderSelector } from '../hooks/use-node-selector';
import { usePliteContentRoot } from '../hooks/use-plite-content-root';
import {
  getDOMTextRenderRevision,
  usePliteNodeKeyDOMValue,
  usePliteNodeRef,
} from '../hooks/use-plite-node-ref';
import { useRequiredPliteRuntimeContext } from '../hooks/use-plite-runtime';
import { ReactEditor } from '../plugin/react-editor';
import { ProjectionContext } from '../projection-context';
import type {
  PliteProjectionRuntimeScope,
  PliteSourceDirtiness,
  PliteSourceDirtinessContext,
} from '../projection-store';
import { recordPliteReactRender } from '../render-profiler';
import { usePliteViewSelectionDecorationSource } from '../view-selection-decoration';
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
import { readEditableDecorations } from './editable-decorations';
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
  mergeMountedRuntimeScope,
  ROOT_GROUP_THRESHOLD,
  resolveProjectionRuntimeScope,
} from './editable-dom-strategy-helpers';
import { EditableElement } from './editable-element';
import { sameDescendantBinding, sameNodeKeys } from './editable-node-equality';
import { EditableRenderedElement } from './editable-rendered-element';
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
  type EditableTextSegment,
  type RenderLeafProps,
  type RenderPlaceholderProps,
  type RenderTextProps,
} from './editable-text';
import { Plite } from './plite';
import { PliteSpacer } from './plite-spacer';
import { PliteInlineVoidShell, PliteVoidShell } from './plite-void-shell';

export { isPliteReactDevelopmentEnvironment } from './editable-rendered-element';

const createCommittedValue = <T,>(initialValue: T) => {
  let value = initialValue;

  return {
    commit(nextValue: T) {
      value = nextValue;
    },
    read() {
      return value;
    },
  };
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
  T = unknown,
  TElement extends PliteElementNode = PliteElementNode,
> = {
  renderElement?: RenderElementRenderer<TElement>;
  renderLeaf?: (props: RenderLeafProps<T>) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderSegment?: (
    segment: EditableTextSegment<T>,
    children: ReactNode
  ) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  renderVoid?: RenderVoidRenderer<TElement>;
};

export type EditableElementSlots = {
  children: (range?: { from?: number; to?: number }) => ReactNode;
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
  T,
  TElement extends PliteElementNode = PliteElementNode,
>(
  editor: ReturnType<typeof useEditorContext>,
  props: {
    element: TElement;
    renderElement?: RenderElementRenderer<TElement>;
    renderChildren: (from?: number, to?: number) => ReactNode;
    renderLeaf?: (props: RenderLeafProps<T>) => ReactNode;
    renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
    renderSegment?: (
      segment: EditableTextSegment<T>,
      children: ReactNode
    ) => ReactNode;
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
      DOMCoverage.materializeBoundary(
        editor,
        resolvedBoundaryId,
        'programmatic'
      );
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
                renderSegment: props.renderSegment,
                renderText: props.renderText,
                renderVoid: props.renderVoid,
              } as EditableContentRootSlotRenderers<any, any>
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

  return (
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
    renderSegment,
    renderText,
    renderVoid,
  } = renderers;
  const editor = useEditorContext();
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
      <PliteContentRootOwnerContext value={contentRootOwner}>
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
          renderSegment={renderSegment}
          renderText={renderText}
          renderVoid={renderVoid}
          spellCheck={spellCheck}
          style={style}
          tabIndex={tabIndex}
        />
      </PliteContentRootOwnerContext>
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

export type EditableDecoration<T = unknown> = PliteRangeDecoration<T>;

export type EditableDecorate<T = unknown> = (
  entry: [Descendant, Path],
  editor?: Editor
) => ReadonlyArray<EditableDecoration<T>>;

export type EditableProps<
  T = unknown,
  TElement extends PliteElementNode = PliteElementNode,
  TRoot extends RootKey = RootKey,
> = {
  autoFocus?: boolean;
  className?: string;
  decorate?: EditableDecorate<T>;
  /**
   * Controls which editor changes recompute `decorate`.
   *
   * Use `external` for decorations derived from an external projection, layout,
   * or annotation source that refreshes the decoration function when it changes.
   */
  decorateDirtiness?: PliteSourceDirtiness;
  /**
   * Limits decoration refresh work to the node keys affected by the source.
   */
  decorateRuntimeScope?: PliteProjectionRuntimeScope;
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
  renderLeaf?: (props: RenderLeafProps<T>) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderSegment?: (
    segment: EditableTextSegment<T>,
    children: ReactNode
  ) => ReactNode;
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
  | 'decorate'
  | 'id'
  | 'onKeyDown'
  | 'onPaste'
  | 'placeholder'
  | 'readOnly'
  | 'spellCheck'
  | 'style'
>;

const EditableDescendantNodeInner = <T, TElement extends PliteElementNode>({
  placeholder,
  placeholderRef,
  renderElement,
  renderLeaf,
  renderPlaceholder,
  renderSegment,
  renderText,
  renderVoid,
  nodeKey,
}: {
  placeholder?: ReactNode;
  placeholderRef?: React.RefCallback<HTMLElement>;
  renderElement?: RenderElementRenderer<TElement>;
  renderLeaf?: (props: RenderLeafProps<T>) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderSegment?: (
    segment: EditableTextSegment<T>,
    children: ReactNode
  ) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  renderVoid?: RenderVoidRenderer<TElement>;
  nodeKey: NodeKey;
}) => {
  const editor = useEditorContext();
  const nodeKeyDOMValue = usePliteNodeKeyDOMValue(nodeKey);

  const binding = useMountedNodeRenderSelector(
    ({ editor: editorValue, node, path }) =>
      readEditableDescendantBinding({
        editor: editorValue,
        node,
        path,
        renderLeaf,
        renderSegment,
        renderText,
      }),
    sameDescendantBinding,
    { nodeKey }
  );

  const {
    childNodeKeys,
    isInline: inline,
    isVoid: voidNode,
    node,
    path,
    renderRevision,
  } = binding;
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

    if (parent && 'children' in parent) {
      NODE_TO_INDEX.set(node, path.at(-1) ?? 0);
      NODE_TO_PARENT.set(node, parent);
      IS_NODE_MAP_DIRTY.set(editor, false);
    }
  }

  if (isEditableTextNode(node)) {
    const { text: _text, ...marks } = node;

    return (
      <EditableText
        key={`${nodeKey}:${renderRevision}`}
        marks={marks}
        path={path}
        placeholder={placeholder}
        placeholderRef={placeholderRef}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        renderSegment={renderSegment}
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
    if (
      !child ||
      !isEditableTextNode(child) ||
      renderLeaf ||
      renderSegment ||
      renderText
    ) {
      return null;
    }

    const childPath = [...path, index] as Path;
    const { text: _text, ...marks } = child;

    NODE_TO_INDEX.set(child, index);
    NODE_TO_PARENT.set(child, node);
    IS_NODE_MAP_DIRTY.set(editor, false);

    return (
      <EditableText
        key={`${childNodeKey}:${getDOMTextRenderRevision(editor, [childNodeKey])}`}
        marks={marks}
        path={childPath}
        placeholder={placeholder}
        placeholderRef={placeholderRef}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        renderSegment={renderSegment}
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
        key={`${childNodeKey}:${getDOMTextRenderRevision(editor, [childNodeKey])}`}
        placeholder={placeholder}
        placeholderRef={placeholderRef}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        renderSegment={renderSegment}
        renderText={renderText}
        renderVoid={renderVoid}
        nodeKey={childNodeKey}
      />
    );
  const renderChildren = (from = 0, to = childNodeKeys.length - 1) => {
    if (childNodeKeys.length === 0 || to < from) {
      return null;
    }

    return childNodeKeys
      .slice(from, to + 1)
      .map((childNodeKey, offset) => renderChild(childNodeKey, from + offset));
  };
  const defaultChildren = childNodeKeys.map(renderChild);

  if (voidNode && renderVoid) {
    if (!path) {
      return null;
    }

    const children = renderChildren();

    return (
      <NodeKeyContext key={nodeKey} value={nodeKey}>
        <ElementPathContext value={path}>
          <ElementContext value={node}>
            <EditableRenderedVoid
              element={node as TElement}
              isInline={inline}
              renderVoid={renderVoid}
            >
              {children}
            </EditableRenderedVoid>
          </ElementContext>
        </ElementPathContext>
      </NodeKeyContext>
    );
  }

  const nodeRenderElement = renderElement;

  if (nodeRenderElement) {
    if (!path) {
      return null;
    }

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
        renderElement,
        renderChildren,
        renderLeaf,
        renderPlaceholder,
        renderSegment,
        renderText,
        renderVoid,
        ownerPath: path,
        nodeKey: nodeKeyDOMValue ?? nodeKey,
      }),
    } as unknown as RenderElementProps<TElement>;

    return (
      <NodeKeyContext key={nodeKey} value={nodeKey}>
        <ElementPathContext value={path}>
          <ElementContext value={node}>
            <EditableRenderedElement
              path={path}
              props={renderElementProps}
              renderElement={nodeRenderElement}
            />
          </ElementContext>
        </ElementPathContext>
      </NodeKeyContext>
    );
  }

  if (voidNode) {
    if (!path) {
      return null;
    }

    const children = renderChildren();

    return (
      <NodeKeyContext key={nodeKey} value={nodeKey}>
        <ElementPathContext value={path}>
          <ElementContext value={node}>
            <EditableRenderedVoid element={node as TElement} isInline={inline}>
              {children}
            </EditableRenderedVoid>
          </ElementContext>
        </ElementPathContext>
      </NodeKeyContext>
    );
  }

  return (
    <NodeKeyContext key={nodeKey} value={nodeKey}>
      <ElementPathContext value={path}>
        <ElementContext value={node}>
          <EditableElement as={inline ? 'span' : 'div'} isInline={inline}>
            {defaultChildren}
          </EditableElement>
        </ElementContext>
      </ElementPathContext>
    </NodeKeyContext>
  );
};

const EditableDescendantNode = React.memo(
  EditableDescendantNodeInner
) as typeof EditableDescendantNodeInner;

const EditableRootGroupInner = <T, TElement extends PliteElementNode>({
  endIndex,
  placeholder,
  placeholderRef,
  renderElement,
  renderLeaf,
  renderPlaceholder,
  renderSegment,
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
  renderLeaf?: (props: RenderLeafProps<T>) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderSegment?: (
    segment: EditableTextSegment<T>,
    children: ReactNode
  ) => ReactNode;
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
          renderSegment={renderSegment}
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
    previous.renderSegment === next.renderSegment &&
    previous.renderText === next.renderText &&
    previous.renderVoid === next.renderVoid &&
    previous.startIndex === next.startIndex &&
    sameNodeKeys(previous.nodeKeys, next.nodeKeys)
) as typeof EditableRootGroupInner;

const EditableInner = <T, TElement extends PliteElementNode>({
  autoFocus,
  className,
  decorate,
  decorateDirtiness,
  decorateRuntimeScope,
  disableDefaultStyles = false,
  enableVirtualizedRendering = false,
  id,
  ignoreBlankEditableRootClicks = false,
  domStrategy,
  onBeforeInput,
  onDOMBeforeInput,
  onKeyDown,
  onDOMStrategyMetrics,
  onPaste,
  readOnly = false,
  placeholder,
  renderElement,
  renderLeaf,
  renderPlaceholder,
  renderSegment,
  renderText,
  renderVoid,
  ref: forwardedRef,
  scrollSelectionIntoView,
  spellCheck,
  style,
  ...attributes
}: EditableProps<T, TElement> & {
  enableVirtualizedRendering?: boolean;
}) => {
  const domStrategyOptions = domStrategy;
  const editor = useEditorContext();
  const editableRoot = toInternalRoot(
    editor.read((state) => state.view.root())
  );
  const inheritedReadOnly = useEditorReadOnly();
  const effectiveReadOnly = readOnly || inheritedReadOnly;
  const upstreamProjectionStore = React.useContext(ProjectionContext);
  const [decorateCell] = React.useState(() => createCommittedValue(decorate));
  const [autoDecorateRuntimeScopeCell] = React.useState(() =>
    createCommittedValue<readonly NodeKey[] | null>(null)
  );

  const activeDecorateRuntimeScope = React.useCallback(
    (context: PliteSourceDirtinessContext) =>
      mergeMountedRuntimeScope(
        context.snapshot,
        resolveProjectionRuntimeScope(decorateRuntimeScope, context),
        autoDecorateRuntimeScopeCell.read()
      ),
    [autoDecorateRuntimeScopeCell, decorateRuntimeScope]
  );
  const readDecorations = React.useCallback(
    (context: PliteDecorationSourceReadContext) =>
      readEditableDecorations(editor, decorateCell.read(), context),
    [decorateCell, editor]
  );

  const hasDecorate = Boolean(decorate);
  const decorateSource = React.useMemo(() => {
    if (!hasDecorate) {
      return null;
    }

    return createDecorationSource(editor, {
      dirtiness: decorateDirtiness,
      id: 'editable-decorate',
      read: readDecorations,
      runtimeScope: activeDecorateRuntimeScope,
    });
  }, [
    activeDecorateRuntimeScope,
    decorateDirtiness,
    editor,
    hasDecorate,
    readDecorations,
  ]);
  const viewSelectionDecorationSource = usePliteViewSelectionDecorationSource(
    editor,
    true,
    {
      runtimeScope: activeDecorateRuntimeScope,
    }
  );
  const projectionStore = React.useMemo(
    () =>
      composeProjectionSources<any>([
        ...(upstreamProjectionStore
          ? [upstreamProjectionStore as PliteOverlayProjectionStore<any>]
          : []),
        ...(decorateSource
          ? [decorateSource as PliteOverlayProjectionStore<any>]
          : []),
        ...(viewSelectionDecorationSource
          ? [viewSelectionDecorationSource as PliteOverlayProjectionStore<any>]
          : []),
      ]),
    [decorateSource, upstreamProjectionStore, viewSelectionDecorationSource]
  );
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

  useIsomorphicLayoutEffect(() => {
    if (!rootGroups) {
      return undefined;
    }

    return DOMCoverage.registerMaterializeHandler(
      editor,
      (boundary, _reason, options) =>
        materializeRootGroupBoundary(boundary, options.range)
    );
  }, [editor, materializeRootGroupBoundary, rootGroups]);
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

  useIsomorphicLayoutEffect(() => {
    if (!virtualizedPlan) {
      return undefined;
    }

    return DOMCoverage.registerMaterializeHandler(
      editor,
      (boundary, _reason, options) =>
        materializeVirtualizedBoundary(boundary, options.range)
    );
  }, [editor, materializeVirtualizedBoundary, virtualizedPlan]);
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
  const autoDecorateRuntimeScope = React.useMemo<
    readonly NodeKey[] | null
  >(() => {
    if (virtualizedPlan) {
      return [...virtualizedPlan.mountedTopLevelNodeKeys];
    }

    if (segmentPlan && mountedTopLevelNodeKeys) {
      return [...mountedTopLevelNodeKeys];
    }

    if (domPresentMountedTopLevelNodeKeys) {
      return [...domPresentMountedTopLevelNodeKeys];
    }

    return null;
  }, [
    domPresentMountedTopLevelNodeKeys,
    mountedTopLevelNodeKeys,
    segmentPlan,
    virtualizedPlan,
  ]);
  React.useLayoutEffect(() => {
    autoDecorateRuntimeScopeCell.commit(autoDecorateRuntimeScope);
  }, [autoDecorateRuntimeScope, autoDecorateRuntimeScopeCell]);
  const autoDecorateRuntimeScopeKey = React.useMemo(
    () => autoDecorateRuntimeScope?.join('|') ?? null,
    [autoDecorateRuntimeScope]
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
  React.useEffect(() => {
    if (!decorateSource) {
      return undefined;
    }

    return () => {
      decorateSource.destroy();
    };
  }, [decorateSource]);
  React.useEffect(() => {
    const unregisterDecorateSource = decorateSource
      ? registerEditorDecorationRefreshSource(editor, decorateSource)
      : null;
    const unregisterViewSelectionSource = viewSelectionDecorationSource
      ? registerEditorDecorationRefreshSource(
          editor,
          viewSelectionDecorationSource
        )
      : null;

    return () => {
      unregisterDecorateSource?.();
      unregisterViewSelectionSource?.();
    };
  }, [decorateSource, editor, viewSelectionDecorationSource]);
  React.useLayoutEffect(() => {
    decorateCell.commit(decorate);
    decorateSource?.refresh({
      reason: 'external',
      requiresDOMSelectionExport: ReactEditor.isFocused(editor),
    });
  }, [decorate, decorateCell, decorateSource, editor]);
  React.useEffect(() => {
    decorateSource?.refresh({
      reason: 'external',
      requiresDOMSelectionExport: ReactEditor.isFocused(editor),
    });
    viewSelectionDecorationSource?.refresh({
      reason: 'external',
      requiresDOMSelectionExport: ReactEditor.isFocused(editor),
    });
  }, [
    autoDecorateRuntimeScopeKey,
    decorateSource,
    editor,
    viewSelectionDecorationSource,
  ]);
  const rootStyle =
    placeholderHeight && !disableDefaultStyles
      ? { minHeight: placeholderHeight, ...style }
      : style;
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
    <ProjectionContext value={projectionStore}>
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
                      mountedTopLevelNodeKeys:
                        domPresentMountedTopLevelNodeKeys,
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
          onDOMBeforeInput={onDOMBeforeInput}
          onDOMStrategyMetrics={onDOMStrategyMetrics}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          readOnly={effectiveReadOnly}
          ref={
            virtualizedDOMStrategyConfig || forwardedRef
              ? editableRootRef
              : undefined
          }
          scrollSelectionIntoView={scrollSelectionIntoView}
          spellCheck={spellCheck}
          style={rootStyle}
        >
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
                        <PliteDOMStrategyVirtualOffsetContext
                          value={item.start}
                        >
                          <div
                            style={{
                              marginLeft: hasInlineBounds
                                ? item.left
                                : undefined,
                              minHeight: item.size,
                              pointerEvents: 'auto',
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
                              renderSegment={renderSegment}
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
                      renderSegment={renderSegment}
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
                  renderSegment={renderSegment}
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
                renderSegment={renderSegment}
                renderText={renderText}
                renderVoid={renderVoid}
                nodeKey={nodeKey}
              />
            ))
          )}
        </EditableDOMRoot>
      </PliteEditableRootContext>
    </ProjectionContext>
  );
};

const EditableVirtualized = <T, TElement extends PliteElementNode>(
  props: EditableProps<T, TElement>
) => <EditableInner {...props} enableVirtualizedRendering />;

const EditableNonVirtualized = <T, TElement extends PliteElementNode>(
  props: EditableProps<T, TElement>
) => <EditableInner {...props} />;

/**
 * Render the editable content area for one Plite root.
 *
 * `Editable` owns DOM strategy, renderers, events, selection sync, and optional
 * root scoping. Pass `root` to mount the editor surface for a specific root.
 */
export const Editable = <
  T,
  TElement extends PliteElementNode,
  const TRoot extends RootKey = RootKey,
>(
  props: EditableProps<T, TElement, TRoot>
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
