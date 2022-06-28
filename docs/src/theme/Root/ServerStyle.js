import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, useLocation } from 'react-router-dom';
import DocusaurusContext from '@docusaurus/context';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { ServerStyleSheet } from 'styled-components';

// FOUC hacky fix: https://github.com/facebook/docusaurus/issues/3236
function ServerStyle({ from: children }) {
  let style = null;

  const location = useLocation();
  const context = useDocusaurusContext();
  const sheet = new ServerStyleSheet();

  try {
    renderToString(
      sheet.collectStyles(
        <StaticRouter location={location}>
          <DocusaurusContext.Provider value={context}>
            {children}
          </DocusaurusContext.Provider>
        </StaticRouter>
      )
    );
    style = sheet.getStyleElement();
  } catch (error) {
    console.error(error);
  } finally {
    sheet.seal();
  }

  return style;
}

function ClientStyle() {
  return null;
}

export default typeof window === 'undefined' ? ServerStyle : ClientStyle;
