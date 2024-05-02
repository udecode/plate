import { TElement } from '@udecode/plate-common/server';

export interface TColumnElement extends TElement {
  id?: string;
  type: 'column';
  width: string;
}

export interface TColumnGroupElement extends TElement {
  id?: string;
  type: 'column_group';
  layout?: number[];
  children: TColumnElement[];
}
