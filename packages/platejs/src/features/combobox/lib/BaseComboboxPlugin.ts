import {
  defineBasePlugin,
  ElementApi,
  type PlatePluginTransaction,
  type NodeKey,
  type Point,
  PLUGINS,
} from '../../../core';

/** Completes transient inline inputs at their current document location. */
export const BaseComboboxPlugin = defineBasePlugin(PLUGINS.combobox, {
  read: ({ editor, state }) => ({
    /** Whether this editor may finish the live input supplied by its renderer. */
    canEdit: (input: NodeKey) => {
      const node = state.nodes.get(input)?.[0];

      return (
        !!node &&
        ElementApi.isElement(node) &&
        state.schema.isInline(node) &&
        state.schema.isVoid(node) &&
        !state.nodes.elementReadOnly({ at: input }) &&
        !editor.read.view.isReadOnly() &&
        (!node.userId || node.userId === editor.runtime.userId)
      );
    },
  }),
}).extend(({ editor, plugin }) => ({
  api: () => {
    const finish = (
      input: NodeKey,
      callback: (tx: PlatePluginTransaction, point: Point) => void
    ) => {
      if (!editor.plugin(plugin).read.canEdit(input)) return false;

      let completed = false;

      editor.update({ history: 'new-batch' }, (tx) => {
        const point = tx.points.before(input);

        if (!point) return;

        const anchor = tx.anchor(point, {
          association: 'backward',
          deletion: 'drop',
        });

        tx.nodes.remove({ at: input });

        const at = anchor.resolve();

        if (!at) return;

        callback(tx, at);
        completed = true;
      });

      return completed;
    };

    return {
      /**
       * Remove the input and restore literal text in one history entry.
       * Omit text for Backspace. Omit select to preserve an outside selection.
       * Returns false for a missing or foreign input without changing content.
       */
      cancel: (
        input: NodeKey,
        { text = '', select }: { text?: string; select?: 'start' | 'end' } = {}
      ) =>
        finish(input, (tx, at) => {
          if (text) tx.text.insert(text, { at });
          if (select) {
            tx.selection.set({
              ...at,
              offset: at.offset + (select === 'end' ? text.length : 0),
            });
          }
        }),
      /**
       * Replace the input through one synchronous transaction callback.
       * The callback starts at the input's current insertion point. Throwing
       * rolls back both removal and insertion. Returns false for a stale input.
       */
      commit: (
        input: NodeKey,
        callback: (tx: PlatePluginTransaction) => void
      ) =>
        finish(input, (tx, at) => {
          tx.selection.set(at);
          callback(tx);
        }),
      /** Undo from an eligible input; return whether history was available. */
      undo: (input: NodeKey) => {
        if (
          !editor.plugin(plugin).read.canEdit(input) ||
          !editor.read.history.undos().length
        ) {
          return false;
        }

        editor.update.history.undo();

        return true;
      },
      /** Redo from an eligible input; return whether history was available. */
      redo: (input: NodeKey) => {
        if (
          !editor.plugin(plugin).read.canEdit(input) ||
          !editor.read.history.redos().length
        ) {
          return false;
        }

        editor.update.history.redo();

        return true;
      },
    };
  },
}));
