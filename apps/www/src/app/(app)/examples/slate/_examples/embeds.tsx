import React, { type ChangeEvent, useMemo } from 'react';
import { defineEditorExtension } from '@platejs/slate';
import {
  Editable,
  type RenderElementProps,
  type RenderVoidProps,
  Slate,
  useEditor,
  useSlateEditor,
} from '@platejs/slate-react';
import { Input } from '@/components/ui/input';
import type {
  CustomEditor,
  CustomElement,
  ParagraphElement as ParagraphElementType,
  VideoElement as VideoElementType,
} from './custom-types.d';

const EmbedsExample = () => {
  const editor = useSlateEditor({
    extensions: [embed()],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'In addition to simple image nodes, you can actually create complex embedded nodes. For example, this one contains an input element that lets you change the video being rendered!',
          },
        ],
      },
      {
        type: 'video',
        url: 'https://player.vimeo.com/video/26689853',
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Try it out! This editor is built to handle Vimeo embeds, but you could handle any type.',
          },
        ],
      },
    ],
  });
  return (
    <Slate editor={editor}>
      <Editable
        placeholder="Enter some text..."
        renderElement={renderElement}
        renderVoid={renderVoid}
      />
    </Slate>
  );
};

const embed = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'embed',
    elements: [{ type: 'video', void: 'block' }],
  });

const renderElement = (props: RenderElementProps<CustomElement>) => {
  switch (props.element.type) {
    case 'paragraph':
      return (
        <ParagraphElement
          {...(props as RenderElementProps<ParagraphElementType>)}
        />
      );
    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

const renderVoid = ({ element }: RenderVoidProps<CustomElement>) => {
  switch (element.type) {
    case 'video':
      return <VideoElement element={element as VideoElementType} />;
    default:
      return null;
  }
};

const ParagraphElement = ({
  attributes,
  children,
}: RenderElementProps<ParagraphElementType>) => (
  <p {...attributes}>{children}</p>
);

const allowedSchemes = ['http:', 'https:'];

const VideoElement = ({ element }: RenderVoidProps<VideoElementType>) => {
  const editor = useEditor<CustomEditor>();
  const { url } = element;

  const safeUrl = useMemo(() => {
    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(url);
    } catch {}
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
    return 'about:blank';
  }, [url]);

  return (
    <>
      <div className="slate-embeds-video-frame">
        <iframe
          className="slate-embeds-video-iframe"
          frameBorder="0"
          src={`${safeUrl}?title=0&byline=0&portrait=0`}
        />
      </div>
      <UrlInput
        onChange={(val) => {
          const path = editor.api.dom.resolvePath(element);

          if (!path) {
            return;
          }

          editor.update((tx) => {
            tx.nodes.set({ url: val }, { at: path, voids: true });
          });
        }}
        url={url}
      />
    </>
  );
};

interface UrlInputProps {
  url: string;
  onChange: (url: string) => void;
}

const UrlInput = ({ url, onChange }: UrlInputProps) => {
  const [value, setValue] = React.useState(url);
  return (
    <Input
      className="mt-[5px]"
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        setValue(newUrl);
        onChange(newUrl);
      }}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      type="text"
      value={value}
    />
  );
};

export default EmbedsExample;
