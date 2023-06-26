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
    //           label: 'Discord',
    //           href: 'https://discord.gg/mAZRuBzGM3',
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
          sidebarPath: require.resolve('./docs/sidebars.js'),
          // Please change this to your repo.
          editUrl: `${githubUrl}/edit/main/docs`,
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
          customCss: [require.resolve('./src/css/custom.scss')],
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
        alias: {},
      },
    ],
    path.resolve(__dirname, 'plugins/source-maps'),
  ],
};
