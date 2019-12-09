export const TextFormat = {
  BOLD: 'bold',
  ITALIC: 'italic',
  UNDERLINED: 'underlined',
  STRIKETHROUGH: 'strikethrough',
  CODE: 'code',

  FONTBGCOLOR: 'FONTBGCOLOR',
  FONTCOLOR: 'FONTCOLOR',
  FONTSIZE: 'FONTSIZE',
};
export enum ListFormat {
  OL_LIST = 'numbered-list',
  UL_LIST = 'bulleted-list',
}
export const BlockFormat = {
  // Classic blocks
  PARAGRAPH: 'paragraph',
  BLOCK_QUOTE: 'block-quote',

  // Headings
  HEADING_1: 'heading-one',
  HEADING_2: 'heading-two',

  // Table
  TABLE: 'table',
  TABLE_ROW: 'table-row',
  TABLE_CELL: 'table-cell',

  // Lists
  ...ListFormat,
  LIST_ITEM: 'list-item',
};
