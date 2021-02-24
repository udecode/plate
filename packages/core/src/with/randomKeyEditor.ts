import { Editor } from 'slate';

export interface RandomKeyEditor {
  key: any;
}

export const withRandomKey = <T extends Editor>(e: T) => {
  const editor = e as T & RandomKeyEditor;

  if (!editor.key) {
    editor.key = Math.random();
  }

  return editor;
};
