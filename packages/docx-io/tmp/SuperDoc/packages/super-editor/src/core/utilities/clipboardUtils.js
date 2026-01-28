// clipboardUtils.js

import { DOMSerializer, DOMParser } from 'prosemirror-model';

/**
 * Serializes the current selection in the editor state to HTML and plain text for clipboard use.
 * @param {EditorState} state - The ProseMirror editor state containing the current selection.
 * @returns {{ htmlString: string, text: string }} An object with the HTML string and plain text of the selection.
 */
export function serializeSelectionToClipboard(state) {
  const { from, to } = state.selection;
  const slice = state.selection.content();
  const htmlContainer = document.createElement('div');
  htmlContainer.appendChild(DOMSerializer.fromSchema(state.schema).serializeFragment(slice.content));
  const htmlString = htmlContainer.innerHTML;
  const text = state.doc.textBetween(from, to);
  return { htmlString, text };
}

/**
 * Writes HTML and plain text data to the system clipboard.
 * Uses the Clipboard API if available, otherwise falls back to plain text.
 * @param {{ htmlString: string, text: string }} param0 - The HTML and plain text to write to the clipboard.
 * @returns {Promise<void>} A promise that resolves when the clipboard write is complete.
 */
export async function writeToClipboard({ htmlString, text }) {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const clipboardItem = new window.ClipboardItem({
        'text/html': new Blob([htmlString], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([clipboardItem]);
    } else {
      await navigator.clipboard.writeText(text);
    }
  } catch (e) {
    console.error('Error writing to clipboard', e);
  }
}

/**
 * Reads content from the system clipboard and parses it into a ProseMirror fragment.
 * Attempts to read HTML first, falling back to plain text if necessary.
 * @param {EditorState} state - The ProseMirror editor state, used for schema and parsing.
 * @returns {Promise<ProseMirrorNode|null>} A promise that resolves to a ProseMirror fragment or text node, or null if reading fails.
 */
export async function readFromClipboard(state) {
  let html = '';
  let text = '';
  if (navigator.clipboard && navigator.clipboard.read) {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes('text/html')) {
          html = await (await item.getType('text/html')).text();
          break;
        } else if (item.types.includes('text/plain')) {
          text = await (await item.getType('text/plain')).text();
        }
      }
    } catch {
      text = await navigator.clipboard.readText();
    }
  } else {
    text = await navigator.clipboard.readText();
  }
  let content = null;
  if (html) {
    try {
      content = DOMParser.fromSchema(state.schema).parseSlice(
        new window.DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body,
      ).content;
    } catch (e) {
      console.error('error parsing html', e);
      // fallback to text
      content = state.schema.text(text);
    }
  }
  if (!content && text) {
    content = state.schema.text(text);
  }
  return content;
}
