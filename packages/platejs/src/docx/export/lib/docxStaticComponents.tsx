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
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  type EquationElement,
  getEquationHtml,
} from '../../../math';
import {
  EditorElement,
  type EditorElementProps,
} from '../../../static/components/plite-nodes';
import type { StaticComponentOverrides } from '../../../static/internal/staticPresentation';

/** Without `border: 'none'`, the converter draws a black grid around a layout table. */
const layoutTable = { border: 'none', width: '100%' } as const;

const CodeBlockDocx = (
  props: EditorElementProps<typeof BaseCodeBlockPlugin>
) => (
  <EditorElement {...props}>
    <div data-docx-preserve-whitespace="">{props.children}</div>
  </EditorElement>
);

const ColumnItemDocx = (
  props: EditorElementProps<typeof BaseColumnItemPlugin>
) => (
  <EditorElement
    {...props}
    as="td"
    style={{ border: 'none', width: props.element.width }}
  >
    {props.children}
  </EditorElement>
);

const ColumnDocx = (props: EditorElementProps<typeof BaseColumnPlugin>) => (
  <EditorElement {...props}>
    <table style={layoutTable}>
      <tbody>
        <tr>{props.children}</tr>
      </tbody>
    </table>
  </EditorElement>
);

const escapeHtml = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const equationMathml = (element: EquationElement, displayMode: boolean) => {
  try {
    return getEquationHtml({
      element,
      options: {
        displayMode,
        output: 'mathml',
        throwOnError: true,
        trust: false,
      },
    });
  } catch {
    return `<math${displayMode ? ' display="block"' : ''}><semantics><annotation encoding="application/x-tex">${escapeHtml(element.latex)}</annotation></semantics></math>`;
  }
};

const EquationDocx = (props: EditorElementProps<typeof BaseEquationPlugin>) => (
  <EditorElement {...props}>
    {props.element.latex ? (
      <p
        // oxlint-disable-next-line react/no-danger -- [P0 behavior-boundary] KaTeX generates this MathML with trust disabled, and the fallback escapes the equation source.
        dangerouslySetInnerHTML={{
          __html: equationMathml(props.element, true),
        }}
      />
    ) : (
      <p data-empty="">[Empty equation]</p>
    )}
    {props.children}
  </EditorElement>
);

const InlineEquationDocx = (
  props: EditorElementProps<typeof BaseInlineEquationPlugin>
) => (
  <EditorElement {...props} as="span">
    {props.element.latex ? (
      <span
        // oxlint-disable-next-line react/no-danger -- [P0 behavior-boundary] KaTeX generates this MathML with trust disabled, and the fallback escapes the equation source.
        dangerouslySetInnerHTML={{
          __html: equationMathml(props.element, false),
        }}
      />
    ) : (
      <span data-empty="">[equation]</span>
    )}
    {props.children}
  </EditorElement>
);

// The converter shades table cells, not tables.
const CalloutDocx = ({
  children,
  ...props
}: EditorElementProps<typeof BaseCalloutPlugin>) => {
  const cell = {
    backgroundColor: props.element.backgroundColor,
    border: 'none',
  };

  return (
    <EditorElement {...props}>
      <table style={layoutTable}>
        <tbody>
          <tr>
            <td style={{ ...cell, width: '30px' }}>
              <span data-editor-prevent-deserialization>
                {props.element.icon || '💡'}
              </span>
            </td>
            <td style={cell}>{children}</td>
          </tr>
        </tbody>
      </table>
    </EditorElement>
  );
};

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
      <div>
        {headings.length > 0 ? (
          headings.map((heading) => (
            <p key={heading.key}>
              <a href={`#${heading.key}`}>{heading.title}</a>
            </p>
          ))
        ) : (
          <p data-empty="">
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
