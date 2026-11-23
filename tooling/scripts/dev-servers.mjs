#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

// A session's own shell is a group leader too, and its command can quote the
// helper path and `next dev`, so the pattern holds only at the start.
const SERVER =
  /^\S*\/Claude\.app\/Contents\/Helpers\/disclaimer -- .*\bnext(?:\/dist\/bin\/next)? dev\b/;
const SESSION = /^\S*\/Claude\.app\/Contents\/Helpers\/disclaimer --pgroup -- /;
const AGENT = /(?:^|\/)(?:claude|codex)(?: |$)/;
const PORT = /--port[= ](\d+)/;
const PS_LINE =
  /^\s*(\d+)\s+(\d+)\s+(\d+)\s+\w{3}\s+(\w{3})\s+(\d+)\s+(\d\d):(\d\d):(\d\d)\s+(\d{4})\s+(.*)$/;
const MONTHS = 'JanFebMarAprMayJunJulAugSepOctNovDec';
// ps gives a server's start to the second, so a landing counts only when it
// began at least a second after that.
const LANDED_AFTER_MS = 1000;
const TERM_GRACE_MS = 5000;
const POLL_MS = 200;

const run = (command, args, options) => {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 10_000,
    ...options,
  });
  if (result.error) throw result.error;
  return result;
};

const git = (cwd, args) => {
  const result = run('git', args, { cwd });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
};

const real = (dir) => {
  try {
    return realpathSync(dir);
  } catch {
    return dir;
  }
};

const within = (dir, parent) => dir === parent || dir.startsWith(`${parent}/`);

function processes() {
  const result = run(
    'ps',
    ['-axww', '-o', 'pid=,ppid=,pgid=,lstart=,command='],
    { env: { ...process.env, LC_ALL: 'C' } }
  );
  if (result.status !== 0) throw new Error(`ps failed: ${result.stderr}`);
  return result.stdout.split('\n').flatMap((line) => {
    const match = PS_LINE.exec(line);
    if (!match) return [];
    const [
      ,
      pid,
      ppid,
      pgid,
      month,
      day,
      hours,
      minutes,
      seconds,
      year,
      command,
    ] = match;
    const start = new Date(
      Number(year),
      MONTHS.indexOf(month) / 3,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds)
    ).getTime();
    return [
      {
        command,
        pgid: Number(pgid),
        pid: Number(pid),
        ppid: Number(ppid),
        start,
      },
    ];
  });
}

function cwdsOf(pids) {
  if (pids.length === 0) return new Map();
  const result = run('lsof', ['-a', '-d', 'cwd', '-Fpn', '-p', pids.join(',')]);
  // lsof exits 1 with nothing on stderr when a process ps listed has exited.
  if (result.status !== 0 && result.stderr.trim()) {
    throw new Error(`lsof failed: ${result.stderr.trim()}`);
  }
  const cwds = new Map();
  let pid;
  for (const line of result.stdout.split('\n')) {
    if (line.startsWith('p')) pid = Number(line.slice(1));
    if (line.startsWith('n')) cwds.set(pid, real(line.slice(1)));
  }
  return cwds;
}

const cloneCheckouts = (checkout) =>
  git(checkout, ['worktree', 'list', '--porcelain'])
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => real(line.slice('worktree '.length)));

function ownSessionLeader(listed) {
  const byPid = new Map(listed.map((each) => [each.pid, each]));
  let each = byPid.get(process.pid);
  while (each && !SESSION.test(each.command)) each = byPid.get(each.ppid);
  return each?.pid;
}

function survey(checkout) {
  const clone = cloneCheckouts(checkout);
  const listed = processes();
  const serverLeaders = listed.filter(
    (each) => each.pid === each.pgid && SERVER.test(each.command)
  );
  const serverGroups = new Set(serverLeaders.map((each) => each.pgid));
  const agents = listed.filter(
    (each) => !serverGroups.has(each.pgid) && AGENT.test(each.command)
  );
  const sessionLeaders = listed.filter((each) => SESSION.test(each.command));
  const cwds = cwdsOf([
    ...new Set(
      [...serverLeaders, ...agents, ...sessionLeaders].map((each) => each.pid)
    ),
  ]);
  const servers = serverLeaders
    .filter((leader) => cwds.has(leader.pid))
    .map((leader) => ({
      checkout: cwds.get(leader.pid),
      pgid: leader.pgid,
      port: PORT.exec(leader.command)?.[1] ?? '?',
      start: leader.start,
    }))
    .filter((server) => clone.some((dir) => within(server.checkout, dir)));
  const places = [...clone, ...servers.map((server) => server.checkout)];
  const innermostPlaceOf = (dir) =>
    places
      .filter((place) => within(dir, place))
      .reduce(
        (deepest, place) => (place.length > deepest.length ? place : deepest),
        ''
      );
  const sessions = new Set(
    agents
      .filter((agent) => cwds.has(agent.pid))
      .map((agent) => innermostPlaceOf(cwds.get(agent.pid)))
  );
  const own = ownSessionLeader(listed);
  const shared = sessionLeaders.some(
    (leader) => leader.pid !== own && cwds.get(leader.pid) === checkout
  );
  return { servers, sessions, shared };
}

const landingsOf = (file, session) =>
  session && existsSync(file)
    ? readFileSync(file, 'utf-8')
        .split('\n')
        .flatMap((line) => {
          try {
            const landing = line ? JSON.parse(line) : undefined;
            return landing?.session === session && landing.exit === 0
              ? [{ start: Date.parse(landing.start), subject: landing.subject }]
              : [];
          } catch {
            return [];
          }
        })
        .sort((a, b) => a.start - b.start)
    : [];

const RULES = [
  {
    events: ['Stop'],
    stop: (server, { checkout, landings }) => {
      const landing =
        server.checkout === checkout
          ? landings.find(
              (each) => each.start >= server.start + LANDED_AFTER_MS
            )
          : undefined;
      return (
        landing && `this session landed "${landing.subject}" after it started`
      );
    },
  },
  {
    events: ['SessionStart', 'Stop'],
    stop: (server, { sessions, sessionsSeeSelf }) =>
      sessionsSeeSelf && !sessions.has(server.checkout)
        ? 'no session works in its checkout'
        : undefined,
  },
];

function judge(server, facts) {
  for (const rule of RULES) {
    const reason = rule.events.includes(facts.event)
      ? rule.stop(server, facts)
      : undefined;
    if (reason) return { ...server, reason, verdict: 'stop' };
  }
  return {
    ...server,
    reason: facts.sessions.has(server.checkout)
      ? 'a session works in its checkout'
      : 'no session shows in this checkout either, so the session list may miss some',
    verdict: 'keep',
  };
}

function judgeServers({ event, idle }) {
  const [root, common] = git(process.cwd(), [
    'rev-parse',
    '--path-format=absolute',
    '--show-toplevel',
    '--git-common-dir',
  ])
    .trim()
    .split('\n');
  const checkout = real(root);
  const session =
    process.env.CLAUDE_CODE_HOST_SESSION_ID ||
    process.env.CLAUDE_CODE_SESSION_ID ||
    process.env.CODEX_SESSION_ID;
  const { servers, sessions, shared } = survey(checkout);
  const landings = landingsOf(
    path.join(common, 'pstack-land-runs.jsonl'),
    session
  );
  const doneDriving =
    idle &&
    !shared &&
    landings.length > 0 &&
    git(checkout, ['status', '--porcelain']) === '';
  const facts = {
    checkout,
    event,
    landings: doneDriving ? landings : [],
    sessions,
    sessionsSeeSelf: sessions.has(checkout),
  };
  return servers.map((server) => judge(server, facts));
}

const groupAlive = (pgid) => {
  try {
    process.kill(-pgid, 0);
    return true;
  } catch (error) {
    // macOS answers EPERM for a group whose exited processes wait to be reaped.
    if (error.code === 'ESRCH' || error.code === 'EPERM') return false;
    throw error;
  }
};

const signalGroup = (pgid, signal) => {
  try {
    process.kill(-pgid, signal);
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
};

async function stopGroup(pgid) {
  signalGroup(pgid, 'SIGTERM');
  for (
    let waited = 0;
    waited < TERM_GRACE_MS && groupAlive(pgid);
    waited += POLL_MS
  ) {
    await sleep(POLL_MS);
  }
  if (groupAlive(pgid)) signalGroup(pgid, 'SIGKILL');
}

async function hook() {
  const payload = JSON.parse(readFileSync(0, 'utf-8'));
  if (!RULES.some((rule) => rule.events.includes(payload.hook_event_name))) {
    return;
  }
  const stopping = judgeServers({
    event: payload.hook_event_name,
    idle: !payload.background_tasks?.length && !payload.session_crons?.length,
  }).filter((server) => server.verdict === 'stop');
  await Promise.all(
    stopping.map(async (server) => {
      try {
        await stopGroup(server.pgid);
        console.log(
          `dev-servers: stopped the preview server on port ${server.port} in ${server.checkout}: ${server.reason}. preview_start starts it again.`
        );
      } catch (error) {
        console.error(
          `dev-servers: could not stop the preview server on port ${server.port} in ${server.checkout}: ${error.message}`
        );
      }
    })
  );
}

function list() {
  const servers = judgeServers({ event: 'Stop', idle: true });
  if (servers.length === 0) console.log('no preview servers in this clone');
  for (const server of servers) {
    console.log(
      `${server.verdict.padEnd(4)} port ${server.port}  pgid ${server.pgid}  started ${new Date(server.start).toLocaleString('sv-SE')}  ${server.checkout}  (${server.reason})`
    );
  }
}

async function main() {
  const [command] = process.argv.slice(2);
  if (command === '--hook') {
    try {
      await hook();
    } catch (error) {
      console.error(`dev-servers hook skipped: ${error.message}`);
    }
    return;
  }
  if (command === 'list') {
    list();
    return;
  }
  throw new Error('usage: dev-servers.mjs list | --hook');
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
