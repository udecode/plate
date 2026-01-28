import { Plugin, PluginKey } from 'prosemirror-state';
import { Extension } from '@core/Extension.js';

/**
 * Calculates the cursor position relative to the editor container element
 * @param {EditorView} view - The ProseMirror editor view instance
 * @param {Object} eventLocation - Object containing clientX/clientY coordinates from an event
 * @param {number} [eventLocation.clientX] - The x coordinate relative to the viewport
 * @param {number} [eventLocation.clientY] - The y coordinate relative to the viewport
 * @returns {{left: number, top: number}} The cursor position relative to the container
 */
function getCursorPositionRelativeToContainer(view, eventLocation) {
  const { state, dom } = view;
  const { selection } = state;
  const containerRect = dom.getBoundingClientRect();
  let x, y;
  if (typeof eventLocation.clientX === 'number' && typeof eventLocation.clientY === 'number') {
    // Use the provided mouse coordinates
    x = eventLocation.clientX - containerRect.left;
    y = eventLocation.clientY - containerRect.top;
  } else {
    // Fallback to the cursor/selection start in the viewport
    const cursorCoords = view.coordsAtPos(selection.from);
    x = cursorCoords.left - containerRect.left;
    y = cursorCoords.top - containerRect.top;
  }
  return { left: x, top: y };
}

export const SlashMenuPluginKey = new PluginKey('slashMenu');

export const SlashMenu = Extension.create({
  name: 'slashMenu',

  addPmPlugins() {
    if (this.editor.options?.disableContextMenu) {
      return [];
    }
    const editor = this.editor;

    // Cooldown flag and timeout for slash menu
    let slashCooldown = false;
    let slashCooldownTimeout = null;

    const slashMenuPlugin = new Plugin({
      key: SlashMenuPluginKey,

      state: {
        init() {
          return {
            open: false,
            selected: null,
            anchorPos: null,
            menuPosition: null,
          };
        },

        apply(tr, value) {
          const meta = tr.getMeta(SlashMenuPluginKey);
          if (!meta) return value;

          switch (meta.type) {
            case 'open': {
              const pos = getCursorPositionRelativeToContainer(editor.view, meta);
              const menuPosition = {
                left: `${pos.left + 100}px`,
                top: `${pos.top + 28}px`,
              };

              // Update state
              const newState = {
                ...value,
                open: true,
                anchorPos: meta.pos,
                menuPosition,
              };

              // Emit event after state update
              editor.emit('slashMenu:open', { menuPosition });

              return newState;
            }

            case 'select': {
              return { ...value, selected: meta.id };
            }

            case 'close': {
              editor.emit('slashMenu:close');
              return { ...value, open: false, anchorPos: null };
            }

            default:
              return value;
          }
        },
      },

      view(editorView) {
        const updatePosition = () => {
          const state = SlashMenuPluginKey.getState(editorView.state);
          if (state.open) {
            editorView.dispatch(
              editorView.state.tr.setMeta(SlashMenuPluginKey, {
                type: 'updatePosition',
              }),
            );
          }
        };

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return {
          destroy() {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
            // Clear cooldown timeout if exists
            if (slashCooldownTimeout) {
              clearTimeout(slashCooldownTimeout);
              slashCooldownTimeout = null;
            }
          },
        };
      },

      props: {
        handleKeyDown(view, event) {
          const pluginState = this.getState(view.state);

          // If cooldown is active and slash is pressed, allow default behavior
          if (event.key === '/' && slashCooldown) {
            return false; // Let browser handle it
          }

          if (event.key === '/' && !pluginState.open) {
            const { $cursor } = view.state.selection;
            if (!$cursor) return false;

            const isParagraph = $cursor.parent.type.name === 'paragraph';
            if (!isParagraph) return false;

            const textBefore = $cursor.parent.textContent.slice(0, $cursor.parentOffset);
            const isEmptyOrAfterSpace = !textBefore || textBefore.endsWith(' ');
            if (!isEmptyOrAfterSpace) return false;

            event.preventDefault();

            // Set cooldown
            slashCooldown = true;
            if (slashCooldownTimeout) clearTimeout(slashCooldownTimeout);
            slashCooldownTimeout = setTimeout(() => {
              slashCooldown = false;
              slashCooldownTimeout = null;
            }, 5000);

            // Only dispatch state update - event will be emitted in apply()
            view.dispatch(
              view.state.tr.setMeta(SlashMenuPluginKey, {
                type: 'open',
                pos: $cursor.pos,
              }),
            );
            return true;
          }

          if (pluginState.open && (event.key === 'Escape' || event.key === 'ArrowLeft')) {
            // Store current state before closing
            const { anchorPos } = pluginState;

            // Close menu
            view.dispatch(
              view.state.tr.setMeta(SlashMenuPluginKey, {
                type: 'close',
              }),
            );

            // Restore cursor position and focus
            if (anchorPos !== null) {
              const tr = view.state.tr.setSelection(
                view.state.selection.constructor.near(view.state.doc.resolve(anchorPos)),
              );
              view.dispatch(tr);
              view.focus();
            }
            return true;
          }

          return false;
        },
      },
    });

    // If we are in headless mode, do not add the plugin
    return this.editor.options.isHeadless ? [] : [slashMenuPlugin];
  },
});
