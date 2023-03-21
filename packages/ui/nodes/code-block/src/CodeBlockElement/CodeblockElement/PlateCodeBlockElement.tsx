import React from 'react';
import { CodeBlockPlugin, ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { getPluginOptions } from '@udecode/plate-common';
import { getCodeBlockElementStyles } from '../CodeBlockElement.styles';
import { PlateCodeBlockSelectElement } from '../CodeBlockSelectElementRoot/PlateCodeBlockSelectElement';
import { CodeBlockElement } from './CodeBlockElement';
import { CodeBlockElementRootProps } from './CodeBlockElementRoot';

export const PlateCodeBlockElement = (props: CodeBlockElementRootProps) => {
  const { element, editor } = props;
  const { children, as, ...rootProps } = props;

  const { lang } = element;
  const codeClassName = lang ? `${lang} language-${lang}` : '';

  const { root } = getCodeBlockElementStyles(props as any);

  const { syntax } = getPluginOptions<CodeBlockPlugin>(
    editor,
    ELEMENT_CODE_BLOCK
  );

  return (
    <>
      <CodeBlockElement.Root
        className={root.className}
        css={root.css}
        {...rootProps}
      >
        {syntax && <PlateCodeBlockSelectElement />}
        <CodeBlockElement.Code className={codeClassName}>
          {children}
        </CodeBlockElement.Code>
      </CodeBlockElement.Root>
    </>
  );
};
