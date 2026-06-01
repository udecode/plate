const ABSOLUTE_URL_REGEX = /^https?:\/\//;
const PLATE_REGISTRY_NAMESPACE = '@plate';
const plateRegistryUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/rd/{name}.json'
    : 'https://platejs.org/r/{name}.json';

function isDirectDependencySpecifier(dependency: string) {
  return (
    dependency.startsWith('@') ||
    dependency.startsWith('/') ||
    dependency.startsWith('./') ||
    dependency.startsWith('../') ||
    ABSOLUTE_URL_REGEX.test(dependency)
  );
}

export function toRegistryDependencySpecifier(dependency: string) {
  if (isDirectDependencySpecifier(dependency)) {
    return dependency;
  }

  return plateRegistryUrl.replace('{name}', dependency);
}

export function toLocalRegistryDependency(dependency: string) {
  if (dependency.startsWith(`${PLATE_REGISTRY_NAMESPACE}/`)) {
    return `${dependency.slice(PLATE_REGISTRY_NAMESPACE.length + 1)}.json`;
  }

  try {
    const url = new URL(dependency);

    if (
      (url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname === 'platejs.org') &&
      url.pathname.endsWith('.json')
    ) {
      return url.pathname.split('/').at(-1) ?? dependency;
    }
  } catch {
    return dependency;
  }

  return dependency;
}
