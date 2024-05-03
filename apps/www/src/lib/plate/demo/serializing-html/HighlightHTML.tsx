import React from 'react';

import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/dracula';

import { formatHTML } from './formatHTML';

export function HighlightHTML({ code }: { code: string }) {
  return (
    <Highlight
      {...defaultProps}
      code={formatHTML(code)}
      language="jsx"
      theme={theme}
    >
      {({ className, getLineProps, getTokenProps, style, tokens }) => (
        <pre className={className} style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ key: i, line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ key, token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
