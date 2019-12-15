import { configure } from '@storybook/react';
import { addParameters } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';

// automatically import all files ending in *.stories.tsx
configure(require.context('../src', true, /\.stories\.(js|jsx|ts|tsx|mdx)$/), module);

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
});