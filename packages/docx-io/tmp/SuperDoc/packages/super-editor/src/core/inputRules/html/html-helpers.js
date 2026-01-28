import { ListHelpers } from '@helpers/list-numbering-helpers.js';

/**
 * Flattens ALL lists to ensure each list contains exactly ONE list item.
 * Handles both multi-item lists and nested lists.
 */
export function flattenListsInHtml(html, editor) {
  // pick the right parser & Node interface
  let parser, NodeInterface;
  if (editor.options?.mockDocument) {
    const win = editor.options.mockDocument.defaultView;
    parser = new win.DOMParser();
    NodeInterface = win.Node;
  } else {
    parser = new DOMParser();
    NodeInterface = window.Node;
  }

  const doc = parser.parseFromString(html, 'text/html');

  // Keep processing until all lists are flattened
  let foundList;
  while ((foundList = findListToFlatten(doc))) {
    flattenFoundList(foundList, editor, NodeInterface);
  }

  return doc.body.innerHTML;
}

/**
 * Finds the first list that needs flattening:
 * 1. Lists without data-list-id (completely unprocessed)
 * 2. Lists with more than one <li> child
 * 3. Lists with nested lists inside them
 */
function findListToFlatten(doc) {
  // First priority: unprocessed lists
  let list = doc.querySelector('ol:not([data-list-id]), ul:not([data-list-id])');
  if (list) return list;

  // Second priority: lists with multiple items
  const allLists = doc.querySelectorAll('ol[data-list-id], ul[data-list-id]');
  for (const list of allLists) {
    const liChildren = Array.from(list.children).filter((c) => c.tagName.toLowerCase() === 'li');
    if (liChildren.length > 1) {
      return list;
    }

    // Third priority: lists with nested lists
    const nestedLists = list.querySelectorAll('ol, ul');
    if (nestedLists.length > 0) {
      return list;
    }
  }

  return null;
}

/**
 * Flattens a single list by:
 * 1. Ensuring it has proper data-list-id
 * 2. Splitting multi-item lists into single-item lists
 * 3. Extracting nested lists and processing them recursively
 */
function flattenFoundList(listElem, editor, NodeInterface) {
  const localDoc = listElem.ownerDocument;
  const tag = listElem.tagName.toLowerCase();

  // Ensure the list has a data-list-id
  let rootNumId = listElem.getAttribute('data-list-id');
  if (!rootNumId) {
    rootNumId = ListHelpers.getNewListId(editor);
    ListHelpers.generateNewListDefinition({
      numId: rootNumId,
      listType: tag === 'ol' ? 'orderedList' : 'bulletList',
      editor,
    });
  }

  // Calculate the level of this list
  let level = 0;
  let ancestor = listElem.parentElement;
  while (ancestor && ancestor !== localDoc.body) {
    if (ancestor.tagName && ancestor.tagName.toLowerCase() === 'li') {
      level++;
    }
    ancestor = ancestor.parentElement;
  }

  // Get all direct <li> children
  const items = Array.from(listElem.children).filter((c) => c.tagName.toLowerCase() === 'li');

  // Create single-item lists for each item
  const newLists = [];

  items.forEach((li) => {
    // Extract any nested lists first
    const nestedLists = Array.from(li.querySelectorAll('ol, ul'));
    const nestedListsData = nestedLists.map((nl) => ({
      element: nl.cloneNode(true),
      parent: nl.parentNode,
    }));

    // Remove nested lists from the li
    nestedLists.forEach((nl) => nl.parentNode.removeChild(nl));

    // Create a new single-item list for this li
    const newList = createSingleItemList({ li, tag, rootNumId, level, editor, NodeInterface });
    newLists.push(newList);

    // Add the nested lists (they'll be processed in the next iteration)
    nestedListsData.forEach((data) => {
      newLists.push(data.element);
    });
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
 * Creates a single-item list from an <li> element
 */
export function createSingleItemList({ li, tag, rootNumId, level, listLevel, editor, NodeInterface }) {
  const localDoc = li.ownerDocument;
  const ELEMENT_NODE = NodeInterface.ELEMENT_NODE;
  const TEXT_NODE = NodeInterface.TEXT_NODE;

  // Create new list and list item
  const newList = localDoc.createElement(tag);
  const newLi = localDoc.createElement('li');

  // Copy attributes from original li (except the ones we'll set ourselves)
  Array.from(li.attributes).forEach((attr) => {
    if (
      !attr.name.startsWith('data-num-') &&
      !attr.name.startsWith('data-level') &&
      !attr.name.startsWith('data-list-')
    ) {
      newLi.setAttribute(attr.name, attr.value);
    }
  });

  // Set list attributes
  newList.setAttribute('data-list-id', rootNumId);

  // Set list item attributes
  newLi.setAttribute('data-num-id', rootNumId);
  newLi.setAttribute('data-level', String(level));

  // Get numbering info
  const { listNumberingType, lvlText } = ListHelpers.getListDefinitionDetails({
    numId: rootNumId,
    level,
    editor,
  });

  newLi.setAttribute('data-num-fmt', listNumberingType);
  newLi.setAttribute('data-lvl-text', lvlText || '');
  newLi.setAttribute('data-list-level', JSON.stringify(listLevel || [level + 1]));

  // Copy content from original li
  Array.from(li.childNodes).forEach((node) => {
    if (node.nodeType === ELEMENT_NODE || (node.nodeType === TEXT_NODE && node.textContent.trim())) {
      newLi.appendChild(node.cloneNode(true));
    }
  });

  // Handle case where li only contains text
  if (newLi.childNodes.length === 0 || (newLi.childNodes.length === 1 && newLi.childNodes[0].nodeType === TEXT_NODE)) {
    const textContent = newLi.textContent.trim();
    if (textContent) {
      newLi.innerHTML = '';
      const p = localDoc.createElement('p');
      p.textContent = textContent;
      newLi.appendChild(p);
    }
  }

  newList.appendChild(newLi);
  return newList;
}

/**
 * Converts flatten lists back to normal list structure.
 */
export function unflattenListsInHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const allNodes = [...doc.body.children];

  const listSequences = [];
  let currentSequence = null;

  allNodes.forEach((node, index) => {
    const isFlattenList =
      node.tagName && (node.tagName === 'OL' || node.tagName === 'UL') && node.hasAttribute('data-list-id');

    if (isFlattenList) {
      const listId = node.getAttribute('data-list-id');

      if (currentSequence && currentSequence.id === listId) {
        currentSequence.lists.push({ element: node, index });
      } else {
        currentSequence = {
          id: listId,
          lists: [{ element: node, index }],
        };
        listSequences.push(currentSequence);
      }
    } else {
      currentSequence = null;
    }
  });

  // Process each sequence in reverse order to avoid index issues.
  listSequences.reverse().forEach((sequence) => {
    const sequenceLists = sequence.lists;

    if (sequenceLists.length === 0) {
      return;
    }

    const items = sequenceLists
      .map(({ element: list }) => {
        const liElement = list.querySelector('li');
        if (!liElement) return null;
        return {
          element: liElement,
          level: parseInt(liElement.getAttribute('data-level') || '0'),
          numFmt: liElement.getAttribute('data-num-fmt') || 'bullet',
          listLevel: JSON.parse(liElement.getAttribute('data-list-level') || '[1]'),
        };
      })
      .filter((item) => item !== null);

    if (items.length === 0) {
      return;
    }

    const rootList = buildNestedList({ items });
    const firstOriginalList = sequenceLists[0].element;

    // Replace the first original list with the new nested structure.
    firstOriginalList?.parentNode?.insertBefore(rootList, firstOriginalList);

    // Remove all original flatten lists in this sequence.
    sequenceLists.forEach(({ element: list }) => {
      if (list.parentNode) list.parentNode.removeChild(list);
    });
  });

  return doc.body.innerHTML;
}

/**
 * Builds a nested list structure from flat items.
 */
function buildNestedList({ items }) {
  if (!items.length) {
    return null;
  }

  const [rootItem] = items;
  const doc = rootItem.element.ownerDocument;
  const isOrderedList = rootItem.numFmt && !['bullet', 'none'].includes(rootItem.numFmt);
  const rootList = doc.createElement(isOrderedList ? 'ol' : 'ul');

  if (isOrderedList && rootItem.listLevel?.[0] && rootItem.listLevel[0] > 1) {
    rootList.setAttribute('start', rootItem.listLevel[0]);
  }

  const lastLevelItem = new Map();
  items.forEach((item) => {
    const { element: liElement, level, numFmt } = item;
    const cleanLi = cleanListItem(liElement.cloneNode(true));

    if (level === 0) {
      rootList.append(cleanLi);
      lastLevelItem.set(0, cleanLi);
    } else {
      const parentLi = lastLevelItem.get(level - 1);

      if (!parentLi) {
        // Fallback: add to root if no parent found.
        rootList.append(cleanLi);
        lastLevelItem.set(level, cleanLi);
        return;
      }

      let nestedList = null;
      [...parentLi.children].forEach((child) => {
        if (child.tagName && (child.tagName === 'OL' || child.tagName === 'UL')) {
          nestedList = child;
        }
      });

      if (!nestedList) {
        const listType = numFmt && !['bullet', 'none'].includes(numFmt) ? 'ol' : 'ul';
        nestedList = doc.createElement(listType);
        parentLi.append(nestedList);
      }

      nestedList.append(cleanLi);
      lastLevelItem.set(level, cleanLi);
    }
  });

  return rootList;
}

/**
 * Removes flatten attributes from list item.
 */
function cleanListItem(listItem) {
  const attrs = [
    'data-num-id',
    'data-level',
    'data-num-fmt',
    'data-lvl-text',
    'data-list-level',
    'data-marker-type',
    'aria-label',
  ];
  attrs.forEach((attr) => {
    listItem.removeAttribute(attr);
  });
  return listItem;
}
