import { Plugin, PluginKey } from 'prosemirror-state';

export function orderedListMarker() {
  return new Plugin({
    key: new PluginKey('orderedListMarker'),

    appendTransaction: (transactions, oldState, newState) => {
      let docChanges = transactions.some((tr) => tr.docChanged) && !oldState.doc.eq(newState.doc);
      if (!docChanges) {
        return;
      }

      let { tr } = newState;
      let listItemsByList = getOrderedListItemsByList(newState);

      if (!listItemsByList.size) {
        return;
      }

      let changed = false;
      Array.from(listItemsByList).forEach(([, items]) => {
        const list = items[0];
        let listItems = items;
        let isBulletList = list.node.type.name === 'bulletList';
        let listHasItemsWithoutAttrs = list.node.childCount !== listItems.length;

        // If the list was toggled to a bullet list,
        // then remove ordered marker attrs from list items.
        if (isBulletList) {
          listItems.forEach((item) => removeListItemMarkerAttrs(tr, item));
          changed = true;
          return;
        }

        // If the current list has items without the marker attrs,
        // then get all items and update listItems.
        if (listHasItemsWithoutAttrs) {
          let allItems = getAllChildListItemsOfList({ state: newState, list });
          if (allItems.length) listItems = allItems;
        }

        let firstItem = listItems[0];
        let firstItemAttrs = buildFirstListItemAttrs({ state: newState, listItems });

        let defaultAttrs = createMarkerAttrs();
        let currentAttrs = {
          lvlText: firstItem.node.attrs.lvlText ?? defaultAttrs.lvlText,
          listLevel: firstItem.node.attrs.listLevel ?? defaultAttrs.listLevel,
          listNumberingType: firstItem.node.attrs.listNumberingType ?? defaultAttrs.listNumberingType,
        };

        let equalFirstItemAttrs =
          currentAttrs.lvlText === firstItemAttrs.lvlText &&
          currentAttrs.listNumberingType === firstItemAttrs.listNumberingType &&
          compare(currentAttrs.listLevel, firstItemAttrs.listLevel);

        if (!equalFirstItemAttrs) {
          tr.setNodeMarkup(firstItem.pos, undefined, {
            ...firstItem.node.attrs,
            ...firstItemAttrs,
          });
          changed = true;
          currentAttrs = firstItemAttrs;
        }

        listItems.forEach((listItem, index) => {
          // Skip the first list item.
          if (index === 0) {
            return;
          }

          let { node, pos } = listItem;
          let { lvlText, listLevel, listNumberingType } = node.attrs;

          if (!Array.isArray(currentAttrs.listLevel)) currentAttrs.listLevel = JSON.parse(currentAttrs.listLevel);
          let newListLevel = [...currentAttrs.listLevel.slice(0, -1), currentAttrs.listLevel.at(-1) + 1];
          let equalMarkerAttrs =
            lvlText === currentAttrs.lvlText &&
            listNumberingType === currentAttrs.listNumberingType &&
            compare(listLevel, newListLevel);

          if (!equalMarkerAttrs) {
            let { selection, storedMarks } = newState;
            let marks = storedMarks || (selection.$to.parentOffset && selection.$from.marks());

            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              listLevel: newListLevel,
              lvlText: currentAttrs.lvlText,
              listNumberingType: currentAttrs.listNumberingType,
            });

            if (marks) {
              tr.ensureMarks(marks);
            }

            changed = true;
          }

          currentAttrs = {
            ...currentAttrs,
            listLevel: newListLevel,
          };
        });
      });

      tr.setMeta('orderedListMarker', true);
      return changed ? tr : null;
    },
  });
}

function getOrderedListItemsByList(state) {
  let { doc } = state;
  let map = new Map();
  doc.descendants((node, pos) => {
    // no need to descend into a paragraph
    if (node.type.name === 'paragraph') {
      return false;
    }

    let { attrs } = node;
    let isListItem = node.type.name === 'listItem';
    let hasListLevel = !!attrs.listLevel?.length;
    let hasLvlText = !!attrs.lvlText;
    let orderedType = attrs.listNumberingType && attrs.listNumberingType !== 'bullet';
    if (isListItem && hasListLevel && hasLvlText && orderedType) {
      let $pos = doc.resolve(pos);
      let list = $pos.parent;

      const key = `${list.attrs.listId}, ${node.attrs.listLevel.slice(0, -1)}`;
      if (!map.get(key)) map.set(key, []);
      let items = map.get(key);
      items.push({ node, pos });
    }
  });
  return map;
}

function getAllChildListItemsOfList({ state, list }) {
  let { doc } = state;
  let allItems = [];
  doc.descendants((node, pos) => {
    // no need to descend into a paragraph
    if (node.type.name === 'paragraph') {
      return false;
    }

    let isListItem = node.type.name === 'listItem';
    let $pos = doc.resolve(pos);
    if (isListItem && $pos.parent === list) {
      allItems.push({ node, pos });
    }
  });
  return allItems;
}

function createMarkerAttrs({ lvlText = '', listLevel = [], listNumberingType = 'decimal' } = {}) {
  return {
    lvlText,
    listLevel,
    listNumberingType,
  };
}

function removeListItemMarkerAttrs(tr, listItem) {
  let { pos, node } = listItem;
  tr.setNodeMarkup(pos, undefined, {
    ...node.attrs,
    lvlText: null,
    listLevel: null,
    listNumberingType: null,
  });
}

function compare(a1, a2) {
  return a1.length === a2.length && a1.every((item, index) => item === a2[index]);
}

// This is the place where we can check
// the first item attributes and patch them as needed.
function buildFirstListItemAttrs({ state, listItems }) {
  let { doc } = state;
  let firstItem = listItems[0];
  let { lvlText, listLevel, listNumberingType } = firstItem.node.attrs;

  let defaultAttrs = createMarkerAttrs({
    lvlText: '%1.',
    listLevel: [1],
    listNumberingType: 'decimal',
  });

  let $itemPos = doc.resolve(firstItem.pos);
  let listDepth = $itemPos.depth - 1; // listItem depth - 1
  let listLevelValue = listDepth / 2;

  let itemHasAllAttrs = lvlText && listLevel?.length && listNumberingType;

  if (!itemHasAllAttrs) {
    // Set default attributes.
    ({ lvlText, listLevel, listNumberingType } = defaultAttrs);
  } else {
    let nestedList = listLevelValue > 0;

    if (nestedList && listLevelValue >= 3) {
      // Set default attributes.
      ({ lvlText, listLevel, listNumberingType } = defaultAttrs);
    } else if (nestedList && listLevelValue < 3) {
      // Update listLevel to always start at 1.
      // [6] -> [1], [3, 3] -> [3, 1], etc.
      listLevel = [...listLevel.slice(0, -1), 1];
    }
  }

  return {
    lvlText,
    listLevel,
    listNumberingType,
  };
}
