import React from 'react';
import { Image } from '@material-ui/icons';
import { Button } from 'slate-plugins/common/components/Button';
import { useEditor } from 'slate-react';
import { insertImage } from './transforms';

export const InsertImageButton = () => {
  const editor = useEditor();

  return (
    <Button
      onMouseDown={(event: Event) => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        insertImage(editor, url);
      }}
    >
      <Image />
    </Button>
  );
};
