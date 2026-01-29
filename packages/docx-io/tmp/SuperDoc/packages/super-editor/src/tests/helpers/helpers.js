import { join } from 'path';
import { readFile } from 'fs/promises';
import { parseXmlToJson } from '@converter/v2/docxHelper.js';
import { getStarterExtensions } from '@extensions/index.js';
import { Editor } from '@core/Editor.js';
import DocxZipper from '@core/DocxZipper.js';

const EXTENSIONS_TO_CONVERT = new Set(['.xml', '.rels']);

/**
 * Load a test docx file into a map of file names to their content
 * @param {string} name The name of the file in the test data folder
 * @returns {Promise<Object>} The test data as a map of file names to their content
 */
export const getTestDataByFileName = async (name) => {
  const basePath = join(__dirname, '../data', name);
  const fileBuffer = await readFile(basePath);
  const zipper = new DocxZipper();
  const xmlFiles = await zipper.getDocxData(fileBuffer, true);
  return readFilesRecursively(xmlFiles);
};

export const getTestDataAsFileBuffer = async (name) => {
  const basePath = join(__dirname, '../data', name);
  const fileBuffer = await readFile(basePath);
  return fileBuffer;
};

const readFilesRecursively = (xmlFiles) => {
  const fileDataMap = {};

  try {
    xmlFiles.forEach((entry) => {
      const { name, content } = entry;
      const extension = name.slice(name.lastIndexOf('.'));
      if (EXTENSIONS_TO_CONVERT.has(extension)) fileDataMap[name] = parseXmlToJson(content);
      else fileDataMap[name] = fileData;
    });
  } catch (err) {
    console.error(`Error reading file:`, err);
  }

  return fileDataMap;
};

/**
 * Get test data for editor tests
 *
 * @param {string} filename
 * @returns {Promise<[Object, Object, Object, Object]>}
 */
export const loadTestDataForEditorTests = async (filename) => {
  const fileSource = await getTestDataAsFileBuffer(filename);
  const [docx, media, mediaFiles, fonts] = await Editor.loadXmlData(fileSource, true);
  return { docx, media, mediaFiles, fonts };
};

/**
 * Instantiate a new test editor instance
 *
 * @param {Object} options Editor options
 * @returns {Editor} A new test editor instance
 */
export const initTestEditor = (options = {}) => {
  const editor = new Editor({
    mode: 'docx',
    documentId: 'test',
    role: 'editor',
    documentMode: 'editing',
    isHeadless: true,
    extensions: getStarterExtensions(),
    users: [],
    ...options,
  });
  return {
    editor,
    dispatch: editor.view.dispatch,
  };
};

/**
 * Get a new transaction from an editor instance
 *
 * @param {Editor} editor
 * @returns {Transaction} A new transaction instance
 */
export const getNewTransaction = (editor) => {
  const { view } = editor;
  const { state, dispatch } = view;
  return state.tr;
};
