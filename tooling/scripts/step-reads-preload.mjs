// check-step-reads.mjs loads this through NODE_OPTIONS, so every Node process
// a traced step starts records the paths it reads and the commands it spawns.
import childProcess from 'node:child_process';
import fs from 'node:fs';
import { registerHooks, syncBuiltinESMExports } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = process.env.STEP_READS_LOG;

if (dir) {
  const { writeFileSync } = fs;
  const seen = { listed: new Set(), probed: new Set(), read: new Set() };
  const spawns = new Set();
  const toPath = (target) => {
    if (typeof target === 'string') return path.resolve(target);
    if (target instanceof URL && target.protocol === 'file:') {
      return fileURLToPath(target);
    }
    if (Buffer.isBuffer(target)) return path.resolve(target.toString());
    return null;
  };
  const note = (kind) => (args) => {
    const file = toPath(args[0]);
    if (file) seen[kind].add(file);
  };
  const read = note('read');
  const probe = note('probed');
  const { O_ACCMODE, O_WRONLY } = fs.constants;
  const opened = (args) => {
    const [, flags = 'r'] = args;
    const writeOnly =
      typeof flags === 'number'
        ? (flags & O_ACCMODE) === O_WRONLY
        : /^[wa]/u.test(String(flags));
    if (!writeOnly) read(args);
  };
  const list = (args, names) => {
    const folder = toPath(args[0]);
    if (!folder || !Array.isArray(names)) return;
    for (const name of names) {
      if (typeof name === 'string') {
        seen.listed.add(path.join(folder, name));
      } else if (name?.name) {
        seen.listed.add(path.join(name.parentPath ?? folder, name.name));
      }
    }
  };

  // Keeps what callers read off the function itself, such as
  // realpathSync.native and the promisify.custom of fs.exists.
  const replace = (object, name, traced) => {
    const original = object[name];
    for (const key of Reflect.ownKeys(original)) {
      if (!['length', 'name', 'prototype'].includes(key)) {
        traced[key] = original[key];
      }
    }
    object[name] = traced;
  };
  const wrapSync = (object, name, onCall) => {
    const original = object[name];
    if (typeof original !== 'function') return;
    replace(object, name, function traced(...args) {
      const result = Reflect.apply(original, this, args);
      onCall(args, result);
      return result;
    });
  };
  const wrapAsync = (object, name, onCall) => {
    const original = object[name];
    if (typeof original !== 'function') return;
    replace(object, name, async function traced(...args) {
      const result = await Reflect.apply(original, this, args);
      onCall(args, result);
      return result;
    });
  };
  const wrapCallback = (object, name, onCall) => {
    const original = object[name];
    if (typeof original !== 'function') return;
    replace(object, name, function traced(...args) {
      const done = args.at(-1);
      if (typeof done !== 'function') {
        return Reflect.apply(original, this, args);
      }
      return Reflect.apply(original, this, [
        ...args.slice(0, -1),
        (error, result) => {
          if (!error) onCall(args, result);
          done(error, result);
        },
      ]);
    });
  };

  const PROBES = ['stat', 'lstat', 'access', 'realpath', 'readlink', 'opendir'];
  for (const [name, onCall] of Object.entries({
    open: opened,
    readFile: read,
  })) {
    wrapSync(fs, `${name}Sync`, onCall);
    wrapCallback(fs, name, onCall);
    wrapAsync(fs.promises, name, onCall);
  }
  for (const name of PROBES) {
    wrapSync(fs, `${name}Sync`, probe);
    wrapCallback(fs, name, probe);
    wrapAsync(fs.promises, name, probe);
  }
  wrapSync(fs, 'createReadStream', read);
  wrapSync(fs, 'existsSync', probe);
  wrapSync(fs, 'exists', probe);
  wrapSync(fs, 'readdirSync', list);
  wrapCallback(fs, 'readdir', list);
  wrapAsync(fs.promises, 'readdir', list);
  wrapSync(fs, 'globSync', (_args, matches) => list([process.cwd()], matches));

  const spawned = ([file, args]) => {
    spawns.add(
      [file, ...(Array.isArray(args) ? args : [])].map(String).join(' ')
    );
  };
  for (const name of [
    'spawn',
    'spawnSync',
    'execFile',
    'execFileSync',
    'exec',
    'execSync',
    'fork',
  ]) {
    wrapSync(childProcess, name, spawned);
  }
  syncBuiltinESMExports();

  registerHooks({
    load(url, context, nextLoad) {
      if (url.startsWith('file:')) read([new URL(url)]);
      return nextLoad(url, context);
    },
  });

  process.on('exit', () => {
    writeFileSync(
      path.join(
        dir,
        `${process.pid}-${Math.random().toString(36).slice(2)}.json`
      ),
      JSON.stringify({
        argv: process.argv.slice(1),
        listed: [...seen.listed],
        probed: [...seen.probed],
        read: [...seen.read],
        spawns: [...spawns],
      })
    );
  });
}
