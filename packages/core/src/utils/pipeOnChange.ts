import { OnChange } from '../types/SlatePlugin/OnChange';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { flatMapByKey } from './flatMapByKey';

export const pipeOnChange = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): ReturnType<OnChange> => (nodes) => {
  flatMapByKey(plugins, 'onChange').some(
    (onChange) => onChange(editor)(nodes) === false
  );
};
