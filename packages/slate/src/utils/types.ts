import type { Editor } from '../interfaces/editor';

export type WithEditorFirstArg<T extends (...args: any) => any> = (
  editor: Editor,
  ...args: Parameters<T>
) => ReturnType<T>;
