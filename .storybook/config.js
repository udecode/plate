import React from 'react'
import { configure, addDecorator } from '@storybook/react';
import { addParameters } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import { withKnobs } from '@storybook/addon-knobs';
import { GlobalStyle } from '../src/globalStyle';
import addonAPI from '@storybook/addons';

let firstLoad = true;
addonAPI.register('my-organisation/my-addon', (storybookAPI) => {
  storybookAPI.onStory((kind, story) => {
    // when you enter a story, if you are just loading storybook up, default to a specific kind/story. 
    if (firstLoad) {
      firstLoad = false; // make sure to set this flag to false, otherwise you will never be able to look at another story.
      storybookAPI.selectStory('Plugins|Playground', 'PluginsExample');
    }
  });
});


addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
  options: {
    panelPosition: 'bottom',
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
configure([
  require.context('../src', true, /\.stories\.mdx$/),
  require.context('../src', true, /\.stories\.tsx$/)
], module);



