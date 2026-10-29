import React, {
  type CSSProperties,
  type ReactNode,
  type Ref,
  createContext,
} from 'react';

import type { Path, Text as TextNode } from '../..';
import {
  getDecorationSliceIdentity,
  type DecorationSlice,
} from '../decoration-source';
import { useEditorComposing } from '../hooks/use-editor-composing';
import type {
  RenderLeafProps,
  RenderPlaceholderProps,
  RenderTextProps,
} from './editable-text';
import type { EditableTextPart } from './editable-text-containers';
import { EditorLeaf } from './plite-leaf';
import {
  getPlitePlaceholderStyle,
  type PlaceholderIntrinsicTag,
  EditorPlaceholder,
} from './plite-placeholder';
import { DecoratedTextString, TextString } from './text-string';
import { ZeroWidthString } from './zero-width-string';

export const TextRenderScopeContext = createContext<'flat' | 'paged' | 'piece'>(
  'flat'
);

const TEXT_PIECE_ATTRIBUTES = Object.freeze({
  'data-editor-text-piece': true as const,
});

const PLACEHOLDER_ANCHOR_STYLE: CSSProperties = {
  display: 'inline-block',
  maxWidth: '100%',
  position: 'relative',
  verticalAlign: 'top',
  width: '100%',
};

export type ZeroWidthOptions = {
  includeSentinel?: boolean;
  isLineBreak?: boolean;
  isMarkPlaceholder?: boolean;
  length?: number;
};

type EmptyTextOptions = {
  placeholder?: ReactNode;
  placeholderAs?: PlaceholderIntrinsicTag;
  placeholderDir?: 'rtl';
  placeholderRef?: React.RefCallback<HTMLElement>;
  placeholderStyle?: CSSProperties;
  zeroWidth?: ZeroWidthOptions;
};

type TextLeaf = {
  isTrailing: boolean;
  leafPosition?: RenderLeafProps['leafPosition'];
  segment: EditableTextPart;
};

export const sameMarks = (
  left: Omit<TextNode, 'text'>,
  right: Omit<TextNode, 'text'>
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

export const samePath = (left: Path | null, right: Path | null) =>
  left === right ||
  (left != null &&
    right != null &&
    left.length === right.length &&
    left.every((part, index) => part === right[index]));

export const sameZeroWidth = (
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

export const RenderCallback = <TProps,>({
  props,
  render,
}: {
  props: TProps;
  render: (props: TProps) => ReactNode;
}) => render(props);

const PlaceholderHiddenWhileComposing = ({
  as,
  children,
  dir,
  ref,
  renderPlaceholder,
  style,
}: {
  as?: PlaceholderIntrinsicTag;
  children: ReactNode;
  dir?: 'rtl';
  ref?: React.RefCallback<HTMLElement>;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  style?: CSSProperties;
}) => {
  const composing = useEditorComposing();
  const shownStyle = composing
    ? { ...style, visibility: 'hidden' as const }
    : style;

  if (!renderPlaceholder) {
    return (
      <EditorPlaceholder as={as} dir={dir} ref={ref} style={shownStyle}>
        {children}
      </EditorPlaceholder>
    );
  }

  const attributes = {
    'aria-hidden': true as const,
    'data-editor-placeholder': true as const,
    contentEditable: false as const,
    dir,
    ref: ref ?? (() => {}),
    style: getPlitePlaceholderStyle(shownStyle),
  };

  return (
    <RenderCallback
      props={{ attributes, children }}
      render={renderPlaceholder}
    />
  );
};

const getLeafAttributes = (leafPosition?: RenderLeafProps['leafPosition']) => ({
  'data-editor-leaf': true as const,
  'data-editor-leaf-end': leafPosition?.end,
  'data-editor-leaf-start': leafPosition?.start,
});

export const toTextLeaves = (
  segments: readonly EditableTextPart[],
  isLast: boolean
): TextLeaf[] =>
  segments.map((segment, index) => ({
    isTrailing:
      isLast && index === segments.length - 1 && segment.text.endsWith('\n'),
    leafPosition:
      segments.length > 1
        ? {
            end: segment.end,
            isFirst: index === 0 ? (true as const) : undefined,
            isLast: index === segments.length - 1 ? (true as const) : undefined,
            start: segment.start,
          }
        : undefined,
    segment,
  }));

export const groupTextPieces = (
  leaves: readonly TextLeaf[],
  containers: ReadonlyArray<DecorationSlice | null>,
  textContainer: DecorationSlice | null
) => {
  if (leaves.length === 0) return [{ container: textContainer, leaves }];

  const pieces: Array<{
    container: DecorationSlice | null;
    leaves: TextLeaf[];
  }> = [];

  leaves.forEach((leaf, index) => {
    const container = containers[index] ?? null;
    const current = pieces.at(-1);

    if (current && current.container === container) {
      current.leaves.push(leaf);
    } else {
      pieces.push({ container, leaves: [leaf] });
    }
  });

  return pieces;
};

export const renderTextLeaf = ({
  leaf: { isTrailing, leafPosition, segment },
  path,
  readRef,
  renderLeaf,
  text,
}: {
  leaf: TextLeaf;
  path?: Path;
  readRef?: Ref<HTMLSpanElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  text: Omit<TextNode, 'text'>;
}) => {
  const innermostDecoration = segment.decorations.at(-1);
  let content: ReactNode =
    segment.text.length === 0 ? (
      <ZeroWidthString isMarkPlaceholder />
    ) : innermostDecoration ? (
      <DecoratedTextString
        attributes={innermostDecoration.attributes}
        isTrailing={isTrailing}
        ref={readRef}
        text={segment.text}
      />
    ) : (
      <TextString isTrailing={isTrailing} ref={readRef} text={segment.text} />
    );
  const wrapperCount =
    segment.decorations.length - (innermostDecoration ? 1 : 0);

  for (let index = wrapperCount - 1; index >= 0; index--) {
    const decoration = segment.decorations[index];

    content = (
      <span
        key={getDecorationSliceIdentity(decoration)}
        {...decoration.attributes}
      >
        {content}
      </span>
    );
  }
  const attributes = getLeafAttributes(leafPosition);

  return renderLeaf ? (
    <RenderCallback
      props={{
        attributes,
        children: content,
        leaf: segment.marks,
        leafPosition,
        path,
        text,
      }}
      render={renderLeaf}
    />
  ) : (
    <EditorLeaf attributes={attributes}>{content}</EditorLeaf>
  );
};

export const renderEmptyTextLeaf = ({
  empty,
  path,
  renderLeaf,
  renderPlaceholder,
  text,
}: {
  empty: EmptyTextOptions;
  path?: Path;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  text: Omit<TextNode, 'text'>;
}) => {
  const placeholderNode = empty.placeholder ? (
    <PlaceholderHiddenWhileComposing
      as={empty.placeholderAs}
      dir={empty.placeholderDir}
      ref={empty.placeholderRef}
      renderPlaceholder={renderPlaceholder}
      style={empty.placeholderStyle}
    >
      {empty.placeholder}
    </PlaceholderHiddenWhileComposing>
  ) : null;
  const zeroWidthString = (
    <ZeroWidthString
      includeSentinel={empty.zeroWidth?.includeSentinel}
      isLineBreak={empty.zeroWidth?.isLineBreak}
      isMarkPlaceholder={empty.zeroWidth?.isMarkPlaceholder}
      length={empty.zeroWidth?.length}
    />
  );
  const content = placeholderNode ? (
    <span
      data-editor-placeholder-anchor="true"
      style={PLACEHOLDER_ANCHOR_STYLE}
    >
      {zeroWidthString}
      {placeholderNode}
    </span>
  ) : (
    zeroWidthString
  );

  return renderLeaf ? (
    <RenderCallback
      key="empty"
      props={{
        attributes: getLeafAttributes(),
        children: content,
        leaf: text,
        path,
        text,
      }}
      render={renderLeaf}
    />
  ) : (
    <EditorLeaf key="empty">{content}</EditorLeaf>
  );
};

type TextPieceProps = {
  empty: EmptyTextOptions;
  index: number;
  leaves: readonly TextLeaf[];
  marks: Omit<TextNode, 'text'>;
  path?: Path;
  readRef?: Ref<HTMLSpanElement>;
  renderLeaf?: (props: RenderLeafProps) => ReactNode;
  renderPlaceholder?: (props: RenderPlaceholderProps) => ReactNode;
  renderRevision: number | string;
  renderText?: (props: RenderTextProps) => ReactNode;
  text: string;
};

const sameDecorations = (
  left: readonly DecorationSlice[],
  right: readonly DecorationSlice[]
) =>
  left.length === right.length &&
  left.every((decoration, index) => {
    const other = right[index];

    return (
      decoration === other ||
      (getDecorationSliceIdentity(decoration) ===
        getDecorationSliceIdentity(other) &&
        decoration.attributes === other.attributes)
    );
  });

const sameLeaf = (left: TextLeaf, right: TextLeaf) =>
  left.isTrailing === right.isTrailing &&
  left.leafPosition?.start === right.leafPosition?.start &&
  left.leafPosition?.end === right.leafPosition?.end &&
  left.leafPosition?.isFirst === right.leafPosition?.isFirst &&
  left.leafPosition?.isLast === right.leafPosition?.isLast &&
  left.segment.text === right.segment.text &&
  sameMarks(left.segment.marks, right.segment.marks) &&
  sameDecorations(left.segment.decorations, right.segment.decorations);

const sameEmptyText = (left: EmptyTextOptions, right: EmptyTextOptions) =>
  left.placeholder === right.placeholder &&
  left.placeholderAs === right.placeholderAs &&
  left.placeholderDir === right.placeholderDir &&
  left.placeholderRef === right.placeholderRef &&
  left.placeholderStyle === right.placeholderStyle &&
  sameZeroWidth(left.zeroWidth, right.zeroWidth);

const sameTextPiece = (left: TextPieceProps, right: TextPieceProps) =>
  left.index === right.index &&
  left.text === right.text &&
  left.renderRevision === right.renderRevision &&
  left.readRef === right.readRef &&
  left.renderLeaf === right.renderLeaf &&
  left.renderPlaceholder === right.renderPlaceholder &&
  left.renderText === right.renderText &&
  sameMarks(left.marks, right.marks) &&
  samePath(left.path ?? null, right.path ?? null) &&
  left.leaves.length === right.leaves.length &&
  left.leaves.every((leaf, index) => sameLeaf(leaf, right.leaves[index])) &&
  (left.text.length > 0 || sameEmptyText(left.empty, right.empty));

const TextPieceInner = ({
  empty,
  index,
  leaves,
  marks,
  path,
  readRef,
  renderLeaf,
  renderPlaceholder,
  renderRevision,
  renderText,
  text,
}: TextPieceProps) => {
  const children =
    leaves.length === 0
      ? renderEmptyTextLeaf({
          empty,
          path,
          renderLeaf,
          renderPlaceholder,
          text: marks,
        })
      : leaves.map((leaf) => (
          <React.Fragment
            key={JSON.stringify([renderRevision, leaf.segment.identity])}
          >
            {renderTextLeaf({ leaf, path, readRef, renderLeaf, text: marks })}
          </React.Fragment>
        ));

  return (
    <TextRenderScopeContext value="piece">
      {renderText ? (
        <RenderCallback
          props={{
            attributes: TEXT_PIECE_ATTRIBUTES,
            children,
            piece: { index },
            text: { text, ...marks },
          }}
          render={renderText}
        />
      ) : (
        children
      )}
    </TextRenderScopeContext>
  );
};

export const TextPiece = React.memo(TextPieceInner, sameTextPiece);
