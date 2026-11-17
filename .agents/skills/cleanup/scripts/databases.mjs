// Judges the databases on each local Postgres server that a checkout's env
// file points at, when a running Docker container publishes the server's port.
// A database stays while an env file of the repository's checkout, one of its
// worktrees or another checkout beside it names it, while a connection is open
// or for a day after its last write. Any other database is one a test or proof
// run made, so it goes once that day passes.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const HOUR = 3_600_000;
const ENV_FILES = ['.env', '.env.local', '.env.development', '.env.development.local', '.env.test', '.env.test.local'];
const LOCAL_URL = /postgres(?:ql)?:\/\/([^:@/\s'"]+)(?::[^@/\s'"]*)?@(?:localhost|127\.0\.0\.1|\[::1\]):(\d+)\/([\w-]+)/gu;
const SYSTEM = new Set(['postgres', 'template0', 'template1']);

const docker = (args, input) => execFileSync('docker', args, { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'], timeout: 20_000 });

const siblings = (main) => {
  try {
    return readdirSync(dirname(main), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => join(dirname(main), entry.name));
  } catch {
    return [];
  }
};

export function envDatabases(dirs) {
  const servers = new Map();
  for (const dir of dirs) {
    for (const name of ENV_FILES) {
      const file = join(dir, name);
      if (!existsSync(file)) continue;
      for (const [, user, port, database] of readFileSync(file, 'utf8').matchAll(LOCAL_URL)) {
        const server = servers.get(port) ?? { port, users: new Set(), named: new Set() };
        server.users.add(user);
        server.named.add(database);
        servers.set(port, server);
      }
    }
  }
  return servers;
}

function containerFor(port) {
  const line = docker(['ps', '--format', '{{.Names}}\t{{.Ports}}'])
    .split('\n')
    .find((each) => new RegExp(`:${port}->5432/tcp`, 'u').test(each));
  return line?.split('\t')[0] ?? null;
}

// pg_stat_file needs a superuser, which the image's POSTGRES_USER is.
const LIST = `select d.datname, s.numbackends, coalesce(extract(epoch from (select max((pg_stat_file('base/' || d.oid || '/' || f)).modification) from pg_ls_dir('base/' || d.oid) f)), 0)::bigint, pg_database_size(d.datname)
from pg_database d join pg_stat_database s using (datname) where not d.datistemplate`;

function listDatabases(container, user) {
  return docker(['exec', '-i', container, 'psql', '-U', user, '-d', 'postgres', '-At', '-F', '\t', '-v', 'ON_ERROR_STOP=1'], LIST)
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [name, connections, written, bytes] = line.split('\t');
      return { name, connections: Number(connections), written: Number(written) * 1000, bytes: Number(bytes) };
    });
}

export function classifyDatabase({ named, connections, hoursQuiet }) {
  if (named) return ['keep', 'an env file of a checkout names it'];
  if (connections > 0) return ['keep', `${connections} open connection${connections === 1 ? '' : 's'}`];
  if (hoursQuiet < 24) return ['keep', `written ${Math.max(0, Math.round(hoursQuiet))}h ago`];
  return ['safe', `no env file names it and nothing wrote it for ${Math.round(hoursQuiet / 24)}d`];
}

const label = (port, name) => `postgres://localhost:${port}/${name}`;

export function databaseItems({ main, worktrees, now = Date.now() }) {
  const servers = envDatabases([...new Set([main, ...worktrees.map((entry) => entry.path), ...siblings(main)])]);
  const items = [];
  for (const server of servers.values()) {
    let container;
    let databases;
    try {
      container = containerFor(server.port);
      if (!container) continue;
      databases = listDatabases(container, [...server.users][0]);
    } catch (error) {
      items.push({ kind: 'database', path: label(server.port, '*'), verdict: 'ask', reason: `could not list its databases: ${String(error.message).split('\n')[0]}`, bytes: null });
      continue;
    }
    for (const database of databases.filter((each) => !SYSTEM.has(each.name))) {
      const [verdict, reason] = classifyDatabase({ named: server.named.has(database.name), connections: database.connections, hoursQuiet: (now - database.written) / HOUR });
      items.push({ kind: 'database', path: label(server.port, database.name), verdict, reason, bytes: database.bytes, server: { container, user: [...server.users][0], named: [...server.named] }, name: database.name });
    }
  }
  return items;
}

// Judges the database once more right before the drop, and drops it without
// FORCE, so a connection opened since the scan makes the drop fail.
export function dropDatabase(item, now = Date.now()) {
  const { container, user, named } = item.server;
  const database = listDatabases(container, user).find((each) => each.name === item.name);
  if (!database) return ['keep', 'already gone'];
  const judged = classifyDatabase({ named: named.includes(item.name), connections: database.connections, hoursQuiet: (now - database.written) / HOUR });
  if (judged[0] !== 'safe') return judged;
  docker(['exec', '-i', container, 'psql', '-U', user, '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-q'], `drop database "${item.name.replaceAll('"', '""')}"`);
  item.bytes = database.bytes;
  return null;
}
