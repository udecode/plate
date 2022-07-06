import React, { HTMLAttributes } from 'react';
import { CSSProp } from 'styled-components';

export interface MediaEmbedUrlInputProps
  extends HTMLAttributes<HTMLInputElement> {
  className?: string;
  css?: CSSProp;
  url: string;
  onChangeValue: (value: string) => void;
}

export const MediaEmbedUrlInput = ({
  url,
  onChangeValue,
  ...props
}: MediaEmbedUrlInputProps) => {
  const [value, setValue] = React.useState(url);

  const validateUrl = (newUrl: string) => {
    // if not starting with http, assume pasting of full iframe embed code
    if (newUrl.substring(0, 4) !== 'http') {
      const regexMatchSrc = /src=".*?"/;
      const regexGroupQuotes = /"([^"]*)"/;

      const src = newUrl.match(regexMatchSrc)?.[0];
      const returnString = src?.match(regexGroupQuotes)?.[1];

      if (returnString) {
        newUrl = returnString;
      }
    }
    return newUrl;
  };

  return (
    <input
      style={{ width: 276 }}
      value={value}
      placeholder="Paste the embed link..."
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const newUrl = e.target.value;
        validateUrl(newUrl);
        setValue(newUrl);
        onChangeValue?.(newUrl);
      }}
      {...props}
    />
  );
};
