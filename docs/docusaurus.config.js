const path = require('path');

const githubOrgUrl = 'https://github.com/udecode';
const projectName = 'plate';
const githubUrl = `${githubOrgUrl}/${projectName}`;
const domain = 'https://plate.udecode.io';
const domainExamples = '/docs/examples/introduction';
const domainAPI = 'https://plate-api.udecode.io/globals.html';
const npmOrgUrl = 'https://www.npmjs.com/package/@udecode';

const customFields = {
  title: 'Plate',
  tagline: 'Rapidly build your rich-text editor with Slate',
  copyright: `© ${new Date().getFullYear()} Ziad Beyens. All rights reserved.`,
  domain,
  githubOrgUrl,
  githubUrl,
  githubDocsUrl: `${githubOrgUrl}/docs`,
  npmCoreUrl: `${npmOrgUrl}/plate`,
  announcementBarContent: `If you like plate, give it a star on <a target="_blank" rel="noopener noreferrer" href="${githubUrl}">GitHub</a> 🎉 !️`,
};

const alias = {
  '@udecode/plate': 'plate',
  '@udecode/plate-alignment': 'nodes/alignment',
  '@udecode/plate-autoformat': 'editor/autoformat',
  '@udecode/plate-basic-elements': 'nodes/basic-elements',
  '@udecode/plate-basic-marks': 'nodes/basic-marks',
  '@udecode/plate-block-quote': 'nodes/block-quote',
  '@udecode/plate-break': 'editor/break',
  '@udecode/plate-code-block': 'nodes/code-block',
  '@udecode/plate-combobox': 'editor/combobox',
  '@udecode/plate-core': 'core',
  '@udecode/plate-serializer-csv': 'serializers/csv',
  '@udecode/plate-serializer-docx': 'serializers/docx',
  '@udecode/plate-excalidraw': 'ui/nodes/excalidraw',
  '@udecode/plate-find-replace': 'decorators/find-replace',
  '@udecode/plate-font': 'nodes/font',
  '@udecode/plate-headless': 'headless',
  '@udecode/plate-heading': 'nodes/heading',
  '@udecode/plate-highlight': 'nodes/highlight',
  '@udecode/plate-horizontal-rule': 'nodes/horizontal-rule',
  '@udecode/plate-image': 'nodes/image',
  '@udecode/plate-indent': 'nodes/indent',
  '@udecode/plate-indent-list': 'nodes/indent-list',
  '@udecode/plate-juice': 'serializers/juice',
  '@udecode/plate-kbd': 'nodes/kbd',
  '@udecode/plate-line-height': 'nodes/line-height',
  '@udecode/plate-link': 'nodes/link',
  '@udecode/plate-list': 'nodes/list',
  '@udecode/plate-serializer-md': 'serializers/md',
  '@udecode/plate-media-embed': 'nodes/media-embed',
  '@udecode/plate-mention': 'nodes/mention',
  '@udecode/plate-node-id': 'editor/node-id',
  '@udecode/plate-normalizers': 'editor/normalizers',
  '@udecode/plate-paragraph': 'nodes/paragraph',
  '@udecode/plate-reset-node': 'editor/reset-node',
  '@udecode/plate-select': 'editor/select',
  '@udecode/plate-styled-components': 'ui/styled-components',
  '@udecode/plate-table': 'nodes/table',
  '@udecode/plate-test-utils': 'test-utils',
  '@udecode/plate-trailing-block': 'editor/trailing-block',
  '@udecode/plate-ui': 'ui/plate',
  '@udecode/plate-ui-alignment': 'ui/nodes/alignment',
  '@udecode/plate-ui-block-quote': 'ui/nodes/block-quote',
  '@udecode/plate-ui-button': 'ui/button',
  '@udecode/plate-ui-code-block': 'ui/nodes/code-block',
  '@udecode/plate-ui-combobox': 'ui/combobox',
  '@udecode/plate-ui-dnd': 'ui/dnd',
  '@udecode/plate-ui-find-replace': 'ui/find-replace',
  '@udecode/plate-ui-font': 'ui/nodes/font',
  '@udecode/plate-ui-horizontal-rule': 'ui/nodes/horizontal-rule',
  '@udecode/plate-ui-image': 'ui/nodes/image',
  '@udecode/plate-ui-line-height': 'ui/nodes/line-height',
  '@udecode/plate-ui-link': 'ui/nodes/link',
  '@udecode/plate-ui-list': 'ui/nodes/list',
  '@udecode/plate-ui-media-embed': 'ui/nodes/media-embed',
  '@udecode/plate-ui-mention': 'ui/nodes/mention',
  '@udecode/plate-ui-placeholder': 'ui/placeholder',
  '@udecode/plate-ui-popover': 'ui/popover',
  '@udecode/plate-ui-popper': 'ui/popper',
  '@udecode/plate-ui-table': 'ui/nodes/table',
  '@udecode/plate-ui-toolbar': 'ui/toolbar',
};

Object.keys(alias).forEach((key) => {
  alias[key] = path.resolve(__dirname, `../packages/${alias[key]}/src`);
});

module.exports = {
  title: customFields.title,
  tagline: customFields.tagline,
  url: customFields.domain,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'udecode', // Usually your GitHub org/user name.
  projectName, // Usually your repo name.
  themes: ['@docusaurus/theme-live-codeblock'],
  customFields: { ...customFields },
  themeConfig: {
    algolia: {
      appId: 'HNVXCXRG8Q',
      apiKey: '4a186ddc10e4fc66646a1359ddedfbf0',
      indexName: 'plate',
    },
    // announcementBar: {
    //   id: 'github-star',
    //   content: customFields.announcementBarContent,
    // },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    googleAnalytics: {
      trackingID: 'UA-195622178-1',
      // Optional fields.
      anonymizeIP: true, // Should IPs be anonymized?
    },
    prism: {
      defaultLanguage: 'typescript',
      theme: require('prism-react-renderer/themes/dracula'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
    },
    navbar: {
      title: 'Plate',
      logo: {
        alt: 'Plate Logo',
        src: 'img/logo.svg',
      },
      hideOnScroll: true,
      items: [
        {
          // Client-side routing, used for navigating within the website.
          // The baseUrl will be automatically prepended to this value.
          to: 'docs/',
          // To apply the active class styling on all
          // routes starting with this path.
          // This usually isn't necessary
          activeBasePath: 'docs',
          // The string to be shown.
          label: 'Docs',
          // Left or right side of the navbar.
          position: 'right',
        },
        {
          href: '/docs/playground',
          label: 'Playground',
          position: 'right',
        },
        {
          href: domainAPI,
          label: 'API',
          position: 'right',
        },
        {
          type: 'search',
          position: 'left',
        },
      ],
    },
    // footer: {
    //   // style: 'dark',
    //   links: [
    //     {
    //       title: 'RESOURCES',
    //       items: [
    //         {
    //           label: 'Docs',
    //           to: 'docs/',
    //         },
    //         {
    //           label: 'Examples',
    //           to: domainExamples,
    //         },
    //         {
    //           label: 'API Reference',
    //           to: domainAPI,
    //         },
    //         {
    //           label: 'Releases',
    //           href: `${githubUrl}/releases`,
    //         },
    //       ],
    //     },
    //     {
    //       title: 'COMMUNITY',
    //       items: [
    //         {
    //           label: 'Forum & Support',
    //           href: `${githubUrl}/discussions`,
    //         },
    //         {
    //           label: 'Stargazers',
    //           href: `${githubUrl}/stargazers`,
    //         },
    //         {
    //           label: 'Slack',
    //           href: 'https://slate-js.slack.com/messages/plate',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'MORE',
    //       items: [
    //         {
    //           label: 'Twitter',
    //           href: 'https://twitter.com/zbeyens',
    //         },
    //         {
    //           label: 'GitHub',
    //           href: 'https://github.com/zbeyens',
    //         },
    //       ],
    //     },
    //   ],
    //   copyright: customFields.copyright,
    // },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: `${githubUrl}/edit/docs/docs`,
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: githubUrl,
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
      },
    ],
  ],
  plugins: [
    'docusaurus-plugin-sass',
    [
      path.resolve(__dirname, 'plugins/module-alias'),
      {
        alias,
      },
    ],
  ],
};
