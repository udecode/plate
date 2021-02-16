import { Editor } from 'slate';
import { OnDOMBeforeInput } from '../types/OnDOMBeforeInput';

/**
 * @see {@link OnDOMBeforeInput}
 */
export const onDOMBeforeInputPlugins = (
  editor: Editor,
  onDOMBeforeInputList: (OnDOMBeforeInput | undefined)[]
) => (event: Event) => {
  onDOMBeforeInputList.some(
    (onDOMBeforeInput) => onDOMBeforeInput?.(event, editor) === false
  );
};
