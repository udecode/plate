import React from 'react';

type StaticStringProps = {
  'data-plite-string': true;
  children: string;
};

export function createStaticString({
  text,
}: {
  text: string;
}): React.ReactElement<StaticStringProps, 'span'> {
  const children = text === '' ? '\uFEFF' : text;

  return React.createElement(
    'span',
    { 'data-plite-string': true },
    children
  ) as React.ReactElement<StaticStringProps, 'span'>;
}
