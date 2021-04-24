module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Slate Plugins',
      items: [
        'slate-plugins/introduction',
        'slate-plugins/design-principles',
        'slate-plugins/contributing',
      ],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/basic-editor',
        'getting-started/basic-plugins',
      ],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        // 'guides/plugins',
        'guides/store',
        {
          type: 'category',
          label: 'Styling',
          items: ['guides/css', 'guides/components'],
          collapsed: false,
        },
        'guides/configuration',
        'guides/creating-plugins',
      ],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        {
          type: 'category',
          label: 'Core',
          items: ['api/SlatePlugins', 'api/SlatePluginsState'],
          collapsed: false,
        },
        // 'api/slate-plugins',
      ],
      collapsed: false,
    },
  ],
};
