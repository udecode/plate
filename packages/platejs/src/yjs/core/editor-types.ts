import type { getEditorRuntimeOwner } from '../../core';

export type YjsEditorInput = Parameters<typeof getEditorRuntimeOwner>[0];
export type YjsEditor = ReturnType<typeof getEditorRuntimeOwner>;
