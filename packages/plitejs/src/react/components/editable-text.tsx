import React, {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
} from 'react';

import type { Path, NodeKey, Text as PliteTextNode } from '../..';
import { usePliteDecorationEntries } from '../decoration-context';
import {
  getDecorationSliceIdentity,
  type PliteDecorationSlice,
} from '../decoration-source';
import {
  type DOMTextSyncOptOutReason,
  getDOMTextSyncCapability,
} from '../dom-text-sync';
import { getNodeKey as editorGetNodeKey } from '../editable/runtime-editor-api';
import { readTextByKey } from '../editable/runtime-live-state';
import { useClaimEditableDOMCommit } from '../hooks/use-claim-editable-dom-commit';
import { useEditorContext } from '../hooks/use-editor-context';
import {
  type EditorTextSelectorContext,
  useMountedTextRenderSelector,
} from '../hooks/use-node-selector';
import {
  getDOMTextRenderRevision,
  usePliteNodeKeyDOMValue,
  usePliteNodeRef,
} from '../hooks/use-plite-node-ref';
import { compileTextFlowSegments } from './editable-text-flow';
import { PliteLeaf } from './plite-leaf';
import {
  getPlitePlaceholderStyle,
  type PlaceholderIntrinsicTag,
  PlitePlaceholder,
} from './plite-placeholder';
import { PliteText } from './plite-text';
import { DecoratedTextString, TextString } from './text-string';
import { ZeroWidthString } from './zero-width-string';

const EMPTY_MARKS: Omit<PliteTextNode, 'text'> = {};
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
  renderRevision: 0,
  text: '',
}) as {
  marks: Omit<PliteTextNode, 'text'>;
  path: Path | null;
  nodeKey: NodeKey | null;
  pliteNode: PliteTextNode | null;
  renderRevision: number;
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

type ZeroWidthOptions = {
  includeSentinel?: boolean;
  isLineBreak?: boolean;
  isMarkPlaceholder?: boolean;
  length?: number;
};

const sameZeroWidth = (
  left: ZeroWidthOptions | undefined,
  right: ZeroWidthOptions | undefined
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
    renderRevision: number;
    text: string;
  } | null,
  right: {
    marks: Omit<PliteTextNode, 'text'>;
    path: Path | null;
    nodeKey: NodeKey | null;
    pliteNode: PliteTextNode | null;
    renderRevision: number;
    text: string;
  }
) =>
  left != null &&
  left.pliteNode === right.pliteNode &&
  left.nodeKey === right.nodeKey &&
  left.renderRevision === right.renderRevision &&
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

type EditableTextPart = {
  decorations: readonly PliteDecorationSlice[];
  end: number;
  identity: string;
  marks: Omit<PliteTextNode, 'text'>;
  start: number;
  text: string;
};

export type RenderLeafProps = {
  attributes: {
    'data-plite-leaf': true;
    'data-plite-leaf-end'?: number;
    'data-plite-leaf-start'?: number;
  };
  children: ReactNode;
  leaf: Omit<PliteTextNode, 'text'>;
  leafPosition?: {
    end: number;
    isFirst?: true;
    isLast?: true;
    start: number;
  };
  path?: Path;
  text: Omit<PliteTextNode, 'text'>;
};

export type RenderTextProps = {
  attributes: {
    'data-plite-dom-sync'?: true;
    'data-plite-node': 'text';
    'data-plite-dom-sync-reason'?: DOMTextSyncOptOutReason;
    'data-plite-path'?: string;
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

const splitTextByDecorations = (
  text: string,
  decorations: readonly PliteDecorationSlice[],
  marks: Omit<PliteTextNode, 'text'>
): EditableTextPart[] =>
  compileTextFlowSegments(text, decorations).segments.map((segment) => ({
    ...segment,
    marks,
  }));

const getTextMarks = (
  node: PliteTextNode | null
): Omit<PliteTextNode, 'text'> => {
  if (!node) {
    return EMPTY_MARKS;
  }

  const { text: _text, ...nextMarks } = node;
  return nextMarks;
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

const getLeafAttributes = (leafPosition?: RenderLeafProps['leafPosition']) => ({
  'data-plite-leaf': true as const,
  'data-plite-leaf-end': leafPosition?.end,
  'data-plite-leaf-start': leafPosition?.start,
});

const RenderEditableText = ({
  decorations,
  isLast = false,
  placeholder,
  placeholderAs,
  placeholderDir,
  placeholderRef,
  placeholderStyle,
  path,
  ref: textRef,
  renderRevision = 0,
  renderLeaf,
  renderPlaceholder,
  renderText,
  resolvedMarks,
  resolvedText,
  nodeKey,
  zeroWidth,
}: {
  decorations: readonly PliteDecorationSlice[];
  isLast?: boolean;
  nodeKey?: NodeKey | null;
  path?: Path;
  placeholder?: ReactNode;
  placeholderAs?: PlaceholderIntrinsicTag;
  placeholderDir?: 'rtl';
  placeholderRef?: React.RefCallback<HTMLElement>;
  placeholderStyle?: CSSProperties;
  ref?: Ref<HTMLSpanElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderRevision?: number | string;
  renderText?: (props: RenderTextProps) => ReactNode;
  resolvedMarks: Omit<PliteTextNode, 'text'>;
  resolvedText: string;
  zeroWidth?: ZeroWidthOptions;
}) => {
  useClaimEditableDOMCommit();
  const nodeKeyDOMValue = usePliteNodeKeyDOMValue(nodeKey ?? null);
  const hasText = resolvedText.length > 0;
  const domTextSync = getDOMTextSyncCapability({
    hasText,
    marks: resolvedMarks,
    decorations,
    renderLeaf,
    renderText,
  });
  const segments = hasText
    ? splitTextByDecorations(resolvedText, decorations, resolvedMarks)
    : [];

  const textNode = {
    text: resolvedText,
    ...resolvedMarks,
  };
  const textAttributes = {
    'data-plite-dom-sync': domTextSync.enabled ? (true as const) : undefined,
    'data-plite-dom-sync-reason': domTextSync.reason ?? undefined,
    'data-plite-node': 'text' as const,
    'data-plite-path': path ? path.join(',') : undefined,
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
          const innermostDecoration = segment.decorations.at(-1);
          const isTrailing =
            isLast &&
            index === segments.length - 1 &&
            segment.text.endsWith('\n');
          const baseContent =
            segment.text.length === 0 ? (
              <ZeroWidthString isMarkPlaceholder />
            ) : innermostDecoration ? (
              <DecoratedTextString
                attributes={innermostDecoration.attributes}
                isTrailing={isTrailing}
                text={segment.text}
              />
            ) : (
              <TextString isTrailing={isTrailing} text={segment.text} />
            );
          let decoratedSegmentContent: ReactNode = baseContent;
          const wrapperCount =
            segment.decorations.length - (innermostDecoration ? 1 : 0);

          for (
            let decorationIndex = wrapperCount - 1;
            decorationIndex >= 0;
            decorationIndex--
          ) {
            const decoration = segment.decorations[decorationIndex];

            decoratedSegmentContent = (
              <span
                key={getDecorationSliceIdentity(decoration)}
                {...decoration.attributes}
              >
                {decoratedSegmentContent}
              </span>
            );
          }
          const leafNode = segment.marks;
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

          const segmentKey = JSON.stringify([
            nodeKey,
            renderRevision,
            segment.identity,
          ]);

          return (
            <React.Fragment key={segmentKey}>
              {renderLeaf ? (
                <RenderCallback
                  props={{
                    attributes: leafAttributes,
                    children: decoratedSegmentContent,
                    leaf: leafNode,
                    leafPosition,
                    path,
                    text: resolvedMarks,
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
          const innerContent = placeholderNode ? (
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
          const leafNode = resolvedMarks;
          const leafAttributes = getLeafAttributes();

          return renderLeaf ? (
            <RenderCallback
              props={{
                attributes: leafAttributes,
                children: innerContent,
                leaf: leafNode,
                path,
                text: resolvedMarks,
              }}
              render={renderLeaf}
            />
          ) : (
            <PliteLeaf>{innerContent}</PliteLeaf>
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
      ref={textRef}
      nodeKey={nodeKey}
    >
      {content}
    </PliteText>
  );
};

const RevisionedEditableText = ({
  editor,
  nodeKey,
  ...props
}: Parameters<typeof RenderEditableText>[0] & {
  editor: ReturnType<typeof useEditorContext>;
}) => {
  const selectDecoratedText = useCallback(
    ({ text }: EditorTextSelectorContext) => {
      const renderRevision = nodeKey
        ? getDOMTextRenderRevision(editor, [nodeKey])
        : 0;

      return {
        renderRevision,
        resolvedMarks: text ? getTextMarks(text) : props.resolvedMarks,
        resolvedText: text?.text ?? props.resolvedText,
      };
    },
    [editor, nodeKey, props.resolvedMarks, props.resolvedText]
  );
  const decoratedText = useMountedTextRenderSelector(
    selectDecoratedText,
    (left, right) =>
      left != null &&
      left.renderRevision === right.renderRevision &&
      left.resolvedText === right.resolvedText &&
      sameMarks(left.resolvedMarks, right.resolvedMarks),
    { nodeKey }
  );
  const { text: currentText } = readTextByKey(editor, nodeKey ?? null);
  const resolvedMarks = currentText
    ? getTextMarks(currentText)
    : decoratedText.resolvedMarks;
  const resolvedText = currentText?.text ?? decoratedText.resolvedText;
  return (
    <RenderEditableText
      {...props}
      nodeKey={nodeKey}
      renderRevision={decoratedText.renderRevision}
      resolvedMarks={resolvedMarks}
      resolvedText={resolvedText}
    />
  );
};

const BoundEditableText = ({
  marks,
  path,
  ref,
  nodeKey = null,
  text,
  ...props
}: {
  isLast?: boolean;
  marks?: Omit<PliteTextNode, 'text'>;
  nodeKey?: NodeKey | null;
  path?: Path;
  placeholder?: ReactNode;
  placeholderAs?: PlaceholderIntrinsicTag;
  placeholderDir?: 'rtl';
  placeholderRef?: React.RefCallback<HTMLElement>;
  placeholderStyle?: CSSProperties;
  pliteNode?: PliteTextNode | null;
  ref?: Ref<HTMLSpanElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  text?: string;
  zeroWidth?: ZeroWidthOptions;
}) => {
  const editor = useEditorContext();
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
        renderRevision: resolvedNodeKey
          ? getDOMTextRenderRevision(editor, [resolvedNodeKey])
          : 0,
        text: text ?? node?.text ?? '',
      };
    },
    [editor, marks, path, nodeKey, text]
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
  const decorations = usePliteDecorationEntries(resolvedNodeKey);

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
      decorations={decorations}
      ref={combinedRef}
      resolvedMarks={boundText.marks}
      resolvedText={boundText.text}
      renderRevision={boundText.renderRevision}
      nodeKey={resolvedNodeKey}
    />
  );
};

const DecoratedEditableText = ({
  marks = EMPTY_MARKS,
  path,
  ref,
  nodeKey = null,
  pliteNode = null,
  text = '',
  ...props
}: {
  isLast?: boolean;
  marks?: Omit<PliteTextNode, 'text'>;
  nodeKey?: NodeKey | null;
  path?: Path;
  placeholder?: ReactNode;
  placeholderAs?: PlaceholderIntrinsicTag;
  placeholderDir?: 'rtl';
  placeholderRef?: React.RefCallback<HTMLElement>;
  placeholderStyle?: CSSProperties;
  pliteNode?: PliteTextNode | null;
  ref?: Ref<HTMLSpanElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  text?: string;
  zeroWidth?: ZeroWidthOptions;
}) => {
  const editor = useEditorContext();
  const boundRef = usePliteNodeRef(nodeKey, { path, pliteNode });
  const decorations = usePliteDecorationEntries(nodeKey);
  const { text: currentText } = readTextByKey(editor, nodeKey);
  const resolvedMarks = currentText ? getTextMarks(currentText) : marks;
  const resolvedText = currentText?.text ?? text;

  const combinedRef = useCallback(
    (node: HTMLSpanElement | null) => {
      boundRef(node);
      assignRef(ref, node);
    },
    [boundRef, ref]
  );

  const renderProps = {
    ...props,
    path,
    decorations,
    ref: combinedRef,
    resolvedMarks,
    resolvedText,
    nodeKey,
  } satisfies Parameters<typeof RenderEditableText>[0];
  return <RevisionedEditableText {...renderProps} editor={editor} />;
};

const EditableTextInner = ({
  path,
  ref,
  nodeKey,
  ...props
}: {
  isLast?: boolean;
  marks?: Omit<PliteTextNode, 'text'>;
  nodeKey?: NodeKey | null;
  path?: Path;
  placeholder?: ReactNode;
  placeholderAs?: PlaceholderIntrinsicTag;
  placeholderDir?: 'rtl';
  placeholderRef?: React.RefCallback<HTMLElement>;
  placeholderStyle?: CSSProperties;
  pliteNode?: PliteTextNode | null;
  ref?: Ref<HTMLSpanElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderText?: (props: RenderTextProps) => ReactNode;
  text?: string;
  zeroWidth?: ZeroWidthOptions;
}) => {
  if (nodeKey && props.text !== undefined && props.marks !== undefined) {
    return (
      <DecoratedEditableText
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
    return <DecoratedEditableText {...props} ref={ref} nodeKey={nodeKey} />;
  }

  return (
    <RenderEditableText
      {...props}
      decorations={[]}
      ref={ref}
      resolvedMarks={props.marks ?? {}}
      resolvedText={props.text ?? ''}
    />
  );
};

const sameEditableTextProps = (
  left: Parameters<typeof EditableTextInner>[0],
  right: Parameters<typeof EditableTextInner>[0]
) =>
  left.isLast === right.isLast &&
  left.placeholder === right.placeholder &&
  left.placeholderAs === right.placeholderAs &&
  left.placeholderDir === right.placeholderDir &&
  left.placeholderRef === right.placeholderRef &&
  left.placeholderStyle === right.placeholderStyle &&
  left.ref === right.ref &&
  left.renderLeaf === right.renderLeaf &&
  left.renderPlaceholder === right.renderPlaceholder &&
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

export const EditableText = React.memo(
  EditableTextInner,
  sameEditableTextProps
) as typeof EditableTextInner;
