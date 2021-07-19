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
      apiKey: 'bca3ec311a129061145bf733a2bda13d',
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
    footer: {
      // style: 'dark',
      links: [
        {
          title: 'RESOURCES',
          items: [
            {
              label: 'Docs',
              to: 'docs/',
            },
            {
              label: 'Examples',
              to: domainExamples,
            },
            {
              label: 'API Reference',
              to: domainAPI,
            },
            {
              label: 'Releases',
              href: `${githubUrl}/releases`,
            },
          ],
        },
        {
          title: 'COMMUNITY',
          items: [
            {
              label: 'Forum & Support',
              href: `${githubUrl}/discussions`,
            },
            {
              label: 'Stargazers',
              href: `${githubUrl}/stargazers`,
            },
            {
              label: 'Slack',
              href: 'https://slate-js.slack.com/messages/plate',
            },
          ],
        },
        {
          title: 'MORE',
          items: [
            {
              label: 'Twitter',
              href: 'https://twitter.com/zbeyens',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/zbeyens',
            },
          ],
        },
      ],
      copyright: customFields.copyright,
    },
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
        alias: {
          '@udecode/plate': path.resolve(__dirname, '../packages/plate/src'),
          '@udecode/plate-dnd': path.resolve(__dirname, '../packages/dnd/src'),
          '@udecode/plate-common': path.resolve(
            __dirname,
            '../packages/common/src'
          ),
          '@udecode/plate-core': path.resolve(
            __dirname,
            '../packages/core/src'
          ),
          '@udecode/plate-basic-elements': path.resolve(
            __dirname,
            '../packages/elements/basic-elements/src'
          ),
          '@udecode/plate-alignment': path.resolve(
            __dirname,
            '../packages/elements/alignment/src'
          ),
          '@udecode/plate-alignment-ui': path.resolve(
            __dirname,
            '../packages/elements/alignment-ui/src'
          ),
          '@udecode/plate-block-quote': path.resolve(
            __dirname,
            '../packages/elements/block-quote/src'
          ),
          '@udecode/plate-block-quote-ui': path.resolve(
            __dirname,
            '../packages/elements/block-quote-ui/src'
          ),
          '@udecode/plate-code-block': path.resolve(
            __dirname,
            '../packages/elements/code-block/src'
          ),
          '@udecode/plate-code-block-ui': path.resolve(
            __dirname,
            '../packages/elements/code-block-ui/src'
          ),
          '@udecode/plate-font': path.resolve(
            __dirname,
            '../packages/marks/font/src'
          ),
          '@udecode/plate-font-ui': path.resolve(
            __dirname,
            '../packages/marks/font-ui/src'
          ),
          '@udecode/plate-excalidraw': path.resolve(
            __dirname,
            '../packages/elements/excalidraw/src'
          ),
          '@udecode/plate-heading': path.resolve(
            __dirname,
            '../packages/elements/heading/src'
          ),
          '@udecode/plate-image': path.resolve(
            __dirname,
            '../packages/elements/image/src'
          ),
          '@udecode/plate-image-ui': path.resolve(
            __dirname,
            '../packages/elements/image-ui/src'
          ),
          '@udecode/plate-link': path.resolve(
            __dirname,
            '../packages/elements/link/src'
          ),
          '@udecode/plate-link-ui': path.resolve(
            __dirname,
            '../packages/elements/link-ui/src'
          ),
          '@udecode/plate-list': path.resolve(
            __dirname,
            '../packages/elements/list/src'
          ),
          '@udecode/plate-list-ui': path.resolve(
            __dirname,
            '../packages/elements/list-ui/src'
          ),
          '@udecode/plate-media-embed': path.resolve(
            __dirname,
            '../packages/elements/media-embed/src'
          ),
          '@udecode/plate-media-embed-ui': path.resolve(
            __dirname,
            '../packages/elements/media-embed-ui/src'
          ),
          '@udecode/plate-mention': path.resolve(
            __dirname,
            '../packages/elements/mention/src'
          ),
          '@udecode/plate-mention-ui': path.resolve(
            __dirname,
            '../packages/elements/mention-ui/src'
          ),
          '@udecode/plate-paragraph': path.resolve(
            __dirname,
            '../packages/elements/paragraph/src'
          ),
          '@udecode/plate-placeholder': path.resolve(
            __dirname,
            '../packages/placeholder/src'
          ),
          '@udecode/plate-table': path.resolve(
            __dirname,
            '../packages/elements/table/src'
          ),
          '@udecode/plate-table-ui': path.resolve(
            __dirname,
            '../packages/elements/table-ui/src'
          ),
          '@udecode/plate-basic-marks': path.resolve(
            __dirname,
            '../packages/marks/basic-marks/src'
          ),
          '@udecode/plate-highlight': path.resolve(
            __dirname,
            '../packages/marks/highlight/src'
          ),
          '@udecode/plate-kbd': path.resolve(
            __dirname,
            '../packages/marks/kbd/src'
          ),
          '@udecode/plate-html-serializer': path.resolve(
            __dirname,
            '../packages/serializers/html-serializer/src'
          ),
          '@udecode/plate-md-serializer': path.resolve(
            __dirname,
            '../packages/serializers/md-serializer/src'
          ),
          '@udecode/plate-ast-serializer': path.resolve(
            __dirname,
            '../packages/serializers/ast-serializer/src'
          ),
          '@udecode/plate-plate': path.resolve(
            __dirname,
            '../packages/plate/src'
          ),
          '@udecode/plate-autoformat': path.resolve(
            __dirname,
            '../packages/autoformat/src'
          ),
          '@udecode/plate-break': path.resolve(
            __dirname,
            '../packages/break/src'
          ),
          '@udecode/plate-find-replace': path.resolve(
            __dirname,
            '../packages/find-replace/src'
          ),
          '@udecode/plate-find-replace-ui': path.resolve(
            __dirname,
            '../packages/find-replace-ui/src'
          ),
          '@udecode/plate-node-id': path.resolve(
            __dirname,
            '../packages/node-id/src'
          ),
          '@udecode/plate-normalizers': path.resolve(
            __dirname,
            '../packages/normalizers/src'
          ),
          '@udecode/plate-reset-node': path.resolve(
            __dirname,
            '../packages/reset-node/src'
          ),
          '@udecode/plate-select': path.resolve(
            __dirname,
            '../packages/select/src'
          ),
          '@udecode/plate-styled-components': path.resolve(
            __dirname,
            '../packages/ui/styled-components/src'
          ),
          '@udecode/plate-trailing-block': path.resolve(
            __dirname,
            '../packages/trailing-block/src'
          ),
          '@udecode/plate-toolbar': path.resolve(
            __dirname,
            '../packages/ui/toolbar/src'
          ),
          '@udecode/plate-test-utils': path.resolve(
            __dirname,
            '../packages/test-utils/src'
          ),
        },
      },
    ],
  ],
};
