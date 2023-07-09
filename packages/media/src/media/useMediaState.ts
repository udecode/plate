import { useEffect } from 'react';
import { useElement, usePlateEditorRef } from '@udecode/plate-common';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import { ELEMENT_MEDIA_EMBED } from '../media-embed/index';
import { useMediaStore } from './mediaStore';
import { parseMediaUrl } from './parseMediaUrl';
import { TMediaElement } from './types';

export const useMediaState = ({
  pluginKey = ELEMENT_MEDIA_EMBED,
}: {
  pluginKey?: string;
} = {}) => {
  const editor = usePlateEditorRef();
  const element = useElement<TMediaElement>();
  const { provider } = useMediaStore().get.urlData();
  const setUrlData = useMediaStore().set.urlData();
  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();

  const { url: elementUrl } = element;

  useEffect(() => {
    const parsed = parseMediaUrl(editor, {
      pluginKey,
      url: elementUrl,
    });

    if (parsed) {
      setUrlData(parsed);
    }
  }, [editor, elementUrl, pluginKey, setUrlData]);

  return {
    focused,
    selected,
    readOnly,
    provider,
  };
};
