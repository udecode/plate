export function fixImport(content: string) {
  const regex =
    /@\/(.+?)\/((?:.*?\/)?(?:components|ui|hooks|lib|app|example))\/([\w-]+)/g;

  const replacement = (
    match: string,
    _path: string,
    type: string,
    component: string
  ) => {
    if (type.endsWith('components') || type.endsWith('example')) {
      return `@/components/${component}`;
    }
    if (type.endsWith('ui')) {
      return `@/components/ui/${component}`;
    }
    if (type.endsWith('hooks')) {
      return `@/hooks/${component}`;
    }
    if (type.endsWith('lib')) {
      return `@/lib/${component}`;
    }
    if (type.endsWith('app')) {
      return `@/app/${component}`;
    }

    return match;
  };

  return content.replace(regex, replacement);
}
