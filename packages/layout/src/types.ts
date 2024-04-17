import { TElement } from '@udecode/plate-common';

export interface TColumnElement extends TElement {
  id?: string;
  type: 'column';
  width: string;
}

export interface TColumnGroupElement extends TElement {
  id?: string;
  type: 'column_group';
  layout?: '1-1' | '1-1-1' | '3-1' | '1-3' | '1-2-1';
  children: TColumnElement[];
}
