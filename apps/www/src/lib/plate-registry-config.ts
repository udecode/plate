export const PLATE_REGISTRY_NAMESPACE = '@plate';
export const PLATE_REGISTRY_URL = 'https://platejs.org/r/{name}.json';

export const plateComponentsJsonConfig = {
  $schema: 'https://ui.shadcn.com/schema.json',
  style: 'new-york',
  rsc: true,
  tsx: true,
  tailwind: {
    config: '',
    css: 'src/app/globals.css',
    baseColor: 'neutral',
    cssVariables: true,
    prefix: '',
  },
  aliases: {
    components: '@/components',
    utils: '@/lib/utils',
    ui: '@/components/ui',
    lib: '@/lib',
    hooks: '@/hooks',
  },
  iconLibrary: 'lucide',
  registries: {
    [PLATE_REGISTRY_NAMESPACE]: PLATE_REGISTRY_URL,
  },
} as const;
