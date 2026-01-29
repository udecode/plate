import { translateParagraphNode } from '../../exporter.js';
import { carbonCopy } from '../../../utilities/carbonCopy.js';
import { COMMENT_REF, COMMENTS_XML_DEFINITIONS } from '../../exporter-docx-defs.js';
import { generateRandom32BitHex } from '../../../helpers/generateDocxRandomId.js';

/**
 * Generate the end node for a comment
 *
 * @param {Object} params The export params
 * @returns {Object} The translated w:commentRangeEnd node for the comment
 */
export function translateCommentNode(params, type) {
  const { node, commentsExportType, exportedCommentDefs = [] } = params;

  if (!exportedCommentDefs.length || commentsExportType === 'clean') return;

  const nodeId = node.attrs['w:id'];

  // Check if the comment is resolved
  const originalComment = params.comments.find((comment) => {
    return comment.commentId == nodeId;
  });

  if (!originalComment) return;

  const commentIndex = params.comments?.findIndex((comment) => comment.commentId === originalComment.commentId);
  const parentId = originalComment.parentCommentId;
  let parentComment;
  if (parentId) {
    parentComment = params.comments.find((c) => c.commentId === parentId || c.importedId === parentId);
  }

  const isInternal = parentComment?.isInternal || originalComment.isInternal;
  if (commentsExportType === 'external' && isInternal) return;

  const isResolved = !!originalComment.resolvedTime;
  if (isResolved) return;

  let commentSchema = getCommentSchema(type, commentIndex);
  if (type === 'End') {
    const commentReference = {
      name: 'w:r',
      elements: [{ name: 'w:commentReference', attributes: { 'w:id': String(commentIndex) } }],
    };
    commentSchema = [commentSchema, commentReference];
  }
  return commentSchema;
}

/**
 * Generate a w:commentRangeStart or w:commentRangeEnd node
 *
 * @param {string} type Must be 'Start' or 'End'
 * @param {string} commentId The comment ID
 * @returns {Object} The comment node
 */
const getCommentSchema = (type, commentId) => {
  return {
    name: `w:commentRange${type}`,
    attributes: {
      'w:id': String(commentId),
    },
  };
};

/**
 * Insert w15:paraId into the comments
 *
 * @param {Object} comment The comment to update
 * @returns {Object} The updated comment
 */
export const prepareCommentParaIds = (comment) => {
  const newComment = {
    ...comment,
    commentParaId: generateRandom32BitHex(),
  };
  return newComment;
};

/**
 * Generate the w:comment node for a comment
 * This is stored in comments.xml
 *
 * @param {Object} comment The comment to export
 * @param {string} commentId The index of the comment
 * @returns {Object} The w:comment node for the comment
 */
export const getCommentDefinition = (comment, commentId, allComments, editor) => {
  const translatedText = translateParagraphNode({ editor, node: comment.commentJSON });
  const attributes = {
    'w:id': String(commentId),
    'w:author': comment.creatorName || comment.importedAuthor?.name,
    'w:email': comment.creatorEmail || comment.importedAuthor?.email,
    'w:date': toIsoNoFractional(comment.createdTime),
    'w:initials': getInitials(comment.creatorName),
    'w:done': comment.resolvedTime ? '1' : '0',
    'w15:paraId': comment.commentParaId,
    'custom:internalId': comment.commentId || comment.internalId,
    'custom:trackedChange': comment.trackedChange,
    'custom:trackedChangeText': comment.trackedChangeText || null,
    'custom:trackedChangeType': comment.trackedChangeType,
    'custom:trackedDeletedText': comment.deletedText || null,
  };

  // Add the w15:paraIdParent attribute if the comment has a parent
  if (comment?.parentCommentId) {
    const parentComment = allComments.find((c) => c.commentId === comment.parentCommentId);
    attributes['w15:paraIdParent'] = parentComment.commentParaId;
  }

  return {
    type: 'element',
    name: 'w:comment',
    attributes,
    elements: [translatedText],
  };
};

/**
 * Get the initials of a name
 *
 * @param {string} name The name to get the initials of
 * @returns {string | null} The initials of the name
 */
export const getInitials = (name) => {
  if (!name) return null;

  const preparedText = name.replace('(imported)', '').trim();
  const initials = preparedText
    .split(' ')
    .map((word) => word[0])
    .join('');
  return initials;
};

/**
 * Convert a unix date to an ISO string without milliseconds
 *
 * @param {number} unixMillis The date to convert
 * @returns {string} The date as an ISO string without milliseconds
 */
export const toIsoNoFractional = (unixMillis) => {
  const date = new Date(unixMillis || Date.now());
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

/**
 * Updates or creates the `word/comments.xml` entry in a docx file structure.
 *
 * @param {Object[]} commentDefs - An array of comment definition objects.
 * @param {Object} convertedXml - The entire XML object representing the docx file structure.
 * @returns {Object} - The updated portion of the comments XML structure.
 */
export const updateCommentsXml = (commentDefs = [], commentsXml) => {
  const newCommentsXml = carbonCopy(commentsXml);

  // Re-build the comment definitions
  commentDefs.forEach((commentDef) => {
    const elements = commentDef.elements[0].elements;
    elements.unshift(COMMENT_REF);

    const paraId = commentDef.attributes['w15:paraId'];
    commentDef.elements[0].attributes['w14:paraId'] = paraId;

    commentDef.attributes = {
      'w:id': commentDef.attributes['w:id'],
      'w:author': commentDef.attributes['w:author'],
      'w:email': commentDef.attributes['w:email'],
      'w:date': commentDef.attributes['w:date'],
      'w:initials': commentDef.attributes['w:initials'],
      'custom:internalId': commentDef.attributes['custom:internalId'],
      'custom:trackedChange': commentDef.attributes['custom:trackedChange'],
      'custom:trackedChangeText': commentDef.attributes['custom:trackedChangeText'],
      'custom:trackedChangeType': commentDef.attributes['custom:trackedChangeType'],
      'custom:trackedDeletedText': commentDef.attributes['custom:trackedDeletedText'],
      'xmlns:custom': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    };
  });

  newCommentsXml.elements[0].elements = commentDefs;
  return newCommentsXml;
};

/**
 * This function updates the commentsExtended.xml structure with the comments list.
 *
 * @param {Array[Object]} comments The comments list
 * @param {Object} commentsExtendedXml The commentsExtended.xml structure as JSON
 * @returns {Object} The updated commentsExtended structure
 */
export const updateCommentsExtendedXml = (comments = [], commentsExtendedXml) => {
  const xmlCopy = carbonCopy(commentsExtendedXml);

  // Re-build the comment definitions
  const commentsEx = comments.map((comment) => {
    const attributes = {
      'w15:paraId': comment.commentParaId,
      'w15:done': comment.resolvedTime ? '1' : '0',
    };

    const parentId = comment.parentCommentId;
    if (parentId) {
      const parentComment = comments.find((c) => c.commentId === parentId);
      attributes['w15:paraIdParent'] = parentComment.commentParaId;
    }

    return {
      type: 'element',
      name: 'w15:commentEx',
      attributes,
    };
  });

  xmlCopy.elements[0].elements = commentsEx;
  return xmlCopy;
};

/**
 * Update commentsIds.xml and commentsExtensible.xml together since they have to
 * share the same durableId for each comment.
 *
 * @param {Array[Object]} comments The comments list
 * @param {Object} commentsIds The commentsIds.xml structure as JSON
 * @param {Object} extensible The commentsExtensible.xml structure as JSON
 * @returns {Object} The updated commentsIds and commentsExtensible structures
 */
export const updateCommentsIdsAndExtensible = (comments = [], commentsIds, extensible) => {
  const documentIdsUpdated = carbonCopy(commentsIds);
  const extensibleUpdated = carbonCopy(extensible);

  documentIdsUpdated.elements[0].elements = [];
  extensibleUpdated.elements[0].elements = [];
  comments.forEach((comment) => {
    const newDurableId = generateRandom32BitHex();
    const newCommentIdDef = {
      type: 'element',
      name: 'w16cid:commentId',
      attributes: {
        'w16cid:paraId': comment.commentParaId,
        'w16cid:durableId': newDurableId,
      },
    };
    documentIdsUpdated.elements[0].elements.push(newCommentIdDef);

    const newExtensible = {
      type: 'element',
      name: 'w16cex:commentExtensible',
      attributes: {
        'w16cex:durableId': newDurableId,
        'w16cex:dateUtc': toIsoNoFractional(),
      },
    };
    extensibleUpdated.elements[0].elements.push(newExtensible);
  });

  return {
    documentIdsUpdated,
    extensibleUpdated,
  };
};

/**
 * Generate the ocument.xml.rels definition
 *
 * @returns {Object} The updated document rels XML structure
 */
export const updateDocumentRels = () => {
  return COMMENTS_XML_DEFINITIONS.DOCUMENT_RELS_XML_DEF;
};

/**
 * Generate initial comments XML structure with no content
 *
 * @param {Object} convertedXml The converted XML structure of the docx file
 * @returns {Object} The updated XML structure with the comments files
 */
export const generateConvertedXmlWithCommentFiles = (convertedXml) => {
  const newXml = carbonCopy(convertedXml);
  newXml['word/comments.xml'] = COMMENTS_XML_DEFINITIONS.COMMENTS_XML_DEF;
  newXml['word/commentsExtended.xml'] = COMMENTS_XML_DEFINITIONS.COMMENTS_EXTENDED_XML_DEF;
  newXml['word/commentsExtensible.xml'] = COMMENTS_XML_DEFINITIONS.COMMENTS_EXTENSIBLE_XML_DEF;
  newXml['word/commentsIds.xml'] = COMMENTS_XML_DEFINITIONS.COMMENTS_IDS_XML_DEF;
  newXml['[Content_Types].xml'] = COMMENTS_XML_DEFINITIONS.CONTENT_TYPES;
  return newXml;
};

/**
 * Get the comments files converted to XML
 *
 * @param {Object} converter The converter instance
 * @returns {Object} The comments files converted to XML
 */
export const getCommentsFilesConverted = (converter, convertedXml) => {
  const commentsXml = convertedXml['word/comments.xml'];
  const commentsExtendedXml = convertedXml['word/commentsExtended.xml'];
  const commentsIdsXml = convertedXml['word/commentsExtensible.xml'];
  const commentsExtensibleXml = convertedXml['word/commentsIds.xml'];
  const contentTypes = convertedXml['[Content_Types].xml'];

  return {
    ...convertedXml,
    'word/comments.xml': converter.schemaToXml(commentsXml.elements[0]),
    'word/commentsExtended.xml': converter.schemaToXml(commentsExtendedXml.elements[0]),
    'word/commentsIds.xml': converter.schemaToXml(commentsIdsXml.elements[0]),
    'word/commentsExtensible.xml': converter.schemaToXml(commentsExtensibleXml.elements[0]),
    '[Content_Types].xml': converter.schemaToXml(contentTypes.elements[0]),
  };
};

/**
 * Remove comments files from the converted XML
 *
 * @param {Object} convertedXml The converted XML structure of the docx file
 * @returns {Object} The updated XML structure with the comments files removed
 */
export const removeCommentsFilesFromConvertedXml = (convertedXml) => {
  const updatedXml = carbonCopy(convertedXml);

  delete updatedXml['word/comments.xml'];
  delete updatedXml['word/commentsExtended.xml'];
  delete updatedXml['word/commentsExtensible.xml'];
  delete updatedXml['word/commentsIds.xml'];

  return updatedXml;
};

/**
 * Generate a relationship for a comments file target
 *
 * @param {String} target The target of the relationship
 * @returns {Object} The generated relationship
 */
export const generateRelationship = (target) => {
  const relsDefault = COMMENTS_XML_DEFINITIONS.DOCUMENT_RELS_XML_DEF.elements[0].elements;
  const rel = relsDefault.find((rel) => rel.attributes.Target === target);
  return { ...rel };
};

/**
 * Generate comments files into convertedXml
 *
 * @param {Object} param0
 * @returns
 */
export const prepareCommentsXmlFilesForExport = ({ convertedXml, defs, commentsWithParaIds, exportType }) => {
  const relationships = [];

  // If we're exporting clean, simply remove the comments files
  if (exportType === 'clean') {
    const documentXml = removeCommentsFilesFromConvertedXml(convertedXml);
    return { documentXml, relationships };
  }

  // Initialize comments files with empty content
  const updatedXml = generateConvertedXmlWithCommentFiles(convertedXml);

  // Update comments.xml
  updatedXml['word/comments.xml'] = updateCommentsXml(defs, updatedXml['word/comments.xml']);
  relationships.push(generateRelationship('comments.xml'));

  // Uodate commentsExtended.xml
  updatedXml['word/commentsExtended.xml'] = updateCommentsExtendedXml(
    commentsWithParaIds,
    updatedXml['word/commentsExtended.xml'],
  );
  relationships.push(generateRelationship('commentsExtended.xml'));

  // Generate updates for documentIds.xml and commentsExtensible.xml here
  // We do them at the same time as we need them to generate and share durable IDs between them
  const { documentIdsUpdated, extensibleUpdated } = updateCommentsIdsAndExtensible(
    commentsWithParaIds,
    updatedXml['word/commentsIds.xml'],
    updatedXml['word/commentsExtensible.xml'],
  );
  updatedXml['word/commentsIds.xml'] = documentIdsUpdated;
  updatedXml['word/commentsExtensible.xml'] = extensibleUpdated;
  relationships.push(generateRelationship('commentsIds.xml'));
  relationships.push(generateRelationship('commentsExtensible.xml'));

  // Generate export-ready files
  return {
    relationships,
    documentXml: updatedXml,
  };
};
