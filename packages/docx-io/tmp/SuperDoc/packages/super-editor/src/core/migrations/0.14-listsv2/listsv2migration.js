import { getAllFieldAnnotations } from '@extensions/field-annotation/fieldAnnotationHelpers/index.js';
import { ListHelpers } from '@helpers/list-numbering-helpers.js';

const isDebugging = false;
const log = (...args) => {
  if (isDebugging) console.debug('[lists v2 migration]', ...args);
};

/**
 * Migration for lists v1 to v2
 * This function checks if the editor has any lists that need to be migrated from v1 to v2.
 * It splits list nodes that have more than one item into single-item lists,
 * @param {Editor} editor - The editor instance containing the lists to be migrated.
 * @return {Object} An object containing the extracted items and replacements made.
 *                  The `extracted` property contains the flattened list items,
 *                  and the `replacements` property contains the positions and nodes replaced.
 *                  If no migration is needed, it returns an empty object.
 */
export const migrateListsToV2IfNecessary = (editor) => {
  const replacements = [];

  log('ATTEMPTING MIGRATIONS');

  const numbering = editor.converter.numbering;
  if (!numbering) return replacements;

  const { state } = editor;
  const { doc } = state;
  const { dispatch } = editor.view;

  const LIST_TYPES = ['orderedList', 'bulletList'];

  // Collect all list nodes that need to be replaced
  let lastListEndPos = 0;
  doc.descendants((node, pos) => {
    if (!LIST_TYPES.includes(node.type.name)) return;

    if (pos < lastListEndPos) return;

    const extracted = flattenListCompletely(node, editor, 0);
    if (extracted.length > 0) {
      replacements.push({
        from: pos,
        to: pos + node.nodeSize,
        listNode: node,
        replacement: extracted,
      });
    }

    lastListEndPos = pos + node.nodeSize;
  });

  // Apply replacements in reverse order to avoid position drift
  let tr = state.tr;
  if (replacements.length > 0) {
    for (let i = replacements.length - 1; i >= 0; i--) {
      const { from, to, replacement, listNode } = replacements[i];

      // Convert the flattened items to actual nodes
      const nodesToInsert = [];
      for (const item of replacement) {
        if (item.node.type.name === 'listItem') {
          // Create a single-item list containing this list item
          const singleItemList = listNode.type.create(listNode.attrs, [item.node]);
          nodesToInsert.push(singleItemList);
        } else {
          // Insert non-list content directly
          nodesToInsert.push(item.node);
        }
      }

      log('NODES TO INSERT', nodesToInsert);
      tr = tr.replaceWith(from, to, nodesToInsert);
    }
  }

  tr.setMeta('listsv2migration', replacements);
  editor.options.migrated = true;
  dispatch(tr);

  return replacements;
};

/**
 * Completely flatten a list structure into single-item lists
 * @param {Node} listNode - The list node to flatten
 * @param {Editor} editor - The editor instance
 * @param {number} baseLevel - The base nesting level
 * @returns {Array} Array of single-item list nodes
 */
function flattenListCompletely(listNode, editor, baseLevel = 0, sharedNumId = null) {
  const result = [];
  const listTypes = ['orderedList', 'bulletList'];
  const currentListType = listNode.type.name;

  const needsMigration = shouldMigrateList(listNode);
  const hasValidDefinition = checkValidDefinition(listNode, editor);
  log('Needs migration?', needsMigration);
  if (!needsMigration) {
    if (!hasValidDefinition) {
      return generateMissingListDefinition(listNode, editor);
    } else {
      return result;
    }
  }

  let numId = parseInt(listNode.attrs?.listId);
  log('LIST ID', numId, 'SHARED NUM ID', sharedNumId);
  if (!numId || Number.isNaN(numId)) numId = ListHelpers.getNewListId(editor);
  const listHasDef = ListHelpers.getListDefinitionDetails({ numId, level: baseLevel, editor });
  if (!listHasDef || (!sharedNumId && !numId)) {
    // In some legacy cases, we might not find any list ID at all but we can infer
    // the list style from the list-style-type attribute.
    numId = ListHelpers.getNewListId(editor);
    log('Genearted new list ID', numId, 'for list type', currentListType);
    ListHelpers.generateNewListDefinition({
      numId,
      listType: currentListType,
      editor,
    });
  }

  if (!sharedNumId) sharedNumId = numId;

  for (const listItem of listNode.content.content) {
    // If the list item has no content, we will still add it as a single-item list
    // Or, main case, where the list item only has one item, it is ready for converting
    if (!listItem.content.content?.length) {
      result.push({ node: listItem, baseLevel });
    }

    // If the list has a single item, we need to check if it is a nested list
    // If it is, we need to flatten it completely
    // If it is not, we can just add it as a single-item list
    else if (listItem.content.content.length === 1) {
      const contentNode = listItem.content.content[0];
      if (listTypes.includes(contentNode.type.name)) {
        // If the content is a nested list, we need to flatten it completely
        const flattened = flattenListCompletely(contentNode, editor, baseLevel + 1, sharedNumId);
        result.push(...flattened);
      } else {
        const newList = ListHelpers.createSchemaOrderedListNode({
          level: baseLevel,
          numId: sharedNumId,
          listType: listNode.type.name,
          editor,
          contentNode: contentNode.toJSON(),
          listLevel: listItem.attrs.listLevel || [1],
        });
        result.push({ node: newList, baseLevel });
      }
    }

    // If we have multiple items, we need to:
    // Convert the first one to the list item
    // Everything else to root nodes
    else {
      const firstItem = listItem.content.content[0];
      if (listTypes.includes(firstItem.type.name)) {
        // If the first item is a nested list, we need to flatten it completely
        const flattened = flattenListCompletely(firstItem, editor, baseLevel + 1, sharedNumId);
        result.push(...flattened);
      } else {
        // If firstItem is already a paragraph or other valid listItem content, wrap it
        // If firstItem is something else, we might need to handle it differently
        if (firstItem.type.name === 'paragraph' || firstItem.isTextblock) {
          // Create a new list item node containing this content
          const newList = ListHelpers.createSchemaOrderedListNode({
            level: baseLevel,
            numId: sharedNumId,
            listType: listNode.type.name,
            editor,
            contentNode: firstItem.toJSON(),
            listLevel: listItem.attrs.listLevel || [1],
          });
          result.push({ node: newList, baseLevel });
        } else {
          // If it's not valid listItem content, treat it as a standalone node
          result.push({ node: firstItem });
        }
      }

      for (let contentItem of listItem.content.content.slice(1)) {
        if (listTypes.includes(contentItem.type.name)) {
          // If the first item is a nested list, we need to flatten it completely
          const flattened = flattenListCompletely(contentItem, editor, baseLevel + 1, sharedNumId);
          result.push(...flattened);
        } else {
          result.push({ node: contentItem });
        }
      }
    }
  }

  return result;
}

/**
 * Check if a list item needs migration to v2.
 * This function checks if a list item has more than one child or if the first child is a list item
 * without the required attributes for v2 migration. It returns true if migration is needed,
 * and false otherwise.
 * @param {Object} listItem - The list item to check for migration.
 * @returns {boolean} True if the list item needs migration, false otherwise.
 */
const shouldMigrateList = (listItem) => {
  const content = listItem.content;

  if (content?.content?.length > 1) {
    // If the list item has more than one child, it needs migration
    return true;
  }

  // Since we know we only have one child, let's check it
  const firstChild = content.firstChild;
  if (firstChild && firstChild.type.name === 'listItem') {
    const { attrs } = firstChild;

    // After v2, we expect level and listNumberingType to be defined
    const { level, listNumberingType } = attrs || {};
    if (typeof level === 'undefined' || !listNumberingType) {
      return true;
    }

    const childContent = firstChild?.content?.content;
    const nestedLists = childContent.filter((child) => ['bulletList', 'orderedList'].includes(child.type.name));
    return nestedLists.length > 0;
  }

  return false;
};

/**
 * Check if a list definition is valid.
 * This function checks if a list node has a valid definition for lists v2 based on its attributes.
 * It returns true if the definition is valid, and false otherwise.
 * @param {Object} listNode - The list node to check for a valid definition.
 * @param {Editor} editor - The editor instance to use for checking the definition.
 * @returns {boolean} True if the list definition is valid, false otherwise.
 */
const checkValidDefinition = (listNode, editor) => {
  const listType = listNode.type.name;
  const listItem = listNode.content.firstChild;
  const { attrs } = listItem;
  const { numId, level } = attrs || {};
  const listDef = ListHelpers.getListDefinitionDetails({ numId, level, listType, editor });
  const { abstract } = listDef || {};

  if (abstract) return true;
  return false;
};

/**
 * Generate a missing list definition for a list node.
 * This function creates a new list definition based on the attributes of the list item
 * and the editor instance. It returns the generated list definition.
 * @param {Object} listNode - The list node to generate a definition for.
 * @param {Editor} editor - The editor instance to use for generating the definition.
 * @returns {Object} The generated list definition.
 */
const generateMissingListDefinition = (listNode, editor) => {
  const listType = listNode.type.name;
  const listItem = listNode.content.firstChild;
  const { attrs } = listItem;
  const { numId } = attrs || {};
  return ListHelpers.generateNewListDefinition({
    numId,
    listType,
    editor,
  });
};

/**
 * Migrate paragraph fields to lists v2.
 * This function processes all field annotations in the editor state,
 * specifically those with type 'html', and migrates their content to the new lists v2 format.
 * It creates a child editor for each field annotation, processes the HTML content,
 * and updates the input values accordingly.
 * @param {Array} annotationValues - The array of field annotations to migrate.
 * @returns {Promise<Array>} A promise that resolves to an array of updated field annotations
 *                            with their input values migrated to the new lists v2 format.
 */
export const migrateParagraphFieldsListsV2 = async (annotationValues = [], editor) => {
  const annotations = getAllFieldAnnotations(editor.state);
  const newValues = [];

  if (!annotations.length) {
    return annotationValues;
  }

  // Process annotations sequentially
  for (const annotation of annotations) {
    const type = annotation.node?.attrs?.type;

    const matchedAnnotation = annotationValues.find((v) => v.input_id === annotation.node.attrs.fieldId);

    if (!!matchedAnnotation && (!type || type !== 'html')) {
      newValues.push(matchedAnnotation);
      continue;
    }

    const value = matchedAnnotation?.input_value;
    if (!value) continue;

    // Wait for each child editor to complete
    await new Promise((resolve, reject) => {
      const element = document.createElement('div');
      editor.createChildEditor({
        element,
        html: value,
        onCreate: ({ editor: localEditor }) => {
          const { migrated } = localEditor.options;

          if (migrated) {
            const newHTML = localEditor.getHTML();
            matchedAnnotation.input_value = newHTML;
            newValues.push(matchedAnnotation);
          }
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  }

  return newValues;
};
