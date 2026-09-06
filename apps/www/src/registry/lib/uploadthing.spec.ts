import { afterAll, describe, expect, it } from 'bun:test';

import { ourFileRouter } from './uploadthing';

const initialEnvironment = process.env.NODE_ENV;
afterAll(() => {
  if (initialEnvironment === undefined)
    Reflect.deleteProperty(process.env, 'NODE_ENV');
  else Object.assign(process.env, { NODE_ENV: initialEnvironment });
});

describe('upload authorization setup', () => {
  it('allows local development uploads', () => {
    Object.assign(process.env, { NODE_ENV: 'development' });

    expect(ourFileRouter.editorUploader.middleware({} as any)).toEqual({});
  });

  it.each([
    'production',
    'test',
  ])('requires application authorization in %s', (environment) => {
    Object.assign(process.env, { NODE_ENV: environment });

    expect(() => ourFileRouter.editorUploader.middleware({} as any)).toThrow(
      'Configure upload authorization before enabling uploads.'
    );
  });
});
