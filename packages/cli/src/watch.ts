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
    results: ReadonlyArray<
      Readonly<{
        entryPath: string;
        sourceFiles: readonly string[];
      }>
    >
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
      const entryPath = entryPaths[index];

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
            const entryPath = entryPaths[index];

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
  const observedDirectories = new Set<string>();
  const forgetObservedDirectory = (path: string) => {
    observedDirectories.forEach((directory) => {
      if (directory === path || directory.startsWith(`${path}${sep}`)) {
        observedDirectories.delete(directory);
      }
    });
  };
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

  const refreshWatchSet = (nextPaths: readonly string[]) => {
    const next = new Set([...entryPaths, ...nextPaths]);
    const nextTargets = watchTargets(next);
    // Re-adding a directory already reached through a recursive parent starts
    // another ignoreInitial crawl, which can swallow its first new file.
    const added = [...nextTargets].filter(
      (path) => !watchedTargets.has(path) && !observedDirectories.has(path)
    );
    const removed = [...watchedTargets].filter(
      (path) => !nextTargets.has(path)
    );
    const retainedAncestors = removed.filter((path) =>
      [...nextTargets].some((target) => target.startsWith(`${path}${sep}`))
    );
    const retainedAncestorSet = new Set(retainedAncestors);
    const unwatchable = removed.filter(
      (path) => !retainedAncestorSet.has(path)
    );

    // Chokidar 4 unwatch is synchronous; only close() awaits watcher cleanup.
    if (unwatchable.length > 0) {
      unwatchable.forEach(forgetObservedDirectory);
      watcher.unwatch(unwatchable);
    }
    if (added.length > 0) watcher.add(added);
    watched = next;
    watchedTargets = new Set(
      [...watchedTargets, ...added].filter(
        (path) => !unwatchable.includes(path)
      )
    );
  };
  const regenerate = async (
    targetEntries: readonly string[],
    notify = true
  ) => {
    try {
      const results = await generateEditors(targetEntries, { cwd }, session);

      recordSources(results);
      refreshWatchSet(allSources());
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
      const attemptedSources = await Promise.all(
        targetEntries.map(async (entry) => {
          const entryPath = resolve(cwd, entry);

          // No replacement graph can exist until the entry returns. Retain
          // the last-good sources instead of starting unrelated watch crawls.
          if (!existsSync(entryPath)) return [entryPath];

          try {
            const sourceFiles = [...(await discoverAttemptedSources(entry))];

            sourcesByEntry.set(entryPath, new Set([entryPath, ...sourceFiles]));

            return [entryPath, ...sourceFiles];
          } catch {
            return [];
          }
        })
      );
      const attempted = attemptedSources.flat();

      if (attempted.length > 0) {
        refreshWatchSet([...watched, ...attempted]);
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
    let shouldContinue = true;

    while (shouldContinue) {
      followUp = false;
      const targetEntries =
        pendingEntries.size > 0 ? [...pendingEntries] : entryPaths;

      pendingEntries.clear();
      await regenerate(targetEntries, notify);
      notify = true;
      shouldContinue = !closed && followUp;
    }

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

    if (event === 'addDir') observedDirectories.add(resolvedPath);
    if (event === 'unlinkDir') forgetObservedDirectory(resolvedPath);

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
        // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- [P1 local-invariant] AbortSignal.reason is a host-owned value whose identity must survive the adapter.
        rejectReady(
          signal?.reason ?? new Error('Plate watch initialization stopped.')
        );
      };
      const onError = (error: unknown) => {
        cleanup();
        // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- [P1 local-invariant] Chokidar owns the emitted error contract; preserve its rejection value unchanged.
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
    refreshWatchSet(allSources());
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
