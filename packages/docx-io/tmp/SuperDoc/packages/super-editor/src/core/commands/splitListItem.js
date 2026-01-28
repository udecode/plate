import { Fragment } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { Attribute } from '../Attribute.js';
import { findParentNode, getNodeType } from '@helpers/index.js';
import { decreaseListIndent } from './decreaseListIndent.js';

/**
 * Splits one list item into two separate list items.
 * @param typeOrName The type or name of the node.
 *
 * The command is a heavily modified version of the original
 * `splitListItem` command to better manage attributes and marks
 * as well as custom SuperDoc lists.
 *
 * https://github.com/ProseMirror/prosemirror-schema-list/blob/master/src/schema-list.ts#L114
 */
export const splitListItem = () => (props) => {
  const { tr, state, editor } = props;
  const type = getNodeType('listItem', state.schema);
  const { $from, $to } = state.selection;
  tr.setMeta('updateListSync', true);

  const currentListItem = findParentNode((node) => node.type.name === 'listItem')(state.selection);
  if (!currentListItem) return false;

  // If selection spans multiple blocks or we're not inside a list item, do nothing
  if ((state.selection.node && state.selection.node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) {
    return false;
  }

  // Check if we should handle this as an empty block split
  if ($from.parent.content.size === 0 && $from.node(-1).childCount === $from.indexAfter(-1)) {
    return handleSplitInEmptyBlock(props, currentListItem);
  }

  const matchedListItem = findParentNode((node) => node.type === type)(state.selection);
  const { node: listItemNode } = matchedListItem || {};
  if (listItemNode.type !== type) return false;

  const listTypes = ['orderedList', 'bulletList'];
  const matchedParentList = findParentNode((node) => listTypes.includes(node.type.name))(state.selection);
  const { node: parentListNode } = matchedParentList || {};

  // If we have something in the selection, we need to remove it
  if ($from.pos !== $to.pos) tr.delete($from.pos, $to.pos);

  const paragraphNode = $from.node();
  const paraOffset = $from.parentOffset;
  const beforeCursor = paragraphNode.content.cut(0, paraOffset);
  const afterCursor = paragraphNode.content.cut(paraOffset);

  // Declare variables that will be used across if-else blocks
  let firstList, secondList;

  const marks = state.storedMarks || $from.marks() || [];

  // Check if the list item has multiple paragraphs
  const listItemHasMultipleParagraphs = listItemNode.childCount > 1;

  if (listItemHasMultipleParagraphs) {
    // Handle multi-paragraph case: preserve all content after cursor position
    const paragraphIndex = $from.index(-1); // Index of current paragraph within list item

    // Get content before current paragraph
    let contentBeforeCurrentPara = [];
    for (let i = 0; i < paragraphIndex; i++) {
      contentBeforeCurrentPara.push(listItemNode.child(i));
    }

    // Get content after current paragraph
    let contentAfterCurrentPara = [];
    for (let i = paragraphIndex + 1; i < listItemNode.childCount; i++) {
      contentAfterCurrentPara.push(listItemNode.child(i));
    }

    // Create first list item content
    let firstListContent = [...contentBeforeCurrentPara];
    if (beforeCursor.size > 0) {
      const modifiedFirstParagraph = editor.schema.nodes.paragraph.create(paragraphNode.attrs, beforeCursor);
      firstListContent.push(modifiedFirstParagraph);
    }

    // Create second list item content
    let secondListContent = [];

    // Always create a paragraph for the cursor position in the second list item
    // If there's content after cursor, use it; otherwise create an empty paragraph
    if (afterCursor && afterCursor.size > 0) {
      const modifiedSecondParagraph = editor.schema.nodes.paragraph.create(paragraphNode.attrs, afterCursor);
      secondListContent.push(modifiedSecondParagraph);
    } else {
      // Create an empty paragraph where the cursor will be positioned
      const emptyParagraph = editor.schema.nodes.paragraph.create(paragraphNode.attrs);
      secondListContent.push(emptyParagraph);
    }

    // Add any paragraphs that come after the current one
    secondListContent = secondListContent.concat(contentAfterCurrentPara);

    // Ensure we have at least one paragraph in each list item
    if (firstListContent.length === 0) {
      const emptyParagraph = editor.schema.nodes.paragraph.create();
      firstListContent = [emptyParagraph];
    }
    if (secondListContent.length === 0) {
      const emptyParagraph = editor.schema.nodes.paragraph.create();
      secondListContent = [emptyParagraph];
    }

    // Create the lists
    const firstListItem = editor.schema.nodes.listItem.create(
      { ...listItemNode.attrs },
      Fragment.from(firstListContent),
    );
    firstList = editor.schema.nodes.orderedList.createAndFill(parentListNode.attrs, Fragment.from(firstListItem));

    const secondListItem = editor.schema.nodes.listItem.create(
      { ...listItemNode.attrs },
      Fragment.from(secondListContent),
    );
    secondList = editor.schema.nodes.orderedList.createAndFill(parentListNode.attrs, Fragment.from(secondListItem));
  } else {
    // Simple case: single paragraph, use original logic
    let firstParagraphContent = beforeCursor;
    if (beforeCursor.size === 0) {
      firstParagraphContent = editor.schema.text(' ', marks);
    }

    const firstParagraph = editor.schema.nodes.paragraph.create(paragraphNode.attrs, firstParagraphContent);
    const firstListItem = editor.schema.nodes.listItem.create({ ...listItemNode.attrs }, firstParagraph);
    firstList = editor.schema.nodes.orderedList.createAndFill(parentListNode.attrs, Fragment.from(firstListItem));

    let secondParagraphContent = afterCursor;
    if (afterCursor.size === 0) {
      secondParagraphContent = editor.schema.text(' ', marks);
    }

    const secondParagraph = editor.schema.nodes.paragraph.create(paragraphNode.attrs, secondParagraphContent);
    const secondListItem = editor.schema.nodes.listItem.create({ ...listItemNode.attrs }, secondParagraph);
    secondList = editor.schema.nodes.orderedList.createAndFill(parentListNode.attrs, Fragment.from(secondListItem));
  }

  if (!firstList || !secondList) return false;

  // Replace the entire original list with the first list
  const listStart = matchedParentList.pos;
  const listEnd = matchedParentList.pos + parentListNode.nodeSize;
  tr.replaceWith(listStart, listEnd, firstList);

  // Insert the second list after the first one
  const insertPosition = listStart + firstList.nodeSize;
  tr.insert(insertPosition, secondList);

  // Set selection at the beginning of the second list's paragraph
  const secondListStart = insertPosition + 2; // +1 for list, +1 for listItem
  tr.setSelection(TextSelection.near(tr.doc.resolve(secondListStart)));
  tr.scrollIntoView();

  // Retain any marks
  // const marks = state.storedMarks || $from.marks() || [];
  if (marks?.length) {
    tr.ensureMarks(marks);
  }
  tr.setMeta('splitListItem', true);

  return true;
};

/**
 * Handle the case where we are splitting a list item in an empty block.
 * @param {Object} props The props object containing the editor state and transaction.
 * @param {Object} currentListItem The current list item node info.
 * @returns {boolean} Returns true if the split was handled, false otherwise.
 */
const handleSplitInEmptyBlock = (props, currentListItem) => {
  const { state, editor, tr } = props;
  const { schema } = state;
  const { $from } = state.selection;
  const extensionAttrs = editor.extensionService.attributes;

  // Find the list item node
  const listItemNode = currentListItem.node;

  // Check if we're in an empty paragraph but the list item has other content
  // This happens after shift+enter creates an empty line
  const isEmptyParagraph = $from.parent.content.size === 0;
  const listItemHasOtherContent = listItemNode.content.size > $from.parent.nodeSize; // More than just this empty paragraph

  // Check if we're at the very end of the list item
  // If we're not at the end, we should split normally rather than create a new list
  const isAtEndOfListItem = $from.indexAfter(-1) === $from.node(-1).childCount;

  if (isEmptyParagraph && listItemHasOtherContent && isAtEndOfListItem) {
    // We're in an empty paragraph after shift+enter AND we're at the end - create a new list item
    try {
      const listTypes = ['orderedList', 'bulletList'];
      const parentList = findParentNode((node) => listTypes.includes(node.type.name))(state.selection);

      if (!parentList) return false;

      // Get attributes for the new paragraph
      const newParagraphAttrs = Attribute.getSplittedAttributes(extensionAttrs, 'paragraph', {});

      // Create a new paragraph and list item with same attributes as current
      const newParagraph = schema.nodes.paragraph.create(newParagraphAttrs);
      const newListItem = schema.nodes.listItem.create({ ...listItemNode.attrs }, newParagraph);
      const newList = schema.nodes.orderedList.createAndFill(parentList.node.attrs, Fragment.from(newListItem));

      if (!newList) return false;

      // Insert the new list after the current one
      const insertPos = parentList.pos + parentList.node.nodeSize;
      tr.insert(insertPos, newList);

      // Set selection to the new list item
      const newPos = insertPos + 2; // +1 for list, +1 for listItem
      tr.setSelection(TextSelection.near(tr.doc.resolve(newPos)));
      tr.scrollIntoView();

      return true;
    } catch (error) {
      console.error('Error creating new list item:', error);
      return false;
    }
  }

  // If we're in an empty paragraph but NOT at the end of the list item,
  // return false to let the normal split logic handle it
  if (isEmptyParagraph && listItemHasOtherContent && !isAtEndOfListItem) {
    return false;
  }

  // Check if the list item is completely empty (only contains empty paragraphs)
  const isListItemEmpty = () => {
    if (listItemNode.childCount === 0) return true;

    // Check if all children are empty paragraphs
    for (let i = 0; i < listItemNode.childCount; i++) {
      const child = listItemNode.child(i);
      if (child.type.name === 'paragraph' && child.content.size === 0) {
        continue; // Empty paragraph, keep checking
      } else if (child.type.name === 'paragraph' && child.content.size > 0) {
        return false; // Non-empty paragraph found
      } else {
        return false; // Non-paragraph content found
      }
    }
    return true; // All children are empty paragraphs
  };

  if (isListItemEmpty()) {
    // First, try to outdent
    const didOutdent = decreaseListIndent()({ editor, tr });
    if (didOutdent) return true;

    try {
      // Find the parent list (orderedList or bulletList)
      const listTypes = ['orderedList', 'bulletList'];
      const parentList = findParentNode((node) => listTypes.includes(node.type.name))(state.selection);

      if (!parentList) {
        console.error('No parent list found');
        return false;
      }

      // Get attributes for the new paragraph
      const newParagraphAttrs = Attribute.getSplittedAttributes(extensionAttrs, 'paragraph', {});

      // Create a new paragraph node
      const paragraphType = schema.nodes.paragraph;
      let newParagraph = paragraphType.createAndFill(newParagraphAttrs);

      if (!newParagraph) {
        newParagraph = paragraphType.create();
      }

      // Replace the ENTIRE LIST with a paragraph
      const listStart = parentList.pos;
      const listEnd = parentList.pos + parentList.node.nodeSize;

      tr.replaceWith(listStart, listEnd, newParagraph);

      // Position cursor at start of new paragraph
      const newPos = listStart + 1;
      tr.setSelection(TextSelection.near(tr.doc.resolve(newPos)));

      tr.scrollIntoView();

      return true;
    } catch (error) {
      console.error('Error destroying list:', error);
      return false;
    }
  }

  return false;
};
