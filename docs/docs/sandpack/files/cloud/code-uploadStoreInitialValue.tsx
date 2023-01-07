export const uploadStoreInitialValueCode = `const GENERIC_URL =
  'https://gist.githubusercontent.com/prabansal/115387/raw/0e5911c791c03f2ffb9708d98cac70dd2c1bf0ba/HelloWorld.txt';
const IMAGE_URL =
  'https://files.portive.com/f/demo/6hndj3bdag7eqbpb2794s--1920x1440.jpg';

export const uploadStoreInitialValue: any = {
  '#a': {
    status: 'progress',
    url: GENERIC_URL,
    sentBytes: 0,
    totalBytes: 1024,
  },
  '#b': {
    status: 'progress',
    url: GENERIC_URL,
    sentBytes: 512,
    totalBytes: 1024,
  },
  '#c': {
    status: 'progress',
    url: GENERIC_URL,
    sentBytes: 1024,
    totalBytes: 1024,
  },
  '#d': {
    status: 'success',
    url:
      'https://gist.githubusercontent.com/prabansal/115387/raw/0e5911c791c03f2ffb9708d98cac70dd2c1bf0ba/HelloWorld.txt',
  },
  '#e': {
    status: 'error',
    url: GENERIC_URL,
    message: 'Upload limit reached',
  },
  '#image-none': {
    status: 'progress',
    url: IMAGE_URL,
    sentBytes: 0,
    totalBytes: 1024,
  },
  '#image-half': {
    status: 'progress',
    url: IMAGE_URL,
    sentBytes: 512,
    totalBytes: 1024,
  },
  '#image-full': {
    status: 'progress',
    url: IMAGE_URL,
    sentBytes: 1024,
    totalBytes: 1024,
  },
  '#image-error': {
    status: 'error',
    url: IMAGE_URL,
    message: 'failed to upload',
  },
};
`;

export const uploadStoreInitialValueFile = {
  '/cloud/uploadStoreInitialValue.tsx': uploadStoreInitialValueCode,
};
