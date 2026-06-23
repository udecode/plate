import type { TextareaHTMLAttributes } from 'react';
import React, { type CSSProperties, type ReactNode } from 'react';
import {
  type Ancestor,
  type Descendant,
  NodeApi,
  type Path,
  type RootKey,
  type RuntimeId,
  type Element as SlateElementNode,
  type Node as SlateNode,
  type Range as SlateRange,
  type Text as SlateTextNode,
} from '@platejs/slate';
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
} from '@platejs/slate-dom/internal';
import {
  ElementContext,
  ElementPathContext,
  NodeRuntimeIdContext,
  SlateContentRootOwnerContext,
  SlateDOMStrategyVirtualOffsetContext,
  SlateDOMTextSyncContext,
  SlateEditableRootContext,
} from '../context';
import {
  composeProjectionSources,
  createDecorationSource,
  type SlateDecoration,
  type SlateOverlayProjectionStore,
} from '../decoration-source';
import type { DOMStrategyOptions } from '../dom-strategy/create-segment-plan';
import { DOMStrategySegmentPlaceholder } from '../dom-strategy/segment-placeholder';
import {
  getVirtualizerScrollElement,
  useVirtualizedRootPlan,
  type VirtualizedPageLayoutItem,
  type VirtualizedTopLevelLayoutItem,
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
import { Editor } from '../editable/runtime-editor-api';
import { readRuntimeNode } from '../editable/runtime-live-state';
import { useEditor } from '../hooks/use-editor';
import { useEditorReadOnly } from '../hooks/use-editor-read-only';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { useMountedNodeRenderSelector } from '../hooks/use-node-selector';
import { useSlateContentRoot } from '../hooks/use-slate-content-root';
import { useSlateNodeRef } from '../hooks/use-slate-node-ref';
import { useRequiredSlateRuntimeContext } from '../hooks/use-slate-runtime';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { ProjectionContext } from '../projection-context';
import type {
  SlateProjectionRuntimeScope,
  SlateSourceDirtiness,
  SlateSourceDirtinessContext,
} from '../projection-store';
import { recordSlateReactRender } from '../render-profiler';
import { useSlateViewSelectionDecorationSource } from '../view-selection-decoration';
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
import { EditableRenderedElement } from './editable-rendered-element';
import { SlateInlineVoidShell, SlateVoidShell } from './slate-void-shell';

export { isSlateReactDevelopmentEnvironment } from './editable-rendered-element';

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
import {
  sameDescendantBinding,
  sameRuntimeIds,
} from './editable-node-equality';
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
import { Slate } from './slate';

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
  id?: string;
  placeholder?: ReactNode;
  readOnly?: boolean;
  spellCheck?: boolean;
  style?: CSSProperties;
  tabIndex?: number;
};

type EditableContentRootSlotRenderers<
  T = unknown,
  TElement extends SlateElementNode = SlateElementNode,
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
  runtimeId: RuntimeId,
  scope: EditableDOMCoverageBoundaryScope
) => {
  if (scope.type === 'self') {
    return `content-boundary:${runtimeId}:self`;
  }

  return `content-boundary:${runtimeId}:children:${scope.from}:${
    scope.to ?? scope.from
  }`;
};

const createEditableElementSlots = <
  T,
  TElement extends SlateElementNode = SlateElementNode,
>(
  editor: ReturnType<typeof useEditor>,
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
    runtimeId: RuntimeId;
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
      boundaryId ?? createContentBoundaryId(props.runtimeId, scope);
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
                boundaryId: `content-root:${props.runtimeId}:${slot}`,
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
  element: SlateElementNode;
  options: EditableContentRootSlotOptions;
  ownerPath: Path;
  renderers: EditableContentRootSlotRenderers;
  slot: string;
}) {
  const ownerEditor = useEditor<ReactRuntimeEditor>();
  const ownerRoot = ownerEditor.read((state) => state.view.root());
  const { root } = useSlateContentRoot(element, { slot });
  const inheritedReadOnly = useEditorReadOnly();
  const readOnly = Boolean(options.readOnly || inheritedReadOnly);

  return (
    <Slate readOnly={readOnly} root={root}>
      <EditableContentRootView
        options={options}
        ownerPath={ownerPath}
        ownerRoot={ownerRoot}
        renderers={renderers}
        root={root}
        slot={slot}
      />
    </Slate>
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
  const editor = useEditor<ReactRuntimeEditor>();
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
  } = useRequiredSlateRuntimeContext();
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
      activateRootView();
      rootInteraction.onMouseDownCapture(event);
    },
    [activateRootView, rootInteraction]
  );
  const onMouseUpCapture = React.useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(
    (event) => {
      activateRootView();
      rootInteraction.onMouseUpCapture(event);
    },
    [activateRootView, rootInteraction]
  );
  const onMouseMoveCapture = React.useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(
    (event) => {
      activateRootView();
      rootInteraction.onMouseMoveCapture(event);
    },
    [activateRootView, rootInteraction]
  );
  const onFocusCapture = React.useCallback<
    React.FocusEventHandler<HTMLDivElement>
  >(() => {
    activateRootView();
  }, [activateRootView]);

  return (
    <div
      contentEditable={false}
      data-slate-content-root-owner-path={ownerPath.join(',')}
      data-slate-content-root-owner-root={ownerRoot}
      data-slate-content-root-slot={slot}
      onFocusCapture={onFocusCapture}
      onMouseDownCapture={onMouseDownCapture}
      onMouseMoveCapture={onMouseMoveCapture}
      onMouseUpCapture={onMouseUpCapture}
      suppressContentEditableWarning
    >
      <SlateContentRootOwnerContext.Provider value={contentRootOwner}>
        <EditableInner
          aria-label={ariaLabel}
          className={className}
          disableDefaultStyles={disableDefaultStyles}
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
      </SlateContentRootOwnerContext.Provider>
    </div>
  );
}

export type RenderElementProps<
  TElement extends SlateElementNode = SlateElementNode,
> = TElement extends SlateElementNode
  ? {
      attributes: {
        'data-slate-inline'?: true;
        'data-slate-node': 'element';
        'data-slate-path': string;
        'data-slate-runtime-id': RuntimeId;
        'data-slate-void'?: true;
        ref: React.RefCallback<HTMLElement>;
      };
      children: ReactNode;
      element: TElement;
      isInline: boolean;
      slots: EditableElementSlots;
    }
  : never;

export type RenderElementRenderer<
  TElement extends SlateElementNode = SlateElementNode,
> = (props: RenderElementProps<TElement>) => ReactNode;

export type RenderVoidProps<
  TElement extends SlateElementNode = SlateElementNode,
> = {
  element: TElement;
};

export type RenderVoidRenderer<
  TElement extends SlateElementNode = SlateElementNode,
> = (props: RenderVoidProps<TElement>) => ReactNode;

const EditableRenderedVoid = <
  TElement extends SlateElementNode = SlateElementNode,
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
    <SlateInlineVoidShell content={content}>{children}</SlateInlineVoidShell>
  ) : (
    <SlateVoidShell content={content}>{children}</SlateVoidShell>
  );
};

const getNearestEditableBlockText = (editor: Editor, path: Path) => {
  for (let depth = path.length - 1; depth >= 0; depth -= 1) {
    const ancestorPath = path.slice(0, depth) as Path;
    const ancestor =
      ancestorPath.length === 0
        ? editor
        : (readRuntimeNode(editor, ancestorPath) as Ancestor | undefined);

    if (!ancestor || !('children' in ancestor)) {
      continue;
    }

    if (Editor.isEditor(ancestor) || !Editor.isInline(editor, ancestor)) {
      return NodeApi.string(ancestor);
    }
  }

  return '';
};

const resolveTextZeroWidth = ({
  editor,
  node,
  path,
}: {
  editor: Editor;
  node: SlateTextNode;
  path: Path | null;
}) => {
  if (!path || node.text !== '') {
    return { isLineBreak: true };
  }

  if (getNearestEditableBlockText(editor, path) !== '') {
    return { isLineBreak: false };
  }

  return { isLineBreak: true };
};

export type EditableDecoration<T = unknown> = Omit<
  SlateDecoration<T>,
  'key'
> & {
  key?: string;
};

export type EditableDecorate<T = unknown> = (
  entry: [Descendant, Path],
  editor: Editor
) => readonly EditableDecoration<T>[];

export type EditableDOMStrategyLayout = {
  getVirtualizedPageItems?: () => readonly VirtualizedPageLayoutItem[] | null;
  getVisibleVirtualizedPageItems?: () =>
    | readonly VirtualizedPageLayoutItem[]
    | null;
  getVirtualizedTopLevelItems?: () =>
    | readonly VirtualizedTopLevelLayoutItem[]
    | null;
};

export type EditableProps<
  T = unknown,
  TElement extends SlateElementNode = SlateElementNode,
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
  decorateDirtiness?: SlateSourceDirtiness;
  /**
   * Limits decoration refresh work to the runtime ids affected by the source.
   */
  decorateRuntimeScope?: SlateProjectionRuntimeScope;
  disableDefaultStyles?: boolean;
  id?: string;
  /**
   * DOM strategy for large documents. `virtualized` is experimental and
   * must use the object form: `{ type: 'virtualized', ... }`.
   */
  domStrategy?: DOMStrategyOptions | null;
  domStrategyLayout?: EditableDOMStrategyLayout | null;
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
  root?: RootKey;
  scrollSelectionIntoView?: (
    editor: Editor,
    domRange: globalThis.Range
  ) => void;
  spellCheck?: boolean;
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

const EditableDescendantNodeInner = <T, TElement extends SlateElementNode>({
  placeholder,
  placeholderRef,
  renderElement,
  renderLeaf,
  renderPlaceholder,
  renderSegment,
  renderText,
  renderVoid,
  runtimeId,
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
  runtimeId: RuntimeId;
}) => {
  const editor = useEditor();

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
    { runtimeId }
  );

  const { childRuntimeIds, node, path } = binding;
  const bindNodeRef = useSlateNodeRef(runtimeId, { path, slateNode: node });

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
        marks={marks}
        path={path}
        placeholder={placeholder}
        placeholderRef={placeholderRef}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        renderSegment={renderSegment}
        renderText={renderText}
        runtimeId={runtimeId}
        slateNode={node}
        text={node.text}
        zeroWidth={resolveTextZeroWidth({ editor, node, path })}
      />
    );
  }

  const inline = Editor.isInline(editor, node);
  const voidNode = Editor.isVoid(editor, node);
  const attributes = {
    'data-slate-inline': inline ? (true as const) : undefined,
    'data-slate-node': 'element' as const,
    'data-slate-path': path.join(','),
    'data-slate-runtime-id': runtimeId,
    'data-slate-void': voidNode ? (true as const) : undefined,
    ref: bindNodeRef as React.RefCallback<HTMLElement>,
  };
  const renderDirectTextChild = (
    childRuntimeId: RuntimeId,
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
        key={childRuntimeId}
        marks={marks}
        path={childPath}
        placeholder={placeholder}
        placeholderRef={placeholderRef}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        renderSegment={renderSegment}
        renderText={renderText}
        runtimeId={childRuntimeId}
        slateNode={child}
        text={child.text}
        zeroWidth={resolveTextZeroWidth({
          editor,
          node: child,
          path: childPath,
        })}
      />
    );
  };
  const renderChild = (childRuntimeId: RuntimeId, index: number) =>
    renderDirectTextChild(childRuntimeId, node.children[index], index) ?? (
      <EditableDescendantNode
        key={childRuntimeId}
        placeholder={placeholder}
        placeholderRef={placeholderRef}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        renderSegment={renderSegment}
        renderText={renderText}
        renderVoid={renderVoid}
        runtimeId={childRuntimeId}
      />
    );
  const renderChildren = (from = 0, to = childRuntimeIds.length - 1) => {
    if (childRuntimeIds.length === 0 || to < from) {
      return null;
    }

    return childRuntimeIds
      .slice(from, to + 1)
      .map((childRuntimeId, offset) =>
        renderChild(childRuntimeId, from + offset)
      );
  };
  const defaultChildren = childRuntimeIds.map(renderChild);

  if (voidNode) {
    if (!path) {
      return null;
    }

    const children = renderChildren();

    return (
      <NodeRuntimeIdContext.Provider key={runtimeId} value={runtimeId}>
        <ElementPathContext.Provider value={path}>
          <ElementContext.Provider value={node}>
            <EditableRenderedVoid
              element={node as TElement}
              isInline={inline}
              renderVoid={renderVoid}
            >
              {children}
            </EditableRenderedVoid>
          </ElementContext.Provider>
        </ElementPathContext.Provider>
      </NodeRuntimeIdContext.Provider>
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
        return renderChildren();
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
        runtimeId,
      }),
    } as unknown as RenderElementProps<TElement>;

    return (
      <NodeRuntimeIdContext.Provider key={runtimeId} value={runtimeId}>
        <ElementPathContext.Provider value={path}>
          <ElementContext.Provider value={node}>
            <EditableRenderedElement
              path={path}
              props={renderElementProps}
              renderElement={nodeRenderElement}
            />
          </ElementContext.Provider>
        </ElementPathContext.Provider>
      </NodeRuntimeIdContext.Provider>
    );
  }

  return (
    <NodeRuntimeIdContext.Provider key={runtimeId} value={runtimeId}>
      <ElementPathContext.Provider value={path}>
        <ElementContext.Provider value={node}>
          <EditableElement as={inline ? 'span' : 'div'} isInline={inline}>
            {defaultChildren}
          </EditableElement>
        </ElementContext.Provider>
      </ElementPathContext.Provider>
    </NodeRuntimeIdContext.Provider>
  );
};

const EditableDescendantNode = React.memo(
  EditableDescendantNodeInner
) as typeof EditableDescendantNodeInner;

const EditableRootGroupInner = <T, TElement extends SlateElementNode>({
  endIndex,
  groupId,
  placeholder,
  placeholderRef,
  renderElement,
  renderLeaf,
  renderPlaceholder,
  renderSegment,
  renderText,
  renderVoid,
  runtimeIds,
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
  runtimeIds: readonly RuntimeId[];
  startIndex: number;
}) => {
  recordSlateReactRender({
    id: `${startIndex}-${endIndex}`,
    kind: 'group',
  });

  return (
    <>
      {runtimeIds.map((runtimeId) => (
        <EditableDescendantNode
          key={runtimeId}
          placeholder={placeholder}
          placeholderRef={placeholderRef}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          renderPlaceholder={renderPlaceholder}
          renderSegment={renderSegment}
          renderText={renderText}
          renderVoid={renderVoid}
          runtimeId={runtimeId}
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
    sameRuntimeIds(previous.runtimeIds, next.runtimeIds)
) as typeof EditableRootGroupInner;

const EditableInner = <T, TElement extends SlateElementNode>({
  autoFocus,
  className,
  decorate,
  decorateDirtiness,
  decorateRuntimeScope,
  disableDefaultStyles = false,
  enableVirtualizedRendering = false,
  id,
  domStrategy,
  domStrategyLayout,
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
  const domTextSyncOptions =
    typeof domStrategyOptions === 'object' && domStrategyOptions != null
      ? (domStrategyOptions.textSync ?? null)
      : null;
  const editor = useEditor();
  const editableRoot = editor.read((state) => state.view.root());
  const inheritedReadOnly = useEditorReadOnly();
  const effectiveReadOnly = readOnly || inheritedReadOnly;
  const upstreamProjectionStore = React.useContext(ProjectionContext);
  const [decorateCell] = React.useState(() => ({ current: decorate }));
  decorateCell.current = decorate;
  const autoDecorateRuntimeScopeRef = React.useRef<readonly RuntimeId[] | null>(
    null
  );
  const activeDecorateRuntimeScope = React.useCallback(
    (context: SlateSourceDirtinessContext) =>
      mergeMountedRuntimeScope(
        context.snapshot,
        resolveProjectionRuntimeScope(decorateRuntimeScope, context),
        autoDecorateRuntimeScopeRef.current
      ),
    [decorateRuntimeScope]
  );
  const hasDecorate = Boolean(decorate);
  const decorateSource = React.useMemo(() => {
    if (!hasDecorate) {
      return null;
    }

    return createDecorationSource<T>(editor, {
      dirtiness: decorateDirtiness,
      id: 'editable-decorate',
      read: (context) =>
        readEditableDecorations(editor, decorateCell.current, context),
      runtimeScope: activeDecorateRuntimeScope,
    });
  }, [
    activeDecorateRuntimeScope,
    decorateCell,
    decorateDirtiness,
    editor,
    hasDecorate,
  ]);
  const viewSelectionDecorationSource = useSlateViewSelectionDecorationSource(
    editor as unknown as ReactRuntimeEditor<any>,
    true,
    {
      runtimeScope: activeDecorateRuntimeScope,
    }
  );
  const projectionStore = React.useMemo(
    () =>
      composeProjectionSources<any>([
        ...(upstreamProjectionStore
          ? [upstreamProjectionStore as SlateOverlayProjectionStore<any>]
          : []),
        ...(decorateSource
          ? [decorateSource as SlateOverlayProjectionStore<any>]
          : []),
        ...(viewSelectionDecorationSource
          ? [viewSelectionDecorationSource as SlateOverlayProjectionStore<any>]
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
    mountedTopLevelRuntimeIds,
    topLevelRuntimeIds,
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
  const virtualizedPageItems =
    domStrategyLayout?.getVirtualizedPageItems?.() ?? null;
  const visibleVirtualizedPageItems =
    domStrategyLayout?.getVisibleVirtualizedPageItems?.() ?? null;
  const virtualizedLayoutItems =
    domStrategyLayout?.getVirtualizedTopLevelItems?.() ?? null;
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
    topLevelRuntimeIds,
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
      topLevelRuntimeIds.length < ROOT_GROUP_THRESHOLD
    ) {
      return null;
    }

    recordSlateReactRender({
      id: 'staged-root-groups',
      kind: 'root-plan',
    });

    return createRootGroups(topLevelRuntimeIds);
  }, [
    domStrategyType,
    segmentPlan,
    shouldUseStagedFallback,
    topLevelRuntimeIds,
  ]);
  const rootGroupPlanKey = React.useMemo(
    () =>
      rootGroups
        ? getRootGroupPlanKey(topLevelRuntimeIds, rootDocumentEpoch)
        : null,
    [rootDocumentEpoch, rootGroups, topLevelRuntimeIds]
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
      groups: rootGroups,
      planKey: rootGroupPlanKey,
    });
  const materializeRootGroupBoundary = React.useCallback(
    (boundary: DOMCoverageBoundary, targetRange?: SlateRange) => {
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
      return;
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
    (boundary: DOMCoverageBoundary, targetRange?: SlateRange) => {
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
      return;
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
    const lastCommit = editor.read((state) => state.value.lastCommit());

    if (lastCommit?.textChanged) {
      return;
    }

    try {
      const [node] = editor.read((state) => state.nodes.get(anchorPath));

      if (node && editor.api.dom.resolveDOMNode(node as SlateNode)) {
        lastVirtualizedScrollPathKeyRef.current = anchorPathKey;
        return;
      }
    } catch {
      // If the path is not mounted or temporarily invalid, fall through to
      // page-aware scrolling.
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
  const domPresentMountedTopLevelRuntimeIds = React.useMemo(
    () =>
      domPresentMountedGroups
        ? new Set(
            domPresentMountedGroups.flatMap((group) => [...group.runtimeIds])
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
    readonly RuntimeId[] | null
  >(() => {
    if (virtualizedPlan) {
      return [...virtualizedPlan.mountedTopLevelRuntimeIds];
    }

    if (segmentPlan && mountedTopLevelRuntimeIds) {
      return [...mountedTopLevelRuntimeIds];
    }

    if (domPresentMountedTopLevelRuntimeIds) {
      return [...domPresentMountedTopLevelRuntimeIds];
    }

    return null;
  }, [
    domPresentMountedTopLevelRuntimeIds,
    mountedTopLevelRuntimeIds,
    segmentPlan,
    virtualizedPlan,
  ]);
  autoDecorateRuntimeScopeRef.current = autoDecorateRuntimeScope;
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
          const start = Editor.point(editor, [startIndex!], { edge: 'start' });
          editor.update((tx) => {
            tx.selection.set({ anchor: start, focus: start });
          });
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
      return;
    }

    return () => {
      decorateSource.destroy();
    };
  }, [decorateSource]);
  React.useEffect(() => {
    decorateCell.current = decorate;
    decorateSource?.refresh({
      reason: 'external',
      requiresDOMSelectionExport: ReactEditor.isFocused(
        editor as unknown as ReactRuntimeEditor
      ),
    });
  }, [decorate, decorateCell, decorateSource, editor]);
  React.useEffect(() => {
    decorateSource?.refresh({
      reason: 'external',
      requiresDOMSelectionExport: ReactEditor.isFocused(
        editor as unknown as ReactRuntimeEditor
      ),
    });
    viewSelectionDecorationSource?.refresh({
      reason: 'external',
      requiresDOMSelectionExport: ReactEditor.isFocused(
        editor as unknown as ReactRuntimeEditor
      ),
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
    const documentSize = topLevelRuntimeIds.length;
    const mountedTopLevelCount = virtualizedPlan
      ? virtualizedPlan.mountedTopLevelRuntimeIds.size
      : segmentPlan
        ? segmentPlan.segments.reduce(
            (total, segment) => total + segment.mountedRuntimeIds.length,
            0
          )
        : domPresentMountedTopLevelRuntimeIds
          ? domPresentMountedTopLevelRuntimeIds.size
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
    domPresentMountedTopLevelRuntimeIds,
    virtualizedPlan,
    segmentPlan,
    internalSegmentDOMStrategyConfig,
    virtualizedDOMStrategyConfig,
    domStrategyType,
    renderedRootGroups,
    rootGroups,
    selectedVirtualizedTopLevelIndex,
    topLevelRuntimeIds.length,
  ]);
  const virtualizedItemGroups = virtualizedPlan
    ? createVirtualizedTopLevelItemGroups(virtualizedPlan.virtualItems)
    : null;

  return (
    <ProjectionContext.Provider value={projectionStore}>
      <SlateDOMTextSyncContext.Provider value={domTextSyncOptions}>
        <SlateEditableRootContext.Provider value={editableRoot}>
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
                    mountedTopLevelRuntimeIds:
                      virtualizedPlan.mountedTopLevelRuntimeIds,
                    mountedTopLevelRanges:
                      virtualizedPlan.mountedTopLevelRanges ?? undefined,
                    scrollToPath: scrollVirtualizedPathIntoView,
                    type: 'virtualized',
                  }
                : segmentPlan
                  ? {
                      mountedTopLevelRuntimeIds,
                      mountedTopLevelRanges: mountedTopLevelRanges ?? undefined,
                      type: 'partial-dom',
                    }
                  : rootGroups
                    ? {
                        mountedTopLevelRuntimeIds:
                          domPresentMountedTopLevelRuntimeIds,
                        mountedTopLevelRanges:
                          domPresentMountedTopLevelRanges ?? undefined,
                        type: 'staged',
                      }
                    : null
            }
            id={id}
            ignoreBlankEditableRootClicks={domStrategyLayout != null}
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
                data-slate-dom-strategy-virtualizer="true"
                style={{
                  height: virtualizedPlan.totalSize,
                  position: 'relative',
                  width: '100%',
                }}
              >
                {virtualizedPlan.missingRanges.map((range) => (
                  <DOMStrategyVirtualizedRangeBoundary
                    anchorRuntimeId={range.anchorRuntimeId}
                    boundaryId={range.boundaryId}
                    endIndex={range.endIndex}
                    focusRuntimeId={range.focusRuntimeId}
                    key={range.boundaryId}
                    startIndex={range.startIndex}
                  />
                ))}
                {virtualizedItemGroups!.map((group) => (
                  <div
                    data-slate-dom-strategy-virtual-row-group="true"
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
                          data-slate-dom-strategy-virtual-row="true"
                          key={String(item.key)}
                          ref={virtualizedPlan.measureElement}
                          style={{
                            minHeight: item.size,
                            pointerEvents: 'none',
                            position: 'relative',
                            width: '100%',
                          }}
                        >
                          <SlateDOMStrategyVirtualOffsetContext.Provider
                            value={item.start}
                          >
                            <div
                              style={{
                                marginLeft: hasInlineBounds
                                  ? item.left
                                  : undefined,
                                minHeight: item.size,
                                pointerEvents: 'auto',
                                position: hasInlineBounds
                                  ? 'static'
                                  : 'relative',
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
                                runtimeId={item.runtimeId}
                              />
                            </div>
                          </SlateDOMStrategyVirtualOffsetContext.Provider>
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
                          internalSegmentDOMStrategyConfig!.previewChars
                        }
                        runtimeIds={segment.runtimeIds.slice(
                          0,
                          segment.mountedStartIndex - segment.startIndex
                        )}
                        segmentIndex={segment.segmentIndex}
                        startIndex={segment.startIndex}
                      />
                    ) : null}
                    {segment.mountedRuntimeIds.map((runtimeId) => (
                      <EditableDescendantNode
                        key={runtimeId}
                        placeholder={placeholderValue}
                        placeholderRef={placeholderRef}
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        renderPlaceholder={renderPlaceholder}
                        renderSegment={renderSegment}
                        renderText={renderText}
                        renderVoid={renderVoid}
                        runtimeId={runtimeId}
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
                          internalSegmentDOMStrategyConfig!.previewChars
                        }
                        runtimeIds={segment.runtimeIds.slice(
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
                      internalSegmentDOMStrategyConfig!.previewChars
                    }
                    runtimeIds={segment.runtimeIds}
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
                    runtimeIds={item.group.runtimeIds}
                    startIndex={item.group.startIndex}
                  />
                ) : (
                  <EditableRootGroupPlaceholder
                    anchorRuntimeId={item.anchorRuntimeId}
                    endIndex={item.endIndex}
                    focusRuntimeId={item.focusRuntimeId}
                    groupId={item.groupId}
                    key={item.groupId}
                    startIndex={item.startIndex}
                  />
                )
              )
            ) : (
              topLevelRuntimeIds.map((runtimeId) => (
                <EditableDescendantNode
                  key={runtimeId}
                  placeholder={placeholderValue}
                  placeholderRef={placeholderRef}
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  renderPlaceholder={renderPlaceholder}
                  renderSegment={renderSegment}
                  renderText={renderText}
                  renderVoid={renderVoid}
                  runtimeId={runtimeId}
                />
              ))
            )}
          </EditableDOMRoot>
        </SlateEditableRootContext.Provider>
      </SlateDOMTextSyncContext.Provider>
    </ProjectionContext.Provider>
  );
};

const EditableVirtualized = <T, TElement extends SlateElementNode>(
  props: EditableProps<T, TElement>
) => <EditableInner {...props} enableVirtualizedRendering />;

const EditableNonVirtualized = <T, TElement extends SlateElementNode>(
  props: EditableProps<T, TElement>
) => <EditableInner {...props} />;

/**
 * Render the editable content area for one Slate root.
 *
 * `Editable` owns DOM strategy, renderers, events, selection sync, and optional
 * root scoping. Pass `root` to mount the editor surface for a specific root.
 */
export const Editable = <T, TElement extends SlateElementNode>(
  props: EditableProps<T, TElement>
) => {
  const { root, ...editableProps } = props;
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
    <Slate readOnly={rootReadOnly} root={root}>
      {editable}
    </Slate>
  );
};
