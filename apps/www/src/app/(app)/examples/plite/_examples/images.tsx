import imageExtensions from 'image-extensions';
import isUrl from 'is-url';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { definePlugin } from 'plitejs';
import { domCommands } from 'plitejs/dom';
import {
  Editable,
  type RenderElementProps,
  type RenderVoidProps,
  EditorRoot,
  useEditorContext,
  useEditorFocused,
  useElementSelected,
  useEditor,
} from 'plitejs/react';
import type { PointerEvent } from 'react';

import { cn } from '@/utils/cn';

import { failInvariant } from '../../../../../lib/failInvariant';
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
  const editor = useEditor({
    plugins: [image()],
    initialValue: createInitialValue(exampleCase),
  });

  return (
    <EditorRoot editor={editor}>
      <Toolbar>
        <InsertImageButton />
      </Toolbar>
      <Editable
        placeholder="Enter some text..."
        renderElement={renderElement}
        renderVoid={renderVoid}
      />
    </EditorRoot>
  );
};

const ImagePlugin = definePlugin('image', {
  schema: { elements: { image: { void: 'block' } } },
  update: ({ context: { afterCommit }, editor, tx }) => ({
    insertFromClipboard(sources: Array<File | string>) {
      const pendingFiles: Array<
        [NonNullable<ReturnType<typeof tx.key>>, File]
      > = [];

      for (const source of sources) {
        const element: ImageElement = {
          type: 'image',
          url: typeof source === 'string' ? source : '',
          children: [{ text: '' }],
        };

        tx.nodes.insert(element);
        tx.nodes.insert({
          type: 'paragraph',
          children: [{ text: '' }],
        });

        const key = tx.key(element);

        if (source instanceof File && key !== null) {
          pendingFiles.push([key, source]);
        }
      }

      if (pendingFiles.length > 0) {
        afterCommit(() => {
          for (const [key, file] of pendingFiles) {
            editor.update((nextTx) => {
              nextTx.nodes.set({ url: URL.createObjectURL(file) }, { at: key });
            });
          }
        });
      }
    },
  }),
});

const image = () =>
  definePlugin('imageClipboard', {
    commands: ({ around }) => [
      around(domCommands.insertData, ({ input, next, state }) => {
        const imageFiles = Array.from(input.files ?? []).filter(
          (file) => file.type.split('/')[0] === 'image'
        );

        if (imageFiles.length > 0) {
          return state.transaction((tx) => {
            tx.image.insertFromClipboard(imageFiles);
          });
        }

        const text = input.getData('text/plain');

        if (!isImageUrl(text)) return next();

        return state.transaction((tx) => {
          tx.image.insertFromClipboard([text]);
        });
      }),
    ],
    dependencies: [ImagePlugin],
  });

const renderElement = (props: RenderElementProps<CustomElement>) => {
  switch (props.element.type) {
    case 'paragraph': {
      return <Paragraph {...(props as RenderElementProps<ParagraphElement>)} />;
    }
    default: {
      return <p {...props.attributes}>{props.children}</p>;
    }
  }
};

const renderVoid = ({ element }: RenderVoidProps<CustomElement>) => {
  switch (element.type) {
    case 'image': {
      return <Image element={element} />;
    }
    default: {
      return null;
    }
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
  const editor = useEditorContext();
  const focused = useEditorFocused();
  const selected = useElementSelected({ mode: 'collapsed' });

  return (
    <div className="editor-images-figure">
      {/* oxlint-disable-next-line nextjs/no-img-element -- [P1 local-invariant] This editor example renders the document-owned image URL as a native selected void node. */}
      <img
        alt=""
        className={cn(
          'editor-images-image',
          selected && focused && 'is-selected'
        )}
        height={90}
        src={element.url}
        width={160}
      />
      <Button
        active
        className={cn(
          'editor-images-remove-button',
          selected && focused && 'is-visible'
        )}
        onClick={() => {
          const path = editor.api.dom.resolvePath(element);

          if (!path) {
            return;
          }

          editor.update.nodes.remove({ at: path, voids: true });
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
  const editor = useEditorContext();
  return (
    <Button
      onClick={() => {
        const url = window.prompt.bind(window)('Enter the URL of the image:');
        if (url && !isImageUrl(url)) {
          window.alert.bind(window)('URL is not an image');
          return;
        }
        if (url) insertImage(editor, url);
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
      }}
    >
      <Icon>image</Icon>
    </Button>
  );
};

const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split('.').pop();
  return imageExtensions.includes(
    ext ?? failInvariant('Expected value to be defined')
  );
};

export default ImagesExample;
