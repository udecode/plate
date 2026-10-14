import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { POST } from './route';

const env = { ...process.env };

const visit = (rendered: number) => ({
  errors: [],
  frame: false,
  path: '/docs/widget',
  rendered,
  sent: Date.now(),
  theme: 'light',
  webdriver: false,
  width: 1280,
});

const post = (body: unknown) =>
  POST(
    new Request('http://localhost:3519/api/dev/drive', {
      body: JSON.stringify(body),
      method: 'POST',
    })
  );

function newDriveDirectory() {
  const dir = path.join(
    mkdtempSync(path.join(tmpdir(), 'drive-route-')),
    'drive'
  );
  Object.assign(process.env, {
    NODE_ENV: 'development',
    PLATE_WWW_DRIVE_DIR: dir,
  });
  return dir;
}

describe('POST /api/dev/drive', () => {
  afterEach(() => {
    for (const key of ['NODE_ENV', 'PLATE_WWW_DRIVE_DIR'] as const) {
      if (env[key] === undefined) delete process.env[key];
      else Object.assign(process.env, { [key]: env[key] });
    }
  });

  it('records a visit into a drive directory that does not exist yet', async () => {
    const dir = newDriveDirectory();
    const rendered = Date.now() - 1000;

    const response = await post(visit(rendered));

    expect(response.status).toBe(204);
    expect(
      JSON.parse(readFileSync(path.join(dir, 'visits.jsonl'), 'utf-8')).rendered
    ).toBe(rendered);
  });

  it('records a visit whose page carries no render time, so its errors still reach check', async () => {
    const dir = newDriveDirectory();

    await post({ ...visit(0), errors: ['boom'], rendered: undefined });

    expect(
      JSON.parse(readFileSync(path.join(dir, 'visits.jsonl'), 'utf-8')).errors
    ).toEqual(['boom']);
  });

  it('refuses a visit whose page rendered after the server received it', async () => {
    const dir = newDriveDirectory();

    const response = await post(visit(Date.now() + 60_000));

    expect(response.status).toBe(400);
    expect(existsSync(path.join(dir, 'visits.jsonl'))).toBe(false);
  });
});
