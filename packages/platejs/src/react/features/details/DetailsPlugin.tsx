import {
  BaseParagraphPlugin,
  editorCommands,
  ElementApi,
  NodeApi,
  PathApi,
  RangeApi,
} from '../../../core';
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
} from '../../../features/details/lib';
import { toPlatePlugin } from '../../core';

export const DetailsSummaryPlugin = toPlatePlugin(BaseDetailsSummaryPlugin);

/** Enables semantic Details editing and transient disclosure state. */
export const DetailsPlugin = toPlatePlugin(BaseDetailsPlugin, {
  dependencies: [DetailsSummaryPlugin, BaseParagraphPlugin],
}).extend(({ editor, plugin, store }) => ({
  commands: ({ around }) => [
    around(editorCommands.insertBreak, ({ state, next }) => {
      const selection = state.selection();

      if (!selection || !RangeApi.isCollapsed(selection)) return false;

      const summary = state.nodes.above({
        at: selection,
        type: DetailsSummaryPlugin,
      });
      const details = summary
        ? state.nodes.parent(summary[1], { type: plugin })
        : state.nodes.above({ at: selection, type: plugin });

      if (!details) return false;

      const detailsKey = state.key(details[0]);
      const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
      const exitAfterDetails = () =>
        state.transaction((tx) => {
          const nextPath = PathApi.next(details[1]);
          const nextBlock = tx.nodes.get(nextPath);
          const point = nextBlock ? tx.points.start(nextPath) : undefined;

          if (point) {
            tx.selection.set(point);

            return;
          }

          tx.nodes.insert(
            { children: [{ text: '' }], type: paragraphType },
            { at: nextPath, select: true }
          );
        });

      if (summary) {
        if (!store.get('isOpen', detailsKey)) return exitAfterDetails();

        if (state.points.isEnd(selection.anchor, summary[1])) {
          const firstBodyPoint = state.points.start(details[1].concat(1));

          if (!firstBodyPoint) return exitAfterDetails();

          return state.transaction((tx) => {
            tx.selection.set(firstBodyPoint);
          });
        }

        const result = next();

        if (result === false) return false;

        return state.transaction.extend(result, (tx) => {
          const firstBodyPath = details[1].concat(1);
          const firstBody = tx.nodes.get(firstBodyPath)?.[0];

          if (
            firstBody &&
            ElementApi.isElementType(
              firstBody,
              editor.plugin(BaseDetailsSummaryPlugin).schema.type
            )
          ) {
            tx.nodes.set({ type: paragraphType }, { at: firstBodyPath });
          }
        });
      }

      const block = state.nodes.block({ at: selection });
      const childIndex = block?.[1].at(-1);

      if (
        block &&
        childIndex === details[0].children.length - 1 &&
        childIndex > 0 &&
        NodeApi.string(block[0]) === '' &&
        state.points.isEnd(selection.anchor, block[1])
      ) {
        return exitAfterDetails();
      }

      return false;
    }),
    around(editorCommands.delete, ({ input, state }) => {
      const selection = state.selection();

      if (!selection || !RangeApi.isCollapsed(selection)) return false;

      const summary = state.nodes.above({
        at: selection,
        type: DetailsSummaryPlugin,
      });
      const details = summary
        ? state.nodes.parent(summary[1], { type: plugin })
        : state.nodes.above({ at: selection, type: plugin });

      if (!details) return false;

      if (
        input.direction === 'backward' &&
        summary &&
        state.points.isStart(selection.anchor, summary[1])
      ) {
        return state.transaction((tx) => {
          tx.plugin(DetailsPlugin).unwrap({ at: details[1] });
        });
      }

      const block = state.nodes.block({ at: selection });

      if (
        input.direction === 'backward' &&
        block &&
        PathApi.equals(block[1], details[1].concat(1)) &&
        state.points.isStart(selection.anchor, block[1])
      ) {
        const point = state.points.end(details[1].concat(0));

        if (!point) return false;

        return state.transaction((tx) => {
          tx.selection.set(point);
        });
      }

      if (
        input.direction === 'forward' &&
        summary &&
        !store.get('isOpen', state.key(details[0])) &&
        state.points.isEnd(selection.anchor, summary[1])
      ) {
        const next = state.nodes.next({ at: details[1], from: 'after' });
        const point = next ? state.points.start(next[1]) : undefined;

        return state.transaction((tx) => {
          tx.selection.set(point ?? selection);
        });
      }

      return false;
    }),
  ],
}));
