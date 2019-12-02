const BLOCKS = require('./blocks');

const ALL_BLOCKS = Object.values(BLOCKS);

/**
 * Map of all block nodes that contains only blocks as children.
 * The value is the default block type.
 *
 * @type {Map<String:Array>}
 */

export const CONTAINERS = {
  [BLOCKS.DOCUMENT]: [BLOCKS.PARAGRAPH, ...ALL_BLOCKS],
  [BLOCKS.BLOCKQUOTE]: [BLOCKS.TEXT, ...ALL_BLOCKS],
  [BLOCKS.TABLE]: [BLOCKS.TABLE_ROW],
  [BLOCKS.TABLE_ROW]: [BLOCKS.TABLE_CELL],
  [BLOCKS.LIST_ITEM]: [BLOCKS.TEXT, ...ALL_BLOCKS],
  [BLOCKS.OL_LIST]: [BLOCKS.LIST_ITEM],
  [BLOCKS.UL_LIST]: [BLOCKS.LIST_ITEM],
};
