import { existsSync, statSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';

import chokidar from 'chokidar';

import {
  acquireEditorWatchOwnership,
  discoverEditorWatchFiles,
  editorArtifactPaths,
  editorPrivateStateRoots,
  generateEditors,
  resolveEditorEntryPaths,
} from './generate';
import {
  NativeTypeScriptSession,
  resolveEditorSourceCandidate,
} from './typescript';

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const sourceRevision = (path: string) => {
  try {
    const stat = statSync(path);

    return `${stat.ino}:${stat.size}:${stat.mtimeMs}`;
  } catch {
    return 'missing';
  }
};

export const watchEditors = async (
  entries: readonly string[],
  cwd = process.cwd(),
  signal?: AbortSignal
) => {
  const entryPaths = resolveEditorEntryPaths(entries, cwd);
  const artifactPaths = new Set(entryPaths.flatMap(editorArtifactPaths));
  const privateStateRoots = editorPrivateStateRoots(entryPaths);
  const sourcesByEntry = new Map<string, Set<string>>(
    entryPaths.map((entryPath) => [entryPath, new Set([entryPath])])
  );
  const allSources = () =>
    [...sourcesByEntry.values()].flatMap((paths) => [...paths]);
  const ignored = (path: string) => {
    const resolvedPath = resolve(path);

    return (
      [...artifactPaths].some(
        (artifactPath) => resolvedPath === artifactPath
      ) ||
      privateStateRoots.some(
        (root) =>
          resolvedPath === root || resolvedPath.startsWith(`${root}${sep}`)
      ) ||
      !allSources().some(
        (source) =>
          source === resolvedPath ||
          source.startsWith(`${resolvedPath}${sep}`) ||
          resolveEditorSourceCandidate(source) === resolvedPath
      )
    );
  };
  const ownership = acquireEditorWatchOwnership(entryPaths);
  const session = new NativeTypeScriptSession(cwd);
  const throwIfAborted = () => {
    if (signal?.aborted) {
      throw signal.reason ?? new Error('Plate watch initialization stopped.');
    }
  };
  let initialError: unknown;
  const recordSources = (
    results: readonly Readonly<{
      entryPath: string;
      sourceFiles: readonly string[];
    }>[]
  ) => {
    results.forEach(({ entryPath, sourceFiles }) => {
      sourcesByEntry.set(
        resolve(entryPath),
        new Set([
          resolve(entryPath),
          ...sourceFiles.map((path) => resolve(path)),
        ])
      );
    });
  };
  const discoverAttemptedSources = async (entry: string) => {
    const sources = new Set<string>();
    const discovered = await Promise.allSettled([
      discoverEditorWatchFiles(entry, { cwd }),
      session.discoverAmbientSourceFiles(resolve(cwd, entry)),
    ]);

    discovered.forEach((result) => {
      if (result.status === 'fulfilled') {
        result.value.forEach((path) => {
          sources.add(path);
        });
      }
    });

    return sources;
  };
  let startupRevisions = new Map<string, string>();

  try {
    throwIfAborted();
    const discovered = await Promise.all(
      entryPaths.map((entry) => discoverAttemptedSources(entry))
    );

    discovered.forEach((sources, index) => {
      const entryPath = entryPaths[index]!;

      sourcesByEntry.set(entryPath, new Set([entryPath, ...sources]));
    });
    // Ambient discovery can initialize the TS snapshot before watch starts.
    // Force its discovered files through the first materialization update so
    // an edit during discovery cannot be mistaken for the snapshot contents.
    allSources().forEach((path) => {
      if (existsSync(path)) session.recordFileChange('change', path);
    });
    startupRevisions = new Map(
      allSources().map((path) => [path, sourceRevision(path)] as const)
    );
    try {
      const results = await generateEditors(entryPaths, { cwd }, session);

      recordSources(results);
    } catch (error) {
      throwIfAborted();
      initialError = error;
      await Promise.all(
        entryPaths.map(async (entry, index) => {
          try {
            const entryPath = entryPaths[index]!;

            sourcesByEntry.set(
              entryPath,
              new Set([entryPath, ...(await discoverAttemptedSources(entry))])
            );
          } catch {
            // The entry itself remains watched for recovery.
          }
        })
      );
    }
    throwIfAborted();
  } catch (error) {
    try {
      await session.close();
    } finally {
      ownership.release();
    }

    throw error;
  }
  let watched = new Set([...entryPaths, ...allSources()]);
  const existingWatchTarget = (path: string) => {
    if (entryPaths.includes(path)) return dirname(path);
    let target = path;

    while (!existsSync(target)) {
      const parent = dirname(target);

      if (parent === target) break;

      target = parent;
    }

    return target;
  };
  const watchTargets = (paths: ReadonlySet<string>) =>
    new Set([...paths].map(existingWatchTarget));
  let watchedTargets = watchTargets(watched);
  const watcher = chokidar.watch([...watchedTargets], {
    ignoreInitial: true,
    ignored,
  });
  let closed = false;
  let readyForChanges = false;
  let running = false;
  let scheduled = false;
  let followUp = false;
  const pendingEntries = new Set<string>();
  let pending = Promise.resolve();
  let coalescingTimer: ReturnType<typeof setTimeout> | undefined;
  const checkedListeners = new Set<(entryPaths: readonly string[]) => void>();
  const generatedListeners = new Set<(entryPaths: readonly string[]) => void>();

  const refreshWatchSet = async (nextPaths: readonly string[]) => {
    const next = new Set([...entryPaths, ...nextPaths]);
    const nextTargets = watchTargets(next);
    const added = [...nextTargets].filter((path) => !watchedTargets.has(path));
    const removed = [...watchedTargets].filter(
      (path) => !nextTargets.has(path)
    );
    const retainedAncestors = removed.filter((path) =>
      [...nextTargets].some((target) => target.startsWith(`${path}${sep}`))
    );
    const unwatchable = removed.filter(
      (path) => !retainedAncestors.includes(path)
    );

    if (unwatchable.length > 0) await watcher.unwatch(unwatchable);
    if (added.length > 0) watcher.add(added);
    watched = next;
    watchedTargets = new Set([...nextTargets, ...retainedAncestors]);
  };
  const regenerate = async (
    targetEntries: readonly string[],
    notify = true
  ) => {
    try {
      const results = await generateEditors(targetEntries, { cwd }, session);

      recordSources(results);
      await refreshWatchSet(allSources());
      const checkedEntries = results.map(({ entryPath }) => entryPath);
      const generatedEntries = results.flatMap(({ entryPath, status }) =>
        status === 'generated' ? [entryPath] : []
      );

      if (notify) {
        checkedListeners.forEach((listener) => {
          listener(checkedEntries);
        });
        if (generatedEntries.length > 0) {
          process.stdout.write(
            `Generated ${generatedEntries.length} editor${generatedEntries.length === 1 ? '' : 's'}\n`
          );
          generatedListeners.forEach((listener) => {
            listener(generatedEntries);
          });
        }
      }
    } catch (error) {
      const attempted = (
        await Promise.all(
          targetEntries.map(async (entry) => {
            try {
              const sourceFiles = [...(await discoverAttemptedSources(entry))];
              const entryPath = resolve(cwd, entry);

              sourcesByEntry.set(
                entryPath,
                new Set([entryPath, ...sourceFiles])
              );

              return [entryPath, ...sourceFiles];
            } catch {
              return [];
            }
          })
        )
      ).flat();

      if (attempted.length > 0) {
        await refreshWatchSet([...watched, ...attempted]);
      }
      process.stderr.write(`${errorMessage(error)}\n`);
    }
  };
  const run = async (notifyFirst = true) => {
    if (closed || running) {
      followUp = !closed;

      return;
    }
    running = true;
    let notify = notifyFirst;

    do {
      followUp = false;
      const targetEntries =
        pendingEntries.size > 0 ? [...pendingEntries] : entryPaths;

      pendingEntries.clear();
      await regenerate(targetEntries, notify);
      notify = true;
    } while (!closed && followUp);

    running = false;
  };
  const schedule = () => {
    if (closed || scheduled) return;
    scheduled = true;
    coalescingTimer = setTimeout(() => {
      scheduled = false;
      pending = pending.then(() => run());
    }, 20);
  };

  watcher.on('all', (event, path) => {
    const resolvedPath = resolve(path);
    let matched = false;

    sourcesByEntry.forEach((sources, entryPath) => {
      if (
        [...sources].some(
          (source) =>
            source === resolvedPath ||
            resolveEditorSourceCandidate(source) === resolvedPath ||
            (!existsSync(source) && source.startsWith(`${resolvedPath}${sep}`))
        )
      ) {
        matched = true;
        pendingEntries.add(entryPath);
      }
    });
    if (!matched) return;
    if (event === 'add' || event === 'change' || event === 'unlink') {
      session.recordFileChange(event, resolvedPath);
    }
    if (!readyForChanges) return;
    if (running) followUp = true;
    else schedule();
  });
  const closeWatcher = watcher.close.bind(watcher);

  watcher.close = async () => {
    if (closed) return;
    closed = true;
    if (coalescingTimer) clearTimeout(coalescingTimer);
    try {
      await closeWatcher();
      await pending;
      await session.close();
    } finally {
      ownership.release();
    }
  };
  try {
    await new Promise<void>((resolveReady, rejectReady) => {
      const cleanup = () => {
        signal?.removeEventListener('abort', onAbort);
        watcher.off('error', onError);
        watcher.off('ready', onReady);
      };
      const onAbort = () => {
        cleanup();
        rejectReady(
          signal?.reason ?? new Error('Plate watch initialization stopped.')
        );
      };
      const onError = (error: unknown) => {
        cleanup();
        rejectReady(error);
      };
      const onReady = () => {
        cleanup();
        resolveReady();
      };

      signal?.addEventListener('abort', onAbort, { once: true });
      watcher.once('error', onError);
      watcher.once('ready', onReady);
      if (signal?.aborted) onAbort();
    });
    throwIfAborted();
    sourcesByEntry.forEach((sources, entryPath) => {
      sourcesByEntry.set(
        entryPath,
        new Set(
          [...sources].flatMap((path) => {
            if (existsSync(path)) return [path];
            const resolvedPath = resolveEditorSourceCandidate(path);

            return resolvedPath ? [path, resolvedPath] : [path];
          })
        )
      );
    });
    await refreshWatchSet(allSources());
    readyForChanges = true;
    const changedDuringStartup = [...watched].filter(
      (path) => startupRevisions.get(path) !== sourceRevision(path)
    );

    if (pendingEntries.size > 0 || changedDuringStartup.length > 0) {
      changedDuringStartup.forEach((path) => {
        const before = startupRevisions.get(path);
        const after = sourceRevision(path);

        session.recordFileChange(
          after === 'missing'
            ? 'unlink'
            : before === undefined || before === 'missing'
              ? 'add'
              : 'change',
          path
        );
      });
      entryPaths.forEach((entryPath) => {
        pendingEntries.add(entryPath);
      });
      await run(false);
    }
    throwIfAborted();
  } catch (error) {
    await watcher.close();
    throw error;
  }
  if (initialError) process.stderr.write(`${errorMessage(initialError)}\n`);
  process.stdout.write(
    `Watching ${entryPaths.length} editor${entryPaths.length === 1 ? '' : 's'}\n`
  );

  return Object.assign(watcher, {
    onChecked(listener: (entryPaths: readonly string[]) => void) {
      checkedListeners.add(listener);

      return () => checkedListeners.delete(listener);
    },
    onGenerated(listener: (entryPaths: readonly string[]) => void) {
      generatedListeners.add(listener);

      return () => generatedListeners.delete(listener);
    },
  });
};

export const watchEditor = async (entry: string, cwd = process.cwd()) =>
  watchEditors([entry], cwd);
