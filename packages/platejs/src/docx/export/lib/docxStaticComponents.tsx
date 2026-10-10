import React from 'react';

import type { Editor } from '../../../core';
import { BaseHeadingPlugin } from '../../../features/basic-nodes';
import { BaseCalloutPlugin } from '../../../features/callout';
import { BaseCodeBlockPlugin } from '../../../features/code-block';
import {
  BaseColumnItemPlugin,
  BaseColumnPlugin,
} from '../../../features/layout';
import { BaseTocPlugin, type Heading } from '../../../features/toc';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../../../math';
import {
  EditorElement,
  type EditorElementProps,
} from '../../../static/components/plite-nodes';
import type { StaticComponentOverrides } from '../../../static/internal/staticPresentation';

const CodeBlockDocx = (
  props: EditorElementProps<typeof BaseCodeBlockPlugin>
) => (
  <EditorElement {...props}>
    <div
      data-docx-preserve-whitespace=""
      style={{
        backgroundColor: '#f5f5f5',
        border: '1px solid #e0e0e0',
        fontFamily: "'Courier New', Consolas, monospace",
        fontSize: '10pt',
        margin: '8pt 0',
        padding: '12pt',
        whiteSpace: 'pre-wrap',
      }}
    >
      {props.children}
    </div>
  </EditorElement>
);

const ColumnItemDocx = (
  props: EditorElementProps<typeof BaseColumnItemPlugin>
) => (
  <EditorElement
    {...props}
    as="td"
    style={{
      border: 'none',
      padding: '4px 8px',
      verticalAlign: 'top',
      width: props.element.width ?? 'auto',
    }}
  >
    {props.children}
  </EditorElement>
);

const ColumnDocx = (props: EditorElementProps<typeof BaseColumnPlugin>) => (
  <EditorElement {...props}>
    <table
      style={{
        border: 'none',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        width: '100%',
      }}
    >
      <tbody>
        <tr>{props.children}</tr>
      </tbody>
    </table>
  </EditorElement>
);

const EquationDocx = (props: EditorElementProps<typeof BaseEquationPlugin>) => (
  <EditorElement {...props}>
    <p
      style={{
        color: props.element.latex ? undefined : '#888',
        fontFamily: 'Cambria Math, Consolas, monospace',
        fontSize: '12pt',
        fontStyle: props.element.latex ? undefined : 'italic',
        margin: '8pt 0',
        textAlign: 'center',
      }}
    >
      {props.element.latex || '[Empty equation]'}
    </p>
    {props.children}
  </EditorElement>
);

const InlineEquationDocx = (
  props: EditorElementProps<typeof BaseInlineEquationPlugin>
) => (
  <EditorElement {...props} as="span">
    <span
      style={{
        color: props.element.latex ? undefined : '#888',
        fontFamily: 'Cambria Math, Consolas, monospace',
        fontStyle: props.element.latex ? undefined : 'italic',
      }}
    >
      {props.element.latex || '[equation]'}
    </span>
    {props.children}
  </EditorElement>
);

const CalloutDocx = ({
  children,
  ...props
}: EditorElementProps<typeof BaseCalloutPlugin>) => (
  <EditorElement {...props}>
    <table
      style={{
        backgroundColor: props.element.backgroundColor || '#f4f4f5',
        border: 'none',
        borderCollapse: 'collapse',
        borderRadius: '4px',
        marginBottom: '4pt',
        marginTop: '4pt',
        width: '100%',
      }}
    >
      <tbody>
        <tr>
          <td
            style={{
              border: 'none',
              fontFamily:
                '"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
              fontSize: '18px',
              padding: '8px 4px 8px 8px',
              verticalAlign: 'top',
              width: '30px',
            }}
          >
            <span data-editor-prevent-deserialization>
              {props.element.icon || '💡'}
            </span>
          </td>
          <td
            style={{
              border: 'none',
              padding: '8px 8px 8px 4px',
              verticalAlign: 'top',
            }}
          >
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  </EditorElement>
);

const HeadingDocx = (props: EditorElementProps<typeof BaseHeadingPlugin>) => {
  const Tag = `h${props.element.level}` as const;
  const key = props.editor.key(props.path);

  return (
    <EditorElement {...props} as={Tag}>
      {key && <span id={key} />}
      {props.children}
    </EditorElement>
  );
};

const getHeadings = (editor?: Editor): readonly Heading[] =>
  editor ? editor.plugin(BaseTocPlugin).read.headings() : [];

const TocDocx = (props: EditorElementProps<typeof BaseTocPlugin>) => {
  const headings = getHeadings(props.editor);

  return (
    <EditorElement {...props}>
      <div style={{ marginBottom: '12pt', padding: '8pt 0' }}>
        {headings.length > 0 ? (
          headings.map((heading) => (
            <p
              key={heading.key}
              style={{
                margin: '4pt 0',
                paddingLeft:
                  heading.depth === 2
                    ? '24pt'
                    : heading.depth === 3
                      ? '48pt'
                      : '0',
              }}
            >
              <a
                href={`#${heading.key}`}
                style={{ color: '#0066cc', textDecoration: 'underline' }}
              >
                {heading.title}
              </a>
            </p>
          ))
        ) : (
          <p style={{ color: '#666', fontSize: '10pt' }}>
            Create a heading to display the table of contents.
          </p>
        )}
      </div>
      {props.children}
    </EditorElement>
  );
};

export const DOCX_STATIC_COMPONENTS: StaticComponentOverrides = Object.freeze({
  [BaseCalloutPlugin.name]: CalloutDocx,
  [BaseCodeBlockPlugin.name]: CodeBlockDocx,
  [BaseColumnItemPlugin.name]: ColumnItemDocx,
  [BaseColumnPlugin.name]: ColumnDocx,
  [BaseEquationPlugin.name]: EquationDocx,
  [BaseHeadingPlugin.name]: HeadingDocx,
  [BaseInlineEquationPlugin.name]: InlineEquationDocx,
  [BaseTocPlugin.name]: TocDocx,
});
