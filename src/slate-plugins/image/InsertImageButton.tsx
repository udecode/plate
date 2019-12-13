import React from 'react';
import { useEditor } from 'slate-react';
import { Button, Icon } from '../../components/components';

export const InsertImageButton = () => {
  const editor = useEditor();
  return (
    <Button
      onMouseDown={(event: Event) => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        editor.exec({ type: 'insert_image', url });
      }}
    >
      <Icon>image</Icon>
    </Button>
  );
};
