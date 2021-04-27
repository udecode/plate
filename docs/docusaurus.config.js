const githubOrgUrl = 'https://github.com/udecode';
const projectName = 'slate-plugins';
const githubUrl = `${githubOrgUrl}/${projectName}`;
const domain = 'https://slate-plugins.udecode.io';
const domainExamples = 'https://slate-plugins-next.udecode.io';
const domainAPI = 'https://slate-plugins-api.udecode.io/globals.html';
const npmOrgUrl = 'https://www.npmjs.com/package/@udecode';

const customFields = {
  title: 'Slate Plugins',
  tagline: 'Build your editor in a clean way.',
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
  plugins: ['docusaurus-plugin-sass'],
  customFields: { ...customFields },
  themeConfig: {
    // algolia: {
    //   apiKey: 'YOUR_API_KEY',
    //   indexName: 'YOUR_INDEX_NAME',
    //
    //   // Optional: see doc section below
    //   contextualSearch: false,
    //
    //   // Optional: see doc section below
    //   appId: 'YOUR_APP_ID',
    //
    //   // Optional: Algolia search parameters
    //   searchParameters: {},
    // },
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
          // A full-page navigation, used for navigating outside of the website.
          // You should only use either `to` or `href`.
          href: githubUrl,
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
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
};
