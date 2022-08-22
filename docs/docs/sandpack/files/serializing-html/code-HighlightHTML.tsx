export const highlightHtmlCode = `import React from 'react';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/dracula';
import { formatHTML } from './formatHTML';

export const HighlightHTML = ({ code }: { code: string }) => (
  <Highlight
    {...defaultProps}
    theme={theme}
    code={formatHTML(code)}
    language="jsx"
  >
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={style}>
        {tokens.map((line, i) => (
          <div {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
);
`;

export const highlightHtmlFile = {
  '/serializing-html/HighlightHTML.tsx': highlightHtmlCode,
};
