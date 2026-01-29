import { DOMParser } from 'prosemirror-model';
import { convertEmToPt, sanitizeHtml } from '../../InputRule.js';
import { ListHelpers } from '../../helpers/list-numbering-helpers.js';
import { createSingleItemList } from '../html/html-helpers.js';
import { getLvlTextForGoogleList, googleNumDefMap } from '../../helpers/pasteListHelpers.js';

/**
 * Main handler for pasted Google Docs content.
 *
 * @param {string} html The string being pasted
 * @param {Editor} editor The SuperEditor instance
 * @param {Object} view The ProseMirror view
 * @returns
 */
export const handleGoogleDocsHtml = (html, editor, view) => {
  // convert lists
  const htmlWithPtSizing = convertEmToPt(html);
  const cleanedHtml = sanitizeHtml(htmlWithPtSizing).innerHTML;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanedHtml;

  const htmlWithMergedLists = mergeSeparateLists(tempDiv);
  const flattenHtml = flattenListsInHtml(htmlWithMergedLists, editor);

  const doc = DOMParser.fromSchema(editor.schema).parse(flattenHtml);
  tempDiv.remove();

  const { dispatch } = editor.view;
  if (!dispatch) return false;

  dispatch(view.state.tr.replaceSelectionWith(doc, true));
  return true;
};

/**
 * Flattens lists to ensure each list contains exactly ONE list item.
 */
function flattenListsInHtml(container, editor) {
  // Keep processing until all lists are flattened
  let foundList;
  while ((foundList = findListToFlatten(container))) {
    flattenFoundList(foundList, editor);
  }

  return container;
}

/**
 * Finds lists to be flattened
 */
function findListToFlatten(container) {
  // First priority: unprocessed lists
  let list = container.querySelector('ol:not([data-list-id]), ul:not([data-list-id])');
  if (list) return list;

  return null;
}

/**
 * Flattens a single list by:
 * 1. Ensuring it has proper data-list-id
 * 2. Splitting multi-item lists into single-item lists
 * 3. Extracting nested lists and processing them recursively
 */
function flattenFoundList(listElem, editor) {
  let NodeInterface;
  if (editor.options.mockDocument) {
    const win = editor.options.mockDocument.defaultView;
    NodeInterface = win.Node;
  } else {
    NodeInterface = window.Node;
  }

  const tag = listElem.tagName.toLowerCase();
  const rootListLevel = Number(listElem.children[0].getAttribute('aria-level'));
  const rootListFmt = listElem.children[0].style['list-style-type'] || 'decimal';
  const start = listElem.getAttribute('start') || 1;

  // Google docs list doesn't have numId
  const rootNumId = ListHelpers.getNewListId(editor);

  ListHelpers.generateNewListDefinition({
    numId: rootNumId,
    listType: tag === 'ol' ? 'orderedList' : 'bulletList',
    editor,
    fmt: googleNumDefMap.get(rootListFmt),
    level: (rootListLevel - 1).toString(),
    start,
    text: getLvlTextForGoogleList(rootListFmt, rootListLevel, editor),
  });

  // Create single-item lists for each item
  const newLists = [];

  // Get all direct <li> children
  const items = Array.from(listElem.children).filter((c) => c.tagName.toLowerCase() === 'li');

  items.forEach((li) => {
    const level = Number(li.getAttribute('aria-level')) - 1;
    const listLevel = [level + 1];
    const nestedLists = getNestedLists([li.nextSibling]);

    // Create a new single-item list for this li
    const newList = createSingleItemList({ li, tag, rootNumId, level, listLevel, editor, NodeInterface });
    newLists.push(newList);

    nestedLists.forEach((list) => {
      newLists.push(list.cloneNode(true));
    });
    if (nestedLists.length && ['OL', 'UL'].includes(li.nextSibling.tagName)) {
      li.nextSibling?.remove();
    }
  });

  // Replace the original list with the new single-item lists
  const parent = listElem.parentNode;
  const nextSibling = listElem.nextSibling;
  parent.removeChild(listElem);

  newLists.forEach((list) => {
    parent.insertBefore(list, nextSibling);
  });
}

/**
 * Recursive helper to find all nested lists for the list item
 */
function getNestedLists(nodes) {
  let result = [];

  const nodesArray = Array.from(nodes).filter((n) => n !== null);

  for (let item of nodesArray) {
    if (item.tagName === 'OL' || item.tagName === 'UL') {
      result.push(item);
      result.push(...getNestedLists(item.children));
    }
  }

  return result;
}

/**
 * Method that combines separate lists with sequential start attribute into one list
 * Google Docs list items could be presented as separate lists with sequential start attribute
 */
function mergeSeparateLists(container) {
  const tempCont = container.cloneNode(true);

  const rootLevelLists = Array.from(tempCont.querySelectorAll('ol:not(ol ol):not(ul ol)') || []);
  const mainList = rootLevelLists.find((list) => !list.getAttribute('start'));
  const hasStartAttr = rootLevelLists.some((list) => list.getAttribute('start') !== null);

  if (hasStartAttr) {
    const listsWithStartAttr = rootLevelLists.filter((list) => list.getAttribute('start') !== null);
    for (let [index, item] of listsWithStartAttr.entries()) {
      if (item.getAttribute('start') === (index + 2).toString()) {
        mainList.append(...item.childNodes);
        item.remove();
      }
    }
  }

  return tempCont;
}
