import { PARAGRAPH } from 'elements/paragraph';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

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

export const defaultListTypes: TypeOption = {
  typeUl: ListType.UL,
  typeOl: ListType.OL,
  typeLi: ListType.LI,
  typeP: PARAGRAPH,
};

// Data of Element node
export interface ListNodeData {}

// Element node
export interface ListNode extends Element, ListNodeData {}

// Option type
interface TypeOption {
  typeUl?: string;
  typeOl?: string;
  typeLi?: string;
  typeP?: string;
}

// deserialize options
export interface ListDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface ListRenderElementOptionsProps {}

// renderElement options
export interface ListRenderElementOptions
  extends ListRenderElementOptionsProps,
    TypeOption {
  UL?: any;
  OL?: any;
  LI?: any;
}

// renderElement props
export interface ListRenderElementProps
  extends RenderElementProps,
    ListRenderElementOptionsProps {
  element: ListNode;
}

export interface ListOnKeyDownOptions extends TypeOption {}

// Plugin options
export interface ListPluginOptions
  extends ListRenderElementOptions,
    ListDeserializeOptions,
    ListOnKeyDownOptions {}

export interface WithListOptions extends TypeOption {}
