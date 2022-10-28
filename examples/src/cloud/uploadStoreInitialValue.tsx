import { Upload } from '@udecode/plate';

export const uploadStoreInitialValue: Record<string, Upload> = {
  '#a': { status: 'progress', sentBytes: 0, totalBytes: 1024 },
  '#b': { status: 'progress', sentBytes: 512, totalBytes: 1024 },
  '#c': { status: 'progress', sentBytes: 1024, totalBytes: 1024 },
  '#d': {
    status: 'success',
    url:
      'https://gist.githubusercontent.com/prabansal/115387/raw/0e5911c791c03f2ffb9708d98cac70dd2c1bf0ba/HelloWorld.txt',
  },
  '#e': { status: 'error', message: 'Upload limit reached' },
};
