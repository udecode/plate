const path = require('path');

const githubOrgUrl = 'https://github.com/udecode';
const projectName = 'slate-plugins';
const githubUrl = `${githubOrgUrl}/${projectName}`;
const domain = 'https://slate-plugins.udecode.io';
const domainExamples = '/docs/examples/introduction';
const domainAPI = 'https://slate-plugins-api.udecode.io/globals.html';
const npmOrgUrl = 'https://www.npmjs.com/package/@udecode';

const customFields = {
  title: 'Slate Plugins',
  tagline: 'Rapidly build your rich-text editor with Slate',
  copyright: `© ${new Date().getFullYear()} Ziad Beyens. All rights reserved.`,
  domain,
  githubOrgUrl,
  githubUrl,
  githubDocsUrl: `${githubOrgUrl}/docs`,
  npmCoreUrl: `${npmOrgUrl}/slate-plugins`,
  announcementBarContent: `If you like slate-plugins, give it a star on <a target="_blank" rel="noopener noreferrer" href="${githubUrl}">GitHub</a> 🎉 !️`,
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
      indexName: 'slate-plugins',
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
      title: 'Slate Plugins',
      logo: {
        alt: 'Slate Plugins Logo',
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
          href: 'https://codesandbox.io/s/slate-plugins-playground-v1-2mh1c',
          label: 'Playground',
          position: 'right',
        },
        {
          // A full-page navigation, used for navigating outside of the website.
          // You should only use either `to` or `href`.
          href: domainExamples,
          label: 'Examples',
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
              href: 'https://slate-js.slack.com/messages/slate-plugins',
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
      'docusaurus-plugin-module-alias',
      {
        alias: {
          '@udecode/slate-plugins': path.resolve(
            __dirname,
            '../packages/slate-plugins/src'
          ),
          '@udecode/slate-plugins-common': path.resolve(
            __dirname,
            '../packages/common/src'
          ),
          '@udecode/slate-plugins-core': path.resolve(
            __dirname,
            '../packages/core/src'
          ),
          '@udecode/slate-plugins-basic-elements': path.resolve(
            __dirname,
            '../packages/elements/basic-elements/src'
          ),
          '@udecode/slate-plugins-alignment': path.resolve(
            __dirname,
            '../packages/elements/alignment/src'
          ),
          '@udecode/slate-plugins-alignment-ui': path.resolve(
            __dirname,
            '../packages/elements/alignment-ui/src'
          ),
          '@udecode/slate-plugins-block-quote': path.resolve(
            __dirname,
            '../packages/elements/block-quote/src'
          ),
          '@udecode/slate-plugins-block-quote-ui': path.resolve(
            __dirname,
            '../packages/elements/block-quote-ui/src'
          ),
          '@udecode/slate-plugins-code-block': path.resolve(
            __dirname,
            '../packages/elements/code-block/src'
          ),
          '@udecode/slate-plugins-code-block-ui': path.resolve(
            __dirname,
            '../packages/elements/code-block-ui/src'
          ),
          '@udecode/slate-plugins-heading': path.resolve(
            __dirname,
            '../packages/elements/heading/src'
          ),
          '@udecode/slate-plugins-image': path.resolve(
            __dirname,
            '../packages/elements/image/src'
          ),
          '@udecode/slate-plugins-image-ui': path.resolve(
            __dirname,
            '../packages/elements/image-ui/src'
          ),
          '@udecode/slate-plugins-link': path.resolve(
            __dirname,
            '../packages/elements/link/src'
          ),
          '@udecode/slate-plugins-link-ui': path.resolve(
            __dirname,
            '../packages/elements/link-ui/src'
          ),
          '@udecode/slate-plugins-list': path.resolve(
            __dirname,
            '../packages/elements/list/src'
          ),
          '@udecode/slate-plugins-list-ui': path.resolve(
            __dirname,
            '../packages/elements/list-ui/src'
          ),
          '@udecode/slate-plugins-media-embed': path.resolve(
            __dirname,
            '../packages/elements/media-embed/src'
          ),
          '@udecode/slate-plugins-media-embed-ui': path.resolve(
            __dirname,
            '../packages/elements/media-embed-ui/src'
          ),
          '@udecode/slate-plugins-mention': path.resolve(
            __dirname,
            '../packages/elements/mention/src'
          ),
          '@udecode/slate-plugins-mention-ui': path.resolve(
            __dirname,
            '../packages/elements/mention-ui/src'
          ),
          '@udecode/slate-plugins-paragraph': path.resolve(
            __dirname,
            '../packages/elements/paragraph/src'
          ),
          '@udecode/slate-plugins-table': path.resolve(
            __dirname,
            '../packages/elements/table/src'
          ),
          '@udecode/slate-plugins-table-ui': path.resolve(
            __dirname,
            '../packages/elements/table-ui/src'
          ),
          '@udecode/slate-plugins-basic-marks': path.resolve(
            __dirname,
            '../packages/marks/basic-marks/src'
          ),
          '@udecode/slate-plugins-highlight': path.resolve(
            __dirname,
            '../packages/marks/highlight/src'
          ),
          '@udecode/slate-plugins-kbd': path.resolve(
            __dirname,
            '../packages/marks/kbd/src'
          ),
          '@udecode/slate-plugins-html-serializer': path.resolve(
            __dirname,
            '../packages/serializers/html-serializer/src'
          ),
          '@udecode/slate-plugins-md-serializer': path.resolve(
            __dirname,
            '../packages/serializers/md-serializer/src'
          ),
          '@udecode/slate-plugins-slate-plugins': path.resolve(
            __dirname,
            '../packages/slate-plugins/src'
          ),
          '@udecode/slate-plugins-autoformat': path.resolve(
            __dirname,
            '../packages/autoformat/src'
          ),
          '@udecode/slate-plugins-break': path.resolve(
            __dirname,
            '../packages/break/src'
          ),
          '@udecode/slate-plugins-dnd': path.resolve(
            __dirname,
            '../packages/dnd/src'
          ),
          '@udecode/slate-plugins-find-replace': path.resolve(
            __dirname,
            '../packages/find-replace/src'
          ),
          '@udecode/slate-plugins-find-replace-ui': path.resolve(
            __dirname,
            '../packages/find-replace-ui/src'
          ),
          '@udecode/slate-plugins-node-id': path.resolve(
            __dirname,
            '../packages/node-id/src'
          ),
          '@udecode/slate-plugins-normalizers': path.resolve(
            __dirname,
            '../packages/normalizers/src'
          ),
          '@udecode/slate-plugins-reset-node': path.resolve(
            __dirname,
            '../packages/reset-node/src'
          ),
          '@udecode/slate-plugins-select': path.resolve(
            __dirname,
            '../packages/select/src'
          ),
          '@udecode/slate-plugins-trailing-block': path.resolve(
            __dirname,
            '../packages/trailing-block/src'
          ),
          '@udecode/slate-plugins-toolbar': path.resolve(
            __dirname,
            '../packages/ui/toolbar/src'
          ),
          '@udecode/slate-plugins-ui-fluent': path.resolve(
            __dirname,
            '../packages/ui/fluent/src'
          ),
          '@udecode/slate-plugins-test-utils': path.resolve(
            __dirname,
            '../packages/test-utils/src'
          ),
        },
      },
    ],
  ],
};
