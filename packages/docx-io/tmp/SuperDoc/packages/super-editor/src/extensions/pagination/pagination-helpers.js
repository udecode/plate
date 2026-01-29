import { PluginKey } from 'prosemirror-state';
import { Editor as SuperEditor } from '@core/Editor.js';
import { getStarterExtensions } from '@extensions/index.js';
import { updateYdocDocxData } from '@extensions/collaboration/collaboration-helpers.js';

export const PaginationPluginKey = new PluginKey('paginationPlugin');

/**
 * Initialize the pagination data for the editor
 * This will fetch the header and footer data from the converter and calculate their height
 * @param {SuperEditor} editor The editor instance
 * @returns {Object} The data for the headers and footers
 */
export const initPaginationData = async (editor) => {
  if (!editor.converter) return;

  const sectionData = { headers: {}, footers: {} };
  const headerIds = editor.converter.headerIds.ids;
  const footerIds = editor.converter.footerIds.ids;

  for (let key in headerIds) {
    const sectionId = headerIds[key];
    if (!sectionId) continue;

    const dataForThisSection = editor.converter.headers[sectionId];
    if (!sectionData.headers[sectionId]) sectionData.headers[sectionId] = {};
    sectionData.headers[sectionId].data = dataForThisSection;
    // Wait for the height to be resolved
    const { height, sectionEditor, sectionContainer } = await getSectionHeight(editor, dataForThisSection);
    sectionData.headers[sectionId].height = height;
    sectionData.headers[sectionId].sectionEditor = sectionEditor;
    sectionData.headers[sectionId].sectionContainer = sectionContainer;
  }

  for (let key in footerIds) {
    const sectionId = footerIds[key];
    if (!sectionId) continue;

    const dataForThisSection = editor.converter.footers[sectionId];
    if (!sectionData.headers[sectionId]) sectionData.footers[sectionId] = {};
    sectionData.footers[sectionId].data = dataForThisSection;
    // Wait for the height to be resolved
    const { height, sectionEditor, sectionContainer } = await getSectionHeight(editor, dataForThisSection);
    sectionData.footers[sectionId].height = height;
    sectionData.footers[sectionId].sectionEditor = sectionEditor;
    sectionData.footers[sectionId].sectionContainer = sectionContainer;
  }

  return sectionData;
};

/**
 * Get the height of a section
 * @param {SuperEditor} editor The editor instance
 * @param {Object} data The data for the section
 * @returns {Promise<Object>} An object containing the height of the section, the section editor and the section container
 */
const getSectionHeight = async (editor, data) => {
  if (!data) return {};

  return new Promise((resolve) => {
    const editorContainer = document.createElement('div');
    editorContainer.className = 'super-editor';
    editorContainer.style.padding = '0';
    editorContainer.style.margin = '0';

    const sectionEditor = createHeaderFooterEditor({ editor, data, editorContainer });

    sectionEditor.on('create', () => {
      sectionEditor.setEditable(false, false);
      requestAnimationFrame(() => {
        const height = editorContainer.offsetHeight;
        document.body.removeChild(editorContainer);
        resolve({ height, sectionEditor, sectionContainer: editorContainer });
      });
    });
  });
};

export const createHeaderFooterEditor = ({
  editor,
  data,
  editorContainer,
  appendToBody = true,
  sectionId,
  type,
  availableHeight,
  currentPageNumber,
}) => {
  const parentStyles = editor.converter.getDocumentDefaultStyles();
  const { fontSizePt, typeface } = parentStyles;
  const fontSizeInPixles = fontSizePt * 1.3333;
  const lineHeight = fontSizeInPixles * 1.2;

  Object.assign(editorContainer.style, {
    padding: '0',
    margin: '0',
    border: 'none',
    boxSizing: 'border-box',
    position: 'absolute',
    top: '0',
    left: '0',
    width: 'auto',
    maxWidth: 'none',
    fontFamily: typeface,
    fontSize: `${fontSizeInPixles}px`,
    lineHeight: `${lineHeight}px`,
  });

  Object.assign(editorContainer.style, {
    padding: '0',
    margin: '0',
    border: 'none',
    boxSizing: 'border-box',
    height: availableHeight + 'px',
    overflow: 'hidden',
  });
  if (appendToBody) document.body.appendChild(editorContainer);

  const headerFooterEditor = new SuperEditor({
    role: editor.options.role,
    loadFromSchema: true,
    mode: 'docx',
    element: editorContainer,
    content: data,
    extensions: getStarterExtensions(),
    documentId: sectionId || 'sectionId',
    media: editor.storage.image.media,
    mediaFiles: editor.storage.image.media,
    fonts: editor.options.fonts,
    isHeaderOrFooter: true,
    isHeadless: editor.options.isHeadless,
    annotations: true,
    currentPageNumber,
    parentEditor: editor,
    editable: false,
    documentMode: 'viewing',
    onCreate: (evt) => setEditorToolbar(evt, editor),
    onBlur: (evt) => onHeaderFooterDataUpdate(evt, editor, sectionId, type),
  });
  headerFooterEditor.setEditable(false, false);

  const pm = editorContainer.querySelector('.ProseMirror');
  if (pm) {
    pm.style.maxHeight = '100%';
    pm.style.minHeight = '100%';
    pm.style.outline = 'none';
    pm.style.border = 'none';

    pm.setAttribute('role', 'textbox');
    pm.setAttribute('aria-multiline', true);
    pm.setAttribute('aria-label', `${type} content area. Double click to start typing.`);
  }

  return headerFooterEditor;
};

export const broadcastEditorEvents = (editor, sectionEditor) => {
  const eventNames = [
    'fieldAnnotationDropped',
    'fieldAnnotationPaste',
    'fieldAnnotationSelected',
    'fieldAnnotationClicked',
    'fieldAnnotationDoubleClicked',
    'fieldAnnotationDeleted',
  ];
  eventNames.forEach((eventName) => {
    sectionEditor.on(eventName, (...args) => {
      editor.emit(eventName, ...args);
      console.debug('broadcastEditorEvents', { eventName, args });
    });
  });
};

export const toggleHeaderFooterEditMode = ({ editor, focusedSectionEditor, isEditMode, documentMode }) => {
  editor.converter.headerEditors.forEach((item) => {
    item.editor.setEditable(isEditMode, false);
    item.editor.view.dom.setAttribute('aria-readonly', !isEditMode);
    item.editor.view.dom.setAttribute('documentmode', documentMode);
  });

  editor.converter.footerEditors.forEach((item) => {
    item.editor.setEditable(isEditMode, false);
    item.editor.view.dom.setAttribute('aria-readonly', !isEditMode);
    item.editor.view.dom.setAttribute('documentmode', documentMode);
  });

  if (isEditMode) {
    const pm = document.querySelector('.ProseMirror');
    pm.classList.add('header-footer-edit');
    pm.setAttribute('aria-readonly', true);
  }

  if (focusedSectionEditor) {
    focusedSectionEditor.view.focus();
  }
};

export const onHeaderFooterDataUpdate = async ({ editor, transaction }, mainEditor, sectionId, type) => {
  if (!type || !sectionId) return;

  const updatedData = editor.getUpdatedJson();
  mainEditor.converter[`${type}Editors`].forEach((item) => {
    if (item.id === sectionId) {
      item.editor.setOptions({
        media: editor.options.media,
        mediaFiles: editor.options.mediaFiles,
      });
      item.editor.replaceContent(updatedData);
    }
    item.editor.setOptions({
      lastSelection: transaction?.selection,
    });
  });
  mainEditor.converter[`${type}s`][sectionId] = updatedData;
  mainEditor.setOptions({ isHeaderFooterChanged: editor.docChanged });

  await updateYdocDocxData(mainEditor);
};

const setEditorToolbar = ({ editor }, mainEditor) => {
  editor.setToolbar(mainEditor.toolbar);
};
