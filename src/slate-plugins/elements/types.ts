import { Editor } from 'slate';

export interface ToggleBlockEditor extends Editor {
  toggleBlock: (format: string) => void;
}
