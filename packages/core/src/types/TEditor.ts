import { Editor } from 'slate';

export type TEditor<TExtension = {}> = Editor &
  TExtension & {
    [key: string]: any;
  };
