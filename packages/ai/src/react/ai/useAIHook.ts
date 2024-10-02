import { useEffect } from 'react';

import { useEditorPlugin } from '@udecode/plate-common/react';

import { type AIPluginConfig, AIPlugin } from './AIPlugin';

export const useAIHooks = () => {
  const { getOptions, setOptions } = useEditorPlugin<AIPluginConfig>(AIPlugin);
  useEffect(() => {
    setTimeout(() => {
      const editor = getOptions().createAIEditor();
      setOptions({ aiEditor: editor });
    }, 0);
  }, [setOptions, getOptions]);
};
