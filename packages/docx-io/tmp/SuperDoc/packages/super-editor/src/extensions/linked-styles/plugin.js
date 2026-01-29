import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { generateLinkedStyleString, getLinkedStyle } from './helpers.js';

export const LinkedStylesPluginKey = new PluginKey('linkedStyles');

export const createLinkedStylesPlugin = (editor) => {
  return new Plugin({
    key: LinkedStylesPluginKey,
    state: {
      init() {
        if (!editor.converter || editor.options.mode !== 'docx') return {};
        const styles = editor.converter?.linkedStyles || [];
        return {
          styles,
          decorations: generateDecorations(editor.state, styles),
        };
      },
      apply(tr, prev, oldEditorState, newEditorState) {
        if (!editor.converter || editor.options.mode !== 'docx') return { ...prev };
        let decorations = prev.decorations || DecorationSet.empty;
        if (tr.docChanged) {
          const styles = LinkedStylesPluginKey.getState(editor.state).styles;
          decorations = generateDecorations(newEditorState, styles);
        }

        return { ...prev, decorations };
      },
    },
    props: {
      decorations(state) {
        return LinkedStylesPluginKey.getState(state)?.decorations;
      },
    },
  });
};

/**
 * Generate style decorations for linked styles
 *
 * @param {Object} state Editor state
 * @param {Array[Object]} styles The linked styles
 * @returns {DecorationSet} The decorations
 */
const generateDecorations = (state, styles) => {
  const decorations = [];
  let lastStyleId = null;
  const doc = state?.doc;

  doc.descendants((node, pos) => {
    const { name } = node.type;

    if (node?.attrs?.styleId) lastStyleId = node.attrs.styleId;
    if (name === 'paragraph' && !node.attrs?.styleId) lastStyleId = null;
    if (name !== 'text' && name !== 'listItem' && name !== 'orderedList') return;

    // Get the last styleId from the node marks
    // This allows run-level styles and styleIds to override paragraph-level styles
    for (const mark of node.marks) {
      if (mark.type.name === 'textStyle' && mark.attrs.styleId) {
        lastStyleId = mark.attrs.styleId;
      }
    }
    const { linkedStyle, basedOnStyle } = getLinkedStyle(lastStyleId, styles);
    if (!linkedStyle) return;

    const $pos = state.doc.resolve(pos);
    const parent = $pos.parent;

    const styleString = generateLinkedStyleString(linkedStyle, basedOnStyle, node, parent);
    if (!styleString) return;

    const decoration = Decoration.inline(pos, pos + node.nodeSize, { style: styleString });
    decorations.push(decoration);
  });
  return DecorationSet.create(doc, decorations);
};
