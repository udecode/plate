import type {
  AggregateProgress,
  UploadCallOptions,
  UploadOutcome,
} from 'files-sdk/client';

import {
  defineEffect,
  definePlugin,
  documentReplacement,
  NodeApi,
  PLUGINS,
  type BlockInsertOptions,
  type Element,
  type ElementOf,
  type NodeEntry,
  type NodeKey,
  property,
} from '../../../core';
import { domCommands } from '../../../dom/plite-dom.internal';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';
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
      code: 'resolver-error';
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

type UploadNodeReader = Readonly<{
  read: Readonly<{
    nodes: Readonly<{
      get: (key: NodeKey) => NodeEntry | undefined;
    }>;
  }>;
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

const uploadAdmissionEffect = defineEffect({
  collab: 'local',
  history: 'skip',
  key: 'plate.upload.admission',
});

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
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
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

    const currentSlot = (
      key: NodeKey,
      kind?: UploadKind,
      owner: UploadNodeReader = editor
    ) => {
      const entry = owner.read.nodes.get(key);

      return entry &&
        NodeApi.isElement(entry[0]) &&
        entry[0].type === type &&
        isUploadKind(entry[0].kind) &&
        (kind === undefined || entry[0].kind === kind)
        ? ([entry[0], entry[1]] as const)
        : undefined;
    };
    const removeTaskResource = (key: NodeKey, task?: InternalTask) => {
      const current = tasks.get(key);
      if (task && current && current !== task) return;
      const next = { ...store.get('tasks') };
      if (!next[key]) return;
      delete next[key];
      store.set({ tasks: next });
    };
    const cancel = (key: NodeKey, expected?: InternalTask) => {
      const task = tasks.get(key);
      if (!task || (expected && task !== expected)) return;
      tasks.delete(key);
      task.controller.abort();
      removeTaskResource(key, task);
    };
    const cancelAll = () => {
      const active = [...tasks.values()];
      tasks.clear();
      active.forEach(({ controller }) => controller.abort());
      if (Object.keys(store.get('tasks')).length > 0) store.set({ tasks: {} });
    };
    const notifyFailure = (failure: UploadFailure) => {
      store.get('onError')?.(failure);
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
      upload: PreparedUpload,
      client: UploadClient,
      getUrl: (file: UploadOutcome) => string,
      owner: typeof editor
    ) => {
      if (!currentSlot(upload.key, upload.kind, owner)) return;

      cancel(upload.key);
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
        !!currentSlot(upload.key, upload.kind, owner);
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
        notifyFailure(failure);
      };

      void (async () => {
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

          tx.nodes.set(normalized, {
            at: upload.key,
            voids: true,
          });
          tx.nodes.unset('kind', { at: upload.key, voids: true });
        });
      })();
    };

    return {
      activate({ beforePublish, onCleanup }) {
        beforePublish(() => validateConfiguration(store.get()));
        onCleanup(cancelAll);
      },
      api: () => ({
        cancel: (key: NodeKey) => cancel(key),
      }),
      on: {
        commit({ commit }) {
          if (commit.annotations[documentReplacement.key] === true) {
            cancelAll();
            return;
          }
          if (!commit.changed.hasAny('document')) return;

          for (const [key, task] of tasks) {
            if (!currentSlot(key, task.kind)) cancel(key, task);
          }
        },
      },
      update: ({ context: { afterCommit }, editor: updateEditor, tx }) => ({
        submit: (
          input: File[] | FileList,
          options: UploadSubmitOptions = {}
        ) => {
          const files = Array.from(input);
          if (files.length === 0 || editor.read.view.isReadOnly()) return false;

          const state = store.get();
          const slot = 'slot' in options ? options.slot : undefined;
          const slotEntry = slot ? currentSlot(slot) : undefined;

          if (
            slot &&
            (!slotEntry || editor.read.nodes.elementReadOnly({ at: slot }))
          ) {
            return false;
          }

          const reject = (failure: UploadFailure) => {
            tx.effects.emit(uploadAdmissionEffect, null);
            afterCommit(() => notifyFailure(failure));
            return true;
          };
          const validation = validateFiles(files, state);
          if (validation.error) {
            return reject({ ...validation.error, phase: 'admission' });
          }
          const { client, getUrl } = state;
          if (!client || !getUrl) {
            return reject({
              code: client ? 'missing-url-resolver' : 'missing-client',
              files,
              phase: 'configuration',
            });
          }

          const uploads = files.map((file) => {
            const fileType = validation.fileTypes.get(file);
            const rule = fileType ? state.rules[fileType] : undefined;
            if (!fileType || !rule) {
              throw new Error(
                'Validated upload file requires a configured rule.'
              );
            }

            return { file, kind: rule.kind };
          });

          for (const { kind } of uploads) {
            if (!destination(kind)) {
              return reject({
                code: 'missing-destination',
                files,
                kind,
                phase: 'configuration',
              });
            }
          }

          if (slot && slotEntry && uploads[0].kind !== slotEntry[0].kind) {
            const allowedTypes = Object.entries(state.rules)
              .filter(([, rule]) => rule?.kind === slotEntry[0].kind)
              .map(([fileType]) => fileType)
              .filter(isUploadFileType);

            return reject({
              allowedTypes,
              code: 'unsupported-file-type',
              files: [uploads[0].file],
              phase: 'admission',
            });
          }

          const prepared: PreparedUpload[] = [];
          const prepareInserted = (
            firstPath: readonly number[],
            insertedUploads: ReadonlyArray<
              Readonly<{
                file: File;
                kind: UploadKind;
              }>
            >
          ) =>
            insertedUploads.map(({ file, kind }, index) => {
              const path = [...firstPath];
              path[path.length - 1] += index;
              const key = tx.key(path);
              if (!key) {
                throw new Error(
                  'Upload insertion did not retain its node identity.'
                );
              }

              return { file, key, kind };
            });
          const prepareByIdentity = (
            insertedUploads: ReadonlyArray<
              Readonly<{
                element: Element;
                file: File;
                kind: UploadKind;
              }>
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
              tx.tags.add('history-push');
              const inserted = tx.blocks.insertAfter(
                additional.map(({ element }) => element),
                { at: slot, replaceEmpty: false }
              );
              if (!inserted) return false;
              prepared.push(...prepareInserted(inserted, additional));
            }
            tx.effects.emit(uploadAdmissionEffect, null);
          } else {
            const elements = uploads.map((upload) => ({
              ...upload,
              element: tx.schema.create(type, { kind: upload.kind }),
            }));
            const { at, before, slot: _slot, ...insertOptions } = options;

            tx.tags.add('history-push');
            if (before !== undefined) {
              const target = tx.nodes.get(before);
              if (!target) return false;

              tx.nodes.insert(
                elements.map(({ element }) => element),
                { ...insertOptions, at: target[1] }
              );
              prepared.push(...prepareByIdentity(elements));
            } else if (at === undefined || insertOptions.after !== undefined) {
              const inserted = tx.blocks.insertAfter(
                elements.map(({ element }) => element),
                {
                  ...insertOptions,
                  at: insertOptions.after,
                }
              );
              if (!inserted) return false;
              prepared.push(...prepareInserted(inserted, elements));
            } else {
              tx.nodes.insert(
                elements.map(({ element }) => element),
                { ...insertOptions, at }
              );
              prepared.push(...prepareByIdentity(elements));
            }
          }

          afterCommit(() => {
            for (const upload of prepared) {
              startTask(upload, client, getUrl, updateEditor);
            }
          });
          return true;
        },
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

        const block = state.nodes.block();
        let handled = false;
        const transaction = state.transaction((tx) => {
          handled = tx.upload.submit(files, {
            after: block ? state.key(block[0]) : undefined,
            replaceEmpty: true,
          });
        });

        return handled ? transaction : next();
      }),
    ],
  }));

export type UploadElement = ElementOf<typeof BaseUploadPlugin>;
