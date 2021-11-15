import React from 'react';
import {
  CodeBlockNodeData,
  CodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
} from '@udecode/plate-code-block';
import { setNodes } from '@udecode/plate-common';
import { getPluginOptions, TElement } from '@udecode/plate-core';
import {
  getRootProps,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { ReactEditor } from 'slate-react';
import { getCodeBlockElementStyles } from './CodeBlockElement.styles';
import { CodeBlockSelectElement } from './CodeBlockSelectElement';

export const CodeBlockElement = (props: StyledElementProps) => {
  const { attributes, children, nodeProps, element, editor } = props;

  const rootProps = getRootProps(props);

  const { lang } = element;
  const { root } = getCodeBlockElementStyles(props);
  const { syntax } = getPluginOptions<CodeBlockPlugin>(
    editor,
    ELEMENT_CODE_BLOCK
  );
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
        {syntax && (
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
