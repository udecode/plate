import { useEffect } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  PlateRenderElementProps,
  useEditorRef,
  useElement,
  useElementProps,
  Value,
} from '@udecode/plate-common';
import { ELEMENT_MEDIA_EMBED } from '../media-embed/index';
import { Resizable } from '../resizable/Resizable';
import { useMediaStore } from './mediaStore';
import { parseMediaUrl } from './parseMediaUrl';
import { TMediaElement } from './types';

export type MediaRootProps = PlateRenderElementProps<Value, TMediaElement> &
  HTMLPropsAs<'div'> & {
    pluginKey?: string;
  };

export const useMedia = ({
  pluginKey = ELEMENT_MEDIA_EMBED,
  ...props
}: MediaRootProps): HTMLPropsAs<'iframe'> => {
  const editor = useEditorRef();
  const element = useElement<TMediaElement>();
  const setUrlData = useMediaStore().set.urlData();
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

  return useElementProps(props as any);
};

export const MediaRoot = createComponentAs<
  PlateRenderElementProps<Value, TMediaElement> & HTMLPropsAs<'div'>
>((props) => {
  const htmlProps = useMedia(props);

  return createElementAs('div', htmlProps);
});

export const Media = {
  Root: MediaRoot,
  Resizable,
};
