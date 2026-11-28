import katex from 'katex';
import React from 'react';

import type { Editor, Element, Path } from '../../../core';
import { BaseHeadingPlugin } from '../../../features/basic-nodes';
import { BaseCalloutPlugin } from '../../../features/callout';
import { BaseCodeBlockPlugin } from '../../../features/code-block';
import {
  BaseColumnItemPlugin,
  BaseColumnGroupPlugin,
} from '../../../features/column';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../../../features/footnote';
import {
  BaseListPlugin,
  type ListElement,
  ListType,
} from '../../../features/list';
import { BaseTocPlugin, type Heading } from '../../../features/toc';
import { getDefaultElementTag } from '../../../internal/plugin/defaultElementTag';
import type { RenderElementProps } from '../../../lib/types/RenderElementProps';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  type EquationElement,
} from '../../../math';
import {
  EditorElement,
  type EditorElementProps,
} from '../../../static/components/plite-nodes';
import type {
  StaticComponentOverrides,
  StaticOverrides,
} from '../../../static/internal/staticPresentation';
import { type DocxListItem, writeListItem } from './internal/list-item';

/** Without `border: 'none'`, the converter draws a black grid around a layout table. */
const layoutTable = { border: 'none', width: '100%' } as const;

const CodeBlockDocx = (
  props: EditorElementProps<typeof BaseCodeBlockPlugin>
) => (
  <EditorElement {...props}>
    <div data-docx-preserve-whitespace="">{props.children}</div>
  </EditorElement>
);

const FootnoteReferenceDocx = (
  props: EditorElementProps<typeof BaseFootnotePlugin>
) => (
  <EditorElement {...props} as="sup">
    {props.children}[{props.element.ref ?? ''}]
  </EditorElement>
);

const FootnoteDefinitionDocx = (
  props: EditorElementProps<typeof BaseFootnoteDefinitionPlugin>
) => (
  <EditorElement {...props} as="div">
    <div>{props.element.ref ?? ''}</div>
    <div>{props.children}</div>
  </EditorElement>
);

const ColumnItemDocx = (
  props: EditorElementProps<typeof BaseColumnItemPlugin>
) => {
  const columnWeight =
    typeof props.element.width === 'number' &&
    Number.isFinite(props.element.width) &&
    props.element.width > 0
      ? props.element.width
      : 1;
  const parent = props.editor.read.nodes.parent(props.path)?.[0];
  const siblingColumns =
    parent && 'children' in parent
      ? parent.children.filter(
          (child): child is typeof props.element =>
            'type' in child && child.type === props.element.type
        )
      : [];
  const totalWeight = siblingColumns.reduce(
    (sum, sibling) =>
      sum +
      (typeof sibling.width === 'number' &&
      Number.isFinite(sibling.width) &&
      sibling.width > 0
        ? sibling.width
        : 1),
    0
  );
  const widthPercent =
    totalWeight > 0 ? `${(columnWeight / totalWeight) * 100}%` : '50%';

  return (
    <EditorElement
      {...props}
      as="td"
      style={{ border: 'none', width: widthPercent }}
    >
      {props.children}
    </EditorElement>
  );
};

const ColumnGroupDocx = (
  props: EditorElementProps<typeof BaseColumnGroupPlugin>
) => (
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
    return katex.renderToString(element.latex, {
      displayMode,
      output: 'mathml',
      throwOnError: true,
      trust: false,
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
            <p
              key={heading.key}
              // The converter sets the left w:ind from a start or left margin and drops padding-left.
              style={{ marginLeft: `${(heading.level - 1) * 24}px` }}
            >
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

const DOCX_STATIC_COMPONENTS: StaticComponentOverrides = Object.freeze({
  [BaseCalloutPlugin.name]: CalloutDocx,
  [BaseCodeBlockPlugin.name]: CodeBlockDocx,
  [BaseColumnItemPlugin.name]: ColumnItemDocx,
  [BaseColumnGroupPlugin.name]: ColumnGroupDocx,
  [BaseEquationPlugin.name]: EquationDocx,
  [BaseFootnotePlugin.name]: FootnoteReferenceDocx,
  [BaseFootnoteDefinitionPlugin.name]: FootnoteDefinitionDocx,
  [BaseHeadingPlugin.name]: HeadingDocx,
  [BaseInlineEquationPlugin.name]: InlineEquationDocx,
  [BaseTocPlugin.name]: TocDocx,
});

const listItemOf = (
  editor: Editor,
  element: ListElement,
  path: Path,
  list: DocxListItem['list']
): DocxListItem | undefined => {
  const base = {
    level: Math.max(0, (element.indent ?? 1) - 1),
    levels: element.listLevels,
    list,
  };

  switch (element.listType) {
    case ListType.Bulleted: {
      return {
        ...base,
        marker: { kind: 'bulleted', style: element.listStyle ?? 'disc' },
      };
    }
    case ListType.Numbered: {
      return {
        ...base,
        marker: {
          kind: 'numbered',
          number: editor.plugin(BaseListPlugin).read.ordinal(path) ?? 1,
          restart: element.listRestart !== undefined,
          style: element.listStyle ?? 'decimal',
        },
      };
    }
    case ListType.Task: {
      return {
        ...base,
        marker: { checked: element.checked === true, kind: 'task' },
      };
    }
    default: {
      return undefined;
    }
  }
};

export type DocxTextFormat = Readonly<{
  dropped: string;
  plugin: string;
  text: (context: Readonly<{ node: Element }>) => string;
  type: string;
}>;

const textComponent = (text: DocxTextFormat['text']) =>
  function DocxText(
    props: Omit<RenderElementProps, 'attributes'> & {
      attributes: Record<string, unknown>;
      path: Path;
    }
  ) {
    return (
      <EditorElement {...props} as={getDefaultElementTag(props.attributes)}>
        {text({ node: props.element })}
        {props.children}
      </EditorElement>
    );
  };

export const docxStaticOverrides = (
  story: string,
  textFormats: readonly DocxTextFormat[]
): StaticOverrides =>
  Object.freeze({
    components: {
      ...DOCX_STATIC_COMPONENTS,
      ...Object.fromEntries(
        textFormats.map(({ plugin, text }) => [plugin, textComponent(text)])
      ),
    },
    slots: { [BaseListPlugin.name]: { wrapNodeChildren: null } },
    wrapElement: ({ attributes, children, editor, element, path }) => {
      const item = editor.plugin(BaseListPlugin).installed
        ? listItemOf(editor, element as ListElement, path, {
            id: typeof element.listId === 'string' ? element.listId : '',
            root:
              typeof attributes['data-editor-root'] === 'string'
                ? attributes['data-editor-root']
                : 'main',
            story,
          })
        : undefined;

      return item ? <div {...writeListItem(item)}>{children}</div> : children;
    },
  });
