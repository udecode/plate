export const PLATE_REGISTRY_NAMESPACE = '@plate';
export const PLATE_REGISTRY_HOMEPAGE = 'https://platejs.org';
export const PLATE_REGISTRY_URL = 'https://platejs.org/r/{name}.json';
export const PLATE_REGISTRY_DESCRIPTION =
  'AI-powered rich text editor for React.';
export const PLATE_INIT_URL = 'https://platejs.org/init';
export const PLATE_INIT_ITEM = 'editor-basic';
export const PLATE_INIT_DEPENDENCY = `${PLATE_REGISTRY_NAMESPACE}/${PLATE_INIT_ITEM}`;

export const plateRegistryDirectory = [
  {
    name: PLATE_REGISTRY_NAMESPACE,
    homepage: PLATE_REGISTRY_HOMEPAGE,
    url: PLATE_REGISTRY_URL,
    description: PLATE_REGISTRY_DESCRIPTION,
  },
] as const;

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
