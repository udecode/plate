import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Location,
  MaximizeMode,
} from '@platejs/plite';
import { PathApi, RangeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type UnwrapLinkOptions = {
  at?: Location;
  mode?: MaximizeMode;
  split?: boolean;
  voids?: boolean;
};

/** Unwrap link nodes. */
export const unwrapLink = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  options?: UnwrapLinkOptions
) =>
  tx.withoutNormalizing(({ tx }) => {
    const selection = tx.selection();

    if (options?.split && selection) {
      const [start, end] = RangeApi.edges(selection);
      const linkAboveStart = tx.nodes.above({
        at: start,
        match: { type: editor.getType(KEYS.link) },
      });
      const linkAboveEnd = tx.nodes.above({
        at: end,
        match: { type: editor.getType(KEYS.link) },
      });

      if (
        linkAboveStart &&
        linkAboveEnd &&
        PathApi.equals(linkAboveStart[1], linkAboveEnd[1])
      ) {
        const linkPath = linkAboveStart[1];
        let selectedPath = linkPath;

        if (!tx.points.isEnd(end, linkPath)) {
          tx.nodes.split({
            at: end,
            match: { type: editor.getType(KEYS.link) },
          });
        }
        if (!tx.points.isStart(start, linkPath)) {
          tx.nodes.split({
            at: start,
            match: { type: editor.getType(KEYS.link) },
          });
          selectedPath = PathApi.next(linkPath);
        }

        tx.nodes.unwrap({
          at: selectedPath,
          match: { type: editor.getType(KEYS.link) },
        });

        return true;
      }

      const point = linkAboveStart ? start : linkAboveEnd ? end : undefined;
      const link = linkAboveStart ?? linkAboveEnd;

      if (point && link) {
        tx.nodes.split({
          at: point,
          match: { type: editor.getType(KEYS.link) },
        });
        tx.nodes.unwrap({
          at: PathApi.next(link[1]),
          match: { type: editor.getType(KEYS.link) },
        });

        return true;
      }
    }

    tx.nodes.unwrap({
      match: { type: editor.getType(KEYS.link) },
      ...options,
    });
  });
