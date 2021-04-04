/** @type {import('@docusaurus/types').DocusaurusConfig} */

const githubOrgUrl = 'https://github.com/udecode';
const domain = 'https://slate-plugins-next.netlify.app/';
const npmOrgUrl = 'https://www.npmjs.com/package/@udecode';

const customFields = {
  copyright: `© ${new Date().getFullYear()} Ziad Beyens. All rights reserved.`,
  domain,
  githubOrgUrl,
  githubUrl: `${githubOrgUrl}/slate-plugins`,
  githubDocsUrl: `${githubOrgUrl}/slate-plugins/docs`,
  npmCoreUrl: `${npmOrgUrl}/slate-plugins`,
  announcementBarContent:
    'If you like slate-plugins, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/udecode/slate-plugins">GitHub</a> 🎉 !️',
};

module.exports = {
  title: 'Slate Plugins',
  tagline: 'A plugin framework for building rich text editors with slate',
  url: customFields.domain,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'udecode', // Usually your GitHub org/user name.
  projectName: 'slate-plugins', // Usually your repo name.
  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: ['docusaurus-plugin-sass', 'my-loaders'],
  customFields: { ...customFields },
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'github-star',
      content: customFields.announcementBarContent,
      backgroundColor: '#ff6288',
      textColor: 'white',
    },
    prism: {
      defaultLanguage: 'typescript',
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
    },
    navbar: {
      title: 'Slate Plugins',
      // logo: {
      //   alt: 'Slate Plugins Logo',
      //   src: 'img/logo.svg',
      // },
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
          // A full-page navigation, used for navigating outside of the website.
          // You should only use either `to` or `href`.
          href: 'https://slate-plugins-next.netlify.app/',
          label: 'Examples',
          position: 'right',
        },
        {
          href: 'https://slate-plugins-api.netlify.app/globals.html',
          label: 'API',
          position: 'right',
        },
        {
          // A full-page navigation, used for navigating outside of the website.
          // You should only use either `to` or `href`.
          href: 'https://github.com/udecode/slate-plugins',
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
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'docs/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
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
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/udecode/slate-plugins/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
        },
      },
    ],
  ],
};
