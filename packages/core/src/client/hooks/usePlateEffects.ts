import React from 'react';

import type { Value } from '@udecode/slate';

import { isDefined } from '@udecode/utils';

import type { PlateEditor } from '../../shared';
import type { PlateProps } from '../components';

import { useEditorRef, usePlateStates } from '../stores';
import { setPlatePlugins } from '../utils';

export type UsePlateEffectsProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = Pick<PlateProps<V, E>, 'disableCorePlugins' | 'id' | 'plugins'>;

export const usePlateEffects = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>({
  disableCorePlugins,
  id,
  plugins: pluginsProp,
}: UsePlateEffectsProps<V, E>) => {
  const editor = useEditorRef<V, E>(id);

  const states = usePlateStates(id);
  const [rawPlugins, setRawPlugins] = states.rawPlugins();
  const [, setPlugins] = states.plugins();

  React.useEffect(() => {
    if (isDefined(pluginsProp) && pluginsProp !== rawPlugins) {
      setRawPlugins(rawPlugins);

      setPlatePlugins<V, E>(editor, {
        disableCorePlugins,
        plugins: pluginsProp,
      });
      setPlugins(editor.plugins as any);
    }
  }, [
    disableCorePlugins,
    editor,
    rawPlugins,
    pluginsProp,
    setPlugins,
    setRawPlugins,
  ]);
};
