import { Element } from 'slate';
import { TDescendant } from './TDescendant';

export type TElement<TExtension = {}> = Element &
  TExtension & {
    [key: string]: any;
    type: string;
    children: TDescendant[];
  };

export const isElement: <TExtension = {}>(
  value: any
) => value is TElement<TExtension> = Element.isElement as any;
