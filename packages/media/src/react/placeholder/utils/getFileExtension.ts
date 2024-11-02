export const getFileExtension = (filename: string) => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  filename = filename.trim();

  if (filename.endsWith('.')) {
    return '';
  }

  const ext = filename.split('.').pop();

  if (ext === filename || filename.startsWith('.')) {
    return '';
  }

  return ext?.toLowerCase() ?? '';
};
