import imageExtensions from 'image-extensions';
import isUrl from 'is-url';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import type { PointerEvent } from 'react';
import { defineEditorExtension } from '@platejs/plite';
import {
  Editable,
  type RenderElementProps,
  type RenderVoidProps,
  Plite,
  useEditor,
  useEditorFocused,
  useElementSelected,
  usePliteEditor,
} from '@platejs/plite-react';

import { cn } from '@/utils/cn';

import { Button, Icon, Toolbar } from './components';
import type {
  CustomEditor,
  CustomElement,
  ImageElement,
  ParagraphElement,
} from './custom-types.d';
import { replaceQueryOptions } from './query-controls';

const imageExampleCases = ['default', 'adjacent-voids', 'edge-voids'] as const;

type ImageExampleCase = (typeof imageExampleCases)[number];

const firstExampleImageUrl = 'https://picsum.photos/id/1015/160/90.jpg';
const secondExampleImageUrl = 'https://picsum.photos/id/1025/160/90.jpg';
const thirdExampleImageUrl = 'https://picsum.photos/id/1069/160/90.jpg';

const createInitialValue = (exampleCase: ImageExampleCase): CustomElement[] => {
  if (exampleCase === 'adjacent-voids') {
    return [
      {
        type: 'paragraph',
        children: [{ text: 'Before adjacent images.' }],
      },
      {
        type: 'image',
        url: firstExampleImageUrl,
        children: [{ text: '' }],
      },
      {
        type: 'image',
        url: secondExampleImageUrl,
        children: [{ text: '' }],
      },
      {
        type: 'image',
        url: thirdExampleImageUrl,
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'After adjacent images.' }],
      },
    ];
  }

  if (exampleCase === 'edge-voids') {
    return [
      {
        type: 'image',
        url: firstExampleImageUrl,
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Between edge images.' }],
      },
      {
        type: 'image',
        url: secondExampleImageUrl,
        children: [{ text: '' }],
      },
    ];
  }

  return [
    {
      type: 'paragraph',
      children: [
        {
          text: 'In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos.',
        },
      ],
    },
    {
      type: 'image',
      url: firstExampleImageUrl,
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your clipboard and paste it anywhere in the editor!',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'You can delete images with the cross in the top left. Try deleting this image:',
        },
      ],
    },
    {
      type: 'image',
      url: secondExampleImageUrl,
      children: [{ text: '' }],
    },
  ];
};

const ImagesExample = () => {
  const [exampleCase] = useQueryState(
    'case',
    parseAsStringLiteral(imageExampleCases)
      .withDefault('default')
      .withOptions(replaceQueryOptions)
  );

  return <ImagesEditor exampleCase={exampleCase} key={exampleCase} />;
};

const ImagesEditor = ({ exampleCase }: { exampleCase: ImageExampleCase }) => {
  const editor = usePliteEditor({
    extensions: [image()],
    initialValue: createInitialValue(exampleCase),
  });

  return (
    <Plite editor={editor}>
      <Toolbar>
        <InsertImageButton />
      </Toolbar>
      <Editable
        placeholder="Enter some text..."
        renderElement={renderElement}
        renderVoid={renderVoid}
      />
    </Plite>
  );
};

const image = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'image',
    clipboard: {
      insertData(data, { editor, next }) {
        const text = data.getData('text/plain');
        const imageFiles = Array.from(data.files ?? []).filter(
          (file) => file.type.split('/')[0] === 'image'
        );

        if (imageFiles.length > 0) {
          imageFiles.forEach((file) => {
            const reader = new FileReader();

            reader.addEventListener('load', () => {
              const url = reader.result;
              insertImage(editor, url as string);
            });

            reader.readAsDataURL(file);
          });
          return true;
        }

        if (isImageUrl(text)) {
          insertImage(editor, text);
          return true;
        }
        return next();
      },
    },
    elements: [{ type: 'image', void: 'block' }],
  });

const renderElement = (props: RenderElementProps<CustomElement>) => {
  switch (props.element.type) {
    case 'paragraph':
      return <Paragraph {...(props as RenderElementProps<ParagraphElement>)} />;
    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

const renderVoid = ({ element }: RenderVoidProps<CustomElement>) => {
  switch (element.type) {
    case 'image':
      return <Image element={element as ImageElement} />;
    default:
      return null;
  }
};

const insertImage = (editor: CustomEditor, url: string) => {
  editor.update((tx) => {
    tx.nodes.insert({ type: 'image', url, children: [{ text: '' }] });
    tx.nodes.insert({ type: 'paragraph', children: [{ text: '' }] });
  });
};

const Paragraph = ({
  attributes,
  children,
}: RenderElementProps<ParagraphElement>) => <p {...attributes}>{children}</p>;

const Image = ({ element }: RenderVoidProps<ImageElement>) => {
  const editor = useEditor<CustomEditor>();
  const focused = useEditorFocused();
  const selected = useElementSelected({ mode: 'collapsed' });

  return (
    <div className="plite-images-figure">
      <img
        className={cn(
          'plite-images-image',
          selected && focused && 'is-selected'
        )}
        height={90}
        src={element.url}
        width={160}
      />
      <Button
        active
        className={cn(
          'plite-images-remove-button',
          selected && focused && 'is-visible'
        )}
        onClick={() => {
          const path = editor.api.dom.resolvePath(element);

          if (!path) {
            return;
          }

          editor.update((tx) => {
            tx.nodes.remove({ at: path, voids: true });
          });
        }}
        onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
          event.preventDefault();
        }}
      >
        <Icon>delete</Icon>
      </Button>
    </div>
  );
};

const InsertImageButton = () => {
  const editor = useEditor<CustomEditor>();
  return (
    <Button
      onClick={() => {
        const url = window.prompt('Enter the URL of the image:');
        if (url && !isImageUrl(url)) {
          alert('URL is not an image');
          return;
        }
        url && insertImage(editor, url);
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.preventDefault()
      }
    >
      <Icon>image</Icon>
    </Button>
  );
};

const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split('.').pop();
  return imageExtensions.includes(ext!);
};

export default ImagesExample;
