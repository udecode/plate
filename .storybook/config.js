import React from 'react';
import { DocsContainer, DocsPage } from '@storybook/addon-docs/blocks';
import { withKnobs } from '@storybook/addon-knobs';
import addonAPI from '@storybook/addons';
import { addDecorator, configure , addParameters } from '@storybook/react';
import { GlobalStyle } from '../stories/config/globalStyle';
import { create } from '@storybook/theming/create';

const theme = create({
  brandTitle: '🧩 Slate Plugins',
  brandUrl: 'https://github.com/zbeyens/slate-plugins-next'
});

let firstLoad = true;
addonAPI.register('my-organisation/my-addon', storybookAPI => {
  storybookAPI.onStory((kind, story) => {
    // when you enter a story, if you are just loading storybook up, default to a specific kind/story.
    if (firstLoad) {
      firstLoad = false; // make sure to set this flag to false, otherwise you will never be able to look at another story.
      storybookAPI.selectStory('Plugins/Playground', 'PluginsExample');
    }
  });
});

addParameters({
  options: {
    theme,
    showRoots: true,
    panelPosition: 'right',
    storySort: (a, b) => {
      if (a[0].includes('docs-')) {
        if (a[0].includes('intro-')) {
          return -1;
        }

        return 0;
      }

      return 1;
    }
  },
  docs: {
    page: () => (
      <DocsPage
        // subtitleSlot={({ selectedKind }) => `Subtitle: ${selectedKind}`}
      />
    )
  },
  storySort: (a, b) =>
    a[1].kind === b[1].kind
      ? 0
      : a[1].id.localeCompare(b[1].id, { numeric: true }),
});

addDecorator(story => (
  <>
    <GlobalStyle />
    {story()}
  </>
));

addDecorator(withKnobs);

// automatically import all files ending in *.stories.tsx
configure(
  [
    // require.context('../docs', true, /Intro.story.mdx/),
    // require.context('../docs', true, /GettingStarted.story.mdx/),
    // require.context('../docs', true, /Data.story.mdx/),
    // require.context('../docs', true, /Developing.story.mdx/),
    // require.context('../docs', true, /Why.story.mdx/),
    // require.context('../docs/charts', true, /\.story.mdx/),
    // require.context('../docs/advanced', true, /\.story.mdx/),
    require.context('../stories', true, /\.stories\.(tsx|mdx)$/),
  ],
  module
);
