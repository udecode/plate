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
  '@udecode/plate-alignment': 'elements/alignment',
  '@udecode/plate-alignment-ui': 'elements/alignment-ui',
  '@udecode/plate-ast-serializer': 'serializers/ast-serializer',
  '@udecode/plate-autoformat': 'autoformat',
  '@udecode/plate-basic-elements': 'elements/basic-elements',
  '@udecode/plate-basic-marks': 'marks/basic-marks',
  '@udecode/plate-block-quote': 'elements/block-quote',
  '@udecode/plate-block-quote-ui': 'elements/block-quote-ui',
  '@udecode/plate-break': 'break',
  '@udecode/plate-code-block': 'elements/code-block',
  '@udecode/plate-code-block-ui': 'elements/code-block-ui',
  '@udecode/plate-combobox': 'ui/combobox',
  '@udecode/plate-common': 'common',
  '@udecode/plate-core': 'core',
  '@udecode/plate-dnd': 'dnd',
  '@udecode/plate-excalidraw': 'elements/excalidraw',
  '@udecode/plate-find-replace': 'find-replace',
  '@udecode/plate-find-replace-ui': 'find-replace-ui',
  '@udecode/plate-font': 'marks/font',
  '@udecode/plate-font-ui': 'marks/font-ui',
  '@udecode/plate-heading': 'elements/heading',
  '@udecode/plate-highlight': 'marks/highlight',
  '@udecode/plate-horizontal-rule': 'elements/horizontal-rule',
  '@udecode/plate-horizontal-rule-ui': 'elements/horizontal-rule-ui',
  '@udecode/plate-html-serializer': 'serializers/html-serializer',
  '@udecode/plate-image': 'elements/image',
  '@udecode/plate-image-ui': 'elements/image-ui',
  '@udecode/plate-indent': 'indent',
  '@udecode/plate-kbd': 'marks/kbd',
  '@udecode/plate-link': 'elements/link',
  '@udecode/plate-link-ui': 'elements/link-ui',
  '@udecode/plate-list': 'elements/list',
  '@udecode/plate-list-ui': 'elements/list-ui',
  '@udecode/plate-md-serializer': 'serializers/md-serializer',
  '@udecode/plate-media-embed': 'elements/media-embed',
  '@udecode/plate-media-embed-ui': 'elements/media-embed-ui',
  '@udecode/plate-mention': 'elements/mention',
  '@udecode/plate-mention-ui': 'elements/mention-ui',
  '@udecode/plate-node-id': 'node-id',
  '@udecode/plate-normalizers': 'normalizers',
  '@udecode/plate-paragraph': 'elements/paragraph',
  '@udecode/plate-placeholder': 'placeholder',
  '@udecode/plate-popper': 'ui/popper',
  '@udecode/plate-reset-node': 'reset-node',
  '@udecode/plate-select': 'select',
  '@udecode/plate-styled-components': 'ui/styled-components',
  '@udecode/plate-table': 'elements/table',
  '@udecode/plate-table-ui': 'elements/table-ui',
  '@udecode/plate-test-utils': 'test-utils',
  '@udecode/plate-toolbar': 'ui/toolbar',
  '@udecode/plate-trailing-block': 'trailing-block',
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
      apiKey: '9c3a7f330e20d38672788d4cce383265',
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
