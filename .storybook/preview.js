import * as React from 'react';
import { DocsPage } from '@storybook/addon-docs/blocks';
import { addDecorator, addParameters } from '@storybook/react';
import { GlobalStyle } from '../stories/config/globalStyle';

addParameters({
  options: {
    showRoots: true,
  },
  docs: { page: DocsPage },
});

addDecorator(story => (
  <>
    <GlobalStyle />
    {story()}
  </>
));


