import * as React from 'react';
import { CodeBlockNodeData } from '@udecode/plate-code-block/src';
import { setNodes } from '@udecode/plate-common';
import { TElement, useEditorRef } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { ReactEditor } from 'slate-react';
import { getCodeBlockElementStyles } from './CodeBlockElement.styles';
import { CodeBlockSelectElement } from './CodeBlockSelectElement';

export const CodeBlockElement = (props: StyledElementProps) => {
  const { attributes, children, element, nodeProps } = props;
  const { lang } = element;
  const editor = useEditorRef();
  const { root } = getCodeBlockElementStyles(props);

  return (
    <>
      <pre
        {...attributes}
        css={root.css}
        className={root.className}
        {...nodeProps}
      >
        <CodeBlockSelectElement
          data-testid="CodeBlockSelectElement"
          lang={lang}
          onChange={(val: string) => {
            const path = ReactEditor.findPath(editor, element);
            setNodes<TElement<CodeBlockNodeData>>(
              editor,
              { lang: val },
              { at: path }
            );
          }}
        />
        <code>{children}</code>
      </pre>
    </>
  );
};
