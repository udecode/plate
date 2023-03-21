import React from 'react';
import {
  CodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
  TCodeBlockElement,
} from '@udecode/plate-code-block';
import { getPluginOptions, Value } from '@udecode/plate-common';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { getCodeBlockElementStyles } from '../CodeBlockElement.styles';
import { PlateCodeBlockSelectElement } from '../CodeBlockSelectElementRoot/PlateCodeBlockSelectElement';
import { CodeBlockElement } from './CodeBlockElement';

export const PlateCodeBlockElement = <V extends Value>(
  props: StyledElementProps<V, TCodeBlockElement>
) => {
  const { children, element, editor } = props;

  const { lang } = element;
  const codeClassName = lang ? `${lang} language-${lang}` : '';

  const { root } = getCodeBlockElementStyles(props as any);

  const { syntax } = getPluginOptions<CodeBlockPlugin, V>(
    editor,
    ELEMENT_CODE_BLOCK
  );

  return (
    <>
      <CodeBlockElement.Pre
        className={root.className}
        css={root.css}
        {...rootProps}
      >
        {syntax && <PlateCodeBlockSelectElement />}
        <CodeBlockElement.Code className={codeClassName}>
          {children}
        </CodeBlockElement.Code>
      </CodeBlockElement.Pre>
    </>
  );
};
