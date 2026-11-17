import { useEditor, useEditorSelector } from '../../core';
import { inkOutline } from './inkPaint.internal';
import { InkPlugin } from './InkPlugin';

const sameIds = (a: readonly string[] | null, b: readonly string[]) =>
  a !== null && a.length === b.length && a.every((id, at) => id === b[at]);

/**
 * The words the marks `marks` names were drawn on, as plain text laid out by
 * their saved lines, with each mark's ink over them. A mark no longer saved
 * shows nothing.
 */
export function InkCopyView({ marks }: { marks: readonly string[] }) {
  const editor = useEditor();
  const saved = useEditorSelector(
    () => marks.filter((id) => editor.plugin(InkPlugin).read.mark(id)),
    { equalityFn: sameIds }
  );
  const { read } = editor.plugin(InkPlugin);
  const shown = saved.flatMap((id) => {
    const mark = read.mark(id);
    const copies = mark?.blocks.flatMap((block) => read.copy(block.copy) ?? []);

    return mark && copies?.length === mark.blocks.length
      ? [{ copies, mark }]
      : [];
  });

  return (
    <div data-ink-copy-view="">
      {shown.map(({ copies, mark }) => {
        const left = Math.min(...mark.blocks.map((block) => block.left));
        const top = Math.min(...mark.blocks.map((block) => block.top));
        const width =
          Math.max(
            ...mark.blocks.map((block, at) => block.left + copies[at].width)
          ) - left;
        const height =
          Math.max(
            ...mark.blocks.map((block, at) => block.top + copies[at].height)
          ) - top;

        return (
          <div
            data-ink-copy={mark.id}
            key={mark.id}
            style={{ height, position: 'relative', width }}
          >
            {mark.blocks.map((block, at) => {
              const copy = copies[at];

              return copy.lines.map((line, index) => (
                <span
                  key={`${copy.id}:${index}`}
                  style={{
                    height: line.height,
                    left: block.left - left + line.left,
                    lineHeight: `${line.height}px`,
                    position: 'absolute',
                    top: block.top - top + line.top,
                    whiteSpace: 'pre',
                  }}
                >
                  {copy.text.slice(
                    index === 0 ? 0 : copy.lines[index - 1].end,
                    line.end
                  )}
                </span>
              ));
            })}
            <svg
              aria-hidden
              height={height}
              style={{
                left: 0,
                overflow: 'visible',
                position: 'absolute',
                top: 0,
              }}
              width={width}
            >
              <path
                d={inkOutline(mark.samples, mark.brush, {
                  dx: -left,
                  dy: -top,
                })}
                fill={mark.brush.color}
                opacity={mark.brush.opacity}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
