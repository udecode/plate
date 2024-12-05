import React from 'react';

export function createStaticString({ text }: { text: string }) {
  return React.createElement(
    'span',
    { 'data-slate-string': true },
    text === '' ? '\uFEFF' : text
  );
}
