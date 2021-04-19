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
      items: ['getting-started/installation'],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/basic-editor',
        'guides/creating-plugins',
        'guides/styling',
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
          items: ['api/slate-plugins'],
          collapsed: false,
        },
        // 'api/slate-plugins',
      ],
      collapsed: false,
    },
  ],
};
