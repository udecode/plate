export const PLATE_REGISTRY_NAMESPACE = '@plate';
export const PLATE_REGISTRY_HOMEPAGE = 'https://platejs.org';
export const PLATE_REGISTRY_URL = 'https://platejs.org/r/{style}/{name}.json';
export const PLATE_REGISTRY_DESCRIPTION =
  'AI-powered rich text editor for React.';

export const plateRegistryDirectory = [
  {
    name: PLATE_REGISTRY_NAMESPACE,
    homepage: PLATE_REGISTRY_HOMEPAGE,
    url: PLATE_REGISTRY_URL,
    description: PLATE_REGISTRY_DESCRIPTION,
  },
] as const;
