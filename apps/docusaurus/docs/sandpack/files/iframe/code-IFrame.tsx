export const iFrameCode = `import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export const IFrame = ({ children, ...props }: any) => {
  const [contentRef, setContentRef] = useState<any>(null);
  const mountNode =
    contentRef &&
    contentRef.contentWindow &&
    contentRef.contentWindow.document.body;

  return (
    // eslint-disable-next-line jsx-a11y/iframe-has-title
    <iframe {...props} ref={setContentRef}>
      {mountNode && createPortal(React.Children.only(children), mountNode)}
    </iframe>
  );
};
`;

export const iFrameFile = {
  '/iframe/IFrame.tsx': iFrameCode,
};
