import { r2 } from 'files-sdk/r2';

import { createFilesGateway, requireFilesEnv } from '@/registry/lib/files';

const localUploadKey =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:\.[a-z0-9]+)?$/i;

let gateway: ReturnType<typeof createFilesGateway> | undefined;

const getLocalGateway = () => {
  if (gateway) return gateway;

  const adapter = r2({
    bucket: requireFilesEnv('FILES_R2_BUCKET'),
    accountId: requireFilesEnv('FILES_R2_ACCOUNT_ID'),
    accessKeyId: requireFilesEnv('FILES_R2_ACCESS_KEY_ID'),
    secretAccessKey: requireFilesEnv('FILES_R2_SECRET_ACCESS_KEY'),
  });

  gateway = createFilesGateway({
    adapter,
    maxUploadSize: Number(requireFilesEnv('FILES_MAX_UPLOAD_SIZE')),
    resolveAccess: async (_request, documentId) => ({
      namespace: `local/${documentId}`,
      canRead: true,
      canWrite: true,
    }),
    secret: requireFilesEnv('FILES_API_SECRET'),
    trustedInlineType: async (_request, documentId, key) => {
      if (!localUploadKey.test(key)) return undefined;

      const file = await adapter.head(`documents/local/${documentId}/${key}`);
      return file.type;
    },
  });

  return gateway;
};

const handle = async (request: Request) => {
  if (process.env.NODE_ENV !== 'development') {
    return new Response(null, { status: 404 });
  }

  const method = request.method as 'GET' | 'POST' | 'PUT';
  return getLocalGateway()[method](request);
};

export { handle as GET, handle as POST, handle as PUT };
