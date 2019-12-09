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
  ...ListFormat,
  HEADING_1: 'heading-one',
  HEADING_2: 'heading-two',
  BLOCK_QUOTE: 'block-quote',
};
// LIST_ITEM = 'list_item',
