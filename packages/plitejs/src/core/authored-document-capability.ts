import type { EditorDocumentValue, PluginPoint } from '../interfaces/editor';
import type { DocumentChange } from './change/document-change';
import type { InternalEditorSchemaApi } from './editor-schema';
import { definePluginPoint } from './plugin';

type NativeAuthoredDocumentAdmissionOptions = Readonly<{
  assertTarget?: (document: EditorDocumentValue) => void;
  schema?: InternalEditorSchemaApi;
}>;

export type NativeAuthoredDocumentCapability = Readonly<{
  createCheckpoint: (
    input: NativeAuthoredDocumentAdmissionOptions &
      Readonly<{
        accepted: EditorDocumentValue;
        documentId?: string;
        replica?: string;
        revisions: ReadonlyArray<
          Readonly<{
            authorId: string;
            change: DocumentChange;
            createdAt: number;
            id: string;
          }>
        >;
      }>
  ) => EditorDocumentValue;
  normalize: (
    document: EditorDocumentValue,
    state: unknown,
    options?: NativeAuthoredDocumentAdmissionOptions
  ) => Readonly<{ state: unknown }>;
}>;

export const authoredDocumentCapabilityPoint: PluginPoint<NativeAuthoredDocumentCapability> =
  definePluginPoint('plite.authored.document');
