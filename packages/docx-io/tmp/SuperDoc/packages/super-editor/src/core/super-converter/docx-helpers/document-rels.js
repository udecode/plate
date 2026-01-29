// @ts-check
import { RELATIONSHIP_TYPES } from './docx-constants.js';

/** @typedef {import('../types.js').Editor} Editor */
/** @typedef {import('../types.js').XmlRelationshipElement} XmlRelationshipElement */
/** @typedef {import('../types.js').RelationshipType} RelationshipType */

/**
 * Get all relationship elements from the document.xml.rels.
 * @param {Editor} editor The editor instance
 * @returns {XmlRelationshipElement[]} An array of relationship elements
 */
export const getDocumentRelationshipElements = (editor) => {
  const docx = editor.converter?.convertedXml;
  if (!docx) return [];

  const documentRels = docx['word/_rels/document.xml.rels'];
  const elements = documentRels?.elements;
  if (!Array.isArray(elements)) return [];

  const relationshipTag = elements.find((el) => el.name === 'Relationships');
  return relationshipTag?.elements || [];
};

/**
 * Get the maximum relationship ID from existing relationships.
 * @param {XmlRelationshipElement[]} relationships The array of relationship elements
 * @returns {number} The maximum relationship ID integer
 */
export const getMaxRelationshipIdInt = (relationships) => {
  const ids = [];
  relationships.forEach((rel) => {
    const splitId = rel.attributes.Id.split('rId');
    const parsedInt = parseInt(splitId[1], 10);
    if (Number.isInteger(parsedInt)) {
      ids.push(parsedInt);
    }
  });

  if (ids.length === 0) return 0;
  return Math.max(...ids);
};

/**
 * Find an existing relationship ID based on the target path.
 * @param {string} target The target path to search for
 * @param {Editor} editor The editor instance
 * @returns {string|null} The relationship ID if found, otherwise null
 */
export const findRelationshipIdFromTarget = (target, editor) => {
  if (!target) return null;

  if (target.startsWith('word/')) target = target.replace('word/', '');
  const relationships = getDocumentRelationshipElements(editor);
  const existingLinkRel = relationships?.find((rel) => rel.attributes.Target === target);
  if (existingLinkRel) {
    return existingLinkRel.attributes.Id;
  }
};

/**
 * Insert a new relationship into the document.xml.rels.
 * This will verify that we do not already have a relationship for the target.
 * If a relationship already exists, it will not create a new one.
 * @param {string} target The target path for the relationship
 * @param {RelationshipType} type The type of the relationship
 * @param {Editor} editor The editor instance
 * @returns {string|null} The new or existing relationship ID or null if it could not be created
 * @throws {Error} When required parameters are missing or invalid
 */
export const insertNewRelationship = (target, type, editor) => {
  // Input validation
  if (!target || typeof target !== 'string') {
    throw new Error('Target must be a non-empty string');
  }
  if (!type || typeof type !== 'string') {
    throw new Error('Type must be a non-empty string');
  }
  if (!editor) {
    throw new Error('Editor instance is required');
  }

  // Check if relationship type is supported
  const mappedType = RELATIONSHIP_TYPES[type];
  if (!mappedType) {
    console.warn(
      `Unsupported relationship type: ${type}. Available types: ${Object.keys(RELATIONSHIP_TYPES).join(', ')}`,
    );
    return null;
  }

  // Check for existing relationship
  const existingRelId = findRelationshipIdFromTarget(target, editor);
  if (existingRelId) {
    console.info(`Reusing existing relationship for target: ${target} (ID: ${existingRelId})`);
    return existingRelId;
  }

  // Validate document structure
  const docx = editor.converter?.convertedXml;
  if (!docx) {
    console.error('No converted XML found in editor');
    return null;
  }

  const documentRels = docx['word/_rels/document.xml.rels'];
  if (!documentRels) {
    console.error('No document relationships found in the docx');
    return null;
  }

  const relationshipsTag = documentRels.elements?.find((el) => el.name === 'Relationships');
  if (!relationshipsTag) {
    console.error('No Relationships tag found in document relationships');
    return null;
  }

  // Ensure elements array exists
  if (!relationshipsTag.elements) {
    relationshipsTag.elements = [];
  }

  // Generate new relationship ID
  const newId = getNewRelationshipId(editor);
  if (!newId) {
    console.error('Failed to generate new relationship ID');
    return null;
  }

  // Create new relationship element
  const newRel = {
    type: 'element',
    name: 'Relationship',
    attributes: {
      Id: newId,
      Type: mappedType,
      Target: target,
    },
  };

  // Insert the new relationship
  relationshipsTag.elements.push(newRel);

  return newId;
};

/**
 * Generate a new relationship ID for the document.
 * This will be in the format rIdX where X is the next available integer.
 * @param {Editor} editor The editor instance
 * @returns {string} The new relationship ID
 */
export const getNewRelationshipId = (editor) => {
  const relationships = getDocumentRelationshipElements(editor);
  const maxIdInt = getMaxRelationshipIdInt(relationships);
  return `rId${maxIdInt + 1}`;
};
