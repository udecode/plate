/**
 * Map of all inline node types. Inline nodes can only contain inline or text nodes.
 * @type {Map}
 */

export enum INLINES {
  HTML = 'html',
  LINK = 'link',
  FOOTNOTE_REF = 'footnote-ref',
  MATH = 'math',
  TEMPLATE = 'template',
  EMOJI = 'emoji',
}
