import { SPEditor } from '../../plugins/useSlatePluginsPlugin';
import { TNode } from '../TNode';

/**
 * Function called whenever a change occurs in the editor.
 * To prevent the next handler from running, return false.
 * @see {@link SlatePropsOnChange}
 */
export type OnChange = (editor: SPEditor) => (value: TNode[]) => boolean | void;
