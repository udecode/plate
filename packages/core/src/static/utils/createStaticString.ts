import React from 'react';

export function createStaticString({ text }: { text: string }) {
  return React.createElement(
    'span',
    { 'data-plite-string': true },
    text === '' ? '\uFEFF' : text
  );
}
