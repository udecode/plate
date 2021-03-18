import { Editor } from 'slate';
import { OnChange } from '../types/SlatePlugin/OnChange';

export const onChangePlugins = (
  editor: Editor,
  onChangeList: (OnChange | undefined)[]
): ReturnType<OnChange> => (nodes) => {
  onChangeList.some((onChange) => onChange?.(editor)(nodes) === false);
};
