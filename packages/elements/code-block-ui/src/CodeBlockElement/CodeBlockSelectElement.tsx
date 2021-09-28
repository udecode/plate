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

  // TODO: Replace options with something generated from CODE_BLOCK_LANGUAGES

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
      <option value="css">CSS</option>
      <option value="markup">HTML</option>
      <option value="java">Java</option>
      <option value="javascript">JavaScript</option>
      <option value="json">JSON</option>
      <option value="jsx">JSX</option>
      <option value="php">PHP</option>
      <option value="python">Python</option>
      <option value="SQL">SQL</option>
      <option value="typescript">TypeScript</option>
      <option value="tsx">TSX</option>
    </select>
  );
};
