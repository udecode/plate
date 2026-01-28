import { Extension } from '@core/Extension.js';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const CustomSelectionPluginKey = new PluginKey('CustomSelection');

const handleClickOutside = (event, editor) => {
  const editorElem = editor?.options?.element;
  if (!editorElem) return;

  const isInsideEditor = editorElem?.contains(event.target);

  if (!isInsideEditor) {
    editor.setOptions({
      focusTarget: event.target,
    });
  } else {
    editor.setOptions({
      focusTarget: null,
    });
  }
};

function getFocusMeta(tr) {
  return tr.getMeta(CustomSelectionPluginKey);
}

function setFocusMeta(tr, value) {
  return tr.setMeta(CustomSelectionPluginKey, value);
}

function getFocusState(state) {
  return CustomSelectionPluginKey.getState(state);
}

const isToolbarInput = (target) => {
  return target?.closest('.button-text-input') || target?.classList?.contains('button-text-input');
};

const isToolbarButton = (target) => {
  return target?.closest('.toolbar-button') || target?.classList?.contains('toolbar-button');
};

export const CustomSelection = Extension.create({
  name: 'customSelection',
  addPmPlugins() {
    const editor = this.editor;
    const customSelectionPlugin = new Plugin({
      key: CustomSelectionPluginKey,
      state: {
        init: () => ({
          focused: false,
          preservedSelection: null,
          showVisualSelection: false,
        }),
        apply: (tr, value) => {
          const meta = getFocusMeta(tr);
          if (meta !== undefined) {
            return { ...value, ...meta };
          }
          return value;
        },
      },
      view: () => {
        document?.addEventListener('mousedown', (event) => handleClickOutside(event, editor));

        return {
          destroy: () => {
            document?.removeEventListener('mousedown', handleClickOutside);
          },
        };
      },
      props: {
        handleDOMEvents: {
          contextmenu: (view, event) => {
            // Prevent context menu from removing focus/selection
            event.preventDefault();
            const { selection } = view.state;
            if (!selection.empty) {
              view.dispatch(
                setFocusMeta(view.state.tr, {
                  focused: true,
                  preservedSelection: selection,
                  showVisualSelection: true,
                }),
              );
            }

            // Re-focus the editor to maintain selection visibility
            setTimeout(() => {
              view.focus();
            }, 0);

            return false;
          },

          mousedown: (view, event) => {
            // Handle right clicks - prevent focus loss
            if (event.button === 2) {
              event.preventDefault(); // Prevent default right-click behavior
              const { selection } = view.state;
              if (!selection.empty) {
                // Ensure selection stays visible for right-click/context menu
                view.dispatch(
                  setFocusMeta(view.state.tr, {
                    focused: true,
                    preservedSelection: selection,
                    showVisualSelection: true,
                  }),
                );

                // Store selection in editor options too
                this.editor.setOptions({
                  lastSelection: selection,
                  preservedSelection: selection,
                });
              }
              return false;
            }

            const { selection } = view.state;
            const target = event.target;
            const isToolbarBtn = isToolbarButton(target);
            const isToolbarInp = isToolbarInput(target);

            // Store focus target for other components
            this.editor.setOptions({
              focusTarget: target,
            });

            // Handle toolbar input clicks - preserve selection
            if (isToolbarInp && !selection.empty) {
              // Store the selection and show visual selection
              view.dispatch(
                setFocusMeta(view.state.tr, {
                  focused: true,
                  preservedSelection: selection,
                  showVisualSelection: true,
                }),
              );

              // Store in editor options as well for commands
              this.editor.setOptions({
                lastSelection: selection,
                preservedSelection: selection,
              });
              return false; // Don't prevent the input from getting focus
            }

            // Handle toolbar button clicks
            if (isToolbarBtn && !isToolbarInp) {
              if (!selection.empty) {
                this.editor.setOptions({
                  lastSelection: selection,
                });
                // Keep selection visible for toolbar buttons
                view.dispatch(
                  setFocusMeta(view.state.tr, {
                    focused: true,
                    preservedSelection: selection,
                    showVisualSelection: true,
                  }),
                );
              }
              return false;
            }

            // Handle clicks outside toolbar
            if (!isToolbarBtn && !isToolbarInp) {
              // Clear preserved selection and visual selection
              view.dispatch(
                setFocusMeta(view.state.tr, {
                  focused: false,
                  preservedSelection: null,
                  showVisualSelection: false,
                }),
              );

              // Clear selection if clicking outside editor
              if (!selection.empty && !this.editor.options.element?.contains(target)) {
                this.editor.setOptions({
                  lastSelection: selection,
                });
                const clearSelectionTr = view.state.tr.setSelection(TextSelection.create(view.state.doc, 0));
                view.dispatch(clearSelectionTr);
              }
            }
          },

          focus: (view) => {
            const target = this.editor.options.focusTarget;
            const isToolbarBtn = isToolbarButton(target);
            const isToolbarInp = isToolbarInput(target);

            // Don't change state if toolbar element caused the focus
            if (!isToolbarBtn && !isToolbarInp) {
              view.dispatch(
                setFocusMeta(view.state.tr, {
                  focused: false,
                  preservedSelection: null,
                  showVisualSelection: false,
                }),
              );
            }
          },

          blur: (view) => {
            const target = this.editor.options.focusTarget;
            const isToolbarBtn = isToolbarButton(target);
            const isToolbarInp = isToolbarInput(target);
            const state = getFocusState(view.state);

            if (isToolbarBtn || isToolbarInp) {
              // Maintain visual selection when toolbar elements are focused
              view.dispatch(
                setFocusMeta(view.state.tr, {
                  focused: true,
                  preservedSelection: state.preservedSelection || view.state.selection,
                  showVisualSelection: true,
                }),
              );
            } else {
              // Clear everything when focus goes elsewhere
              view.dispatch(
                setFocusMeta(view.state.tr, {
                  focused: false,
                  preservedSelection: null,
                  showVisualSelection: false,
                }),
              );
            }
          },
        },
        decorations: (state) => {
          const { selection, doc } = state;
          const focusState = getFocusState(state);

          // Show visual selection if we have a preserved selection or current selection with focus
          const shouldShowSelection =
            focusState.showVisualSelection &&
            (focusState.preservedSelection || (!selection.empty && focusState.focused));

          if (!shouldShowSelection) {
            return null;
          }

          // Use preserved selection if available, otherwise current selection
          const targetSelection = focusState.preservedSelection || selection;

          if (targetSelection.empty) {
            return null;
          }

          return DecorationSet.create(doc, [
            Decoration.inline(targetSelection.from, targetSelection.to, {
              class: 'sd-custom-selection',
            }),
          ]);
        },
      },
    });

    return [customSelectionPlugin];
  },

  addCommands() {
    return {
      restorePreservedSelection:
        () =>
        ({ tr, state }) => {
          const focusState = getFocusState(state);
          if (focusState.preservedSelection) {
            return tr.setSelection(focusState.preservedSelection);
          }

          const lastSelection = this.editor.options.lastSelection;
          if (lastSelection) {
            return tr.setSelection(lastSelection);
          }
          return tr;
        },
    };
  },
});
