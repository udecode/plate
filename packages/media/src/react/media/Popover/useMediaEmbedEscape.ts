import {
  focusEditor,
  useEditorPlugin,
  useHotkeys,
} from '@udecode/plate-common/react';

import { MediaEmbedPlugin } from '../MediaEmbedPlugin';

export const useMediaEmbedEscape = () => {
  const { editor, setOptions, useOption } = useEditorPlugin(MediaEmbedPlugin);

  const isOpen = useOption('isOpen');

  useHotkeys(
    'escape',
    () => {
      setOptions({ isOpen: false, url: '' });
      focusEditor(editor);
    },
    {
      enableOnFormTags: ['INPUT'],
      enabled: isOpen,
    },
    []
  );
};
