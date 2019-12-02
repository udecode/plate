/**
 * Map of all block types. Blocks can contain inlines or blocks.
 */

export enum BLOCKS {
  DOCUMENT = 'document',
  TEXT = 'unstyled',
  // Classic blocks
  CODE = 'code_block',
  CODE_LINE = 'code_line',
  BLOCKQUOTE = 'blockquote',
  PARAGRAPH = 'paragraph',
  FOOTNOTE = 'footnote',
  HTML = 'html_block',
  HR = 'hr',
  // Headings
  HEADING_1 = 'header_one',
  HEADING_2 = 'header_two',
  HEADING_3 = 'header_three',
  HEADING_4 = 'header_four',
  HEADING_5 = 'header_five',
  HEADING_6 = 'header_six',
  // Table
  TABLE = 'table',
  TABLE_ROW = 'table_row',
  TABLE_CELL = 'table_cell',
  // Lists
  OL_LIST = 'ordered_list',
  UL_LIST = 'unordered_list',
  LIST_ITEM = 'list_item',

  // Default block
  DEFAULT = 'paragraph',

  // Special
  IMAGE = 'image',
  VIDEO = 'video',
  FLASHCARD = 'flashcard',
  FLASHCARD_FRONT = 'flashcard_front',
  FLASHCARD_BACK = 'flashcard_back',
}

export enum VIDEOS {
  YOUTUBE = 'youtube',
  DAILYMOTION = 'dailymotion',
  YOUKU = 'youku',
  VIMEO = 'vimeo',
}
