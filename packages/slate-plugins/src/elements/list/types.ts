import { PARAGRAPH } from 'elements/paragraph';

export const ListHotkey = {
  TAB: 'Tab',
  ENTER: 'Enter',
  DELETE_BACKWARD: 'Backspace',
};

export enum ListType {
  OL = 'ol',
  UL = 'ul',
  LI = 'li',
}

export interface ListTypeOptions {
  typeUl?: string;
  typeOl?: string;
  typeLi?: string;
  typeP?: string;
}

export interface RenderElementListOptions extends ListTypeOptions {
  UL?: any;
  OL?: any;
  LI?: any;
}

export const defaultListTypes: ListTypeOptions = {
  typeUl: ListType.UL,
  typeOl: ListType.OL,
  typeLi: ListType.LI,
  typeP: PARAGRAPH,
};
