import * as React from 'react';

export const MediaEmbedUrlInput = ({
  className,
  url,
  onChange,
  ...props
}: {
  className?: string;
  url: string;
  onChange: Function;
}) => {
  const [value, setValue] = React.useState(url);

  return (
    <input
      className={className}
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
