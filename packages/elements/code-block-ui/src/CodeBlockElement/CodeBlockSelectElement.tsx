import * as React from 'react';
import { CODE_BLOCK_LANGUAGES } from '@udecode/plate-code-block';
import { CSSProp } from 'styled-components';

export const CodeBlockSelectElement = ({
  lang,
  onChange,
  ...props
}: {
  lang: string;
  className?: string;
  css?: CSSProp;
  onChange: Function;
}) => {
  const [value, setValue] = React.useState(lang);
  return (
    <select
      value={value}
      style={{ float: 'right' }}
      onChange={(e) => {
        onChange(e.target.value);
        setValue(e.target.value);
      }}
      {...props}
    >
      <option value="">Plain text</option>
      {Object.entries(CODE_BLOCK_LANGUAGES).map(([key, val]) => (
        <option value={key}>{val}</option>
      ))}
    </select>
  );
};
