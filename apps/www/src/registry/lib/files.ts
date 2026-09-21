import { createFiles, FilesError, type Adapter } from 'files-sdk';
import { createFilesRouter } from 'files-sdk/api';
import { createRouteHandler } from 'files-sdk/next';

export const requireFilesEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Configure ${name} for the Files gateway`);
  return value;
};

/** Replace this with the application's session and document ACL lookup. */
export async function resolveFilesAccess(
  _req: Request,
  _documentId: string
): Promise<FilesAccess> {
  throw new FilesGatewayError(
    503,
    'Configure resolveFilesAccess with session and document permissions'
  );
}

/** Return only a type established by server-side byte validation or trusted ingestion. */
export async function resolveTrustedFilesInlineType(
  _req: Request,
  _documentId: string,
  _key: string
): Promise<string | undefined> {
  return undefined;
}

export interface FilesAccess {
  /** Stable tenant/document path, shared by every authorized collaborator. */
  namespace: string;
  canRead: boolean;
  canWrite: boolean;
}

export class FilesGatewayError extends Error {
  readonly status: 400 | 401 | 403 | 503;

  constructor(status: 400 | 401 | 403 | 503, message: string) {
    super(message);
    this.name = 'FilesGatewayError';
    this.status = status;
  }
}

export interface FilesGatewayOptions {
  adapter: Adapter;
  /** Authenticate the current request and check its document ACL. Return null for no session. */
  resolveAccess: (
    req: Request,
    documentId: string
  ) => Promise<FilesAccess | null>;
  /** Return a MIME only after validating the stored bytes or trusted ingestion record. */
  trustedInlineType?: (
    req: Request,
    documentId: string,
    key: string
  ) => Promise<string | undefined>;
  secret: string;
  maxUploadSize: number;
}

const inlineTypes = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'video/mp4',
  'video/webm',
]);

const documentIdPattern = /^[a-zA-Z0-9_-]{1,128}$/;
const namespacePattern = /^[a-zA-Z0-9_-]{1,128}\/[a-zA-Z0-9_-]{1,128}$/;

const errorResponse = (status: number, code: string, message: string) =>
  Response.json(
    { error: { code, message } },
    { headers: { 'cache-control': 'private, no-store' }, status }
  );

/** Persist this URL, never a short-lived signed storage URL. */
export const filesDownloadUrl = (
  origin: string,
  documentId: string,
  key: string
): string => {
  const url = new URL('/api/files', origin);
  url.searchParams.set('documentId', documentId);
  url.searchParams.set('op', 'download');
  url.searchParams.set('key', key);
  return url.toString();
};

export const createFilesGateway = (options: FilesGatewayOptions) => {
  if (
    options.secret.length < 32 ||
    !Number.isSafeInteger(options.maxUploadSize) ||
    options.maxUploadSize <= 0
  ) {
    throw new Error(
      'Files gateway needs a stable secret of at least 32 characters and a positive maxUploadSize'
    );
  }

  const handle = async (req: Request): Promise<Response> => {
    try {
      const url = new URL(req.url);
      const documentId = url.searchParams.get('documentId');
      if (!documentId || !documentIdPattern.test(documentId)) {
        throw new FilesGatewayError(400, 'A valid documentId is required');
      }

      let operation: 'download' | 'upload' | 'capabilities';
      let key: string | null = null;
      if (req.method === 'GET' && url.searchParams.get('op') === 'download') {
        operation = 'download';
        key = url.searchParams.get('key');
      } else if (
        req.method === 'PUT' &&
        url.searchParams.get('op') === 'proxy'
      ) {
        operation = 'upload';
      } else if (
        req.method === 'PUT' &&
        url.searchParams.get('op') === 'upload'
      ) {
        throw new FilesGatewayError(403, 'Explicit-key uploads are disabled');
      } else if (req.method === 'POST') {
        const body: unknown = await req
          .clone()
          .json()
          .catch(() => null);
        const op =
          body && typeof body === 'object' && 'op' in body
            ? body.op
            : undefined;
        if (op === 'presign' || op === 'complete') {
          operation = 'upload';
        } else if (op === 'capabilities') {
          operation = 'capabilities';
        } else {
          throw new FilesGatewayError(403, 'Operation is not allowed');
        }
      } else {
        throw new FilesGatewayError(403, 'Operation is not allowed');
      }

      const access = await options.resolveAccess(req, documentId);
      if (!access) {
        throw new FilesGatewayError(401, 'Authentication required');
      }
      if (
        !namespacePattern.test(access.namespace) ||
        !access.namespace.endsWith(`/${documentId}`)
      ) {
        throw new Error('Files access returned an invalid namespace');
      }
      if (operation === 'upload' && !access.canWrite) {
        throw new FilesGatewayError(403, 'Document write access required');
      }
      if (operation === 'download' && !access.canRead) {
        throw new FilesGatewayError(403, 'Document read access required');
      }

      const trustedType =
        operation === 'download' && key && options.trustedInlineType
          ? await options.trustedInlineType(req, documentId, key)
          : undefined;
      const inlineType =
        trustedType && inlineTypes.has(trustedType) ? trustedType : undefined;
      const files = createFiles({
        adapter: options.adapter,
        signal: req.signal,
      });
      const router = createFilesRouter({
        files,
        secret: options.secret,
        maxUploadSize: options.maxUploadSize,
        operations: ['upload', 'download'],
        downloadMode: inlineType ? 'proxy' : 'auto',
        defaultExpiresIn: 300,
        forceDownloadDisposition: true,
        authorize: ({ key: requestedKey, operation: authorizedOperation }) => {
          if (authorizedOperation === 'upload' && requestedKey !== undefined) {
            throw new FilesGatewayError(
              403,
              'Explicit-key uploads are disabled'
            );
          }

          return {
            keyPrefix: `documents/${access.namespace}/`,
            maxExpiresIn: 300,
            disposition: inlineType ? 'inline' : 'attachment',
          };
        },
      });
      const route = createRouteHandler(router);
      const response = await route[req.method as 'GET' | 'POST' | 'PUT'](req);
      if (inlineType && response.ok) {
        response.headers.set('content-type', inlineType);
        response.headers.set('x-content-type-options', 'nosniff');
      }
      response.headers.set('cache-control', 'private, no-store');
      return response;
    } catch (error) {
      if (error instanceof FilesGatewayError) {
        const code =
          error.status === 401
            ? 'Unauthorized'
            : error.status === 403
              ? 'Forbidden'
              : error.status === 503
                ? 'Provider'
                : 'Validation';
        return errorResponse(error.status, code, error.message);
      }
      if (error instanceof FilesError) {
        if (error.code === 'Unauthorized') {
          return errorResponse(401, 'Unauthorized', error.message);
        }
        if (error.code === 'ReadOnly') {
          return errorResponse(403, 'Forbidden', error.message);
        }
      }
      return errorResponse(500, 'Provider', 'Files gateway failed');
    }
  };

  return { GET: handle, POST: handle, PUT: handle };
};

/** Assemble one provider adapter behind the shared authenticated gateway. */
export const createFilesRoute = (
  createAdapter: () => Adapter | Promise<Adapter>
) => {
  const configuredGateway = async () =>
    createFilesGateway({
      adapter: await createAdapter(),
      secret: requireFilesEnv('FILES_API_SECRET'),
      maxUploadSize: Number(requireFilesEnv('FILES_MAX_UPLOAD_SIZE')),
      resolveAccess: resolveFilesAccess,
      trustedInlineType: resolveTrustedFilesInlineType,
    });

  const handle = async (req: Request): Promise<Response> => {
    try {
      const gateway = await configuredGateway();
      return gateway[req.method as 'GET' | 'POST' | 'PUT'](req);
    } catch {
      return Response.json(
        {
          error: {
            code: 'Provider',
            message: 'Files gateway configuration is incomplete',
          },
        },
        { status: 503, headers: { 'cache-control': 'private, no-store' } }
      );
    }
  };

  return { GET: handle, POST: handle, PUT: handle };
};
