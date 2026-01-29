import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'SuperDoc',
  description: 'The modern collaborative document editor for the web',

  dest: '../docs/',
  srcDir: './src',

  lastUpdated: false,
  cleanUrls: true,

  /* prettier-ignore */
  head: [
    ['link', { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }],
    ['link', { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" }],
    ['link', { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" }],
    ['link', { rel: "manifest", href: "/site.webmanifest" }],
    ['meta', { name: 'theme-color', content: '#1255FE' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'SuperDoc' }],
  ],

  themeConfig: {
    logo: { light: '/logo.png', dark: '/logo-dark.png' },
    siteTitle: false,
    sidebar: sidebar(),
    nav: navMenu(),
    search: {
      provider: 'local',
    },
    footer: {
      message: `© ${new Date().getFullYear()} Harbour Enterprises, Inc. 💙💛`,
    },
    socialLinks: [
      { icon: 'discord', link: 'https://discord.gg/b9UuaZRyaB' },
      { icon: 'github', link: 'https://github.com/Harbour-Enterprises/SuperDoc' },
    ],
  },
});

function navMenu() {
  return [
    { text: 'Docs', link: '/' },
    // { text: 'Demos', link: '/demos/' },
    // { text: 'API', link: '/api/' },
  ];
}

function sidebar() {
  return {
    '/': [
      {
        text: 'Quick Start',
        link: '/',
        items: [
          { text: 'Introduction', link: '/#introduction' },
          { text: 'Installation', link: '/#installation' },
          { text: 'Basic Usage', link: '/#basic-usage' },
          { text: 'Configuration', link: '/#configuration' },
        ],
      },
      {
        text: 'Integration',
        link: '/integration',
        items: [
          { text: 'React', link: '/integration/#react' },
          { text: 'Vue', link: '/integration/#vue' },
          { text: 'Vanilla JS', link: '/integration/#vanilla-js' },
        ],
      },
      {
        text: 'Components',
        link: '/components',
        items: [
          { text: 'SuperDoc', link: '/components/#superdoc' },
          { text: 'SuperEditor', link: '/components/#supereditor' },
        ],
      },
      {
        text: 'Modules',
        link: '/modules',
        items: [
          { text: 'Toolbar', link: '/modules/#superdoc-toolbar' },
          { text: 'Comments', link: '/modules/#comments' },
          { text: 'Search', link: '/modules/#search' },
          { text: 'Fields', link: '/modules/#fields' },
          { text: 'Annotate', link: '/modules/#annotate' },
        ]
      },
      {
        text: 'Resources',
        link: '/resources',
        items: [
          { text: 'Examples', link: '/resources/#examples' },
          { text: 'FAQ', link: '/resources/#faq' },
          {
            text: 'Guides',
            link: '/resources/#guides',
            collapsed: true,
            items: [
              {
                text: 'Migrate from Prosemirror',
                link: '/resources/#migrate-from-prosemirror',
              },
            ],
          },
          {
            text: 'License',
            link: '/resources/#license',
          },
        ],
      },
    ],
  };
}