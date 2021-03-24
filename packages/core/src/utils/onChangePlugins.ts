import { OnChange } from '../types/SlatePlugin/OnChange';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { flatMapKey } from './flatMapKey';

export const onChangePlugins = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): ReturnType<OnChange> => (nodes) => {
  flatMapKey(plugins, 'onChange').some(
    (onChange) => onChange(editor)(nodes) === false
  );
};
