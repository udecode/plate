export const siteConfig = {
  author: 'zbeyens',
  description: 'The rich-text editor framework for React.',
  links: {
    discord: 'https://discord.gg/mAZRuBzGM3',
    github: 'https://github.com/udecode/plate',
    platePro: 'https://pro.platejs.org',
    plateProIframe: 'https://pro.platejs.org/iframe',
    // Quick fix: playground crashes on iOS
    potionIframe: 'https://potion.platejs.org/ai?iframe=true',
    potionTemplate: 'https://pro.platejs.org/docs/templates/potion',
    profile: 'https://github.com/zbeyens',
    twitter: 'https://twitter.com/zbeyens',
    plateProExample: (id: string) =>
      `https://pro.platejs.org/docs/examples/${id}`,
  },
  name: 'Plate',
  navItems: [
    {
      href: '/docs',
      label: 'Docs',
      labelCn: '文档',
    },
    {
      href: '/editors',
      label: 'Editors',
      labelCn: '编辑器',
    },
  ],
  ogImage: 'https://platejs.org/og.png',
  registryUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/rd/'
      : 'https://platejs.org/r/',
  url:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://platejs.org',
};

export type SiteConfig = typeof siteConfig;

export const META_THEME_COLORS = {
  dark: '#09090b',
  light: '#ffffff',
};
