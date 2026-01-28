// import './file-polyfill.js'; Import the file polyfill if using NodeJS < v22.0.0
import fs from 'fs/promises';
import express from 'express';
import { JSDOM } from 'jsdom';
import documentBlob from './document.js';

// In Node, we use the Editor class directly from superdoc/super-editor
import { Editor, getStarterExtensions } from '@harbour-enterprises/superdoc/super-editor';

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Init your server of choice. For simplicity, we use express here
const server = express();

/**
 * A basic endpoint that appends content to the document.
 * You can pass in text and html as query parameters, at least one of which is required to edit the document.
 * If no param is passed, the document will be returned as as-is (blank template with header and footer).
 */
server.get('/', async (req, res, next) => {
  const { text, html } = req.query;

  // Load the specified document:
  // if using stackblitz:
  let documentData = documentBlob;
  const arrayBuffer = await documentData.arrayBuffer();
  documentData = Buffer.from(arrayBuffer);

  // otherwise, you can read from disk:
  // let documentData = await fs.readFile(`./sample-document.docx`);

  const editor = await getEditor(documentData);
  
  // If we have text or html, we will to load the editor and insert the content
  if (text) editor.commands.insertContent(text);
  if (html) editor.commands.insertContent(html);

  // Export the docx and create a buffer to return to the user
  const zipBuffer = await editor.exportDocx();
  documentData = Buffer.from(zipBuffer);

  // Download the file
  res
  .status(200)
  .type(DOCX_MIME_TYPE)
  .set('Content-Disposition', 'attachment; filename="exported-superdoc.docx"')
  .send(documentData);

})

server.listen(3000, '0.0.0.0', () => console.debug(`Server running on port 3000`));


/**
 * Loads the editor with the document data
 * @param {Buffer} docxFileBuffer The docx file as a Buffer
 * @returns {Promise<Editor>} The Super Editor instance
 */
const getEditor = async (docxFileBuffer) => {
  // For now, this is boilerplate code to mock the window and document
  const { window: mockWindow } = (new JSDOM('<!DOCTYPE html><html><body></body></html>'));
  const { document: mockDocument } = mockWindow;

  // Prepare document data for the editor
  const [content, mediaFiles] = await Editor.loadXmlData(docxFileBuffer);

  return new Editor({
    isHeadless: true,

    // We pass in the mock document and window here
    mockDocument,
    mockWindow,

    // Our standard list of extensions
    extensions: getStarterExtensions(),

    // Our prepaerd document data
    content,
    mediaFiles,
  });
};
