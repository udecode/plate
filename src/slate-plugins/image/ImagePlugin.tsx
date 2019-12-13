import React from 'react';
import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { Plugin, RenderElementProps } from 'slate-react';
import { ImageElement } from './ImageElement';
import { isImageUrl } from './utils';

export const withImage = (editor: Editor) => {
  const { exec, isVoid } = editor;

  editor.isVoid = element => {
    return element.type === ElementType.IMAGE ? true : isVoid(element);
  };

  editor.exec = command => {
    switch (command.type) {
      case 'insert_data': {
        const { data } = command;
        const text = data.getData('text/plain');
        const { files } = data;

        if (files && files.length > 0) {
          for (const file of files) {
            const reader = new FileReader();
            const [mime] = file.type.split('/');

            if (mime === ElementType.IMAGE) {
              reader.addEventListener('load', () => {
                const url = reader.result;
                editor.exec({ type: 'insert_image', url });
              });

              reader.readAsDataURL(file);
            }
          }
        } else if (isImageUrl(text)) {
          editor.exec({ type: 'insert_image', url: text });
        } else {
          exec(command);
        }

        break;
      }

      case 'insert_image': {
        const { url } = command;
        const text = { text: '' };
        const image = { type: ElementType.IMAGE, url, children: [text] };
        Editor.insertNodes(editor, image);
        break;
      }

      default: {
        exec(command);
        break;
      }
    }
  };

  return editor;
};

export const renderElementImage = (props: RenderElementProps) => {
  const { element } = props;

  switch (element.type) {
    case ElementType.IMAGE:
      return <ImageElement {...props} />;
    default:
      break;
  }
};

export const ImagePlugin = (): Plugin => ({
  editor: withImage,
  renderElement: renderElementImage,
});
