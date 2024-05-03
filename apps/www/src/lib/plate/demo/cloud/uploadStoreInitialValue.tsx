const GENERIC_URL =
  'https://gist.githubusercontent.com/prabansal/115387/raw/0e5911c791c03f2ffb9708d98cac70dd2c1bf0ba/HelloWorld.txt';
const IMAGE_URL =
  'https://files.portive.com/f/demo/6hndj3bdag7eqbpb2794s--1920x1440.jpg';

export const uploadStoreInitialValue: any = {
  '#a': {
    sentBytes: 0,
    status: 'progress',
    totalBytes: 1024,
    url: GENERIC_URL,
  },
  '#b': {
    sentBytes: 512,
    status: 'progress',
    totalBytes: 1024,
    url: GENERIC_URL,
  },
  '#c': {
    sentBytes: 1024,
    status: 'progress',
    totalBytes: 1024,
    url: GENERIC_URL,
  },
  '#d': {
    status: 'success',
    url: 'https://gist.githubusercontent.com/prabansal/115387/raw/0e5911c791c03f2ffb9708d98cac70dd2c1bf0ba/HelloWorld.txt',
  },
  '#e': {
    message: 'Upload limit reached',
    status: 'error',
    url: GENERIC_URL,
  },
  '#image-error': {
    message: 'failed to upload',
    status: 'error',
    url: IMAGE_URL,
  },
  '#image-full': {
    sentBytes: 1024,
    status: 'progress',
    totalBytes: 1024,
    url: IMAGE_URL,
  },
  '#image-half': {
    sentBytes: 512,
    status: 'progress',
    totalBytes: 1024,
    url: IMAGE_URL,
  },
  '#image-none': {
    sentBytes: 0,
    status: 'progress',
    totalBytes: 1024,
    url: IMAGE_URL,
  },
};
