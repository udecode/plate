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

export const ElementType = {
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

  CHECK_LIST_ITEM: 'check-list-item',

  IMAGE: 'image',
  VIDEO: 'video',

  // Inlines
  LINK: 'link',
  HTML: 'html',
  EMOJI: 'emoji',
};
