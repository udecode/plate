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
  type EditorViewOptions,
  type Element,
  type ElementOf,
  type NodeKey,
  type Path,
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
  getEditorRuntimeRootKeys,
  getSnapshotVersion,
  getViewAuthor,
  readAuthoredView,
  registerEditorTransactionGuard,
  reportEditorLifecycleError,
  txStored,
  withStoredAuthoredRead,
} from '../../../facade';
import { isReplaceableEmptyBlock } from '../../../internal/plugin/blockInsertion';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';
import { getCaretAnchor } from '../../../internal/plugin/insertionAnchor';
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

const winningMark = (effects: readonly EditorEffect[], key: NodeKey) => {
  let given = false;
  let winner: AdmissionMark | undefined;

  for (const mark of admissionMarks(effects)) {
    if (!mark.keys.includes(key)) continue;
    if (mark.form === 'cancel') {
      winner = undefined;
      continue;
    }
    if (mark.form === 'replace' || !given) winner = mark;
    given = true;
  }

  return winner;
};

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

type InternalTask = {
  admittedVersion: number;
  controller: AbortController;
  kind: UploadKind;
  state: ReturnType<typeof createZustandStore<UploadTaskState>>;
  token: object;
};

type PreparedUpload = Readonly<{
  file: File;
  kind: UploadKind;
  key: NodeKey;
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
    const tasks = new Map<NodeKey, InternalTask>();
    const pastedPictures = new Map<NodeKey, PastedPicture>();
    type PendingStart = Readonly<{
      admittedVersion: number;
      id: number;
      kind: UploadKind;
    }>;
    type Admitted = Readonly<{ admittedVersion: number; kind: UploadKind }>;
    const pending = new Map<NodeKey, Map<number, PendingStart>>();
    const joinPending = (key: NodeKey, start: PendingStart) => {
      pending.set(key, (pending.get(key) ?? new Map()).set(start.id, start));
    };
    const leavePending = (key: NodeKey, id: number) => {
      const starts = pending.get(key);

      starts?.delete(id);
      if (starts?.size === 0) pending.delete(key);
    };
    const supersedePending = (key: NodeKey, id: number) => {
      const starts = pending.get(key);

      if (!starts) return;
      for (const other of starts.keys()) {
        if (other !== id) starts.delete(other);
      }
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
    const slotIn = (commit: EditorCommit, key: NodeKey, kind: UploadKind) =>
      getEditorRuntimeRootKeys(editor).some((root) => {
        const node = getEditorCommitNode(commit, key, root)?.[0];

        return (
          NodeApi.isElement(node) && node.type === type && node.kind === kind
        );
      });
    const removeTaskResource = (key: NodeKey, task?: InternalTask) => {
      const current = tasks.get(key);
      if (task && current && current !== task) return;
      const next = { ...store.get('tasks') };
      if (!next[key]) return;
      delete next[key];
      store.set({ tasks: next });
    };
    const stopTask = (key: NodeKey, expected?: InternalTask) => {
      const task = tasks.get(key);
      if (!task || (expected && task !== expected)) return false;
      tasks.delete(key);
      task.controller.abort();
      removeTaskResource(key, task);
      return true;
    };
    const cancel = (key: NodeKey, expected?: InternalTask) => {
      if (stopTask(key, expected)) pastedPictures.delete(key);
    };
    const createOwnerView = (
      authorId: string | undefined,
      authored: EditorViewOptions['authored']
    ) => {
      const owner = createEditorView(editor, { authorId });

      configureAuthoredView(owner, authored);
      return owner;
    };
    const notifyFailure = (failure: UploadFailure) => {
      store.get('onError')?.(failure);
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
      matches: (key: NodeKey, work: Admitted) => boolean
    ) => {
      for (const [key, starts] of pending) {
        for (const start of starts.values()) {
          if (matches(key, start)) leavePending(key, start.id);
        }
      }
      const stopped = [...tasks].filter(([key, task]) => matches(key, task));

      for (const [key] of stopped) {
        tasks.delete(key);
        pastedPictures.delete(key);
      }
      for (const [, task] of stopped) task.controller.abort();
      const current = store.get('tasks');
      const gone = (Object.keys(current) as NodeKey[]).filter(
        (key) => !tasks.has(key)
      );

      if (gone.length === 0) return;
      const next = { ...current };
      for (const key of gone) delete next[key];
      store.set({ tasks: next });
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
      if (!portal) return undefined;
      const { api } = portal;
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
        type: portal.schema.type,
      };
    };
    const startTask = (
      upload: PreparedUpload | PastedPicture,
      client: UploadClient,
      getUrl: (file: UploadOutcome) => string,
      owner: typeof editor,
      revoked: () => boolean,
      admittedVersion: number
    ) => {
      if (!isStoredDraft(upload.key, upload.kind)) return;

      stopTask(upload.key);
      // Stopping the older request runs its abort listeners, which may cancel
      // this slot or close the editor.
      if (revoked()) {
        if (!tasks.has(upload.key)) pastedPictures.delete(upload.key);
        return;
      }
      if ('caption' in upload) {
        pastedPictures.set(upload.key, upload);
      } else if (pastedPictures.get(upload.key)?.file !== upload.file) {
        pastedPictures.delete(upload.key);
      }
      const controller = new AbortController();
      const state = createZustandStore<UploadTaskState>(
        Object.freeze({
          progress: Object.freeze({ fraction: 0, loaded: 0, total: 0 }),
          status: 'uploading',
        })
      );
      const resource: UploadTask = {
        file: upload.file,
        getSnapshot: state.get,
        subscribe: state.subscribe,
      };
      const task: InternalTask = {
        admittedVersion,
        controller,
        kind: upload.kind,
        state,
        token: {},
      };
      tasks.set(upload.key, task);
      store.set({
        tasks: { ...store.get('tasks'), [upload.key]: resource },
      });

      const owns = () =>
        tasks.get(upload.key)?.token === task.token &&
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

          owner.update({ history: 'skip' }, (tx) => {
            const entry = tx.nodes.get(upload.key);
            if (
              tasks.get(upload.key)?.token !== task.token ||
              !entry ||
              !NodeApi.isElement(entry[0]) ||
              entry[0].type !== type ||
              entry[0].kind !== upload.kind
            ) {
              return;
            }

            const kept = pastedPictures.get(upload.key);

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
            // A throw while publishing the commit skips the `on.commit` handler
            // that drops the task.
            cancel(upload.key, task);
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
      admission: Readonly<{
        authored: EditorViewOptions['authored'];
        authorId: string | undefined;
        client: UploadClient;
        getUrl: (file: UploadOutcome) => string;
        uploads: ReadonlyArray<PreparedUpload | PastedPicture>;
      }>,
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
          const start = pending.get(upload.key)?.get(id);

          if (!start) return;
          if (closed() || winningMark(commit.effects, upload.key)?.id !== id) {
            leavePending(upload.key, id);
            return;
          }
          supersedePending(upload.key, id);
          owner ??= createOwnerView(admission.authorId, admission.authored);
          const supersededOrClosed = () =>
            !pending.get(upload.key)?.has(id) || closed();

          startTask(
            upload,
            admission.client,
            admission.getUrl,
            owner,
            supersededOrClosed,
            start.admittedVersion
          );
          leavePending(upload.key, id);
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
            const marks = admissionMarks(effects).filter(
              ({ form }) => form === 'replace' || form === 'yield'
            );
            const joinOnPublish = () => {
              for (const { id, keys, kinds } of marks) {
                keys.forEach((key, index) => {
                  joinPending(key, {
                    admittedVersion: commit.previousVersion,
                    id,
                    kind: kinds[index],
                  });
                });
              }
            };

            return marks.length === 0 ? undefined : joinOnPublish;
          })
        );
        onCleanup(() => revokeWhere(() => true));
      },
      api: () => ({
        cancel: (key: NodeKey) => {
          const active = getActiveEditorTransaction(editor);

          if (active) markAdmission(active.effects, 'cancel', [key]);
          pending.delete(key);
          cancel(key);
        },
      }),
      commands: ({ around }) => [
        around(domCommands.insertData, ({ input, next, state }) => {
          const { client, getUrl, rules } = store.get();
          const pictureType = destination('image')?.schema.type;
          const hasDataUrl = (picture: Element) =>
            typeof picture.url === 'string' && /^data:/iu.test(picture.url);
          const stringsCarryPicture = () =>
            Array.from(input.types ?? []).some((format) => {
              // happy-dom's DataTransfer returns a pasted file from getData under its MIME type.
              const data: unknown = input.getData(format);

              return (
                typeof data === 'string' &&
                (/data:image\//iu.test(data) || data.includes('\\pict'))
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
                      element.type === pictureType && hasDataUrl(element)
                  )
                )
            );
          };

          if (
            closed() ||
            !client ||
            !getUrl ||
            !pictureType ||
            !Object.values(rules).some((rule) => rule?.kind === 'image') ||
            !(stringsCarryPicture() || editorSliceCarriesPicture())
          ) {
            return next();
          }

          const known = new Set<NodeKey>();

          for (const [picture, path] of state.nodes.entries({
            at: [],
            type: pictureType,
          })) {
            const key = hasDataUrl(picture) ? state.key(path) : null;
            if (key) known.add(key);
          }
          const before = new Set(state.nodes.children([]));
          const writer = getAuthoredUpdateView(editor);
          const pasted = next();

          if (pasted === false) return false;

          const handlers: EditorCommitHandler[] = [];
          const result = state.transaction.extend(pasted, (tx) => {
            const allowedTypes = new Set(
              Object.keys(rules).filter(isUploadFileType)
            );
            const decodeDataUrl = (url: string) => {
              const mime = url.slice(5, url.indexOf(';')).toLowerCase();

              try {
                const bytes = Uint8Array.from(
                  atob(url.slice(url.indexOf(',') + 1)),
                  (char) => char.charCodeAt(0)
                );

                return new File([bytes], `image.${mime.slice(6)}`, {
                  type: mime,
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

            tx.nodes.children([]).forEach((block, index) => {
              if (before.has(block)) return;
              for (const [picture, path] of tx.nodes.entries({
                at: [index],
                type: pictureType,
              })) {
                const key = hasDataUrl(picture) ? tx.key(path) : null;
                if (key && !known.has(key)) candidates.push([picture, path]);
              }
            });

            const pictures = candidates.flatMap(([node, path]) => {
              const file = decodeDataUrl(String(node.url));
              const fileType = file && classifyFile(file, allowedTypes);
              if (!file || !fileType || rules[fileType]?.kind !== 'image') {
                return [];
              }

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
                { caption: node.children, draft, file, path, properties },
              ];
            });

            if (pictures.length === 0) return;

            const validation = validateFiles(
              pictures.map(({ file }) => file),
              store.get()
            );

            if (validation.error) {
              const failure: UploadFailure = {
                ...validation.error,
                phase: 'admission',
              };

              handlers.push(onceAcrossReplays(() => notifyFailure(failure)));
              return;
            }

            const selection = tx.selection();
            const caretPicture = pictures.find(
              ({ path }) =>
                selection &&
                (PathApi.isAncestor(path, selection.anchor.path) ||
                  PathApi.isAncestor(path, selection.focus.path))
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

            if (slot && (!slotKind || tx.nodes.elementReadOnly({ at: slot }))) {
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
                const inserted = tx.blocks.insert(
                  additional.map(({ element }) => element),
                  { after: slot, replaceEmpty: false }
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
                const anchor = tx.nodes.block({ at: after })?.[0];
                // A submit at the selection fills an empty block, as paste does.
                const replaceEmpty =
                  insertOptions.replaceEmpty ??
                  insertOptions.after === undefined;

                inserted = tx.blocks.insert(nodes, {
                  ...insertOptions,
                  after,
                  replaceEmpty:
                    replaceEmpty &&
                    (!anchor || isReplaceableEmptyBlock(tx, anchor)),
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
        const files = Array.from(input.files ?? []);

        if (
          files.length === 0 ||
          Array.from(input.types ?? []).includes('text/html')
        ) {
          return next();
        }

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
