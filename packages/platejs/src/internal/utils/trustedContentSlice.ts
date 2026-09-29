import { createDetachedContentSlice } from 'plitejs/internal';

/**
 * Build a slice from deeply frozen nodes that `schema` already validated, so
 * neither construction nor insertion copies or validates them again.
 */
export const createValidatedContentSlice = (
  content: Parameters<typeof createDetachedContentSlice>[0],
  schema: object
) => createDetachedContentSlice(content, 0, 0, { canonicalFor: schema });
