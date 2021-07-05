import * as React from 'react';
import { CSSProp } from 'styled-components';

export const MediaEmbedUrlInput = ({
  url,
  onChange,
  ...props
}: {
  className?: string;
  css?: CSSProp;
  url: string;
  onChange: Function;
}) => {
  const [value, setValue] = React.useState(url);

  return (
    <input
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const newUrl = e.target.value;
        setValue(newUrl);
        onChange(newUrl);
      }}
      {...props}
    />
  );
};
