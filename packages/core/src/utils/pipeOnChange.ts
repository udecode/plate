import { OnChange } from '../types/SlatePlugin/OnChange';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

export const pipeOnChange = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): ReturnType<OnChange> => {
  const onChanges = plugins.flatMap(
    (plugin) => plugin.onChange?.(editor) ?? []
  );

  return (nodes) => {
    onChanges.some((onChange) => onChange(nodes) === false);
  };
};
