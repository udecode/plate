#!/usr/bin/env node
// Runs /cleanup all without a Claude session, for a launchd job.
//
//   node daily.mjs run [--folder <dir>]      removes the safe set in every checkout of the folder, ~/git by default
//   node daily.mjs install [--folder <dir>]  writes and loads a launchd job that runs it each day at 05:30
//
// The session list comes from the files the Claude desktop app keeps for each
// session, which hold its folder, title and archived flag but no pin, so a
// worktree a pinned session uses stays only while something writes it or a
// `git worktree lock` holds it. The run stops Next telemetry flushers that
// esbuild left running with no parent, because they keep their worktree
// forever. It writes its report to ~/Library/Logs/cleanup-daily/ and posts a
// notification with the space freed and the rows left to decide.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const LABEL = 'dev.dotai.cleanup-daily';
const SCAN = join(dirname(fileURLToPath(import.meta.url)), 'scan.mjs');
const LOGS = join(homedir(), 'Library', 'Logs', 'cleanup-daily');
const SESSIONS = join(homedir(), 'Library', 'Application Support', 'Claude', 'claude-code-sessions');
const KEEP_DAYS = 14;

const freeBytes = (folder) => Number(execFileSync('df', ['-kP', folder], { encoding: 'utf8' }).trim().split('\n').at(-1).split(/\s+/u)[3]) * 1024;
const gib = (bytes) => `${(bytes / 1024 ** 3).toFixed(1)}G`;

function* sessionFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sessionFiles(path);
    else if (/^local_.+\.json$/u.test(entry.name)) yield path;
  }
}

export function desktopSessions(dir = SESSIONS) {
  const sessions = [];
  for (const file of sessionFiles(dir)) {
    try {
      const record = JSON.parse(readFileSync(file, 'utf8'));
      const cwd = record.worktreePath ?? record.cwd;
      if (cwd) sessions.push({ cwd, isArchived: record.isArchived === true, sessionId: record.sessionId, title: record.title });
    } catch {}
  }
  return sessions;
}

function stopFlushers() {
  const lines = execFileSync('ps', ['-axo', 'pid=,ppid=,command='], { encoding: 'utf8' }).split('\n');
  const pids = lines
    .map((line) => line.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/u))
    .filter((match) => match && match[2] === '1' && match[3].includes('next/dist/telemetry/detached-flush.js'))
    .map((match) => Number(match[1]));
  for (const pid of pids) {
    try {
      process.kill(pid);
    } catch {}
  }
  return pids.length;
}

function notify(title, message) {
  spawnSync('osascript', ['-e', `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`]);
}

function run(folder) {
  const before = freeBytes(folder);
  const stopped = stopFlushers();
  const sessionsFile = join(tmpdir(), `cleanup-daily-sessions-${process.pid}.json`);
  writeFileSync(sessionsFile, JSON.stringify(desktopSessions()));
  const scan = spawnSync(process.execPath, [SCAN, '--repos', folder, '--delete', '--sessions', sessionsFile], { encoding: 'utf8', maxBuffer: 1024 ** 3 });
  rmSync(sessionsFile, { force: true });
  const after = freeBytes(folder);
  const asks = (scan.stdout ?? '').split('\n').filter((line) => line.startsWith('ASK '));
  mkdirSync(LOGS, { recursive: true });
  const report = join(LOGS, `${new Date().toISOString().slice(0, 10)}.txt`);
  const summary = `free on ${folder}: ${gib(before)} before, ${gib(after)} after; stopped ${stopped} orphaned Next telemetry flushers; ${asks.length} rows to decide`;
  writeFileSync(report, [summary, '', scan.stdout ?? '', scan.stderr ? `stderr:\n${scan.stderr}` : '', `exit ${scan.status}`].join('\n'));
  for (const name of readdirSync(LOGS)) {
    const path = join(LOGS, name);
    if (Date.now() - statSync(path).mtimeMs > KEEP_DAYS * 86_400_000) rmSync(path, { force: true });
  }
  const failed = scan.status !== 0 ? ' The scan failed.' : '';
  notify('Daily cleanup', `Freed ${gib(Math.max(0, after - before))}, ${asks.length} rows to decide.${failed} Report: ${report}`);
  console.log(`${summary}\nreport: ${report}`);
  return scan.status ?? 1;
}

function install(folder) {
  const node = realpathSync(process.execPath);
  const script = realpathSync(fileURLToPath(import.meta.url));
  const plist = join(homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`);
  const path = [dirname(node), '/usr/local/bin', '/opt/homebrew/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'].join(':');
  const string = (value) => `<string>${value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</string>`;
  mkdirSync(LOGS, { recursive: true });
  writeFileSync(
    plist,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key>${string(LABEL)}
<key>ProgramArguments</key><array>${string(node)}${string(script)}${string('run')}${string('--folder')}${string(folder)}</array>
<key>StartCalendarInterval</key><dict><key>Hour</key><integer>5</integer><key>Minute</key><integer>30</integer></dict>
<key>EnvironmentVariables</key><dict><key>PATH</key>${string(path)}<key>HOME</key>${string(homedir())}</dict>
<key>StandardOutPath</key>${string(join(LOGS, 'launchd.log'))}
<key>StandardErrorPath</key>${string(join(LOGS, 'launchd.log'))}
</dict></plist>
`
  );
  const domain = `gui/${process.getuid()}`;
  spawnSync('launchctl', ['bootout', `${domain}/${LABEL}`]);
  const loaded = spawnSync('launchctl', ['bootstrap', domain, plist], { encoding: 'utf8' });
  console.log(loaded.status === 0 ? `installed ${plist}, running daily at 05:30 over ${folder}` : `wrote ${plist}, but launchctl refused it: ${loaded.stderr.trim()}`);
  return loaded.status ?? 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const [command, ...rest] = process.argv.slice(2);
  const at = rest.indexOf('--folder');
  const folder = resolve(at === -1 ? join(homedir(), 'git') : rest[at + 1]);
  if (command === 'run') process.exitCode = run(folder);
  else if (command === 'install') process.exitCode = install(folder);
  else {
    console.error('usage: node daily.mjs run|install [--folder <dir>]');
    process.exitCode = 2;
  }
}
