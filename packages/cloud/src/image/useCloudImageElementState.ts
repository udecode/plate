import { useEffect, useState } from 'react';
import { findNodePath, setNodes, useEditorRef } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

import { generateSrcAndSrcSet, TCloudImageElement, useUpload } from '..';

export const useCloudImageElementState = ({
  element,
}: {
  element: TCloudImageElement;
}) => {
  const editor = useEditorRef();
  const upload = useUpload(element.url);

  const url = upload.status === 'not-found' ? undefined : upload.url;

  useEffect(() => {
    /**
     * We only want to update the actual URL of the element if the URL is not
     * a blob URL and if it's different from the current URL.
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

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: element.width,
    height: element.height,
  });

  useEffect(() => {
    setSize({ width: element.width, height: element.height });
  }, [element.width, element.height]);

  const selected = useSelected();
  const focused = useFocused();

  const { src, srcSet } = generateSrcAndSrcSet({
    url: upload.status === 'not-found' ? undefined : upload.url,
    size: [element.width, element.height],
    maxSize: [element.maxWidth, element.maxHeight],
  });

  return {
    focused,
    selected,
    src,
    srcSet,
    size,
    upload,
    setSize,
  };
};
