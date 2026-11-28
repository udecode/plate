import type {
  AggregateProgress,
  UploadCallOptions,
  UploadOutcome,
} from 'files-sdk/client';

import {
  createEditorView,
  defineEffect,
  definePlugin,
  documentReplacement,
  EditorSchemaValidationError,
  ElementApi,
  type Node,
  NodeApi,
  PathApi,
  PLUGINS,
  TextApi,
  type BlockInsertOptions,
  type Descendant,
  type Editor,
  type EditorCommit,
  type EditorCommitHandler,
  type EditorEffect,
  type EditorTransactionEffectsApi,
  type EditorUpdateTransaction,
  type EditorViewOptions,
  type Element,
  type ElementOf,
  type NodeKey,
  type Path,
  type Point,
  property,
  transferVeto,
  txLocate,
  locateAt,
} from '../../../core';
import { domCommands } from '../../../dom/plite-dom.internal';
import {
  attachTransactionSpecAfterCommit,
  canPlaceBlocksAtPath,
  configureAuthoredView,
  getActiveEditorTransaction,
  getAuthoredUpdateView,
  getEditorCommitNode,
  hasNonWritableAt,
  getEditorRuntimeRootKeys,
  getSnapshotVersion,
  getViewAuthor,
  isEditorPublishingCommit,
  readAuthoredView,
  registerEditorTransactionGuard,
  reportEditorLifecycleError,
  txStored,
  withStoredAuthoredRead,
} from '../../../facade';
import { isReplaceableEmptyBlock } from '../../../internal/plugin/blockInsertion';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';
import { getCaretAnchor } from '../../../internal/plugin/insertionAnchor';
import { pastedUploadFiles } from '../../../internal/plugin/pastedUploadFiles';
import { UPLOAD_COMMIT_TAG } from '../../../internal/plugin/uploadDrafts';
import { createZustandStore } from '../../../lib/libs/zustand';
import { lookup } from './mimeTypes.internal';

export const UPLOAD_FILE_TYPES = [
  'image',
  'video',
  'audio',
  'pdf',
  'text',
  'blob',
] as const;

export const UPLOAD_KINDS = ['audio', 'file', 'image', 'video'] as const;

export type UploadFileType = (typeof UPLOAD_FILE_TYPES)[number];
export type UploadKind = (typeof UPLOAD_KINDS)[number];

export type UploadRule = {
  kind: UploadKind;
  maxBytes?: number;
  maxFiles?: number;
  minFiles?: number;
};

export type UploadRules = Partial<Record<UploadFileType, UploadRule>>;

export type UploadAdmissionError =
  | Readonly<{
      allowedTypes: readonly UploadFileType[];
      code: 'unsupported-file-type';
      files: readonly File[];
    }>
  | Readonly<{
      code: 'file-too-large';
      fileType: UploadFileType;
      files: readonly File[];
      maxBytes: number;
    }>
  | Readonly<{
      code: 'too-few-files';
      fileType: UploadFileType;
      files: readonly File[];
      minFiles: number;
    }>
  | Readonly<{
      code: 'too-many-files';
      fileType: UploadFileType | null;
      files: readonly File[];
      maxFiles: number;
    }>;

export type UploadFailure =
  | (UploadAdmissionError & Readonly<{ phase: 'admission' }>)
  | Readonly<{
      code: 'missing-client' | 'missing-url-resolver';
      files: readonly File[];
      phase: 'configuration';
    }>
  | Readonly<{
      code: 'missing-destination';
      files: readonly File[];
      kind: UploadKind;
      phase: 'configuration';
    }>
  | Readonly<{
      code: 'does-not-fit';
      files: readonly File[];
      phase: 'placement';
    }>
  | Readonly<{
      code: 'upload-error';
      error: unknown;
      file: File;
      key: NodeKey;
      phase: 'upload';
    }>
  | Readonly<{
      code: 'invalid-url';
      file: File;
      key: NodeKey;
      phase: 'result';
      result: UploadOutcome;
    }>
  | Readonly<{
      code: 'completion-error' | 'resolver-error';
      error: unknown;
      file: File;
      key: NodeKey;
      phase: 'result';
      result: UploadOutcome;
    }>;

export type UploadTaskState =
  | Readonly<{ progress: AggregateProgress; status: 'uploading' }>
  | Readonly<{
      failure: Extract<UploadFailure, { phase: 'result' | 'upload' }>;
      progress: AggregateProgress;
      status: 'failed';
    }>;

/** One editor-owned request with progress independent of a mounted preview. */
export type UploadTask = Readonly<{
  file: File;
  getSnapshot: () => UploadTaskState;
  subscribe: (listener: () => void) => () => void;
}>;

/** The Files SDK capability Plate needs to complete one admitted browser file. */
export type UploadClient = Readonly<{
  upload: (file: File, options?: UploadCallOptions) => Promise<UploadOutcome>;
}>;

/** Configures upload admission and resolves SDK outcomes to document URLs. */
export type UploadPluginState = {
  client: UploadClient | null;
  getUrl: ((file: UploadOutcome) => string) | null;
  maxFiles: number;
  onError: ((failure: UploadFailure) => void) | null;
  rules: UploadRules;
  tasks: Partial<Record<NodeKey, UploadTask>>;
};

/** Fill a live draft slot or insert drafts beside a block. */
export type UploadSubmitOptions =
  | ({ slot: NodeKey } & {
      after?: never;
      at?: never;
      before?: never;
      replaceEmpty?: never;
    })
  | ({ slot?: never } & BlockInsertOptions);

/** Limits the batch `admit` checks to the one upload kind a caller's drafts take. */
export type UploadAdmitOptions = Readonly<{
  /** A file of another kind refuses the batch before every other check. */
  kind?: UploadKind;
}>;

/**
 * A batch that passed every check and waits for the caller to insert its
 * drafts. It lives for the transaction that admitted it.
 */
export type UploadAdmission = Readonly<{
  /** One new draft per file, in file order. Upload does not track them. */
  drafts: readonly Element[];
  /**
   * Give each file the live draft its node key names, in file order. It checks
   * every key before it gives any file a draft, and throws when a check fails.
   */
  fill: (keys: readonly NodeKey[]) => void;
}>;

/** A batch `admit` refused, with the failure upload reports after the commit. */
export type UploadRefusal = Readonly<{
  failure: Extract<UploadFailure, { phase: 'admission' | 'configuration' }>;
}>;

const defaultRules = {
  audio: { kind: 'audio' },
  blob: { kind: 'file' },
  image: { kind: 'image' },
  pdf: { kind: 'file' },
  text: { kind: 'file' },
  video: { kind: 'video' },
} satisfies UploadRules;

const initialState: UploadPluginState = {
  client: null,
  getUrl: null,
  maxFiles: Number.POSITIVE_INFINITY,
  onError: null,
  rules: defaultRules,
  tasks: {},
};

type AdmissionMark = Readonly<{
  form: 'cancel' | 'refuse' | 'replace' | 'yield';
  id: number;
  keys: readonly NodeKey[];
  kinds: readonly UploadKind[];
}>;

const uploadAdmissionEffect = defineEffect<AdmissionMark>({
  collab: 'local',
  history: 'skip',
  key: 'upload.admission',
});

const admissionMarks = (effects: readonly EditorEffect[]) =>
  effects.flatMap(({ type, value }): AdmissionMark[] =>
    type === uploadAdmissionEffect ? [value] : []
  );

const onceAcrossReplays = <TArgs extends unknown[]>(
  handler: (...args: TArgs) => void
) => {
  let ran = false;

  return (...args: TArgs) => {
    if (ran) return;
    ran = true;
    handler(...args);
  };
};

type PastedPicture = PreparedUpload &
  Readonly<{
    caption: readonly Descendant[];
    properties: Readonly<Record<string, unknown>>;
  }>;

const isUploadFileType = (value: string): value is UploadFileType =>
  (UPLOAD_FILE_TYPES as readonly string[]).includes(value);

const isUploadKind = (value: unknown): value is UploadKind =>
  typeof value === 'string' &&
  (UPLOAD_KINDS as readonly string[]).includes(value);

const assertPositiveInteger = (value: unknown, name: string) => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
};

const validateConfiguration = (state: Readonly<UploadPluginState>) => {
  if (state.maxFiles !== Number.POSITIVE_INFINITY) {
    assertPositiveInteger(state.maxFiles, 'Upload maxFiles');
  }

  for (const [fileType, rule] of Object.entries(state.rules)) {
    if (!isUploadFileType(fileType) || !rule || typeof rule !== 'object') {
      throw new Error(`Invalid upload rule "${fileType}".`);
    }
    if (!isUploadKind(rule.kind)) {
      throw new Error(`Upload rule "${fileType}" has an invalid kind.`);
    }
    if (rule.minFiles !== undefined) {
      assertPositiveInteger(
        rule.minFiles,
        `Upload rule "${fileType}" minFiles`
      );
    }
    if (rule.maxFiles !== undefined) {
      assertPositiveInteger(
        rule.maxFiles,
        `Upload rule "${fileType}" maxFiles`
      );
    }
    if (
      rule.maxBytes !== undefined &&
      (!Number.isFinite(rule.maxBytes) || rule.maxBytes <= 0)
    ) {
      throw new Error(
        `Upload rule "${fileType}" maxBytes must be a positive finite number.`
      );
    }
    if (
      rule.minFiles !== undefined &&
      rule.maxFiles !== undefined &&
      rule.minFiles > rule.maxFiles
    ) {
      throw new Error(
        `Upload rule "${fileType}" minFiles cannot exceed maxFiles.`
      );
    }
  }
};

const classifyFile = (
  file: File,
  allowedTypes: ReadonlySet<UploadFileType>
): UploadFileType | undefined => {
  const mimeType = file.type || lookup(file.name);

  if (!mimeType) return allowedTypes.has('blob') ? 'blob' : undefined;

  const candidate =
    mimeType.toLowerCase() === 'application/pdf'
      ? 'pdf'
      : mimeType.split('/')[0];

  if (isUploadFileType(candidate) && allowedTypes.has(candidate)) {
    return candidate;
  }

  return allowedTypes.has('blob') ? 'blob' : undefined;
};

const validateFiles = (
  files: readonly File[],
  state: Readonly<UploadPluginState>
) => {
  if (files.length > state.maxFiles) {
    return {
      error: {
        code: 'too-many-files',
        fileType: null,
        files,
        maxFiles: state.maxFiles,
      } satisfies UploadAdmissionError,
      fileTypes: null,
    } as const;
  }

  const allowedTypes = Object.keys(state.rules).filter(isUploadFileType);
  const allowedTypeSet = new Set(allowedTypes);
  const filesByType = new Map<UploadFileType, File[]>();
  const fileTypes = new Map<File, UploadFileType>();

  for (const file of files) {
    const fileType = classifyFile(file, allowedTypeSet);

    if (!fileType) {
      return {
        error: {
          allowedTypes,
          code: 'unsupported-file-type',
          files: [file],
        } satisfies UploadAdmissionError,
        fileTypes: null,
      } as const;
    }

    const typeFiles = filesByType.get(fileType) ?? [];
    typeFiles.push(file);
    filesByType.set(fileType, typeFiles);
    fileTypes.set(file, fileType);
  }

  for (const [fileType, typeFiles] of filesByType) {
    const rule = state.rules[fileType];
    if (!rule) {
      return {
        error: {
          allowedTypes,
          code: 'unsupported-file-type',
          files: typeFiles,
        } satisfies UploadAdmissionError,
        fileTypes: null,
      } as const;
    }

    if (rule.minFiles !== undefined && typeFiles.length < rule.minFiles) {
      return {
        error: {
          code: 'too-few-files',
          fileType,
          files: typeFiles,
          minFiles: rule.minFiles,
        } satisfies UploadAdmissionError,
        fileTypes: null,
      } as const;
    }
    if (rule.maxFiles !== undefined && typeFiles.length > rule.maxFiles) {
      return {
        error: {
          code: 'too-many-files',
          fileType,
          files: typeFiles,
          maxFiles: rule.maxFiles,
        } satisfies UploadAdmissionError,
        fileTypes: null,
      } as const;
    }
    const { maxBytes } = rule;
    if (maxBytes === undefined) continue;

    const largeFile = typeFiles.find((file) => file.size > maxBytes);

    if (largeFile) {
      return {
        error: {
          code: 'file-too-large',
          fileType,
          files: [largeFile],
          maxBytes,
        } satisfies UploadAdmissionError,
        fileTypes: null,
      } as const;
    }
  }

  return { error: null, fileTypes } as const;
};

const refusedWhateverFollows = (
  count: number,
  types: ReadonlySet<UploadFileType>,
  rule: UploadRule,
  maxFiles: number
) =>
  count > maxFiles ||
  (maxFiles === Number.POSITIVE_INFINITY &&
    types.size === 1 &&
    count >= (rule.minFiles ?? 0) &&
    count > (rule.maxFiles ?? Number.POSITIVE_INFINITY));

const lowBytes = (text: string) => {
  const bytes = new Uint8Array(text.length);

  for (let index = 0; index < text.length; index += 1) {
    bytes[index] = text.charCodeAt(index) & 0xff;
  }

  return bytes;
};

const rasterFormat = (bytes: Uint8Array) => {
  const head = String.fromCharCode(...bytes.subarray(0, 12));

  if (head.startsWith('\u0089PNG\r\n\u001A\n')) return 'png';
  if (head.startsWith('\u00FF\u00D8\u00FF')) return 'jpeg';
  if (head.startsWith('GIF87a') || head.startsWith('GIF89a')) return 'gif';
  if (head.startsWith('RIFF') && head.slice(8) === 'WEBP') return 'webp';

  return undefined;
};

type InternalTask = Readonly<{
  admittedVersion: number;
  controller: AbortController;
  kind: UploadKind;
  resource: UploadTask;
  state: ReturnType<typeof createZustandStore<UploadTaskState>>;
}>;

type Admission = Readonly<{
  admittedVersion: number;
  id: number;
  key: NodeKey;
  kind: UploadKind;
}>;

type DraftRecord = {
  picture?: PastedPicture;
  task?: InternalTask;
  waiting?: Admission;
};

type PreparedUpload = Readonly<{
  file: File;
  kind: UploadKind;
  key: NodeKey;
}>;

type Batch = Readonly<{
  authored: EditorViewOptions['authored'];
  authorId: string | undefined;
  client: UploadClient;
  getUrl: (file: UploadOutcome) => string;
  uploads: ReadonlyArray<PreparedUpload | PastedPicture>;
}>;

/** Owns persisted upload drafts and editor-lifetime Files SDK requests. */
export const BaseUploadPlugin = definePlugin(PLUGINS.upload, {
  component: () => null,
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: () => undefined,
        encode: () => null,
        match: [
          {
            attributes: { 'data-editor-upload': true },
            tag: 'template',
          },
        ],
      },
    }),
  effectTypes: [uploadAdmissionEffect],
  initialState,
  schema: {
    element: {
      type: 'upload',
      properties: {
        kind: property.enum(UPLOAD_KINDS, { required: true }),
      },
      void: 'block',
    },
  },
  selectors: {
    task: (state, key: NodeKey) => state.tasks[key],
  },
})
  .extend((context) => {
    const {
      editor,
      schema: { type },
      store,
    } = context;
    const records = new Map<NodeKey, DraftRecord>();
    const unpublished = new Set<Admission>();
    const unlist = (key?: NodeKey) => {
      const current = store.get('tasks');
      const gone = (key ? [key] : (Object.keys(current) as NodeKey[])).filter(
        (listed) => current[listed] && !records.get(listed)?.task
      );

      if (gone.length === 0) return;
      const next = { ...current };
      for (const listed of gone) delete next[listed];
      store.set({ tasks: next });
    };
    const prune = (key: NodeKey, record: DraftRecord) => {
      if (!record.task && !record.waiting && records.get(key) === record) {
        records.delete(key);
      }
    };
    const stop = (key: NodeKey, task: InternalTask) => {
      const record = records.get(key);
      if (record?.task !== task) return;
      record.task = undefined;
      prune(key, record);
      task.controller.abort();
      unlist(key);
    };
    let admissions = 0;
    const markAdmission = (
      effects: EditorTransactionEffectsApi,
      form: AdmissionMark['form'],
      keys: readonly NodeKey[],
      kinds: readonly UploadKind[] = []
    ) => {
      admissions += 1;
      effects.emit(uploadAdmissionEffect, {
        form,
        id: admissions,
        keys,
        kinds,
      });
      return admissions;
    };
    let closed = () => true;

    const draftKind = (node: Node | undefined) =>
      NodeApi.isElement(node) && node.type === type && isUploadKind(node.kind)
        ? node.kind
        : undefined;
    const isStoredDraft = (key: NodeKey, kind: UploadKind) =>
      draftKind(
        withStoredAuthoredRead(editor, () => editor.read.nodes.get(key))?.[0]
      ) === kind;
    const placeAfter = (
      tx: Pick<EditorUpdateTransaction, 'blocks'>,
      slot: NodeKey,
      drafts: readonly Element[]
    ) => tx.blocks.insert(drafts, { after: slot, replaceEmpty: false });
    const slotIn = (commit: EditorCommit, key: NodeKey, kind: UploadKind) =>
      getEditorRuntimeRootKeys(editor).some((root) => {
        const node = getEditorCommitNode(commit, key, root)?.[0];

        return (
          NodeApi.isElement(node) && node.type === type && node.kind === kind
        );
      });
    const createOwnerView = (
      authorId: string | undefined,
      authored: EditorViewOptions['authored']
    ) => {
      const owner = createEditorView(editor, { authorId });

      configureAuthoredView(owner, authored);
      return owner;
    };
    const notifyFailure = (failure: UploadFailure) => {
      if (!closed()) store.get('onError')?.(failure);
    };
    const refuse = (
      effects: EditorTransactionEffectsApi,
      afterCommit: (handler: EditorCommitHandler) => void,
      failure: UploadFailure
    ) => {
      markAdmission(effects, 'refuse', []);
      afterCommit(onceAcrossReplays(() => notifyFailure(failure)));
    };
    const reportTaskError = (cause: unknown) => {
      reportEditorLifecycleError({
        cause,
        editor,
        phase: 'after-commit',
        pluginName: PLUGINS.upload,
      });
    };
    const revokeWhere = (
      matches: (key: NodeKey, work: Admission | InternalTask) => boolean
    ) => {
      const stopped: InternalTask[] = [];

      for (const admission of unpublished) {
        if (matches(admission.key, admission)) unpublished.delete(admission);
      }
      for (const [key, record] of records) {
        if (record.waiting && matches(key, record.waiting)) {
          record.waiting = undefined;
        }
        if (record.task && matches(key, record.task)) {
          stopped.push(record.task);
          record.task = undefined;
          record.picture = undefined;
        }
        prune(key, record);
      }
      for (const task of stopped) task.controller.abort();
      unlist();
    };
    const destination = (kind: UploadKind) => {
      const name =
        kind === 'audio'
          ? PLUGINS.audio
          : kind === 'file'
            ? PLUGINS.file
            : kind === 'image'
              ? PLUGINS.image
              : PLUGINS.video;
      const descriptor = getCompiledPlatePlugin(editor, name);

      return descriptor ? editor.plugin(descriptor) : undefined;
    };
    const normalizeResult = (
      kind: UploadKind,
      file: File,
      url: string,
      dimensions?: { naturalHeight: number; naturalWidth: number }
    ) => {
      const portal = destination(kind);
      if (!portal || !portal.schema || !('type' in portal.schema)) {
        return undefined;
      }
      const { api, schema: portalSchema } = portal;
      if (!('normalizeUrl' in api) || typeof api.normalizeUrl !== 'function') {
        return undefined;
      }
      const normalized = api.normalizeUrl(url);
      if (
        !normalized ||
        typeof normalized !== 'object' ||
        !('url' in normalized) ||
        typeof normalized.url !== 'string'
      ) {
        return undefined;
      }

      return {
        ...normalized,
        ...(kind === 'file' ? { name: file.name } : {}),
        ...(kind === 'image' && dimensions ? dimensions : {}),
        ...(kind === 'video' ? { provider: 'file' } : {}),
        type: portalSchema.type,
      };
    };
    const startTask = (
      upload: PreparedUpload,
      record: DraftRecord,
      admittedVersion: number,
      { client, getUrl }: Pick<Batch, 'client' | 'getUrl'>,
      owner: typeof editor
    ) => {
      const controller = new AbortController();
      const state = createZustandStore<UploadTaskState>(
        Object.freeze({
          progress: Object.freeze({ fraction: 0, loaded: 0, total: 0 }),
          status: 'uploading',
        })
      );
      const task: InternalTask = {
        admittedVersion,
        controller,
        kind: upload.kind,
        resource: {
          file: upload.file,
          getSnapshot: state.get,
          subscribe: state.subscribe,
        },
        state,
      };
      record.task = task;
      store.set({
        tasks: { ...store.get('tasks'), [upload.key]: task.resource },
      });

      const owns = () =>
        records.get(upload.key)?.task === task &&
        !controller.signal.aborted &&
        isStoredDraft(upload.key, upload.kind);
      const fail = (
        failure: Extract<UploadFailure, { phase: 'result' | 'upload' }>
      ) => {
        if (!owns()) return;
        controller.abort();
        state.set(
          'state',
          Object.freeze({
            failure,
            progress: state.get('progress'),
            status: 'failed',
          })
        );
        try {
          notifyFailure(failure);
        } catch (error) {
          reportTaskError(error);
        }
      };

      void (async () => {
        if (closed() || !owns()) return;
        let result: UploadOutcome;

        try {
          result = await client.upload(upload.file, {
            signal: controller.signal,
            onProgress: (progress) => {
              if (!owns() || !Number.isFinite(progress.fraction)) return;
              const previous = state.get('progress');
              if (
                previous.fraction === progress.fraction &&
                previous.loaded === progress.loaded &&
                previous.total === progress.total
              ) {
                return;
              }
              state.set(
                'state',
                Object.freeze({
                  progress: Object.freeze({ ...progress }),
                  status: 'uploading',
                })
              );
            },
          });
        } catch (error) {
          fail({
            code: 'upload-error',
            error,
            file: upload.file,
            key: upload.key,
            phase: 'upload',
          });
          return;
        }

        if (!owns()) return;
        let url: string;
        try {
          url = getUrl(result);
        } catch (error) {
          fail({
            code: 'resolver-error',
            error,
            file: upload.file,
            key: upload.key,
            phase: 'result',
            result,
          });
          return;
        }
        if (!owns()) return;

        let dimensions:
          | { naturalHeight: number; naturalWidth: number }
          | undefined;
        if (
          upload.kind === 'image' &&
          typeof createImageBitmap === 'function'
        ) {
          try {
            const bitmap = await createImageBitmap(upload.file);
            try {
              dimensions = {
                naturalHeight: bitmap.height,
                naturalWidth: bitmap.width,
              };
            } finally {
              bitmap.close();
            }
          } catch {
            // Decoding is optional metadata; uploaded bytes still own the result.
          }
        }

        if (!owns()) return;
        try {
          const normalized = normalizeResult(
            upload.kind,
            upload.file,
            url,
            dimensions
          );

          if (!normalized) {
            fail({
              code: 'invalid-url',
              file: upload.file,
              key: upload.key,
              phase: 'result',
              result,
            });
            return;
          }

          owner.update({ history: 'skip', tags: UPLOAD_COMMIT_TAG }, (tx) => {
            const entry = tx.nodes.get(upload.key);
            if (
              records.get(upload.key)?.task !== task ||
              !entry ||
              !NodeApi.isElement(entry[0]) ||
              entry[0].type !== type ||
              entry[0].kind !== upload.kind
            ) {
              return;
            }

            const kept = record.picture;

            tx.nodes.set(
              { ...kept?.properties, ...normalized },
              { at: upload.key, voids: true }
            );
            tx.nodes.unset('kind', { at: upload.key, voids: true });
            if (
              kept?.caption.some(
                (child) => !TextApi.isText(child) || child.text !== ''
              )
            ) {
              tx.nodes.replaceChildren(kept.caption, { at: upload.key });
            }
          });

          // A write the editor refuses or drops leaves the draft in place.
          if (owns()) {
            throw new Error('The editor refused the completed upload.');
          }
        } catch (error) {
          // `fail` ignores a task that lost ownership, which would hide this error.
          if (!owns()) {
            stop(upload.key, task);
            reportTaskError(error);
            return;
          }

          fail({
            code: 'completion-error',
            error,
            file: upload.file,
            key: upload.key,
            phase: 'result',
            result,
          });
        }
      })();
    };

    // A task keeps the author and intent that admitted it, so its view can
    // turn read-only, unmount or preview while the task runs.
    const bind = (
      effects: EditorTransactionEffectsApi,
      afterCommit: (handler: EditorCommitHandler) => void,
      admission: Batch,
      form: 'replace' | 'yield'
    ) => {
      const id = markAdmission(
        effects,
        form,
        admission.uploads.map(({ key }) => key),
        admission.uploads.map(({ kind }) => kind)
      );
      let owner: typeof editor | undefined;

      for (const upload of admission.uploads) {
        afterCommit(({ commit }) => {
          const record = records.get(upload.key);
          const waiting = record?.waiting;

          if (
            !record ||
            waiting?.id !== id ||
            waiting.admittedVersion !== commit.previousVersion
          ) {
            return;
          }
          if (closed() || !isStoredDraft(upload.key, upload.kind)) {
            record.waiting = undefined;
            prune(upload.key, record);
            return;
          }
          if (record.task) stop(upload.key, record.task);
          // Stopping the older request runs its abort listeners, which may
          // cancel this draft, admit another file into it or close the editor.
          if (
            records.get(upload.key) !== record ||
            record.waiting !== waiting ||
            closed()
          ) {
            prune(upload.key, record);
            return;
          }
          record.waiting = undefined;
          record.picture =
            'caption' in upload
              ? upload
              : record.picture?.file === upload.file
                ? record.picture
                : undefined;
          owner ??= createOwnerView(admission.authorId, admission.authored);
          startTask(upload, record, waiting.admittedVersion, admission, owner);
        });
      }
    };
    const writerWithWork = (updateEditor: Editor, files: readonly File[]) => {
      const writer = getAuthoredUpdateView(updateEditor);
      const authored = readAuthoredView(writer);

      return closed() ||
        files.length === 0 ||
        updateEditor.read.view.isReadOnly() ||
        (authored && 'preview' in authored)
        ? undefined
        : { authored, authorId: getViewAuthor(writer) };
    };
    const refusal = (failure: UploadRefusal['failure']): UploadRefusal => ({
      failure,
    });
    const check = (
      files: readonly File[],
      requireKind?: Readonly<{ files: readonly File[]; kind: UploadKind }>
    ) => {
      const state = store.get();

      if (requireKind) {
        const fileTypes = Object.keys(state.rules).filter(isUploadFileType);
        const allowed = new Set(fileTypes);
        const others = requireKind.files.filter((file) => {
          const fileType = classifyFile(file, allowed);

          return !fileType || state.rules[fileType]?.kind !== requireKind.kind;
        });

        if (others.length > 0) {
          return refusal({
            allowedTypes: fileTypes.filter(
              (fileType) => state.rules[fileType]?.kind === requireKind.kind
            ),
            code: 'unsupported-file-type',
            files: others,
            phase: 'admission',
          });
        }
      }

      const validation = validateFiles(files, state);
      if (validation.error) {
        return refusal({ ...validation.error, phase: 'admission' });
      }
      const { client, getUrl } = state;
      if (!client || !getUrl) {
        return refusal({
          code: client ? 'missing-url-resolver' : 'missing-client',
          files,
          phase: 'configuration',
        });
      }

      const uploads = files.map((file) => {
        const fileType = validation.fileTypes.get(file);
        const rule = fileType ? state.rules[fileType] : undefined;
        if (!fileType || !rule) {
          throw new Error('Validated upload file requires a configured rule.');
        }

        return { file, kind: rule.kind };
      });

      for (const { kind } of uploads) {
        if (!destination(kind)) {
          return refusal({
            code: 'missing-destination',
            files,
            kind,
            phase: 'configuration',
          });
        }
      }

      return { client, getUrl, uploads };
    };

    return {
      activate({ acquire, beforePublish, onCleanup }) {
        let taken = false;

        acquire(() => {
          taken = true;
          return () => {
            taken = false;
          };
        });
        closed = () => !taken;
        beforePublish(() => validateConfiguration(store.get()));
        onCleanup(
          registerEditorTransactionGuard(editor, ({ commit, effects }) => {
            const given = new Set<NodeKey>();
            const admitted = new Map<NodeKey, Admission>();

            for (const { form, id, keys, kinds } of admissionMarks(effects)) {
              keys.forEach((key, index) => {
                if (form === 'cancel') {
                  admitted.delete(key);
                  return;
                }
                if (form === 'replace' || !given.has(key)) {
                  admitted.set(key, {
                    admittedVersion: commit.previousVersion,
                    id,
                    key,
                    kind: kinds[index],
                  });
                }
                given.add(key);
              });
            }
            if (admitted.size === 0) return undefined;
            if (!isEditorPublishingCommit(editor)) unpublished.clear();
            for (const admission of admitted.values()) {
              unpublished.add(admission);
            }

            return () => {
              for (const [key, waiting] of admitted) {
                if (!unpublished.delete(waiting)) continue;
                const record = records.get(key) ?? {};
                const newest = Math.max(
                  record.task?.admittedVersion ?? -1,
                  record.waiting?.admittedVersion ?? -1
                );

                if (
                  newest > waiting.admittedVersion ||
                  !isStoredDraft(key, waiting.kind)
                ) {
                  continue;
                }
                record.waiting = waiting;
                records.set(key, record);
              }
            };
          })
        );
        onCleanup(() => revokeWhere(() => true));
      },
      api: () => ({
        cancel: (key: NodeKey) => {
          const active = getActiveEditorTransaction(editor);

          if (active) markAdmission(active.effects, 'cancel', [key]);
          for (const admission of unpublished) {
            if (admission.key === key) unpublished.delete(admission);
          }
          const record = records.get(key);

          if (!record) return;
          const { task } = record;

          record.waiting = undefined;
          if (!task) {
            if (!record.picture) prune(key, record);
            return;
          }
          records.delete(key);
          task.controller.abort();
          unlist(key);
        },
        /**
         * Whether another draft of the same kind fits after the upload draft
         * at `key`, where a slot submit lands the draft of a second file. It
         * writes nothing, and it is false when `key` names no upload draft.
         */
        fitsAfter: (key: NodeKey): boolean => {
          let fits = false;

          withStoredAuthoredRead(editor, () =>
            editor.read((state) =>
              state.transaction((tx) => {
                const kind = draftKind(tx.nodes.get(key)?.[0]);

                fits =
                  !!kind &&
                  !!placeAfter(tx, key, [tx.schema.create(type, { kind })]);
              })
            )
          );

          return fits;
        },
      }),
      commands: ({ around }) => [
        around(domCommands.insertData, ({ input, next, state }) => {
          const imageSchema = destination('image')?.schema;
          const pictureType =
            imageSchema && 'type' in imageSchema ? imageSchema.type : undefined;
          const writer = getAuthoredUpdateView(editor);
          const keepsPictures = () => {
            const authored = readAuthoredView(writer);

            return (
              closed() ||
              writer.read.view.isReadOnly() ||
              (authored !== undefined &&
                ('preview' in authored || authored.intent === 'propose'))
            );
          };
          const admitting = () => {
            const settings = store.get();
            const { client, getUrl, rules } = settings;

            return !keepsPictures() &&
              client &&
              getUrl &&
              Object.values(rules).some((rule) => rule?.kind === 'image')
              ? { client, getUrl, settings }
              : undefined;
          };
          const hasLocalUrl = (picture: Element) =>
            typeof picture.url === 'string' &&
            /^(?:blob|data):/iu.test(picture.url);
          const stringsCarryPicture = () =>
            Array.from(input.types ?? []).some((format) => {
              // happy-dom's DataTransfer returns a pasted file from getData under its MIME type.
              const data: unknown = input.getData(format);

              return (
                typeof data === 'string' &&
                (/data:image\/|blob:(?:null\/|[a-z][\d+.a-z-]*:)/iu.test(
                  data
                ) ||
                  data.includes('\\pict'))
              );
            });
          const editorSliceCarriesPicture = () => {
            const read = editor.api.dom.clipboard.readSlice(input);

            return (
              read.kind === 'slice' &&
              [read.slice.content, ...Object.values(read.slice.roots ?? {})]
                .flat()
                .some((node) =>
                  [...NodeApi.elements(node)].some(
                    ([element]) =>
                      element.type === pictureType && hasLocalUrl(element)
                  )
                )
            );
          };

          if (
            !pictureType ||
            !admitting() ||
            !(stringsCarryPicture() || editorSliceCarriesPicture())
          ) {
            return next();
          }

          const known = new Set<NodeKey>();

          for (const [picture, path] of state.nodes.entries({
            at: [],
            type: pictureType,
          })) {
            const key = hasLocalUrl(picture) ? state.key(path) : null;
            if (key) known.add(key);
          }
          const before = new Set(state.nodes.children([]));
          const roots = new Set(getEditorRuntimeRootKeys(editor));
          const pasted = next();

          if (pasted === false) return false;

          const handlers: EditorCommitHandler[] = [];
          const result = state.transaction.extend(pasted, (tx) => {
            const admission = admitting();
            if (!admission) return;

            const { client, getUrl, settings } = admission;
            const { rules } = settings;
            const allowedTypes = new Set(
              Object.keys(rules).filter(isUploadFileType)
            );
            const suggestingLosesPaste = getEditorRuntimeRootKeys(editor).some(
              (root) => !roots.has(root)
            );
            const blocks = tx.nodes.children([]);
            const stale = () => {
              const now = tx.nodes.children([]);
              const current = store.get();

              return (
                keepsPictures() ||
                current.client !== client ||
                current.getUrl !== getUrl ||
                current.maxFiles !== settings.maxFiles ||
                current.rules !== rules ||
                (now !== blocks &&
                  (now.length !== blocks.length ||
                    now.some((block, index) => block !== blocks[index])))
              );
            };
            const readPicture = (url: string) => {
              try {
                if (/^data:/iu.test(url)) {
                  const mime = url.slice(5, url.indexOf(';')).toLowerCase();

                  return new File(
                    [lowBytes(atob(url.slice(url.indexOf(',') + 1)))],
                    `image.${mime.slice(6)}`,
                    { type: mime }
                  );
                }
                if (suggestingLosesPaste) return undefined;

                const request = new XMLHttpRequest();

                // oxlint-disable-next-line react-doctor/no-sync-xhr -- Each draft must enter the paste's own update, and only a synchronous request reads a `blob:` address before that update commits.
                request.open('GET', url, false);
                // Without this charset the browser decodes the bytes as UTF-8.
                request.overrideMimeType('text/plain; charset=x-user-defined');
                if (stale()) return undefined;
                request.send();
                if (request.status !== 200) return undefined;

                const text = request.responseText;

                // A leading byte-order mark overrides that charset and is
                // dropped, which the length shows.
                if (
                  text.length !==
                  Number(request.getResponseHeader('Content-Length'))
                ) {
                  return undefined;
                }

                const format = rasterFormat(lowBytes(text.slice(0, 12)));

                if (!format) return undefined;

                return new File([lowBytes(text)], `image.${format}`, {
                  type: `image/${format}`,
                });
              } catch {
                return undefined;
              }
            };
            const captionOwnsContentRoot = (picture: Element) =>
              [...NodeApi.elements(picture)].some(
                ([element]) =>
                  Object.keys(tx.schema.getElementContentRoots(element))
                    .length > 0
              );
            const createDraft = (properties: Record<string, unknown>) => {
              try {
                return tx.schema.create(type, {
                  ...properties,
                  kind: 'image',
                });
              } catch (error) {
                if (error instanceof EditorSchemaValidationError) {
                  return undefined;
                }
                throw error;
              }
            };
            const candidates: Array<[Element, Path]> = [];

            blocks.forEach((block, index) => {
              if (before.has(block)) return;
              for (const [picture, path] of tx.nodes.entries({
                at: [index],
                type: pictureType,
              })) {
                const key = hasLocalUrl(picture) ? tx.key(path) : null;
                if (key && !known.has(key)) candidates.push([picture, path]);
              }
            });

            const placeable = candidates.flatMap(([node, path]) => {
              const properties: Record<string, unknown> = {};
              const draftProperties: Record<string, unknown> = {};

              for (const [key, value] of Object.entries(node)) {
                if (key === 'children' || key === 'type' || key === 'url') {
                  continue;
                }
                if (
                  [
                    'alt',
                    'naturalHeight',
                    'naturalWidth',
                    'title',
                    'width',
                  ].includes(key)
                ) {
                  properties[key] = value;
                } else {
                  draftProperties[key] = value;
                }
              }

              const draft = createDraft(draftProperties);

              if (
                !draft ||
                !canPlaceBlocksAtPath(tx.schema, path, [draft], {
                  removing: path.slice(-1),
                  root: tx.view.root(),
                }) ||
                captionOwnsContentRoot(node)
              ) {
                return [];
              }

              return [
                {
                  caption: node.children,
                  draft,
                  path,
                  properties,
                  url: String(node.url),
                },
              ];
            });
            const pictures: Array<(typeof placeable)[number] & { file: File }> =
              [];
            const types = new Set<UploadFileType>();

            for (const picture of placeable) {
              if (
                pictures.some(({ path }) =>
                  PathApi.isAncestor(path, picture.path)
                )
              ) {
                continue;
              }

              const file = readPicture(picture.url);
              const fileType = file && classifyFile(file, allowedTypes);
              const rule = fileType ? rules[fileType] : undefined;
              if (!file || !fileType || rule?.kind !== 'image') continue;

              types.add(fileType);
              pictures.push({ ...picture, file });
              if (
                refusedWhateverFollows(
                  pictures.length,
                  types,
                  rule,
                  settings.maxFiles
                )
              ) {
                break;
              }
            }

            if (pictures.length === 0) return;

            const validation = validateFiles(
              pictures.map(({ file }) => file),
              settings
            );

            if (stale()) return;
            if (validation.error) {
              const failure: UploadFailure = {
                ...validation.error,
                phase: 'admission',
              };

              handlers.push(onceAcrossReplays(() => notifyFailure(failure)));
              return;
            }

            const selection = tx.selection();
            const holds = (path: Path, point: Point) =>
              point.root === tx.view.root() &&
              PathApi.isAncestor(path, point.path);
            const caretPicture = pictures.find(
              ({ path }) =>
                selection &&
                (holds(path, selection.anchor) || holds(path, selection.focus))
            );
            const swapped = pictures.flatMap(
              ({ caption, draft, file, path, properties }) => {
                if (!tx.nodes.replace(draft, { at: path })) return [];
                const key = tx.key(path);
                if (!key) {
                  throw new Error(
                    'Upload insertion did not retain its node identity.'
                  );
                }

                return [
                  { caption, file, key, kind: 'image' as const, properties },
                ];
              }
            );

            if (caretPicture) {
              const start = tx.points.start(caretPicture.path);
              if (start) tx.selection.set(start);
            }
            bind(
              tx.effects,
              (handler) => handlers.push(handler),
              {
                authored: readAuthoredView(writer),
                authorId: getViewAuthor(writer),
                client,
                getUrl,
                uploads: swapped,
              },
              'yield'
            );
          });

          for (const handler of handlers) {
            attachTransactionSpecAfterCommit(result, handler);
          }
          return result;
        }),
      ],
      on: {
        commit({ commit }) {
          const replaces = commit.annotations[documentReplacement.key] === true;
          if (!replaces && !commit.changed.hasAny('document')) return;

          const isLatest = commit.version >= getSnapshotVersion(editor);

          revokeWhere((key, { admittedVersion, kind }) => {
            if (admittedVersion >= commit.version) return false;
            if (replaces && admittedVersion < commit.previousVersion) {
              return true;
            }

            return !(
              isStoredDraft(key, kind) &&
              (isLatest || slotIn(commit, key, kind))
            );
          });
        },
      },
      update: ({ context: { afterCommit }, editor: updateEditor, tx }) => ({
        /**
         * Check a batch for drafts the caller inserts itself. It writes nothing,
         * and returns nothing when there is nothing to do.
         */
        admit: txStored(
          (
            input: readonly File[] | FileList,
            options: UploadAdmitOptions = {}
          ): UploadAdmission | UploadRefusal | undefined => {
            const files = Array.from(input);
            const writer = writerWithWork(updateEditor, files);

            if (!writer) return undefined;

            const batch = check(
              files,
              options.kind && { files, kind: options.kind }
            );
            if ('failure' in batch) {
              const { failure } = batch;

              refuse(tx.effects, afterCommit, failure);
              return batch;
            }

            const { client, getUrl, uploads } = batch;
            let filled = false;

            return {
              drafts: uploads.map(({ kind }) =>
                tx.schema.create(type, { kind })
              ),
              fill: (given) => {
                const keys = Array.from(given);

                if (keys.length !== uploads.length) {
                  throw new Error(
                    'Upload fill takes one draft key for each file.'
                  );
                }
                if (keys.some((key) => typeof key !== 'string')) {
                  throw new Error('Upload fill takes node keys only.');
                }
                if (new Set(keys).size !== keys.length) {
                  throw new Error(
                    'Upload fill takes a different draft key for each file.'
                  );
                }

                const taken = new Set(
                  admissionMarks(tx.effects.all()).flatMap((mark) =>
                    mark.form === 'replace' || mark.form === 'yield'
                      ? mark.keys
                      : []
                  )
                );
                const prepared = keys.map((key, index) => {
                  const { file, kind } = uploads[index];
                  const draft = tx.nodes.get(key)?.[0];

                  if (
                    !NodeApi.isElement(draft) ||
                    draft.type !== type ||
                    draft.kind !== kind
                  ) {
                    throw new Error(
                      'Upload fill takes the key of a live upload draft of its file kind.'
                    );
                  }
                  if (tx.nodes.elementReadOnly({ at: key })) {
                    throw new Error(
                      'Upload fill cannot give a file to a draft inside a read-only element.'
                    );
                  }
                  if (
                    hasNonWritableAt(updateEditor, key, {
                      includeReadOnly: false,
                    })
                  ) {
                    throw new Error(
                      'Upload fill cannot give a file to a draft inside a non-writable element.'
                    );
                  }
                  if (taken.has(key)) {
                    throw new Error(
                      'Upload fill names a draft that this update already gave a file.'
                    );
                  }

                  return { file, key, kind };
                });

                if (filled) {
                  throw new Error(
                    'Upload fill runs once for each admitted batch.'
                  );
                }

                tx.tags.add('history-push');
                bind(
                  tx.effects,
                  afterCommit,
                  { ...writer, client, getUrl, uploads: prepared },
                  'yield'
                );
                filled = true;
              },
            };
          }
        ),
        submit: txLocate(
          (args, place) => {
            const [, { after, at, before, slot } = {}] = args;
            const liveCaret =
              getActiveEditorTransaction(updateEditor)?.selection();
            const placed = [after, at, before, slot].some(
              (target) => target !== undefined
            );

            if (placed || !liveCaret) {
              return locateAt(1, 'slot', 'at', 'after', 'before')(args, place);
            }

            return place.location(liveCaret) === null ? null : args;
          },
          (
            input: readonly File[] | FileList,
            options: UploadSubmitOptions = {}
          ) => {
            const files = Array.from(input);
            const writer = writerWithWork(updateEditor, files);

            if (!writer) return false;

            const slot = 'slot' in options ? options.slot : undefined;
            const slotKind = slot
              ? draftKind(tx.nodes.get(slot)?.[0])
              : undefined;

            if (slot && (!slotKind || hasNonWritableAt(updateEditor, slot))) {
              return false;
            }

            const reject = (failure: UploadFailure) => {
              refuse(tx.effects, afterCommit, failure);
              return true;
            };
            const refuseDoesNotFit = () =>
              reject({ code: 'does-not-fit', files, phase: 'placement' });
            const batch = check(
              files,
              slotKind && { files: files.slice(0, 1), kind: slotKind }
            );
            if ('failure' in batch) return reject(batch.failure);

            const { client, getUrl, uploads } = batch;

            const prepared: PreparedUpload[] = [];
            const prepareInserted = (
              insertedUploads: ReadonlyArray<
                Readonly<{ element: Element; file: File; kind: UploadKind }>
              >
            ) =>
              insertedUploads.map(({ element, file, kind }) => {
                const key = tx.key(element);
                if (!key) {
                  throw new Error(
                    'Upload insertion did not retain its node identity.'
                  );
                }

                return { file, key, kind };
              });
            if (slot) {
              prepared.push({ ...uploads[0], key: slot });
              const additional = uploads.slice(1).map((upload) => ({
                ...upload,
                element: tx.schema.create(type, { kind: upload.kind }),
              }));

              if (additional.length > 0) {
                const inserted = placeAfter(
                  tx,
                  slot,
                  additional.map(({ element }) => element)
                );
                if (!inserted) return refuseDoesNotFit();
                tx.tags.add('history-push');
                prepared.push(...prepareInserted(additional));
              }
            } else {
              const elements = uploads.map((upload) => ({
                ...upload,
                element: tx.schema.create(type, { kind: upload.kind }),
              }));
              const nodes = elements.map(({ element }) => element);
              const { slot: _slot, ...insertOptions } = options;
              let inserted: readonly NodeKey[] | undefined;

              if (
                insertOptions.at !== undefined ||
                insertOptions.before !== undefined
              ) {
                inserted = tx.blocks.insert(nodes, insertOptions);
              } else {
                const after = insertOptions.after ?? getCaretAnchor(editor, tx);
                const anchor = tx.nodes.block({ at: after });
                // A submit at the selection fills an empty block, as paste does.
                const replaceEmpty =
                  insertOptions.replaceEmpty ??
                  insertOptions.after === undefined;

                inserted = tx.blocks.insert(nodes, {
                  ...insertOptions,
                  after,
                  replaceEmpty:
                    replaceEmpty &&
                    (!anchor ||
                      isReplaceableEmptyBlock(updateEditor, tx, anchor)),
                });
              }
              if (!inserted) return refuseDoesNotFit();
              tx.tags.add('history-push');
              prepared.push(...prepareInserted(elements));
            }

            bind(
              tx.effects,
              afterCommit,
              { ...writer, client, getUrl, uploads: prepared },
              slot ? 'replace' : 'yield'
            );
            return true;
          }
        ),
      }),
    };
  })
  .extend(() => ({
    commands: ({ around }) => [
      around(domCommands.insertData, ({ input, next, state }) => {
        const files = pastedUploadFiles(input);

        if (files.length === 0) return next();

        let handled = false;
        const transaction = state.transaction((tx) => {
          handled = tx.upload.submit(files);
        });

        return handled ? transaction : next();
      }),
    ],
  }))
  .extend(({ schema: { type } }) => {
    const holdsDraft = (node: Node): boolean =>
      ElementApi.isElement(node) &&
      (node.type === type || node.children.some(holdsDraft));

    return {
      contributions: [
        transferVeto.of(
          ({ from, intent, payload }, view) =>
            intent === 'move' &&
            payload.kind === 'nodes' &&
            from.read.view.root() !== view.read.view.root() &&
            payload.nodes.some(holdsDraft)
        ),
      ],
    };
  });

export type UploadElement = ElementOf<typeof BaseUploadPlugin>;
