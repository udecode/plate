module.exports = {
  stories: [
    '../stories/docs/**/intro.stories.mdx',
    '../stories/docs/**/getting-started.stories.mdx',
    '../stories/docs/**/guide.stories.mdx',
    '../stories/docs/**/contributing.stories.mdx',
    '../stories/docs/**/*.stories.(tsx|mdx)',
    '../stories/basic/**/*.stories.(tsx|mdx)',
    '../stories/basic/editable-voids.stories.tsx',
    '../stories/plugins/**/playground.stories.tsx',
    '../stories/plugins/**/*.stories.(tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-knobs',
    '@storybook/addon-docs/preset'
  ]
}