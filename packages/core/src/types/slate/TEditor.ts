import { Editor } from 'slate';
import { AnyObject } from '../utility/AnyObject';
import { TDescendant } from './TDescendant';

export type TEditor<TExtension = AnyObject> = Editor &
  TExtension &
  AnyObject & {
    children: TDescendant[];
  };
