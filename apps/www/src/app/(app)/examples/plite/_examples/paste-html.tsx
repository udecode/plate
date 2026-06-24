import type React from 'react';
import { useMemo } from 'react';
import type { Element as PliteElement } from '@platejs/plite';
import {
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  type RenderTextProps,
  type RenderVoidProps,
  Plite,
  useEditorFocused,
  useElementSelected,
  usePliteEditor,
} from '@platejs/plite-react';

import { cn } from '@/utils/cn';

import type {
  CustomElement,
  CustomText,
  ImageElement as ImageElementType,
} from './custom-types.d';
import { html } from './paste-html-import';

const PasteHtmlExample = () => {
  const editor = usePliteEditor({
    extensions: [html()],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          {
            text: "By default, pasting content into a Plite editor will use the clipboard's ",
          },
          { text: "'text/plain'", code: true },
          {
            text: " data. That's okay for some use cases, but sometimes you want users to be able to paste in content and have it maintain its formatting. To do this, your editor needs to handle ",
          },
          { text: "'text/html'", code: true },
          { text: ' data. ' },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'This is an example of doing exactly that!' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Try it out for yourself! Copy and paste some rendered HTML rich text content (not the source code) from another site into this editor and its formatting should be preserved.',
          },
        ],
      },
    ],
  });

  return (
    <Plite editor={editor}>
      <Editable
        placeholder="Paste in some HTML..."
        renderElement={Element}
        renderLeaf={Leaf}
        renderText={FontSizeText}
        renderVoid={({ element }) => {
          switch (element.type) {
            case 'image':
              return <ImageElement element={element} />;
            default:
              return null;
          }
        }}
      />
    </Plite>
  );
};

const Element = (props: RenderElementProps<CustomElement>) => {
  const { attributes, children, element } = props;
  const style = getElementStyle(element);

  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case 'code-block':
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 style={style} {...attributes}>
          {children}
        </h3>
      );
    case 'heading-four':
      return (
        <h4 style={style} {...attributes}>
          {children}
        </h4>
      );
    case 'heading-five':
      return (
        <h5 style={style} {...attributes}>
          {children}
        </h5>
      );
    case 'heading-six':
      return (
        <h6 style={style} {...attributes}>
          {children}
        </h6>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    case 'table':
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case 'table-cell':
      return <td {...attributes}>{children}</td>;
    case 'table-row':
      return <tr {...attributes}>{children}</tr>;
    case 'link':
      return (
        <SafeLink attributes={attributes} href={element.url}>
          {children}
        </SafeLink>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const getElementStyle = (
  element: PliteElement
): React.CSSProperties | undefined => {
  const align =
    'align' in element && typeof element.align === 'string'
      ? element.align
      : undefined;

  return align
    ? { textAlign: align as React.CSSProperties['textAlign'] }
    : undefined;
};

const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:'];

interface SafeLinkProps {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  href: string;
}

const SafeLink = ({ children, href, attributes }: SafeLinkProps) => {
  const safeHref = useMemo(() => {
    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(href);
    } catch {}
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
    return 'about:blank';
  }, [href]);

  return (
    <a href={safeHref} {...attributes}>
      {children}
    </a>
  );
};

const ImageElement = ({ element }: RenderVoidProps<ImageElementType>) => {
  const focused = useEditorFocused();
  const selected = useElementSelected();

  return (
    <img
      className={cn(
        'plite-paste-html-image',
        selected && focused && 'is-selected'
      )}
      src={element.url}
    />
  );
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps<CustomText>) => {
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
  if (leaf.strikethrough) {
    children = <del>{children}</del>;
  }
  if (leaf.superscript) {
    children = <sup>{children}</sup>;
  }
  if (leaf.subscript) {
    children = <sub>{children}</sub>;
  }

  return <span {...attributes}>{children}</span>;
};

const FontSizeText = ({ attributes, children, text }: RenderTextProps) => {
  const backgroundColor =
    typeof text.backgroundColor === 'string' ? text.backgroundColor : undefined;
  const color = typeof text.color === 'string' ? text.color : undefined;
  const fontSize =
    typeof text.fontSize === 'string' ? text.fontSize : undefined;
  const style =
    backgroundColor || color || fontSize
      ? {
          backgroundColor,
          color,
          fontSize,
        }
      : undefined;

  return (
    <span {...attributes} style={style}>
      {children}
    </span>
  );
};

export default PasteHtmlExample;
