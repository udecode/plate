import { resolve } from 'node:path';

import chokidar from 'chokidar';

import { discoverEditorWatchFiles, generateEditor } from './generate';

export const watchEditor = async (entry: string, cwd = process.cwd()) => {
  const entryPath = resolve(cwd, entry);
  let initialError: unknown;
  let initialSources: readonly string[];

  try {
    initialSources = (await generateEditor(entry, { cwd })).sourceFiles;
  } catch (error) {
    initialError = error;
    try {
      initialSources = await discoverEditorWatchFiles(entry, { cwd });
    } catch {
      initialSources = [entryPath];
    }
  }
  const watcher = chokidar.watch([...new Set([entryPath, ...initialSources])], {
    ignoreInitial: true,
  });
  let watched = new Set([entryPath, ...initialSources]);
  let closed = false;
  let pending = Promise.resolve();
  let scheduled = false;

  const regenerate = async () => {
    try {
      const result = await generateEditor(entry, { cwd });
      const next = new Set(result.sourceFiles);
      const added = [...next].filter((path) => !watched.has(path));
      const removed = [...watched].filter((path) => !next.has(path));

      if (added.length > 0) watcher.add(added);
      if (removed.length > 0) await watcher.unwatch(removed);
      watched = next;
      process.stdout.write(`Generated ${result.typesPath}\n`);
    } catch (error) {
      try {
        const attempted = await discoverEditorWatchFiles(entry, { cwd });
        const added = attempted.filter((path) => !watched.has(path));

        if (added.length > 0) watcher.add(added);
        watched = new Set([...watched, ...attempted]);
      } catch {
        // Keep the last-good watch set when dependency discovery also fails.
      }
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`
      );
    }
  };
  const scheduleRegeneration = () => {
    if (closed || scheduled) return;
    scheduled = true;
    pending = pending.then(async () => {
      scheduled = false;
      if (!closed) await regenerate();
    });
  };
  const closeWatcher = watcher.close.bind(watcher);

  watcher.on('all', scheduleRegeneration);
  watcher.once('ready', scheduleRegeneration);
  watcher.close = async () => {
    closed = true;
    await closeWatcher();
    await pending;
  };
  if (initialError) {
    process.stderr.write(
      `${initialError instanceof Error ? initialError.message : String(initialError)}\n`
    );
  }
  process.stdout.write(`Watching ${entryPath}\n`);

  return watcher;
};
