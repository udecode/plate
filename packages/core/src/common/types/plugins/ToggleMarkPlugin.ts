import { Value } from '../../../slate/types/TEditor';
import { EMarks } from '../../../slate/types/TText';
import { HotkeyPlugin } from './HotkeyPlugin';

export interface ToggleMarkPlugin<V extends Value, K extends keyof EMarks<V>>
  extends HotkeyPlugin {
  /**
   * Node properties to delete.
   */
  clear?: K | K[];
}
