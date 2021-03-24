import { SPEditor } from '../plugins/useSlatePluginsPlugin';
import { OnChange } from '../types/SlatePlugin/OnChange';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { flatMapKey } from './flatMapKey';

export const onChangePlugins = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): ReturnType<OnChange> => (nodes) => {
  flatMapKey(plugins, 'onChange').some(
    (onChange) => onChange(editor)(nodes) === false
  );
};
