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

  const validateUrl = (newUrl: string) => {
    // if not starting with http, assume pasting of full iframe embed code
    if (newUrl.substring(0, 4) !== 'http') {
      const regex = /(?<=src=").*?(?=[*"])/g;
      const src = newUrl.match(regex)?.[0];
      if (src) {
        newUrl = src;
      }
    }
    return newUrl;
  };

  return (
    <input
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const newUrl = e.target.value;
        validateUrl(newUrl);
        setValue(newUrl);
        onChange(newUrl);
      }}
      {...props}
    />
  );
};
