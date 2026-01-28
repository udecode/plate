// @ts-check

/**
 * @typedef {'image' | 'hyperlink'} RelationshipType
 */

/**
 * Supported relationship types for .docx documents
 * @readonly
 */
export const RELATIONSHIP_TYPES = /** @type {const} */ ({
  image: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
  hyperlink: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
});
