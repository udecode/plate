import { Editor } from '../Editor.js';

/**
 * Creates a linked child editor based on the current editor.
 * This function checks if the current editor is already a child editor,
 * and if not, it creates a new editor instance with the specified options.
 * The new editor will have pagination disabled and will link to the parent editor's list definitions change handler.
 * @param {Editor} currentEditor - The current editor instance to link to.
 * @param {Object} [options={}] - Additional options to override the default editor options.
 * @returns {Editor} A new child editor instance linked to the current editor.
 */
export const createLinkedChildEditor = (currentEditor, options = {}) => {
  if (currentEditor.options.isChildEditor) {
    return null;
  }

  const editor = new Editor({
    ...currentEditor.options,
    pagination: false,
    suppressDefaultDocxStyles: true,
    ydoc: null,
    collaborationProvider: null,
    fileSource: null,
    initialState: null,
    documentId: null,
    isCommentsEnabled: false,
    isNewFile: false,
    fragment: false,
    onCreate: () => null,
    onListDefinitionsChange: linkListDefinitionsChange,

    // Options overrides
    ...options,
    isChildEditor: true,
    parentEditor: currentEditor,
  });

  return editor;
};

/**
 * Default handler for when the list definitions change in a linked child editor.
 * This function updates the parent editor's converter with the new numbering definitions
 * and dispatches a transaction to update the list item node views.
 * @param {Object} options - The options object containing the editor, change, and numbering.
 * @param {Editor} options.editor - The parent editor instance.
 * @param {Object} options.change - The change object containing the new numbering definitions.
 * @param {Object} options.numbering - The new numbering definitions to be applied.
 * @returns {void}
 */
const linkListDefinitionsChange = (options) => {
  const { editor, numbering } = options;
  const { parentEditor = {} } = editor.options;
  const { converter: parentConverter } = parentEditor;
  if (!parentConverter) return;

  parentConverter.numbering = numbering;

  const { tr } = parentEditor.state;
  const { dispatch } = parentEditor.view;
  tr.setMeta('updatedListItemNodeViews', true);
  dispatch(tr);
};
