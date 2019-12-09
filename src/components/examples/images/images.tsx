/* eslint-disable no-alert */
import React, { useMemo, useState } from 'react';
import { css } from 'emotion';
import imageExtensions from 'image-extensions';
import isUrl from 'is-url';
import { createEditor, Editor, Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  RenderElementProps,
  Slate,
  useEditor,
  useFocused,
  useSelected,
  withReact,
} from 'slate-react';
import { Button, Icon, Toolbar } from '../../components';
import { initialValue } from './config';

const isImageUrl = (url: string) => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split('.').pop();
  if (!ext) return false;

  return imageExtensions.includes(ext);
};

const withImages = (editor: Editor) => {
  const { exec, isVoid } = editor;

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element);
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

            if (mime === 'image') {
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
        const image = { type: 'image', url, children: [text] };
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

const Element = (props: any) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case 'image':
      return <ImageElement {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const ImageElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={element.url}
          alt=""
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
          `}
        />
      </div>
      {children}
    </div>
  );
};

const InsertImageButton = () => {
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

export const Images = () => {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState<Range | null>(null);
  const editor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    []
  );

  return (
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(newValue, newSelection) => {
        setValue(newValue);
        setSelection(newSelection);
      }}
    >
      <Toolbar>
        <InsertImageButton />
      </Toolbar>
      <Editable
        renderElement={props => <Element {...props} />}
        placeholder="Enter some text..."
      />
    </Slate>
  );
};
