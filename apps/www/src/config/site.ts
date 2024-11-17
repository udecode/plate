export const siteConfig = {
  author: 'zbeyens',
  description: 'The rich-text editor framework for React.',
  links: {
    discord: 'https://discord.gg/mAZRuBzGM3',
    github: 'https://github.com/udecode/plate',
    platePro: 'https://pro.platejs.org',
    plateProComponent: (id: string) =>
      `https://pro.platejs.org/docs/components/${id}`,
    plateProExample: (id: string) =>
      `https://pro.platejs.org/docs/examples/${id}`,
    plateProIframe: 'https://pro.platejs.org/iframe',
    potionIframe: 'https://potion.platejs.org/playground?iframe=true',
    potionTemplate: 'https://pro.platejs.org/docs/templates/potion',
    profile: 'https://github.com/zbeyens',
    twitter: 'https://twitter.com/zbeyens',
  },
  name: 'Plate',
  ogImage: 'https://platejs.org/og.png',
  url: 'https://platejs.org',
};

export type SiteConfig = typeof siteConfig;
