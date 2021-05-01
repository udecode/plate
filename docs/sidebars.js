module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Slate Plugins',
      items: ['slate-plugins/introduction', 'slate-plugins/contributing'],
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
        'guides/SlatePlugins',
        'guides/store',
        'guides/styling',
        'guides/configuration',
        'guides/creating-plugins',
        {
          type: 'category',
          label: 'Serializing',
          items: ['guides/serializing-html', 'guides/serializing-md'],
          collapsed: false,
        },
      ],
      collapsed: false,
    },

    // {
    //   type: 'category',
    //   label: 'API Reference',
    //   items: [
    //     {
    //       type: 'category',
    //       label: 'Core',
    //       items: [''],
    //       collapsed: false,
    //     },
    //     // 'api/slate-plugins',
    //   ],
    //   collapsed: false,
    // },
  ],
};
