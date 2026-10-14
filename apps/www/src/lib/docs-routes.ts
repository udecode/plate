const MDX_EXTENSION_REGEX = /\.mdx$/;
const CN_EXTENSION_REGEX = /\.cn$/;
const ROUTE_GROUP_REGEX = /^\(.+\)$/;
const DEMO_SUFFIX_REGEX = /-demo$/;

/**
 * The docs URL a `content/docs` source path renders at, such as
 * `(plugins)/(functionality)/lint.cn.mdx` at `/cn/docs/lint`.
 */
export function sourcePathToDocsRoute(sourcePath: string) {
  const withoutExtension = sourcePath.replace(MDX_EXTENSION_REGEX, '');
  const routeParts = withoutExtension
    .replace(CN_EXTENSION_REGEX, '')
    .split('/')
    .filter((part) => !ROUTE_GROUP_REGEX.test(part));

  if (routeParts.at(-1) === 'index') {
    routeParts.pop();
  }

  const prefix = withoutExtension.endsWith('.cn') ? '/cn/docs' : '/docs';
  return routeParts.length > 0 ? `${prefix}/${routeParts.join('/')}` : prefix;
}

/**
 * The `/docs/examples/<slug>` slug of a registry example, its name without
 * `-demo`.
 */
export function registryExampleSlug(name: string) {
  return name.replace(DEMO_SUFFIX_REGEX, '');
}
