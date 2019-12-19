import React from 'react';
import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { RenderElementProps, SlatePlugin } from 'slate-react';
import { ImageElement } from './ImageElement';
import { insertImage } from './transforms';
import { isImageUrl } from './utils';

export const withImage = (editor: Editor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = element => {
    return element.type === ElementType.IMAGE ? true : isVoid(element);
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result;
            if (url) insertImage(editor, url);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

export const renderElementImage = (props: RenderElementProps) => {
  const { element } = props;

  if (element.type === ElementType.IMAGE) {
    return <ImageElement {...props} />;
  }
};

export const ImagePlugin = (): SlatePlugin => ({
  editor: withImage,
  renderElement: renderElementImage,
});
