import type { RegistryItem } from 'shadcn/registry';

export const registryStyles: RegistryItem[] = [
  {
    dependencies: ['tailwind-scrollbar-hide'],
    files: [],
    name: 'tailwind-scrollbar-hide',
    tailwind: {
      config: {
        plugins: ['tailwind-scrollbar-hide'],
      },
    },
    type: 'registry:style',
  },
  {
    cssVars: {
      dark: {
        highlight: 'oklch(0.852 0.199 91.936)',
        hljsBuiltIn: 'oklch(0.6935 0.1548 59.32)',
        hljsBullet: 'oklch(0.5222 0.1621 89.45)',
        hljsComment: 'oklch(0.5726 0.0316 264.48)',
        hljsDiffAdditionBackground: 'oklch(0.3483 0.0496 148.64)',
        hljsDiffAdditionForeground: 'oklch(0.8736 0.0639 142.12)',
        hljsDiffDeletionBackground: 'oklch(0.3096 0.0392 24.41)',
        hljsDiffDeletionForeground: 'oklch(0.8467 0.0615 19.89)',
        hljsFunction: 'oklch(0.7134 0.2318 295.82)',
        hljsKeyword: 'oklch(0.6833 0.2439 29.58)',
        hljsLiteral: 'oklch(0.6976 0.1202 255.44)',
        hljsSection: 'oklch(0.7415 0.1503 254.68)',
        hljsSelectorTag: 'oklch(0.6609 0.1746 145.91)',
        hljsString: 'oklch(0.6952 0.1886 254.35)',
      },
      light: {
        highlight: 'oklch(0.852 0.199 91.936)',
        hljsBuiltIn: 'oklch(0.6953 0.2258 47.44)',
        hljsBullet: 'oklch(0.5222 0.1621 89.45)',
        hljsComment: 'oklch(0.5726 0.0316 264.48)',
        hljsDiffAdditionBackground: 'oklch(0.9764 0.0154 157.82)',
        hljsDiffAdditionForeground: 'oklch(0.5305 0.1826 145.77)',
        hljsDiffDeletionBackground: 'oklch(0.9633 0.0275 22.53)',
        hljsDiffDeletionForeground: 'oklch(0.4772 0.2655 24.88)',
        hljsFunction: 'oklch(0.5159 0.2039 296.99)',
        hljsKeyword: 'oklch(0.5963 0.2607 27.37)',
        hljsLiteral: 'oklch(0.4789 0.1768 258.57)',
        hljsSection: 'oklch(0.4789 0.1768 258.57)',
        hljsSelectorTag: 'oklch(0.5305 0.1826 145.77)',
        hljsString: 'oklch(0.2967 0.0844 257.56)',
      },
    },
    files: [],
    name: 'highlight-style',
    type: 'registry:style',
  },
];
