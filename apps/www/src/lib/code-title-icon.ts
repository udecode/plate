export function getCodeTitleIconLabel(language: unknown) {
  if (typeof language !== 'string') return;

  switch (language) {
    case 'css':
      return '#';
    case 'javascript':
    case 'js':
    case 'jsx':
      return 'JS';
    case 'json':
      return '{}';
    case 'bash':
    case 'sh':
    case 'shell':
      return '>';
    case 'ts':
    case 'tsx':
    case 'typescript':
      return 'TS';
    default:
      return language.slice(0, 3).toUpperCase();
  }
}
