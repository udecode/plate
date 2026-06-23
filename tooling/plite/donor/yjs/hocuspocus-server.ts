import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Logger as LoggerExtension } from '@hocuspocus/extension-logger';
import { Redis as RedisExtension } from '@hocuspocus/extension-redis';
import {
  type Document as HocuspocusDocument,
  type onAuthenticatePayload,
  Server,
} from '@hocuspocus/server';
import * as Y from 'yjs';

import { readPliteValueFromYjs } from '../../packages/yjs/src/core/document';

type CollabContext = {
  documentName?: string;
  readOnly?: boolean;
};

type HeaderBag = Headers | Record<string, string | string[] | undefined>;

const AUTHORIZATION_SPLIT_RE = /\s+/;

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const YJS_PORT = toNumber(process.env.PLITE_YJS_PORT, 4444);
const YJS_HOST = process.env.PLITE_YJS_HOST ?? '0.0.0.0';
const YJS_PATH = process.env.PLITE_YJS_PATH ?? '/yjs';
const YJS_TIMEOUT = toNumber(process.env.PLITE_YJS_TIMEOUT, 10_000);
const YJS_DEBOUNCE = toNumber(process.env.PLITE_YJS_DEBOUNCE, 2000);
const YJS_MAX_DEBOUNCE = toNumber(process.env.PLITE_YJS_MAX_DEBOUNCE, 10_000);
const YJS_ROOT_NAME = process.env.PLITE_YJS_ROOT_NAME ?? '@platejs/plite';
const YJS_STORAGE_DIR = path.resolve(
  process.cwd(),
  process.env.PLITE_YJS_STORAGE_DIR ?? '.tmp/yjs-documents'
);
const YJS_AUTH_TOKEN = process.env.PLITE_YJS_AUTH_TOKEN;
const YJS_READ_TOKEN = process.env.PLITE_YJS_READ_TOKEN;
const YJS_ALLOW_ANONYMOUS_READ = toBoolean(
  process.env.PLITE_YJS_ALLOW_ANONYMOUS_READ
);
const YJS_MAX_SNAPSHOT_BYTES = toNumber(
  process.env.PLITE_YJS_MAX_SNAPSHOT_BYTES,
  10 * 1024 * 1024
);
const YJS_WRITE_JSON_DEBUG = toBoolean(
  process.env.PLITE_YJS_WRITE_JSON_DEBUG,
  true
);
const REDIS_ENABLED = toBoolean(process.env.PLITE_YJS_REDIS_ENABLED);
const REDIS_HOST = process.env.PLITE_YJS_REDIS_HOST ?? '127.0.0.1';
const REDIS_PORT = toNumber(process.env.PLITE_YJS_REDIS_PORT, 6379);
const REDIS_USERNAME = process.env.PLITE_YJS_REDIS_USERNAME;
const REDIS_PASSWORD = process.env.PLITE_YJS_REDIS_PASSWORD;

const markReadOnly = (
  context: CollabContext,
  connectionConfig?: onAuthenticatePayload['connectionConfig']
) => {
  context.readOnly = true;

  if (connectionConfig) {
    connectionConfig.readOnly = true;
  }
};

const getHeader = (headers: HeaderBag, key: string): string | undefined => {
  if (headers instanceof Headers) {
    return headers.get(key) ?? undefined;
  }

  const value = headers[key] ?? headers[key.toLowerCase()];

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return value;
};

const bearerToken = (headers: HeaderBag): string | undefined => {
  const authorization = getHeader(headers, 'authorization');

  if (!authorization) {
    return;
  }

  const [scheme, token] = authorization.split(AUTHORIZATION_SPLIT_RE, 2);

  return scheme?.toLowerCase() === 'bearer' ? token : undefined;
};

const sanitizeDocumentName = (documentName: string) =>
  documentName
    .replaceAll(/[^a-zA-Z0-9._-]/g, '_')
    .replaceAll(/^_+|_+$/g, '')
    .slice(0, 160) || 'document';

const snapshotPath = (documentName: string) =>
  path.join(YJS_STORAGE_DIR, `${sanitizeDocumentName(documentName)}.bin`);

const jsonDebugPath = (documentName: string) =>
  path.join(YJS_STORAGE_DIR, `${sanitizeDocumentName(documentName)}.json`);

const writeAtomic = async (targetPath: string, data: Uint8Array | string) => {
  const tempPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;

  await writeFile(tempPath, data);
  await rename(tempPath, targetPath);
};

const loadSnapshot = async (
  document: HocuspocusDocument,
  documentName: string
) => {
  try {
    const update = await readFile(snapshotPath(documentName));

    Y.applyUpdate(document, update);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
};

const storeSnapshot = async (
  document: HocuspocusDocument,
  documentName: string
) => {
  const update = Y.encodeStateAsUpdate(document);

  if (update.byteLength > YJS_MAX_SNAPSHOT_BYTES) {
    throw new Error(
      `Yjs snapshot is too large: ${update.byteLength} bytes exceeds ${YJS_MAX_SNAPSHOT_BYTES}`
    );
  }

  await mkdir(YJS_STORAGE_DIR, { recursive: true });
  await writeAtomic(snapshotPath(documentName), update);

  if (YJS_WRITE_JSON_DEBUG) {
    const root = document.get(YJS_ROOT_NAME, Y.XmlElement);
    const value = readPliteValueFromYjs(root);

    await writeAtomic(
      jsonDebugPath(documentName),
      `${JSON.stringify(
        {
          documentName,
          rootName: YJS_ROOT_NAME,
          updatedAt: new Date().toISOString(),
          value,
        },
        null,
        2
      )}\n`
    );
  }
};

const extensions = [
  new LoggerExtension({
    log: (..._args: unknown[]) => {},
    onChange: false,
  }),
];

if (REDIS_ENABLED) {
  extensions.push(
    new RedisExtension({
      host: REDIS_HOST,
      port: REDIS_PORT,
      ...(REDIS_USERNAME || REDIS_PASSWORD
        ? {
            options: {
              ...(REDIS_USERNAME ? { username: REDIS_USERNAME } : {}),
              ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
            },
          }
        : {}),
    }) as never
  );
}

const collabServer = new Server(
  {
    address: YJS_HOST,
    debounce: YJS_DEBOUNCE,
    extensions,
    maxDebounce: YJS_MAX_DEBOUNCE,
    name: 'slate-yjs-collab',
    port: YJS_PORT,
    quiet: true,
    timeout: YJS_TIMEOUT,
    onAuthenticate: async (payload) => {
      payload.context ??= {};
      const context = payload.context as CollabContext;
      const token =
        payload.token || bearerToken(payload.requestHeaders as HeaderBag);

      context.documentName = payload.documentName;

      if (!YJS_AUTH_TOKEN) {
        return;
      }

      if (token === YJS_AUTH_TOKEN) {
        return;
      }

      if (
        YJS_ALLOW_ANONYMOUS_READ ||
        (YJS_READ_TOKEN && token === YJS_READ_TOKEN)
      ) {
        markReadOnly(context, payload.connectionConfig);

        return;
      }

      throw new Error('Unauthorized');
    },
    onLoadDocument: async ({ document, documentName }) => {
      await loadSnapshot(document, documentName);
    },
    onStoreDocument: async ({ context, document, documentName }) => {
      if ((context as CollabContext | undefined)?.readOnly) {
        return;
      }

      await storeSnapshot(document, documentName);
    },
  },
  {
    path: YJS_PATH,
  }
);

collabServer
  .listen()
  .then(() => {
    const host = YJS_HOST === '0.0.0.0' ? '127.0.0.1' : YJS_HOST;

    console.log(
      `[slate-yjs] Hocuspocus listening at ws://${host}:${YJS_PORT}${YJS_PATH}`
    );
    console.log(`[slate-yjs] snapshots: ${YJS_STORAGE_DIR}`);
    console.log(`[slate-yjs] redis: ${REDIS_ENABLED ? 'enabled' : 'disabled'}`);
  })
  .catch((error) => {
    console.error('[slate-yjs] failed to start Hocuspocus server', error);

    throw error;
  });
