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
  type Element as ElementNode,
  type Range as ModelRange,
  type Text as TextNode,
} from '../..';
import {
  readAuthoredViewFragments,
  readAuthoredViewFragmentSlots,
  subscribeAuthoredViewFragmentSlots,
  type NativeAuthoredFragmentSlot,
  type NativeAuthoredRenderSegment,
} from '../../core/authored-runtime';
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
} from '../../dom/internal';
import {
  AuthoredFragmentRendererContext,
  AuthoredFragmentRootsContext,
} from '../authored-fragment-context';
import {
  ElementContext,
  PliteContentRootOwnerContext,
  PliteEditableRootContext,
} from '../context';
import {
  DecorationContext,
  type PliteDecorationStore,
  useRegisterPliteDecorationSource,
} from '../decoration-context';
import { canSkipRendererForRetainedTextFlow } from '../dom-text-sync';
import { readContentRootRenderSegments } from '../editable/content-root-owners';
import { assertExternalTextElement } from '../editable/external-text-binding';
import { useRootInteractionController } from '../editable/root-interaction-controller';
import {
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
import { readRuntimeNode } from '../editable/runtime-live-state';
import { resolveViewBoundaryDOMPoint } from '../editable/selection-projected-dom';
import type { ExternalTextOptions } from '../external-text';
import { useAuthoredFragmentSlots } from '../hooks/use-authored-fragment-slots';
import {
  useEditableDOMRuntime,
  useClaimEditableDOMCommit,
} from '../hooks/use-claim-editable-dom-commit';
import { useEditorComposing } from '../hooks/use-editor-composing';
import { useEditorContext } from '../hooks/use-editor-context';
import { useEditorFocused } from '../hooks/use-editor-focused';
import { useEditorReadOnly } from '../hooks/use-editor-read-only';
import { useEditorSelection } from '../hooks/use-editor-selection';
import { useRequiredEditorSelectorContext } from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { useMountedNodeRenderSelector } from '../hooks/use-node-selector';
import { useContentRoot } from '../hooks/use-plite-content-root';
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
import {
  createRangeGeometryOwner,
  useRangeGeometryOwner,
} from '../range-geometry';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  subscribePliteViewSelection,
} from '../view-selection';
import { usePliteViewSelectionFragmentKeys } from '../view-selection-decoration';
import { EditableViewportBoundary } from '../viewport-boundary';
import type { EditableViewportPlan } from '../viewport-plan';
import {
  type DOMCoverageBoundaryMaterializePayload,
  DOMCoverageBoundaryRange,
  DOMCoverageSelfBoundary,
} from './dom-coverage-boundary';
import {
  type EditableDOMBeforeInputHandler,
  EditableDOMRoot,
  type EditableKeyDownHandler,
} from './editable';
import {
  isEditableTextNode,
  readEditableDescendantBinding,
} from './editable-descendant-binding';
import { EditableExternalText } from './editable-external-text';
import { sameDescendantBinding } from './editable-node-equality';
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
import {
  EditorRoot,
  PliteFragment,
  PlitePlainTextFragment,
  usePliteRenderContext,
} from './plite';
import { EditorElement } from './plite-element';
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
  spellCheck?: TextareaHTMLAttributes<HTMLDivElement>['spellCheck'];
  style?: CSSProperties;
  tabIndex?: number;
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

/** @internal */
export type EditableElementLayout = Readonly<{
  height: number;
  left: number;
  top: number;
  width: number;
}>;

const EditableElementLayoutsContext = React.createContext<ReadonlyMap<
  string,
  EditableElementLayout | null
> | null>(null);

const applyEditableElementLayout = (
  element: HTMLElement,
  layout: EditableElementLayout | null
) => {
  element.style.height = layout ? `${layout.height}px` : '';
  element.style.left = layout ? `${layout.left}px` : '';
  element.style.position = layout ? 'absolute' : '';
  element.style.top = layout ? `${layout.top}px` : '';
  element.style.width = layout ? `${layout.width}px` : '';
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
  element: ElementNode;
  options: EditableContentRootSlotOptions;
  ownerPath: Path;
  renderers: EditableContentRootSlotRenderers;
  slot: string;
}) {
  const ownerEditor = useEditorContext();
  const ownerRoot = toInternalRoot(
    ownerEditor.read((state) => state.view.root())
  );
  const { root } = useContentRoot(element, { slot });
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
      <EditorRoot editor={ownerEditor} readOnly={readOnly} root={root}>
        <EditableContentRootView
          options={options}
          ownerPath={ownerPath}
          ownerRoot={ownerRoot}
          renderers={renderers}
          root={root}
          slot={slot}
        />
      </EditorRoot>
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
      data-editor-content-root-owner-path={ownerPath.join(',')}
      data-editor-content-root-owner-root={ownerRoot}
      data-editor-content-root-slot={slot}
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

export type RenderElementProps<TElement extends ElementNode = ElementNode> =
  TElement extends ElementNode
    ? {
        attributes: {
          'data-editor-inline'?: true;
          'data-editor-node': 'element';
          'data-editor-path': string;
          'data-editor-node-key': string;
          'data-editor-void'?: true;
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
    <PliteInlineVoidShell content={content}>{children}</PliteInlineVoidShell>
  ) : (
    <PliteVoidShell content={content}>{children}</PliteVoidShell>
  );
};

const resolveTextZeroWidth = ({
  editor,
  isRetainedFragmentRoot,
  node,
  path,
}: {
  editor: Editor;
  isRetainedFragmentRoot?: boolean;
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

  if (isRetainedFragmentRoot) {
    return { isLineBreak: false };
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
  TElement extends ElementNode = ElementNode,
  TRoot extends RootKey = RootKey,
> = {
  autoFocus?: boolean;
  className?: string;
  disableDefaultStyles?: boolean;
  id?: string;
  ignoreBlankEditableRootClicks?: boolean;
  onBeforeInput?: React.FormEventHandler<HTMLDivElement>;
  onDOMBeforeInput?: EditableDOMBeforeInputHandler;
  onKeyDown?: EditableKeyDownHandler;
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
  textRange,
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
  textRange?: Readonly<{ end: number; start: number }>;
}) => {
  const editor = useEditorContext();
  const elementLayouts = React.useContext(EditableElementLayoutsContext);
  const fragment = React.useContext(AuthoredFragmentRootsContext);
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
  const hasTextChildFragments = React.useSyncExternalStore(
    React.useCallback(
      (notify) => {
        const stops = childNodeKeys.flatMap((key, index) =>
          directTextChildNodes[index]
            ? [subscribeAuthoredViewFragmentSlots(editor, key, notify)]
            : []
        );
        return () => stops.forEach((stop) => stop());
      },
      [editor, childNodeKeys, directTextChildNodes]
    ),
    () =>
      childNodeKeys.some(
        (key, index) =>
          directTextChildNodes[index] &&
          readAuthoredViewFragmentSlots(editor, key).length > 0
      ),
    () =>
      childNodeKeys.some(
        (key, index) =>
          directTextChildNodes[index] &&
          readAuthoredViewFragmentSlots(editor, key).length > 0
      )
  );
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
    !renderChildrenOverride &&
    !hasTextChildFragments &&
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
        pliteNode={node}
        text={node.text}
        textRange={textRange}
        zeroWidth={resolveTextZeroWidth({
          editor,
          isRetainedFragmentRoot: fragment?.roots.has(nodeKey),
          node,
          path,
        })}
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

  const elementLayout = elementLayouts?.get(path.join('.'));
  const elementRef: React.RefCallback<HTMLElement> =
    elementLayout === undefined
      ? (bindNodeRef as React.RefCallback<HTMLElement>)
      : (element) => {
          (bindNodeRef as React.RefCallback<HTMLElement>)(element);
          if (element) applyEditableElementLayout(element, elementLayout);
        };
  const attributes = {
    'data-editor-inline': inline ? (true as const) : undefined,
    'data-editor-node': 'element' as const,
    'data-editor-path': path.join(','),
    'data-editor-node-key': nodeKeyDOMValue,
    'data-editor-void': voidNode ? (true as const) : undefined,
    ref: elementRef,
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
  const renderChild = (childNodeKey: NodeKey, index: number) => {
    const directText = renderDirectTextChild(
      childNodeKey,
      node.children[index],
      index
    );
    return directText ? (
      <EditableDescendantNodeWithFragments
        nodeKey={childNodeKey}
        key={childNodeKey}
      >
        {directText}
      </EditableDescendantNodeWithFragments>
    ) : (
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
      <EditorElement
        style={{ position: 'relative' }}
        as={inline ? 'span' : 'div'}
        isInline={inline}
      >
        {renderChildren()}
      </EditorElement>
    </ElementContext>
  );
};

const EditableRetainedFragments = ({
  side,
  slots,
}: {
  side: NativeAuthoredFragmentSlot['side'];
  slots: readonly NativeAuthoredFragmentSlot[];
}) => {
  const editor = useEditorContext();
  const render = React.useContext(AuthoredFragmentRendererContext);
  useClaimEditableDOMCommit();
  return slots
    .filter((slot) => slot.side === side)
    .map((slot) => {
      const fragment = readAuthoredViewFragments(editor, slot.changeId).find(
        (current) => current.id === slot.id
      );
      if (
        !render ||
        !fragment ||
        fragment.kind === 'properties' ||
        fragment.placement?.kind !== 'children'
      ) {
        return null;
      }
      return render(fragment);
    });
};

const EditableDescendantContent = React.memo(
  EditableDescendantNodeInner
) as typeof EditableDescendantNodeInner;

const EditableAuthoredSegmentContent = <TElement extends ElementNode>({
  segment,
  ...props
}: Omit<
  Parameters<typeof EditableDescendantNodeInner<TElement>>[0],
  'nodeKey'
> & {
  segment: NativeAuthoredRenderSegment;
}) => {
  const editor = useEditorContext();
  const nodeKey = editor.key(segment.path);
  return nodeKey ? (
    <EditableDescendantContent {...props} nodeKey={nodeKey} />
  ) : null;
};

const EditableAuthoredSegments = <TElement extends ElementNode>({
  nodeKey,
  ...props
}: Omit<
  Parameters<typeof EditableDescendantNodeInner<TElement>>[0],
  'nodeKey'
> & {
  nodeKey?: NodeKey;
}) => {
  const editor = useEditorContext();
  const { addEventListener } = useRequiredEditorSelectorContext();
  const renderParent = usePliteRenderContext();
  const readSegments = React.useCallback(
    () => readContentRootRenderSegments(editor, nodeKey),
    [editor, nodeKey]
  );
  const segments = React.useSyncExternalStore(
    React.useCallback(
      (notify) => {
        const stopNode = addEventListener(notify, { nodeKey });
        const stopFragments = subscribeAuthoredViewFragmentSlots(
          editor,
          nodeKey,
          notify
        );
        return () => {
          stopNode();
          stopFragments();
        };
      },
      [addEventListener, editor, nodeKey]
    ),
    readSegments,
    readSegments
  );
  const readOnly = new Map<NativeAuthoredRenderSegment, boolean>();
  const isReadOnly = (segment: NativeAuthoredRenderSegment): boolean => {
    const cached = readOnly.get(segment);
    if (cached !== undefined) return cached;
    const value =
      Boolean(segment.fragment) &&
      (segment.kind === 'text' || segment.children.every(isReadOnly));
    readOnly.set(segment, value);
    return value;
  };
  const renderSegment = (
    segment: NativeAuthoredRenderSegment,
    currentFragmentId: string | null = null
  ): ReactNode => {
    const content = (fragmentId: string | null) => (
      <EditableAuthoredSegmentContent
        {...props}
        segment={segment}
        renderChildrenOverride={
          segment.kind === 'element'
            ? (from = 0, to = Number.POSITIVE_INFINITY) =>
                segment.children
                  .filter(
                    (child) =>
                      child.childIndex >= from && child.childIndex <= to
                  )
                  .map((child) => renderSegment(child, fragmentId))
            : undefined
        }
        textRange={
          segment.kind === 'text'
            ? { end: segment.end, start: segment.start }
            : undefined
        }
      />
    );
    if (segment.fragment && segment.fragment.id !== currentFragmentId) {
      const { fragment } = segment;
      return (
        <React.Fragment key={segment.key}>
          {renderParent(
            <PliteFragment
              fragment={fragment}
              paths={[segment.path]}
              readOnlyRoots={isReadOnly(segment)}
            >
              {() => content(isReadOnly(segment) ? fragment.id : null)}
            </PliteFragment>
          )}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment key={segment.key}>
        {segment.fragment
          ? content(currentFragmentId)
          : renderParent(content(null))}
      </React.Fragment>
    );
  };
  return segments?.map((segment) => renderSegment(segment)) ?? null;
};

const EditableDescendantNodeWithFragments = <TElement extends ElementNode>({
  children,
  nodeKey,
  ...props
}: Parameters<typeof EditableDescendantNodeInner<TElement>>[0] & {
  children?: ReactNode;
}) => {
  const slots = useAuthoredFragmentSlots(nodeKey);
  useClaimEditableDOMCommit();
  if (slots.some((slot) => slot.side === 'structure')) {
    return <EditableAuthoredSegments {...props} nodeKey={nodeKey} />;
  }
  return (
    <>
      {slots.some((slot) => slot.side === 'before') && (
        <EditableRetainedFragments side="before" slots={slots} />
      )}
      {children ?? <EditableDescendantContent {...props} nodeKey={nodeKey} />}
      {slots.some((slot) => slot.side === 'after') && (
        <EditableRetainedFragments side="after" slots={slots} />
      )}
    </>
  );
};

export const EditableDescendantNode = React.memo(
  EditableDescendantNodeWithFragments
) as typeof EditableDescendantNodeWithFragments;

const EditableAuthoredRoot = <TElement extends ElementNode>({
  children,
  ...props
}: Omit<
  Parameters<typeof EditableDescendantNodeInner<TElement>>[0],
  'nodeKey'
> & { children: ReactNode }) => {
  const slots = useAuthoredFragmentSlots();
  return slots.some((slot) => slot.side === 'structure') ? (
    <EditableAuthoredSegments {...props} />
  ) : (
    <>
      <EditableRetainedFragments side="children" slots={slots} />
      {children}
    </>
  );
};

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
  onBeforeInput,
  onBlurCapture,
  onDOMBeforeInput,
  onFocusCapture,
  onKeyDown,
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
  viewportPlan = null,
  ...attributes
}: EditableProps<TElement> & {
  viewportPlan?: EditableViewportPlan | null;
}) => {
  const editor = useEditorContext();
  const viewSelectionFragmentKeys = usePliteViewSelectionFragmentKeys(editor);
  const renderAuthoredFragment = React.useCallback<
    NonNullable<React.ContextType<typeof AuthoredFragmentRendererContext>>
  >(
    (fragment) => {
      const children = (keys: readonly NodeKey[]) =>
        keys.map((key) => (
          <EditableDescendantNode
            key={key}
            nodeKey={key}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            renderPlaceholder={renderPlaceholder}
            renderText={renderText}
            renderVoid={renderVoid}
          />
        ));

      return fragment.placement?.kind === 'text' &&
        !renderLeaf &&
        !renderText ? (
        <PlitePlainTextFragment
          key={fragment.id}
          fragment={fragment}
          hasViewSelection={viewSelectionFragmentKeys.includes(
            JSON.stringify([fragment.changeId, fragment.id])
          )}
        >
          {children}
        </PlitePlainTextFragment>
      ) : (
        <PliteFragment key={fragment.id} fragment={fragment}>
          {children}
        </PliteFragment>
      );
    },
    [
      renderElement,
      renderLeaf,
      renderPlaceholder,
      renderText,
      renderVoid,
      viewSelectionFragmentKeys,
    ]
  );
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
  const inactiveSelectionEditableRef = React.useRef<HTMLDivElement | null>(
    null
  );
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

      if (typeof targetIndex === 'number') {
        viewportPlan?.requestMount?.(targetIndex, path);
      }

      return viewportPlan?.scrollToPath(path, align) ?? false;
    },
    [viewportPlan]
  );
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

    if (node && editor.api.dom.resolveDOMNode(node)) {
      lastViewportScrollPathKeyRef.current = anchorPathKey;
      return;
    }
    if (lastViewportScrollPathKeyRef.current === anchorPathKey) return;

    viewportPlan.requestMount?.(anchorPath[0] ?? 0, anchorPath);
    if (viewportPlan.scrollToPath(anchorPath, 'center')) {
      lastViewportScrollPathKeyRef.current = anchorPathKey;
    }
  }, [editor, selectedViewportPaths, viewportPlan]);

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
    <AuthoredFragmentRendererContext value={renderAuthoredFragment}>
      <PliteEditableRootContext value={editableRoot}>
        <EditableDOMRoot
          autoFocus={autoFocus}
          {...attributes}
          className={className}
          deferNativeTextInputRepair={viewportPlan != null}
          disableDefaultStyles={disableDefaultStyles}
          viewportRuntime={
            viewportPlan
              ? {
                  mountedTopLevelNodeKeys: viewportPlan.mountedTopLevelNodeKeys,
                  mountedTopLevelRanges: viewportPlan.mountedTopLevelRanges,
                  scrollToPath: scrollViewportPathIntoView,
                  type: 'virtualized',
                }
              : null
          }
          id={id}
          ignoreBlankEditableRootClicks={ignoreBlankEditableRootClicks}
          onBeforeInput={onBeforeInput}
          onBlurCapture={handleBlurCapture}
          onDOMBeforeInput={onDOMBeforeInput}
          onFocusCapture={handleFocusCapture}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
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
          <EditableAuthoredRoot
            placeholder={placeholderValue}
            placeholderRef={placeholderRef}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            renderPlaceholder={renderPlaceholder}
            renderText={renderText}
            renderVoid={renderVoid}
          >
            {renderedNodes}
          </EditableAuthoredRoot>
          <PliteInactiveSelectionCaret
            editableRef={inactiveSelectionEditableRef}
            store={inactiveSelectionStore}
          />
          {!effectiveReadOnly && (
            <PliteViewSelectionCaret
              editableRef={inactiveSelectionEditableRef}
            />
          )}
        </EditableDOMRoot>
      </PliteEditableRootContext>
    </AuthoredFragmentRendererContext>
  );
};

export const EditableViewportSurface = <
  TElement extends ElementNode = ElementNode,
>({
  decorationStore,
  elementLayouts,
  viewportPlan,
  ...props
}: EditableProps<TElement> & {
  decorationStore?: PliteDecorationStore | null;
  elementLayouts?: ReadonlyMap<string, EditableElementLayout | null>;
  viewportPlan: EditableViewportPlan | null;
}) => {
  const inheritedDecorationStore = React.useContext(DecorationContext);
  const editable = <EditableInner {...props} viewportPlan={viewportPlan} />;
  const content = elementLayouts ? (
    <EditableElementLayoutsContext value={elementLayouts}>
      {editable}
    </EditableElementLayoutsContext>
  ) : (
    editable
  );

  return decorationStore && decorationStore !== inheritedDecorationStore ? (
    <DecorationContext value={decorationStore}>{content}</DecorationContext>
  ) : (
    content
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

const PliteViewSelectionCaret = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const editor = useEditorContext();
  const focused = useEditorFocused();
  const selection = React.useSyncExternalStore(
    React.useCallback(
      (notify) => subscribePliteViewSelection(editor, notify),
      [editor]
    ),
    React.useCallback(() => readPliteViewSelection(editor), [editor]),
    () => null
  );
  if (!focused || !selection || !isPliteViewSelectionCollapsed(selection)) {
    return null;
  }
  return <PliteViewSelectionCaretGeometry editableRef={editableRef} />;
};

const PliteViewSelectionCaretGeometry = ({
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
  if (!rect) return null;
  return (
    <span
      aria-hidden="true"
      contentEditable={false}
      data-editor-view-selection-caret=""
      data-editor-root-chrome-ignore="true"
      style={{
        backgroundColor: 'currentColor',
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
      data-editor-inactive-selection-caret=""
      data-editor-root-chrome-ignore="true"
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

/**
 * Render the editable content area for one Plite root.
 *
 * `Editable` renders the complete root DOM and owns renderers, events,
 * selection sync, and optional root scoping. Pass `root` to mount the editor
 * surface for a specific root.
 * When focus moves to an element or composed ancestor with
 * `data-editor-keep-selection-visible`, that exact Editable paints its live
 * canonical selection through `data-editor-inactive-selection` or
 * `data-editor-inactive-selection-caret` until focus returns or moves elsewhere.
 */
export const Editable = <
  TElement extends ElementNode,
  const TRoot extends RootKey = RootKey,
>(
  props: EditableProps<TElement, TRoot>
) => {
  const { root, ...editableProps } = props;

  if (root === 'main') {
    throw new Error('[Plite] Omit root to render the primary editable.');
  }
  const inheritedReadOnly = useEditorReadOnly();
  const editor = useEditorContext();
  const rootReadOnly = props.readOnly || inheritedReadOnly;
  const editable = <EditableInner {...editableProps} />;

  return root === undefined ? (
    editable
  ) : (
    <EditorRoot editor={editor} readOnly={rootReadOnly} root={root}>
      {editable}
    </EditorRoot>
  );
};
