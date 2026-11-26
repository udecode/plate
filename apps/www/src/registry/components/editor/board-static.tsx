import { cn } from 'cn';
import { type Element, ElementApi, NodeApi } from 'platejs';
import {
  BaseBoardArrowPlugin,
  BaseBoardFramePlugin,
  BaseBoardGeoPlugin,
  BaseBoardImagePlugin,
  BaseBoardNotePlugin,
  BaseBoardPlugin,
  BaseBoardStrokePlugin,
  type BoardMemberEntry,
} from 'platejs/board';
import { BaseImagePlugin, type ImageElement } from 'platejs/media';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

import { BaseBasicBlocksKit } from '@/registry/components/editor/basic-blocks-static';
import { BaseBasicMarksKit } from '@/registry/components/editor/basic-marks-static';
import {
  ARROW_HEAD,
  BOARD_COLORS,
  dashArray,
  geoOutline,
  paint,
  SHAPE_HEADINGS,
  STROKE_WIDTHS,
  TEXT_SIZES,
  tint,
} from '@/registry/components/editor/board-styles';
import { BaseLinkKit } from '@/registry/components/editor/link-static';
import { BaseListKit } from '@/registry/components/editor/list-static';
import { ImageElementStatic } from '@/registry/components/editor/media-image-static';
import { BaseMentionKit } from '@/registry/components/editor/mention-static';

type Box = Readonly<{ height: number; width: number; x: number; y: number }>;

const SHADOW_REACH = 8;

const idOf = (element: Element) =>
  typeof element.shapeId === 'string' ? element.shapeId : '';

const boxOf = (entry: BoardMemberEntry | null): Box | null =>
  entry && entry.kind !== 'arrow' ? { ...entry.place, ...entry.size } : null;

const placed = <
  TProps extends Readonly<{
    attributes: EditorElementProps<typeof BaseBoardPlugin>['attributes'];
    element: Element;
  }>,
>(
  props: TProps,
  box: Box
) => ({
  ...props,
  attributes: {
    ...props.attributes,
    'data-board-box': `${box.x} ${box.y} ${box.width} ${box.height}`,
    'data-board-picture': idOf(props.element),
  },
  style: {
    height: box.height,
    left: box.x,
    position: 'absolute',
    top: box.y,
    width: box.width,
  } as const,
});

export function BoardElementStatic(
  props: EditorElementProps<typeof BaseBoardPlugin>
) {
  return (
    <EditorElement
      {...props}
      className={cn('overflow-hidden', BOARD_COLORS)}
      style={{ height: props.element.height }}
    >
      {props.slots.contentRoot('shapes')}
      {props.children}
    </EditorElement>
  );
}

export function BoardNoteElementStatic(
  props: EditorElementProps<typeof BaseBoardNotePlugin>
) {
  const { editor, element } = props;
  const box = boxOf(editor.plugin(BaseBoardPlugin).read.shape(idOf(element)));

  if (!box) return <EditorElement {...props} />;

  const height = box.height + SHADOW_REACH * 2;
  const width = box.width + SHADOW_REACH * 2;

  return (
    <EditorElement {...placed(props, box)}>
      <svg
        height={height}
        overflow="visible"
        style={{
          left: -SHADOW_REACH,
          position: 'absolute',
          top: -SHADOW_REACH,
        }}
        width={width}
      >
        <foreignObject height={height} width={width}>
          <div
            className="relative rounded-sm p-3 leading-snug"
            style={{
              fontSize: TEXT_SIZES[element.textSize],
              height: box.height,
              margin: SHADOW_REACH,
              width: box.width,
            }}
          >
            <div
              className="absolute inset-0 rounded-sm shadow-md"
              style={{
                backgroundColor:
                  element.fill === 'none'
                    ? 'var(--background)'
                    : tint(element.fill),
                opacity: element.opacity,
              }}
            />
            <div
              className={cn('relative', SHAPE_HEADINGS)}
              style={{ opacity: element.opacity }}
            >
              {props.children}
            </div>
          </div>
        </foreignObject>
      </svg>
    </EditorElement>
  );
}

export function BoardGeoElementStatic(
  props: EditorElementProps<typeof BaseBoardGeoPlugin>
) {
  const { editor, element } = props;
  const box = boxOf(editor.plugin(BaseBoardPlugin).read.shape(idOf(element)));

  if (!box) return <EditorElement {...props} />;

  const width = STROKE_WIDTHS[element.strokeWidth];

  return (
    <EditorElement {...placed(props, box)}>
      <svg
        height={box.height}
        overflow="visible"
        style={{ inset: 0, position: 'absolute' }}
        width={box.width}
      >
        <svg
          height="100%"
          opacity={element.opacity}
          overflow="visible"
          strokeDasharray={dashArray(element.dash, width)}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={width}
          style={{
            fill: element.fill === 'none' ? 'none' : tint(element.fill),
            stroke: paint(element.strokeColor),
          }}
          width="100%"
        >
          {geoOutline(element.geo, box)}
        </svg>
        <foreignObject height={box.height} width={box.width}>
          <div
            className="flex flex-col justify-center p-3 text-center leading-snug"
            style={{
              fontSize: TEXT_SIZES[element.textSize],
              height: box.height,
              opacity: element.opacity,
              width: box.width,
            }}
          >
            <div className={cn('relative', SHAPE_HEADINGS)}>
              {props.children}
            </div>
          </div>
        </foreignObject>
      </svg>
    </EditorElement>
  );
}

export function BoardFrameElementStatic(
  props: EditorElementProps<typeof BaseBoardFramePlugin>
) {
  const { editor, element } = props;
  const box = boxOf(editor.plugin(BaseBoardPlugin).read.shape(idOf(element)));

  if (!box) return <EditorElement {...props} />;

  return (
    <EditorElement {...placed(props, box)}>
      <svg
        height={box.height}
        overflow="visible"
        style={{ inset: 0, position: 'absolute' }}
        width={box.width}
      >
        <rect
          className="fill-none stroke-foreground/50"
          height={Math.max(0, box.height - 2)}
          rx={3}
          strokeWidth={2}
          width={Math.max(0, box.width - 2)}
          x={1}
          y={1}
        />
        <text
          className="fill-muted-foreground text-xs"
          dominantBaseline="text-after-edge"
          y={-4}
        >
          {element.name || 'Frame'}
        </text>
      </svg>
      {props.children}
    </EditorElement>
  );
}

export function BoardArrowElementStatic(
  props: EditorElementProps<typeof BaseBoardArrowPlugin>
) {
  const { editor, element } = props;
  const ends = editor.plugin(BaseBoardPlugin).read.arrowEnds(idOf(element));

  if (!ends) return <EditorElement {...props} />;

  const box = {
    height: Math.abs(ends.end.y - ends.start.y),
    width: Math.abs(ends.end.x - ends.start.x),
    x: Math.min(ends.start.x, ends.end.x),
    y: Math.min(ends.start.y, ends.end.y),
  };
  const start = { x: ends.start.x - box.x, y: ends.start.y - box.y };
  const end = { x: ends.end.x - box.x, y: ends.end.y - box.y };
  const angle = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
  const width = STROKE_WIDTHS[element.strokeWidth];

  return (
    <EditorElement {...placed(props, box)} className="text-foreground">
      {/* Firefox draws nothing in an svg viewport with a zero width or
          height, so the arrow draws past a 1 by 1 viewport. */}
      <svg
        height={1}
        overflow="visible"
        style={{ left: 0, position: 'absolute', top: 0 }}
        width={1}
      >
        <g
          opacity={element.opacity}
          style={{ color: paint(element.strokeColor) }}
        >
          <path
            d={`M${start.x} ${start.y}L${end.x} ${end.y}`}
            fill="none"
            stroke="currentColor"
            strokeDasharray={dashArray(element.dash, width)}
            strokeLinecap="round"
            strokeWidth={width}
          />
          <g transform={`translate(${end.x} ${end.y}) rotate(${angle})`}>
            <polygon fill="currentColor" points={ARROW_HEAD} />
          </g>
        </g>
      </svg>
      {NodeApi.string(element) !== '' && (
        <div
          className="absolute min-w-4 -translate-1/2 rounded-sm bg-background px-1 text-center leading-snug whitespace-nowrap"
          data-board-arrow-label=""
          style={{
            fontSize: TEXT_SIZES[element.textSize],
            left: (start.x + end.x) / 2,
            opacity: element.opacity,
            top: (start.y + end.y) / 2,
          }}
        >
          {props.children}
        </div>
      )}
    </EditorElement>
  );
}

export function BoardStrokeElementStatic(
  props: EditorElementProps<typeof BaseBoardStrokePlugin>
) {
  const { editor, element } = props;
  const board = editor.plugin(BaseBoardPlugin);
  const id = idOf(element);
  const box = boxOf(board.read.shape(id));
  const drawn = board.read.strokePath(id);

  if (!box || !drawn) return <EditorElement {...props} />;

  return (
    <EditorElement {...placed(props, box)} className="text-foreground">
      <svg
        height={box.height}
        opacity={element.opacity}
        overflow="visible"
        preserveAspectRatio="none"
        style={{
          color: paint(element.strokeColor),
          inset: 0,
          position: 'absolute',
        }}
        viewBox={`0 0 ${drawn.width} ${drawn.height}`}
        width={box.width}
      >
        <path d={drawn.path} fill="currentColor" />
      </svg>
      {props.children}
    </EditorElement>
  );
}

export function BoardImageElementStatic(
  props: EditorElementProps<typeof BaseBoardImagePlugin>
) {
  const { editor, element } = props;
  const box = boxOf(editor.plugin(BaseBoardPlugin).read.shape(idOf(element)));
  const image = editor.plugin(BaseImagePlugin);
  const [child] = element.children;
  const uploaded =
    image.installed &&
    ElementApi.isElement(child) &&
    child.type === image.schema.type
      ? (child as ImageElement)
      : undefined;

  if (!box) return <EditorElement {...props} />;

  return (
    <EditorElement {...placed(props, box)}>
      <svg
        height={box.height}
        style={{ inset: 0, position: 'absolute' }}
        width={box.width}
      >
        {uploaded?.url ? (
          <image
            aria-label={uploaded.alt}
            height={box.height}
            href={uploaded.url}
            preserveAspectRatio="xMidYMid meet"
            width={box.width}
          />
        ) : (
          <rect
            className="fill-muted"
            data-board-image-unreadable=""
            height={box.height}
            width={box.width}
          />
        )}
      </svg>
    </EditorElement>
  );
}

export const BoardStaticKit = [
  BaseBoardPlugin.configure({ component: BoardElementStatic }),
  BaseBoardNotePlugin.configure({ component: BoardNoteElementStatic }),
  BaseBoardGeoPlugin.configure({ component: BoardGeoElementStatic }),
  BaseBoardArrowPlugin.configure({ component: BoardArrowElementStatic }),
  BaseBoardFramePlugin.configure({ component: BoardFrameElementStatic }),
  BaseBoardStrokePlugin.configure({ component: BoardStrokeElementStatic }),
];

export const BoardImageStaticKit = [
  BaseBoardImagePlugin.configure({ component: BoardImageElementStatic }),
];

/** The presentation that draws a board as a picture, with what its notes hold. */
export const BoardPictureKit = [
  ...BoardStaticKit,
  ...BoardImageStaticKit,
  BaseImagePlugin.configure({ component: ImageElementStatic }),
  ...BaseBasicBlocksKit,
  ...BaseBasicMarksKit,
  ...BaseLinkKit,
  ...BaseListKit,
  ...BaseMentionKit,
];
