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
  cn,
  PlateElement,
  PlateElementProps,
} from '@udecode/plate-styled-components';
import { CodeBlockSelectElement } from './CodeBlockSelectElement';

export function CodeBlockElement({
  className,
  ...props
}: PlateElementProps<Value, TCodeBlockElement>) {
  const { children, element, editor } = props;
  const { lang } = element;

  const { syntax } = getPluginOptions<CodeBlockPlugin>(
    editor,
    ELEMENT_CODE_BLOCK
  );
  const codeClassName = lang ? `${lang} language-${lang}` : '';

  return (
    <PlateElement
      as="pre"
      className={cn(
        "whitespace-pre-wrap rounded-[3px] bg-[rgb(247,246,243)] px-4 py-3 font-[SFMono-Regular,_Consolas,_Monaco,_'Liberation_Mono',_Menlo,_Courier,_monospace] text-[16px] leading-[normal] [tab-size:2]",
        className
      )}
      {...props}
    >
      {syntax && (
        <CodeBlockSelectElement
          data-testid="CodeBlockSelectElement"
          lang={lang}
          onChange={(val: string) => {
            const path = findNodePath(editor, element);
            path &&
              setNodes<TCodeBlockElement>(editor, { lang: val }, { at: path });
          }}
        />
      )}
      <code className={codeClassName}>{children}</code>
    </PlateElement>
  );
}
