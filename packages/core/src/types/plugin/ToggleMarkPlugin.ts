import { Value } from '../../slate/editor/TEditor';
import { EMarks } from '../../slate/text/TText';
import { HotkeyPlugin } from './HotkeyPlugin';

export interface ToggleMarkPlugin<
  V extends Value = Value,
  K extends keyof EMarks<V> = keyof EMarks<V>
> extends HotkeyPlugin {
  /**
   * Node properties to delete.
   */
  clear?: K | K[];
}
