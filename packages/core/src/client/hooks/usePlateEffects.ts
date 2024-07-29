import React from 'react';

import { isDefined } from '@udecode/utils';

import type { PlateProps } from '../components';

import { useEditorRef, usePlateStates } from '../stores';
import { setEditorPlugins } from '../utils';

export type UsePlateEffectsProps = Pick<
  PlateProps,
  'disableCorePlugins' | 'id' | 'plugins'
>;

export const usePlateEffects = ({
  disableCorePlugins,
  id,
  plugins: pluginsProp,
}: UsePlateEffectsProps) => {
  const editor = useEditorRef(id);

  const states = usePlateStates(id);
  const [rawPlugins, setRawPlugins] = states.rawPlugins();
  const [, setPlugins] = states.plugins();

  React.useEffect(() => {
    if (isDefined(pluginsProp) && pluginsProp !== rawPlugins) {
      setRawPlugins(rawPlugins);

      setEditorPlugins(editor, {
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
