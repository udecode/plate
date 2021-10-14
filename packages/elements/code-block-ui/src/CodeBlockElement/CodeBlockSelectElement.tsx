import * as React from 'react';
import {
  CODE_BLOCK_LANGUAGES,
  CODE_BLOCK_LANGUAGES_POPULAR,
  getCodeBlockPluginOptions,
} from '@udecode/plate-code-block';
import { useEditorRef } from '@udecode/plate-core';
import { CSSProp } from 'styled-components';

export const CodeBlockSelectElement = ({
  lang,
  onChange,
  ...props
}: {
  lang?: string;
  onChange: Function;
  className?: string;
  css?: CSSProp;
}) => {
  const [value, setValue] = React.useState(lang);
  const editor = useEditorRef();
  const code_block = getCodeBlockPluginOptions(editor);
  return (
    <select
      value={value}
      style={{ float: 'right' }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onChange={(e) => {
        onChange(e.target.value);
        setValue(e.target.value);
      }}
      contentEditable={false}
      {...props}
    >
      <option value="">Plain text</option>
      {code_block?.syntaxPopularFirst &&
        Object.entries(CODE_BLOCK_LANGUAGES_POPULAR).map(([key, val]) => (
          <option key={key} value={key}>
            {val}
          </option>
        ))}
      {Object.entries(CODE_BLOCK_LANGUAGES).map(([key, val]) => (
        <option key={key} value={key}>
          {val}
        </option>
      ))}
    </select>
  );
};
