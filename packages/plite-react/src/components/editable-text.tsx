import React, {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
} from 'react';
import type { Path, NodeKey, Text as PliteTextNode } from '@platejs/plite';
import {
  PliteContentRootOwnerContext,
  PliteDOMTextSyncContext,
  PliteEditableRootContext,
} from '../context';
import {
  canUseProjectedDOMTextSync,
  type DOMTextSyncOptOutReason,
  getDOMTextSyncCapability,
} from '../dom-text-sync';
import { getNodeKey as editorGetNodeKey } from '../editable/runtime-editor-api';
import { useEditor } from '../hooks/use-editor';
import {
  type EditorTextSelectorContext,
  useMountedTextRenderSelector,
} from '../hooks/use-node-selector';
import {
  usePliteNodeKeyDOMValue,
  usePliteNodeRef,
} from '../hooks/use-plite-node-ref';
import { usePliteProjectionEntries } from '../hooks/use-plite-projection-entries';
import type { PliteProjectionSlice } from '../projection-store';
import { hasVisiblePliteViewSelectionDecoration } from '../view-selection-decoration';
import { PliteLeaf } from './plite-leaf';
import {
  getPlitePlaceholderStyle,
  type PlaceholderIntrinsicTag,
  PlitePlaceholder,
} from './plite-placeholder';
import { PliteText } from './plite-text';
import { TextString } from './text-string';
import { ZeroWidthString } from './zero-width-string';

const EMPTY_MARKS: Omit<PliteTextNode, 'text'> = {};
const VIEW_SELECTION_STYLE: CSSProperties = {
  backgroundColor: 'Highlight',
  color: 'HighlightText',
};
const PLACEHOLDER_ANCHOR_STYLE: CSSProperties = {
  display: 'inline-block',
  maxWidth: '100%',
  position: 'relative',
  verticalAlign: 'top',
  width: '100%',
};
const EMPTY_BOUND_TEXT = Object.freeze({
  marks: EMPTY_MARKS,
  path: null,
  nodeKey: null,
  pliteNode: null,
  text: '',
}) as {
  marks: Omit<PliteTextNode, 'text'>;
  path: Path | null;
  nodeKey: NodeKey | null;
  pliteNode: PliteTextNode | null;
  text: string;
};

const sameMarks = (
  left: Omit<PliteTextNode, 'text'>,
  right: Omit<PliteTextNode, 'text'>
) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key) =>
      Object.is(
        (left as Record<string, unknown>)[key],
        (right as Record<string, unknown>)[key]
      )
    )
  );
};

const samePath = (left: Path | null, right: Path | null) =>
  left === right ||
  (left != null &&
    right != null &&
    left.length === right.length &&
    left.every((part, index) => part === right[index]));

const samePathOrRuntimeStable = ({
  leftPath,
  leftNodeKey,
  leftPliteNode,
  rightPath,
  rightNodeKey,
  rightPliteNode,
}: {
  leftPath: Path | null;
  leftNodeKey: NodeKey | null | undefined;
  leftPliteNode: PliteTextNode | null | undefined;
  rightPath: Path | null;
  rightNodeKey: NodeKey | null | undefined;
  rightPliteNode: PliteTextNode | null | undefined;
}) =>
  samePath(leftPath, rightPath) ||
  (leftNodeKey != null &&
    leftNodeKey === rightNodeKey &&
    leftPliteNode != null &&
    leftPliteNode === rightPliteNode);

const sameZeroWidth = (
  left: EditableTextProps['zeroWidth'],
  right: EditableTextProps['zeroWidth']
) =>
  left === right ||
  (left != null &&
    right != null &&
    left.includeSentinel === right.includeSentinel &&
    left.isLineBreak === right.isLineBreak &&
    left.isMarkPlaceholder === right.isMarkPlaceholder &&
    left.length === right.length);

const sameBoundText = (
  left: {
    marks: Omit<PliteTextNode, 'text'>;
    path: Path | null;
    nodeKey: NodeKey | null;
    pliteNode: PliteTextNode | null;
    text: string;
  } | null,
  right: {
    marks: Omit<PliteTextNode, 'text'>;
    path: Path | null;
    nodeKey: NodeKey | null;
    pliteNode: PliteTextNode | null;
    text: string;
  }
) =>
  left != null &&
  left.pliteNode === right.pliteNode &&
  left.nodeKey === right.nodeKey &&
  left.text === right.text &&
  samePathOrRuntimeStable({
    leftPath: left.path,
    leftNodeKey: left.nodeKey,
    leftPliteNode: left.pliteNode,
    rightPath: right.path,
    rightNodeKey: right.nodeKey,
    rightPliteNode: right.pliteNode,
  }) &&
  sameMarks(left.marks, right.marks);

export type EditableTextSegment<T = unknown> = {
  end: number;
  marks: Omit<PliteTextNode, 'text'>;
  slices: readonly PliteProjectionSlice<T>[];
  start: number;
  text: string;
};

export type RenderLeafProps<T = unknown> = {
  attributes: {
    'data-plite-leaf': true;
    'data-plite-leaf-end'?: number;
    'data-plite-leaf-start'?: number;
  };
  children: ReactNode;
  leaf: PliteTextNode;
  leafPosition?: {
    end: number;
    isFirst?: true;
    isLast?: true;
    start: number;
  };
  segment: EditableTextSegment<T>;
  text: PliteTextNode;
};

export type RenderTextProps = {
  attributes: {
    'data-plite-node': 'text';
    'data-plite-dom-sync-reason'?: DOMTextSyncOptOutReason;
    'data-plite-path'?: string;
    'data-plite-projected-dom-sync'?: true;
    'data-plite-node-key'?: string;
    ref?: Ref<HTMLSpanElement>;
  };
  children: ReactNode;
  text: PliteTextNode;
};

export type RenderPlaceholderProps = {
  attributes: {
    'aria-hidden': true;
    'data-plite-placeholder': true;
    contentEditable: false;
    dir?: 'rtl';
    ref: React.RefCallback<HTMLElement>;
    style: CSSProperties;
  };
  children: ReactNode;
};

const RenderCallback = <TProps,>({
  props,
  render,
}: {
  props: TProps;
  render: (props: TProps) => ReactNode;
}) => render(props);

const RenderSegmentCallback = <T,>({
  children,
  render,
  segment,
}: {
  children: ReactNode;
  render: (segment: EditableTextSegment<T>, children: ReactNode) => ReactNode;
  segment: EditableTextSegment<T>;
}) => render(segment, children);

const splitTextByProjections = <T,>(
  text: string,
  slices: readonly PliteProjectionSlice<T>[],
  marks: Omit<PliteTextNode, 'text'>
): EditableTextSegment<T>[] => {
  const clampOffset = (offset: number) =>
    Math.max(0, Math.min(text.length, offset));
  const zeroLengthSlices = slices.filter((slice) => slice.start === slice.end);
  const rangedSlices = slices.filter((slice) => slice.start !== slice.end);

  if (text.length === 0 && zeroLengthSlices.length === 0) {
    return [];
  }

  if (rangedSlices.length === 0 && zeroLengthSlices.length === 0) {
    return [
      {
        end: text.length,
        marks,
        slices: [],
        start: 0,
        text,
      },
    ];
  }

  const boundaries = new Set<number>([0, text.length]);

  rangedSlices.forEach((slice) => {
    boundaries.add(clampOffset(slice.start));
    boundaries.add(clampOffset(slice.end));
  });

  zeroLengthSlices.forEach((slice) => {
    boundaries.add(clampOffset(slice.start));
  });

  const sorted = Array.from(boundaries).sort((left, right) => left - right);
  const segments: EditableTextSegment<T>[] = [];

  const pushZeroLengthSegmentsAt = (offset: number) => {
    zeroLengthSlices
      .filter((slice) => clampOffset(slice.start) === offset)
      .forEach((slice) => {
        segments.push({
          end: offset,
          marks,
          slices: [slice],
          start: offset,
          text: '',
        });
      });
  };

  pushZeroLengthSegmentsAt(0);

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const start = sorted[index]!;
    const end = sorted[index + 1]!;

    if (start === end) {
      continue;
    }

    segments.push({
      end,
      marks,
      slices: rangedSlices.filter(
        (slice) => slice.start < end && slice.end > start
      ),
      start,
      text: text.slice(start, end),
    });

    pushZeroLengthSegmentsAt(end);
  }

  return segments;
};

const getTextMarks = (
  node: PliteTextNode | null
): Omit<PliteTextNode, 'text'> => {
  if (!node) {
    return EMPTY_MARKS;
  }

  const { text: _text, ...nextMarks } = node;
  return nextMarks;
};

type EditableTextProps<T = unknown> = {
  marks?: Omit<PliteTextNode, 'text'>;
  path?: Path;
  placeholder?: ReactNode;
  placeholderAs?: PlaceholderIntrinsicTag;
  placeholderDir?: 'rtl';
  placeholderRef?: React.RefCallback<HTMLElement>;
  placeholderStyle?: CSSProperties;
  ref?: Ref<HTMLSpanElement>;
  renderLeaf?: (props: RenderLeafProps<T>) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderSegment?: (
    segment: EditableTextSegment<T>,
    children: ReactNode
  ) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  nodeKey?: NodeKey | null;
  pliteNode?: PliteTextNode | null;
  text?: string;
  zeroWidth?: {
    includeSentinel?: boolean;
    isLineBreak?: boolean;
    isMarkPlaceholder?: boolean;
    length?: number;
  };
};

const assignRef = (
  ref: Ref<HTMLSpanElement> | undefined,
  node: HTMLSpanElement | null
) => {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
};

const RenderEditableText = <T,>({
  placeholder,
  placeholderAs,
  placeholderDir,
  placeholderRef,
  placeholderStyle,
  path,
  projections,
  ref: textRef,
  renderLeaf,
  renderPlaceholder,
  renderSegment,
  renderText,
  resolvedMarks,
  resolvedText,
  nodeKey,
  zeroWidth,
}: EditableTextProps<T> & {
  projections: readonly PliteProjectionSlice<T>[];
  resolvedMarks: Omit<PliteTextNode, 'text'>;
  resolvedText: string;
}) => {
  const editableRoot = useContext(PliteEditableRootContext);
  const contentRootOwner = useContext(PliteContentRootOwnerContext);
  const textSync = useContext(PliteDOMTextSyncContext);
  const nodeKeyDOMValue = usePliteNodeKeyDOMValue(nodeKey ?? null);
  const hasText = resolvedText.length > 0;
  const domTextSync = getDOMTextSyncCapability({
    hasText,
    projections,
    renderLeaf,
    renderSegment,
    renderText,
    textSync,
  });
  const projectedDOMTextSync = canUseProjectedDOMTextSync({
    hasText,
    projections,
    renderLeaf,
    renderSegment,
    renderText,
    textSync,
  });
  const segments =
    hasText || projections.some((slice) => slice.start === slice.end)
      ? splitTextByProjections(resolvedText, projections, resolvedMarks)
      : [];

  const getLeafAttributes = (
    leafPosition?: RenderLeafProps<T>['leafPosition']
  ) => ({
    'data-plite-leaf': true as const,
    'data-plite-leaf-end': leafPosition?.end,
    'data-plite-leaf-start': leafPosition?.start,
  });
  const textNode = {
    text: resolvedText,
    ...resolvedMarks,
  };
  const textAttributes = {
    'data-plite-dom-sync-reason': domTextSync.reason ?? undefined,
    'data-plite-node': 'text' as const,
    'data-plite-path': path ? path.join(',') : undefined,
    'data-plite-projected-dom-sync': projectedDOMTextSync
      ? (true as const)
      : undefined,
    'data-plite-node-key': nodeKeyDOMValue,
    ref: textRef,
  };
  const placeholderAttributes = {
    'aria-hidden': true as const,
    'data-plite-placeholder': true as const,
    contentEditable: false as const,
    dir: placeholderDir,
    ref: placeholderRef ?? (() => {}),
    style: getPlitePlaceholderStyle(placeholderStyle),
  };

  const content =
    hasText || segments.some((segment) => segment.text.length === 0)
      ? segments.map((segment, index) => {
          const baseContent =
            segment.text.length === 0 ? (
              <ZeroWidthString isMarkPlaceholder />
            ) : (
              <TextString text={segment.text} />
            );
          const segmentContent = renderSegment ? (
            <RenderSegmentCallback render={renderSegment} segment={segment}>
              {baseContent}
            </RenderSegmentCallback>
          ) : (
            baseContent
          );
          const decoratedSegmentContent =
            hasVisiblePliteViewSelectionDecoration(segment.slices, {
              owner: contentRootOwner,
              root: editableRoot,
            }) ? (
              <span
                data-plite-view-selection="true"
                style={VIEW_SELECTION_STYLE}
              >
                {segmentContent}
              </span>
            ) : (
              segmentContent
            );
          const leafNode = {
            text: segment.text,
            ...segment.marks,
          };
          const leafPosition =
            segments.length > 1
              ? {
                  end: segment.end,
                  isFirst: index === 0 ? (true as const) : undefined,
                  isLast:
                    index === segments.length - 1 ? (true as const) : undefined,
                  start: segment.start,
                }
              : undefined;
          const leafAttributes = getLeafAttributes(leafPosition);

          return (
            <React.Fragment key={`segment-${index}`}>
              {renderLeaf ? (
                <RenderCallback
                  props={{
                    attributes: leafAttributes,
                    children: decoratedSegmentContent,
                    leaf: leafNode,
                    leafPosition,
                    segment,
                    text: textNode,
                  }}
                  render={renderLeaf}
                />
              ) : (
                <PliteLeaf attributes={leafAttributes}>
                  {decoratedSegmentContent}
                </PliteLeaf>
              )}
            </React.Fragment>
          );
        })
      : (() => {
          const segment: EditableTextSegment<T> = {
            end: 0,
            marks: resolvedMarks,
            slices: [],
            start: 0,
            text: '',
          };
          const placeholderNode = placeholder ? (
            renderPlaceholder ? (
              <RenderCallback
                props={{
                  attributes: placeholderAttributes,
                  children: placeholder,
                }}
                render={renderPlaceholder}
              />
            ) : (
              <PlitePlaceholder
                as={placeholderAs}
                dir={placeholderDir}
                ref={placeholderRef}
                style={placeholderStyle}
              >
                {placeholder}
              </PlitePlaceholder>
            )
          ) : null;
          const zeroWidthString = (
            <ZeroWidthString
              includeSentinel={zeroWidth?.includeSentinel}
              isLineBreak={zeroWidth?.isLineBreak}
              isMarkPlaceholder={zeroWidth?.isMarkPlaceholder}
              length={zeroWidth?.length}
            />
          );
          const content = placeholderNode ? (
            <span
              data-plite-placeholder-anchor="true"
              style={PLACEHOLDER_ANCHOR_STYLE}
            >
              {zeroWidthString}
              {placeholderNode}
            </span>
          ) : (
            zeroWidthString
          );
          const leafNode = {
            text: '',
            ...resolvedMarks,
          };
          const leafAttributes = getLeafAttributes();

          return renderLeaf ? (
            <RenderCallback
              props={{
                attributes: leafAttributes,
                children: content,
                leaf: leafNode,
                segment,
                text: textNode,
              }}
              render={renderLeaf}
            />
          ) : (
            <PliteLeaf>{content}</PliteLeaf>
          );
        })();

  if (renderText) {
    return (
      <RenderCallback
        props={{
          attributes: textAttributes,
          children: content,
          text: textNode,
        }}
        render={renderText}
      />
    );
  }

  return (
    <PliteText
      domSync={domTextSync.enabled}
      domSyncReason={domTextSync.reason}
      path={path}
      projectedDomSync={projectedDOMTextSync}
      ref={textRef}
      nodeKey={nodeKey}
    >
      {content}
    </PliteText>
  );
};

const BoundEditableText = <T,>({
  marks,
  path,
  ref,
  nodeKey = null,
  text,
  ...props
}: EditableTextProps<T>) => {
  const editor = useEditor();
  const selectorNodeKey = path ? editorGetNodeKey(editor, path) : nodeKey;
  const selectBoundText = useCallback(
    ({
      path: selectorPath,
      nodeKey: resolvedNodeKey,
      text: node,
    }: EditorTextSelectorContext) => {
      if (!path && !nodeKey) {
        return EMPTY_BOUND_TEXT;
      }

      const resolvedPath = path ?? selectorPath;

      return {
        marks: marks ?? getTextMarks(node),
        path: resolvedPath,
        nodeKey: resolvedNodeKey,
        pliteNode: node,
        text: text ?? node?.text ?? '',
      };
    },
    [marks, path, nodeKey, text]
  );
  const boundText = useMountedTextRenderSelector(
    selectBoundText,
    sameBoundText,
    {
      nodeKey: selectorNodeKey,
    }
  );
  const resolvedNodeKey = boundText.nodeKey;
  const boundRef = usePliteNodeRef(resolvedNodeKey, {
    path: boundText.path,
    pliteNode: boundText.pliteNode,
  });
  const projections = usePliteProjectionEntries(
    resolvedNodeKey
  ) as readonly PliteProjectionSlice<T>[];

  const combinedRef = useCallback(
    (node: HTMLSpanElement | null) => {
      boundRef(node);
      assignRef(ref, node);
    },
    [boundRef, ref]
  );

  return (
    <RenderEditableText
      {...props}
      path={boundText.path ?? undefined}
      projections={projections}
      ref={combinedRef}
      resolvedMarks={boundText.marks}
      resolvedText={boundText.text}
      nodeKey={resolvedNodeKey}
    />
  );
};

const ProjectedEditableText = <T,>({
  marks = EMPTY_MARKS,
  path,
  ref,
  nodeKey = null,
  pliteNode = null,
  text = '',
  ...props
}: EditableTextProps<T>) => {
  const boundRef = usePliteNodeRef(nodeKey, { path, pliteNode });
  const projections = usePliteProjectionEntries(
    nodeKey
  ) as readonly PliteProjectionSlice<T>[];

  const combinedRef = useCallback(
    (node: HTMLSpanElement | null) => {
      boundRef(node);
      assignRef(ref, node);
    },
    [boundRef, ref]
  );

  return (
    <RenderEditableText
      {...props}
      path={path}
      projections={projections}
      ref={combinedRef}
      resolvedMarks={marks}
      resolvedText={text}
      nodeKey={nodeKey}
    />
  );
};

const sameEditableTextProps = <T,>(
  left: EditableTextProps<T>,
  right: EditableTextProps<T>
) =>
  left.placeholder === right.placeholder &&
  left.placeholderAs === right.placeholderAs &&
  left.placeholderDir === right.placeholderDir &&
  left.placeholderRef === right.placeholderRef &&
  left.placeholderStyle === right.placeholderStyle &&
  left.ref === right.ref &&
  left.renderLeaf === right.renderLeaf &&
  left.renderPlaceholder === right.renderPlaceholder &&
  left.renderSegment === right.renderSegment &&
  left.renderText === right.renderText &&
  left.nodeKey === right.nodeKey &&
  left.pliteNode === right.pliteNode &&
  left.text === right.text &&
  sameMarks(left.marks ?? EMPTY_MARKS, right.marks ?? EMPTY_MARKS) &&
  samePathOrRuntimeStable({
    leftPath: left.path ?? null,
    leftNodeKey: left.nodeKey,
    leftPliteNode: left.pliteNode,
    rightPath: right.path ?? null,
    rightNodeKey: right.nodeKey,
    rightPliteNode: right.pliteNode,
  }) &&
  sameZeroWidth(left.zeroWidth, right.zeroWidth);

const EditableTextInner = <T,>({
  path,
  ref,
  nodeKey,
  ...props
}: EditableTextProps<T>) => {
  if (nodeKey && props.text !== undefined && props.marks !== undefined) {
    return (
      <ProjectedEditableText
        {...props}
        path={path}
        ref={ref}
        nodeKey={nodeKey}
      />
    );
  }

  if (
    path ||
    (nodeKey && (props.text === undefined || props.marks === undefined))
  ) {
    return (
      <BoundEditableText {...props} path={path} ref={ref} nodeKey={nodeKey} />
    );
  }

  if (nodeKey) {
    return <ProjectedEditableText {...props} ref={ref} nodeKey={nodeKey} />;
  }

  return (
    <RenderEditableText
      {...props}
      projections={[]}
      ref={ref}
      resolvedMarks={props.marks ?? {}}
      resolvedText={props.text ?? ''}
    />
  );
};

export const EditableText = React.memo(
  EditableTextInner,
  sameEditableTextProps
) as typeof EditableTextInner;
