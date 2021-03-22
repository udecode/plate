import { Editor } from 'slate';
import { TDescendant } from './TDescendant';

export type TEditor<TExtension = {}> = Editor &
  TExtension & {
    [key: string]: any;
    children: TDescendant[];
  };
