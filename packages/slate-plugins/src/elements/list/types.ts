export enum ListType {
  OL_LIST = 'numbered-list',
  UL_LIST = 'bulleted-list',
  LIST_ITEM = 'list-item',
}

export interface RenderElementListOptions {
  UL?: any;
  OL?: any;
  LI?: any;
}
