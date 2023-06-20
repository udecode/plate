import { useEffect } from 'react';
import {
  findNodePath,
  isDefined,
  setNodes,
  usePlateEditorRef,
} from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';
import { TCloudAttachmentElement, useUpload } from '..';

export const useCloudAttachmentElementState = ({
  element,
}: {
  element: TCloudAttachmentElement;
}) => {
  const editor = usePlateEditorRef();

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
    if (isDefined(url) && !url.startsWith('blob:') && url !== element.url) {
      const path = findNodePath(editor, element);
      setNodes<TCloudAttachmentElement>(
        editor,
        { url },
        {
          at: path,
        }
      );
    }
  }, [editor, element, url]);

  const selected = useSelected();
  const focused = useFocused();

  return {
    focused,
    selected,
    upload,
  };
};
