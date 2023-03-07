import React from 'react';
import {
  CodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
  TCodeBlockElement,
} from '@udecode/plate-code-block';
import {
  findNodePath,
  getPluginOptions,
  setNodes,
  Value,
} from '@udecode/plate-common';
import {
  getRootProps,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { getCodeBlockElementStyles } from './CodeBlockElement.styles';
import { CodeBlockSelectElement } from './CodeBlockSelectElement';

export const CodeBlockElement = <V extends Value>(
  props: StyledElementProps<V, TCodeBlockElement>
) => {
  const { attributes, children, nodeProps, element, editor } = props;

  const rootProps = getRootProps(props);

  const { lang } = element;

  const { root } = getCodeBlockElementStyles(props as any);
  const { syntax } = getPluginOptions<CodeBlockPlugin, V>(
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
              const path = findNodePath(editor, element);
              path &&
                setNodes<TCodeBlockElement>(
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
