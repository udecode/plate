import React from 'react';
import { DocsContainer, DocsPage } from '@storybook/addon-docs/blocks';
import { withKnobs } from '@storybook/addon-knobs';
import addonAPI from '@storybook/addons';
import { addDecorator, configure , addParameters } from '@storybook/react';
import { create } from '@storybook/theming/create';
import { GlobalStyle } from '../stories/config/globalStyle';

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
      storybookAPI.selectStory('Plugins/Playground', 'Plugins');
    }
  });
});

addParameters({
  options: {
    theme,
    showRoots: true,
    panelPosition: 'right',
  },
  docs: {
    page: () => (
      <DocsPage />
    )
  },
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
    require.context('../stories/docs', true, /intro.stories.mdx/),
    require.context('../stories/docs', true, /getting-started.stories.mdx/),
    require.context('../stories/docs', true, /guide.stories.mdx/),
    require.context('../stories/docs', true, /contributing.stories.mdx/),
    require.context('../stories/docs', true, /\.stories\.(tsx|mdx)$/),
    require.context('../stories/basic/', true, /\.stories\.(tsx|mdx)$/),
    require.context('../stories/plugins/', true, /playground.stories.tsx/),
    require.context('../stories/plugins/', true, /\.stories\.(tsx|mdx)$/),
  ],
  module
);
