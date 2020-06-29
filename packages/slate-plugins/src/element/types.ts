import { Editor } from 'slate';

export const DEFAULT_ELEMENT = 'p';

export interface ToggleTypeEditor extends Editor {
  /**
   * Toggle the type of the selected nodes.
   */
  toggleType: (activeType: string, defaultType?: string) => void;
}
