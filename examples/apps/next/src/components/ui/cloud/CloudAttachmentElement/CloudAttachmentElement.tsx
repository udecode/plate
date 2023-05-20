import React, { useEffect } from 'react';
import { TCloudAttachmentElement, useUpload } from '@udecode/plate-cloud';
import {
  findNodePath,
  isDefined,
  setNodes,
  Value,
} from '@udecode/plate-common';
import { cn, PlateElement, PlateElementProps } from '@udecode/plate-tailwind';
import { useFocused, useSelected } from 'slate-react';
import { StatusBar } from '../StatusBar';
import { AttachFileIcon } from './AttachFileIcon';
import { CloudDownloadIcon } from './CloudDownloadIcon';

export interface CloudAttachmentElementProps
  extends PlateElementProps<Value, TCloudAttachmentElement> {}

export function CloudAttachmentElement({
  className,
  ...props
}: CloudAttachmentElementProps) {
  const { children, editor, element } = props;

  const upload = useUpload(element.url);

  const url = upload.status !== 'not-found' ? upload.url : undefined;

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

  return (
    <PlateElement
      className={cn(
        'relative my-4 flex h-10 max-w-sm items-center gap-2 rounded-lg border border-solid border-gray-200 bg-white p-4',
        focused && selected && 'border-blue-400 shadow-[0_0_1px_3px_#60a5fa]',
        className
      )}
      draggable
      {...props}
    >
      <div className="shrink-0 text-gray-400" contentEditable={false}>
        <AttachFileIcon width={24} height={24} />
      </div>
      <div className="grow" contentEditable={false}>
        <div className="text-base">{element.filename}</div>
        <StatusBar upload={upload}>
          <div className="text-sm text-gray-500">{element.bytes} bytes</div>
        </StatusBar>
      </div>
      <div
        className="ml-4 h-8 w-8 shrink-0 duration-200"
        contentEditable={false}
      >
        {upload.status === 'success' && (
          <a href={element.url} target="_blank" rel="noreferrer">
            <CloudDownloadIcon
              className="cursor-pointer text-gray-400 hover:text-blue-500"
              width={24}
              height={24}
            />
          </a>
        )}
      </div>
      {children}
    </PlateElement>
  );
}
