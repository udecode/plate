import { Plugin, PluginKey } from 'prosemirror-state';
import { Extension } from '@core/Extension.js';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { AiMarkName, AiLoaderNodeName } from './ai-constants.js';

export const AiPluginKey = new PluginKey('ai');

export const AiPlugin = Extension.create({
  name: 'ai',

  addCommands() {
    return {
      insertAiMark:
        () =>
        ({ tr, dispatch }) => {
          const { selection } = tr;
          const { $from, $to } = selection;

          // Only add mark if there's a selection
          if ($from.pos === $to.pos) return false;

          tr.addMark(
            $from.pos,
            $to.pos,
            this.editor.schema.marks[AiMarkName].create({
              id: 'ai-highlight',
            }),
          );

          if (dispatch) dispatch(tr);
          return true;
        },
      /**
       * Remove selection before ai pulse styles
       */
      removeSelectionAfterAiPulse:
        () =>
        ({ tr, dispatch, state }) => {
          const { selection } = tr;
          const { $to } = selection;

          tr.setSelection(state.selection.constructor.create(tr.doc, $to.pos, $to.pos));

          if (dispatch) dispatch(tr);
          return true;
        },

      /**
       * Update the AI highlights with custom styling
       * @remarks This is to avoid manipulating the DOM directly - use Prosemirror state. Avoids re-rendering the entire document
       * @param {String} className - The CSS class to add to the AI highlights
       * @returns {Boolean} - True if the highlight style was updated
       */
      updateAiHighlightStyle:
        (className) =>
        ({ tr, dispatch }) => {
          // We can use a transaction meta to communicate with the plugin
          // to update our decorations with the new class
          tr.setMeta(AiPluginKey, { type: 'updateStyle', className });

          if (dispatch) dispatch(tr);
          return true;
        },

      /**
       * Clear any custom styling from AI highlights
       * @returns {Boolean} - True if the highlight style was cleared
       */
      clearAiHighlightStyle:
        () =>
        ({ tr, dispatch }) => {
          // We'll send null to clear any custom classes
          tr.setMeta(AiPluginKey, { type: 'updateStyle', className: null });

          if (dispatch) dispatch(tr);
          return true;
        },

      /**
       * Remove all AI marks from the document
       * @param {String} markName - The name of the mark to remove - defaults to AiMarkName
       * Can also be used to remove the ai animation mark after streams are complete
       * @returns {Boolean} - True if the mark was removed, false otherwise
       */
      removeAiMark:
        (markName = AiMarkName) =>
        ({ tr, dispatch, state }) => {
          // Loop through the document to find and remove all AI marks
          const { doc } = state;
          let markFound = false;

          doc.descendants((node, pos) => {
            const { marks = [] } = node;
            const aiMark = marks.find((mark) => mark.type.name === markName);

            if (aiMark) {
              markFound = true;
              tr.removeMark(pos, pos + node.nodeSize, state.schema.marks[markName]);
            }
          });

          if (markFound) {
            if (dispatch) dispatch(tr);
            return true;
          }

          return false;
        },

      /**
       * Remove all AI nodes of a specific type from the document
       * @param {String} nodeName - The name of the node to remove
       * @returns {Boolean} - True if any nodes were removed, false otherwise
       */
      removeAiNode:
        (nodeName = AiLoaderNodeName) =>
        ({ tr, dispatch, state }) => {
          const { doc } = state;
          const positions = [];

          doc.descendants((node, pos) => {
            if (node.type.name === nodeName) {
              positions.push(pos);
            }
          });

          if (positions.length === 0) {
            return false;
          }

          // Sort positions in descending order to avoid position shifting
          positions.sort((a, b) => b - a);

          // Delete nodes from highest to lowest position
          positions.forEach((pos) => {
            const node = doc.nodeAt(pos);
            if (node) {
              tr.delete(pos, pos + node.nodeSize);
            }
          });

          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },

  addPmPlugins() {
    const editor = this.editor;
    const aiPlugin = new Plugin({
      key: AiPluginKey,
      state: {
        init() {
          return {
            decorations: DecorationSet.empty,
            highlightColor: '#6366f1', // Indigo color, matches AiLayer
            customClass: null, // Pulse animation class spot (later)
          };
        },
        apply(tr, oldState, _, newEditorState) {
          // Check if we have an update meta for styling
          const meta = tr.getMeta(AiPluginKey);
          let customClass = oldState.customClass;

          if (meta && meta.type === 'updateStyle') {
            customClass = meta.className;
          }

          // Clear pulse animation when text is being inserted/replaced
          // This ensures it doesn't persist after AI has inserted content
          if (tr.docChanged && customClass === 'sd-ai-highlight-pulse') {
            // Check if any text was inserted in places with AI marks
            let hasTextChanges = false;
            tr.steps.forEach((step) => {
              if (step.slice && step.slice.content.size > 0) {
                hasTextChanges = true;
              }
            });

            if (hasTextChanges) {
              customClass = null;
            }
          }

          // If no document changes and no meta updates, return the old state
          if (!tr.docChanged && !meta) return oldState;

          // Process AI highlights in the document with custom class if needed
          const { decorations } =
            processAiHighlights(editor, newEditorState.doc, oldState.highlightColor, customClass) || {};
          const decorationSet = DecorationSet.create(newEditorState.doc, decorations);

          return {
            ...oldState,
            decorations: decorationSet,
            customClass,
          };
        },
      },
      props: {
        decorations(state) {
          return this.getState(state).decorations;
        },
      },
    });
    return [aiPlugin];
  },
});

/**
 * Iterate through the document to find AI marks and create decorations for them
 * @param {*} editor The current editor instance
 * @param {*} doc The current document
 * @param {string} highlightColor The color to use for highlights
 * @param {string} customClass Optional custom class to add to the decorations
 * @returns {Object} The decorations for AI marks
 */
const processAiHighlights = (editor, doc, highlightColor, customClass = null) => {
  const decorations = [];

  doc.descendants((node, pos) => {
    // Check if it contains the aiMarkName
    const { marks = [] } = node;
    const aiMark = marks.find((mark) => mark.type.name === AiMarkName);

    if (aiMark) {
      // Base style and classes
      const attrs = {
        style: `background-color: ${highlightColor}33; border-radius: 4px; transition: background-color 250ms ease;`, // 33 is 20% opacity in hex
        class: 'sd-ai-highlight-element',
      };

      // Add custom class if provided
      if (customClass) {
        attrs.class += ` ${customClass}`;
      }

      const deco = Decoration.inline(pos, pos + node.nodeSize, attrs);
      decorations.push(deco);
    }
  });

  return { decorations };
};
