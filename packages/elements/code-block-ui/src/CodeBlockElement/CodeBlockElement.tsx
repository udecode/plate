import * as React from 'react';
import {
  CodeBlockNodeData,
  getCodeBlockPluginOptions,
} from '@udecode/plate-code-block';
import { setNodes } from '@udecode/plate-common';
import { TElement, useEditorRef } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { ReactEditor } from 'slate-react';
import { getCodeBlockElementStyles } from './CodeBlockElement.styles';
import { CodeBlockSelectElement } from './CodeBlockSelectElement';

export const CodeBlockElement = (props: StyledElementProps) => {
  const {
    attributes,
    children,
    nodeProps,
    styles,
    element,
    classNames,
    prefixClassNames,
    ...rootProps
  } = props;

  const { lang } = element;
  const editor = useEditorRef();
  const { root } = getCodeBlockElementStyles(props);
  const code_block = getCodeBlockPluginOptions(editor);
  const codeClassName = lang ? `${lang} language-${lang}` : '';

  return (
    <>
      <pre
        {...attributes}
        css={root.css}
        className={root.className}
        {...rootProps}
        {...nodeProps}
      >
        {code_block?.syntax && (
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
        )}
        <code className={codeClassName}>{children}</code>
      </pre>
    </>
  );
};
