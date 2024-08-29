import React from 'react';

import { setNodes } from '@udecode/plate-common';
import { findNodePath, useEditorRef } from '@udecode/plate-common/react';
import { useFocused, useSelected } from 'slate-react';

import { type TCloudImageElement, generateSrcAndSrcSet, useUpload } from '..';

export const useCloudImageElementState = ({
  element,
}: {
  element: TCloudImageElement;
}) => {
  const editor = useEditorRef();
  const upload = useUpload(element.url);

  const url = upload.status === 'not-found' ? undefined : upload.url;

  React.useEffect(() => {
    /**
     * We only want to update the actual URL of the element if the URL is not a
     * blob URL and if it's different from the current URL.
     *
     * NOTE:
     *
     * If the user does an undo, this may cause some issues. The ideal solution
     * is to change the URL once the upload is complete to the final URL and
     * change the edit history so that the initial insertion of the cloud image
     * appears to have the final URL.
     */
    if (
      typeof url === 'string' &&
      !url.startsWith('blob:') &&
      url !== element.url
    ) {
      const path = findNodePath(editor, element);
      setNodes<TCloudImageElement>(
        editor,
        { url },
        {
          at: path,
        }
      );
    }
  }, [editor, element, url]);

  const [size, setSize] = React.useState<{ height: number; width: number }>({
    height: element.height,
    width: element.width,
  });

  React.useEffect(() => {
    setSize({ height: element.height, width: element.width });
  }, [element.width, element.height]);

  const selected = useSelected();
  const focused = useFocused();

  const { src, srcSet } = generateSrcAndSrcSet({
    maxSize: [element.maxWidth, element.maxHeight],
    size: [element.width, element.height],
    url: upload.status === 'not-found' ? undefined : upload.url,
  });

  return {
    focused,
    selected,
    setSize,
    size,
    src,
    srcSet,
    upload,
  };
};
