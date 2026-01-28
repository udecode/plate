import { computed } from 'vue';

/**
 * Composable to get the currently selected text from an editor
 *
 * @param {Object} editorRef - Ref to the editor instance
 * @returns {Object} - Object containing the selected text as a computed property
 */
export function useSelectedText(editorRef) {
  // Create a computed property that will update when the editor selection changes
  const selectedText = computed(() => {
    const editor = editorRef.value;
    if (!editor || !editor.state) return '';

    return editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');
  });

  return {
    selectedText,
  };
}
