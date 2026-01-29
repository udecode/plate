import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { TrackInsertMarkName, TrackDeleteMarkName, TrackFormatMarkName } from '../constants.js';
import { getTrackChanges } from '../trackChangesHelpers/getTrackChanges.js';

export const TrackChangesBasePluginKey = new PluginKey('TrackChangesBase');

export const TrackChangesBasePlugin = () => {
  return new Plugin({
    key: TrackChangesBasePluginKey,

    state: {
      init(_, state) {
        const decorations = getTrackChangesDecorations(state, false, false);
        return {
          isTrackChangesActive: false,
          onlyOriginalShown: false,
          onlyModifiedShown: false,
          decorations,
        };
      },

      apply(tr, oldState, prevEditorState, newEditorState) {
        const meta = tr.getMeta(TrackChangesBasePluginKey);

        if (!meta) {
          return {
            ...oldState,
            decorations: getTrackChangesDecorations(
              newEditorState,
              oldState.onlyOriginalShown,
              oldState.onlyModifiedShown,
            ),
          };
        }

        if (meta.type === 'TRACK_CHANGES_ENABLE') {
          return {
            ...oldState,
            isTrackChangesActive: meta.value === true,
            decorations: getTrackChangesDecorations(
              newEditorState,
              oldState.onlyOriginalShown,
              oldState.onlyModifiedShown,
            ),
          };
        }

        if (meta.type === 'SHOW_ONLY_ORIGINAL') {
          return {
            ...oldState,
            onlyOriginalShown: meta.value === true,
            onlyModifiedShown: false,
            decorations: getTrackChangesDecorations(newEditorState, meta.value === true, false),
          };
        }

        if (meta.type === 'SHOW_ONLY_MODIFIED') {
          return {
            ...oldState,
            onlyOriginalShown: false,
            onlyModifiedShown: meta.value === true,
            decorations: getTrackChangesDecorations(newEditorState, false, meta.value === true),
          };
        }

        return {
          ...oldState,
          decorations: getTrackChangesDecorations(
            newEditorState,
            oldState.onlyOriginalShown,
            oldState.onlyModifiedShown,
          ),
        };
      },
    },

    props: {
      decorations(state) {
        return this.getState(state)?.decorations;
      },
    },
  });
};

const getTrackChangesDecorations = (state, onlyOriginalShown, onlyModifiedShown) => {
  if (!state.doc || !state.doc.nodeSize || (onlyModifiedShown && onlyOriginalShown)) {
    return DecorationSet.empty;
  }

  const decorations = [];
  const trackedChanges = getTrackChanges(state);

  if (!trackedChanges.length) {
    return DecorationSet.empty;
  }

  trackedChanges.forEach(({ mark, from, to }) => {
    if (mark.type.name === TrackInsertMarkName) {
      if (onlyOriginalShown) {
        const decoration = Decoration.inline(from, to, {
          class: 'track-insert-dec hidden',
        });
        decorations.push(decoration);
      } else if (onlyModifiedShown) {
        const decoration = Decoration.inline(from, to, {
          class: 'track-insert-dec normal',
        });
        decorations.push(decoration);
      } else {
        const decoration = Decoration.inline(from, to, {
          class: 'track-insert-dec highlighted',
        });
        decorations.push(decoration);
      }
    }

    if (mark.type.name === TrackDeleteMarkName) {
      if (onlyOriginalShown) {
        const decoration = Decoration.inline(from, to, {
          class: 'track-delete-dec normal',
        });
        decorations.push(decoration);
      } else if (onlyModifiedShown) {
        const decoration = Decoration.inline(from, to, {
          class: 'track-delete-dec hidden',
        });
        decorations.push(decoration);
      } else {
        const decorationInline = Decoration.inline(from, to, {
          class: 'track-delete-dec highlighted', // 'hidden'
        });
        decorations.push(decorationInline);

        // Workaround for Chrome to handle text deletion correctly.
        // Maybe this won't be needed later.
        const decorationWidget = Decoration.widget(
          from,
          () => {
            const span = document.createElement('span');
            span.classList.add('track-delete-widget');
            span.contentEditable = false;
            return span;
          },
          { ignoreSelection: true },
        );
        decorations.push(decorationWidget);
      }
    }

    if (mark.type.name === TrackFormatMarkName) {
      if (onlyOriginalShown) {
        // For this we should render the before array as marks.
        // No solid idea for this yet.
        const decoration = Decoration.inline(from, to, {
          class: 'track-format-dec before',
        });
        decorations.push(decoration);
      } else if (onlyModifiedShown) {
        // For this we should render nothing.
        // We already have the applied marks on the text.
        const decoration = Decoration.inline(from, to, {
          class: 'track-format-dec normal',
        });
        decorations.push(decoration);
      } else {
        const decoration = Decoration.inline(from, to, {
          class: 'track-format-dec highlighted',
        });
        decorations.push(decoration);
      }
    }
  });

  return DecorationSet.create(state.doc, decorations);
};
