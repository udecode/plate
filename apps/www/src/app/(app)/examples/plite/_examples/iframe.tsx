import { isHotkey } from 'plitejs/dom';
import {
  Editable,
  Plite,
  type RenderElementProps,
  type RenderLeafProps,
  useEditor,
  useEditorContext,
  useEditorSelector,
} from 'plitejs/react';
import type React from 'react';
import { type PointerEvent, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button, Icon, Toolbar } from './components';
import type {
  CustomText,
  CustomTextKey,
  CustomValue,
  ParagraphElement as ParagraphElementType,
} from './custom-types.d';
import { isMarkActive, toggleMark } from './mark-utils';

const HOTKEYS: Record<string, CustomTextKey> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const MARK_HOTKEYS = Object.entries(HOTKEYS);

const IFrameExample = () => {
  const initialValue: CustomValue = [
    {
      type: 'paragraph',
      children: [
        {
          text: 'In this example, the document gets rendered into a controlled ',
        },
        { text: '<iframe>', code: true },
        {
          text: '. This is ',
        },
        {
          text: 'particularly',
          italic: true,
        },
        {
          text: ' useful, when you need to separate the styles for your editor contents from the ones addressing your UI.',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'This also the only reliable method to preview any ',
        },
        {
          text: 'media queries',
          bold: true,
        },
        {
          text: ' in your CSS.',
        },
      ],
    },
  ];
  const editor = useEditor({
    initialValue,
  });

  return (
    <Plite editor={editor}>
      <Toolbar>
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
      </Toolbar>
      <IFrame
        onBlur={() => {
          editor.api.dom.deselect();
        }}
      >
        <Editable
          autoFocus
          onKeyDown={(event) => {
            for (const [hotkey, mark] of MARK_HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                toggleMark(editor, mark);
                return true;
              }
            }

            return undefined;
          }}
          placeholder="Enter some rich text…"
          renderElement={ParagraphElement}
          renderLeaf={Leaf}
          spellCheck
        />
      </IFrame>
    </Plite>
  );
};

const ParagraphElement = ({
  attributes,
  children,
}: RenderElementProps<ParagraphElementType>) => (
  <p {...attributes}>{children}</p>
);

const Leaf = ({
  attributes,
  children: initialChildren,
  leaf,
}: RenderLeafProps<CustomText>) => {
  let children = initialChildren;
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const MarkButton = ({
  format,
  icon,
}: {
  format: CustomTextKey;
  icon: string;
}) => {
  const editor = useEditorContext();
  const active = useEditorSelector((innerEditor) =>
    isMarkActive(innerEditor, format)
  );
  return (
    <Button
      active={active}
      onClick={() => {
        toggleMark(editor, format);
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const IFrame = ({
  children,
  ...props
}: React.IframeHTMLAttributes<HTMLIFrameElement> & {
  children: React.ReactNode;
}) => {
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);
  const handleLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.target as HTMLIFrameElement;
    if (!iframe.contentDocument) return;
    Object.assign(iframe.contentDocument.body.style, {
      position: 'relative',
      zIndex: '0',
    });
    setIframeBody(iframe.contentDocument.body);
  };
  return (
    <iframe
      title="Embedded Plate editor"
      sandbox="allow-same-origin"
      srcDoc="<!DOCTYPE html>"
      {...props}
      onLoad={handleLoad}
    >
      {iframeBody && createPortal(children, iframeBody)}
    </iframe>
  );
};

export default IFrameExample;
