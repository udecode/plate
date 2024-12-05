import React from 'react';

import { decode } from 'html-entities';

export const renderComponentToHtml = <P extends {}>(
  ReactDOMServer: any,
  type: React.ComponentType<P>,
  props: P
): string => {
  return decode(
    ReactDOMServer.renderToStaticMarkup(React.createElement(type, props))
  );
};
