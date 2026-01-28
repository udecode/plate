import { DOMParser } from 'prosemirror-model';
import { cleanHtmlUnnecessaryTags, convertEmToPt, handleHtmlPaste } from '../../InputRule.js';
import { ListHelpers } from '@helpers/list-numbering-helpers.js';
import { extractListLevelStyles, numDefByTypeMap, numDefMap, startHelperMap } from '@helpers/pasteListHelpers.js';
import { normalizeLvlTextChar } from '../../super-converter/v2/importer/listImporter.js';

/**
 * Main handler for pasted DOCX content.
 *
 * @param {string} html The string being pasted
 * @param {Editor} editor The SuperEditor instance
 * @param {Object} view The ProseMirror view
 * @param {Object} plugin The plugin instance
 * @returns
 */
export const handleDocxPaste = (html, editor, view) => {
  const { converter } = editor;
  if (!converter || !converter.convertedXml) return handleHtmlPaste(html, editor);

  let cleanedHtml = convertEmToPt(html);
  cleanedHtml = cleanHtmlUnnecessaryTags(cleanedHtml);

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanedHtml;

  const data = tempDiv.querySelectorAll('p, li');

  const startMap = {};

  data.forEach((item) => {
    let type;
    if (item.localName === 'li') {
      type = 'listItem';
    } else {
      const html = item.innerHTML;
      type = 'p';
      // Looking only for lists to extract list info
      if (!html.includes('<!--[if !supportLists]')) return;
    }

    const styleAttr = item.getAttribute('style') || '';
    const msoListMatch = styleAttr.match(/mso-list:\s*l(\d+)\s+level(\d+)\s+lfo(\d+)/);
    const css = tempDiv.querySelector('style').innerHTML;

    if (msoListMatch) {
      const [, abstractId, level, numId] = msoListMatch;
      const styles = extractListLevelStyles(css, abstractId, level, numId) || {};
      let start, numFmt, lvlText;

      if (type === 'listItem') {
        const listType = item.parentNode.getAttribute('type');
        const startAttr = item.parentNode.getAttribute('start');
        if (!startMap[numId]) startMap[numId] = startAttr;
        start = startMap[numId];
        numFmt = numDefByTypeMap.get(listType);
        lvlText = `%${level}.`;
      } else {
        // Get numbering format from Word styles
        const msoNumFormat = styles['mso-level-number-format'] || 'decimal';
        numFmt = numDefMap.get(msoNumFormat);
        const punc = item.innerText?.match(/^\s*[a-zA-Z0-9]+([.()])/i)?.[1] || '.';
        lvlText = numFmt === 'bullet' ? normalizeLvlTextChar(styles['mso-level-text']) : `%${level}${punc}`;

        const startGetter = startHelperMap.get(numFmt);
        if (!startMap[numId]) startMap[numId] = startGetter(item.children[0]?.innerText || '1');
        start = startMap[numId];
      }

      item.setAttribute('data-num-id', numId);
      item.setAttribute('data-list-level', parseInt(level) - 1);
      item.setAttribute('data-start', start);
      item.setAttribute('data-lvl-text', lvlText);
      item.setAttribute('data-num-fmt', numFmt);

      const ptToPxRatio = 1.333;
      const indent = parseInt(styles['margin-left']) * ptToPxRatio || 0;
      if (indent > 0) item.setAttribute('data-left-indent', indent);
    }

    // Strip literal prefix inside conditional span
    extractAndRemoveConditionalPrefix(item);
  });

  transformWordLists(tempDiv, editor);
  const doc = DOMParser.fromSchema(editor.schema).parse(tempDiv);

  tempDiv.remove();

  const { dispatch } = editor.view;
  if (!dispatch) return false;

  dispatch(view.state.tr.replaceSelectionWith(doc, true));
  return true;
};

const transformWordLists = (container, editor) => {
  const listItems = Array.from(container.querySelectorAll('[data-num-id]'));

  const lists = {};
  const mappedLists = {};

  for (const item of listItems) {
    const level = parseInt(item.getAttribute('data-list-level'));
    const numFmt = item.getAttribute('data-num-fmt');
    const start = item.getAttribute('data-start');
    const lvlText = item.getAttribute('data-lvl-text');
    const indent = item.getAttribute('data-left-indent');

    // MS Word copy-pasted lists always start with num Id 1 and increment from there.
    // Which way not match the target documents numbering.xml lists
    // We will generate new definitions for all pasted lists
    // But keep track of a map of original ID to new ID so that we can keep lists together
    const importedId = item.getAttribute('data-num-id');
    if (!mappedLists[importedId]) mappedLists[importedId] = ListHelpers.getNewListId(editor);
    const id = mappedLists[importedId];
    const listType = numFmt === 'bullet' ? 'bulletList' : 'orderedList';
    ListHelpers.generateNewListDefinition({
      numId: id,
      listType,
      level: level.toString(),
      start,
      fmt: numFmt,
      text: lvlText,
      editor,
    });

    if (!lists[id]) lists[id] = { levels: {} };
    const currentListByNumId = lists[id];

    if (!currentListByNumId.levels[level]) currentListByNumId.levels[level] = Number(start) || 1;
    else currentListByNumId.levels[level]++;

    // Reset deeper levels when this level is updated
    Object.keys(currentListByNumId.levels).forEach((key) => {
      const level1 = Number(key);
      if (level1 > level) {
        delete currentListByNumId.levels[level1];
      }
    });

    const path = generateListPath(level, currentListByNumId.levels, start);
    if (!path.length) path.push(currentListByNumId.levels[level]);

    const li = document.createElement('li');
    li.innerHTML = item.innerHTML;
    li.setAttribute('data-num-id', id);
    li.setAttribute('data-list-level', JSON.stringify(path));
    li.setAttribute('data-level', level);
    li.setAttribute('data-lvl-text', lvlText);
    li.setAttribute('data-num-fmt', numFmt);
    if (indent) li.setAttribute('data-indent', JSON.stringify({ left: indent }));

    if (item.hasAttribute('data-font-family')) {
      li.setAttribute('data-font-family', item.getAttribute('data-font-family'));
    }
    if (item.hasAttribute('data-font-size')) {
      li.setAttribute('data-font-size', item.getAttribute('data-font-size'));
    }

    const parentNode = item.parentNode;

    let listForLevel;
    const newList = numFmt === 'bullet' ? document.createElement('ul') : document.createElement('ol');
    newList.setAttribute('data-list-id', id);
    newList.level = level;

    parentNode.insertBefore(newList, item);
    listForLevel = newList;

    listForLevel.appendChild(li);
    item.remove();
  }
};

export const generateListPath = (level, levels, start) => {
  const iLvl = Number(level);
  const path = [];
  if (iLvl > 0) {
    for (let i = iLvl; i >= 0; i--) {
      if (!levels[i]) levels[i] = Number(start);
      path.unshift(levels[i]);
    }
  }
  return path;
};

function extractAndRemoveConditionalPrefix(item) {
  const nodes = Array.from(item.childNodes);
  let fontFamily = null;
  let fontSize = null;

  let start = -1,
    end = -1;
  nodes.forEach((node, index) => {
    if (node.nodeType === Node.COMMENT_NODE && node.nodeValue.includes('[if !supportLists]')) {
      start = index;
    }
    if (start !== -1 && node.nodeType === Node.COMMENT_NODE && node.nodeValue.includes('[endif]')) {
      end = index;
    }
  });

  if (start !== -1 && end !== -1) {
    for (let i = start + 1; i < end; i++) {
      const node = nodes[i];
      if (node.nodeType === Node.ELEMENT_NODE && node.style) {
        fontFamily = fontFamily || node.style.fontFamily;
        fontSize = fontSize || node.style.fontSize;
      }
    }

    // Remove all nodes in that range
    for (let i = end; i >= start; i--) {
      item.removeChild(item.childNodes[i]);
    }

    // Store on <p> as attributes
    if (fontFamily) item.setAttribute('data-font-family', fontFamily);
    if (fontSize) item.setAttribute('data-font-size', fontSize);
  }
}
