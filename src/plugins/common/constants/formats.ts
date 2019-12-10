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
  CODE: 'code',

  // Headings
  HEADING_1: 'heading-one',
  HEADING_2: 'heading-two',
  HEADING_3: 'header-three',
  HEADING_4: 'header-four',
  HEADING_5: 'header-five',
  HEADING_6: 'header-six',

  // Table
  TABLE: 'table',
  TABLE_ROW: 'table-row',
  TABLE_CELL: 'table-cell',

  // Lists
  ...ListFormat,
  LIST_ITEM: 'list-item',

  IMAGE: 'image',
};

export enum InlineFormat {
  HTML = 'html',
  LINK = 'link',
  EMOJI = 'emoji',
}
