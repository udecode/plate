export const readVSCodeLanguage = (source: {
  getData: (format: string) => string;
}) => {
  try {
    const data: unknown = JSON.parse(source.getData('vscode-editor-data'));

    return typeof data === 'object' &&
      data !== null &&
      'mode' in data &&
      typeof data.mode === 'string'
      ? data.mode
      : null;
  } catch {
    return null;
  }
};
