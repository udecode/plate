import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { describe, test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('triage.mjs', import.meta.url));
const NODE = process.execPath;
const SESSION = '11111111-2222-4333-8444-555555555555';
const THREAD = '019a0000-0000-7000-8000-000000000001';
const CHILD = '019a0000-0000-7000-8000-000000000002';
const OPUS = 'claude-opus-5-5';
const SOL = 'gpt-6.1-sol';
const FLOOR = ['claude-opus-5 @xhigh', 'gpt-6.1-sol @xhigh'];
const KIND =
  'scope: editing; priority: P0; owner: packages/a/src/owner.ts:3; cause: read';
const HEADER =
  'id\tts\tissue\toutcome\tdetail\tread\tseen\trev\tby\twho\tprev\twhy\n';
const LEDGER_HEADER = 'ts\tphase\tdecision\twhy\tevidence\tresult\n';
const later = () => new Date(Date.now() + 60_000).toISOString();
const lines = (records) => `${records.join('\n')}\n`;

const GH = `#!/usr/bin/env node
const { appendFileSync, readFileSync, writeFileSync } = require('node:fs');
const fixture = JSON.parse(readFileSync(process.env.GH_FIXTURE, 'utf8'));
const args = process.argv.slice(2);
const login = fixture.login ?? 'zbeyens';
const people = (logins) => (logins ?? []).map((each) => ({ login: each }));
if (fixture.fail) { console.error('gh: network down'); process.exit(1); }
if (args[0] === 'issue' && args[1] === 'view') {
  const issue = fixture.issues[args[2]];
  if (!issue) { console.error('gh: no issue ' + args[2]); process.exit(1); }
  console.log(JSON.stringify(issue));
} else if (args[0] === 'issue' && args[1] === 'list') {
  const label = args.includes('--label') ? args[args.indexOf('--label') + 1] : null;
  const open = Object.values(fixture.issues).filter((issue) => issue.state === 'OPEN' && (!label || issue.labels.some((each) => each.name === label)));
  console.log(JSON.stringify(open.map((issue) => ({ ...issue, assignees: people(issue.assignees) }))));
} else if (args[0] === 'issue' && args[1] === 'edit') {
  appendFileSync(process.env.GH_EDITS, args.join(' ') + '\\n');
  const issue = fixture.issues[args[2]];
  const added = args.includes('--add-assignee') ? args[args.indexOf('--add-assignee') + 1] : null;
  if (issue && added && fixture.assignable !== false) {
    issue.assignees = [...(issue.assignees ?? []), added === '@me' ? login : added];
    writeFileSync(process.env.GH_FIXTURE, JSON.stringify(fixture));
  }
} else if (args[0] === 'api' && args[1] === 'user') {
  if (fixture.login === null) { console.error('gh: not logged in'); process.exit(1); }
  console.log(login);
} else if (args[0] === 'api' && args[1] === 'graphql') {
  const query = args[args.indexOf('-f') + 1].slice('query='.length);
  const fields = query.includes('issueFieldValues');
  const signals = query.includes('closedByPullRequestsReferences');
  const repository = {};
  for (const [, alias, number] of query.matchAll(/(i\\d+): issue\\(number: (\\d+)\\)/g)) {
    const issue = fixture.issues[number];
    repository[alias] = !issue ? null : signals
      ? {
          assignees: { nodes: people(issue.assignees) },
          timelineItems: { nodes: Object.entries(issue.assignedAt ?? {}).map(([each, createdAt]) => ({ createdAt, assignee: { login: each } })) },
          referenced: { nodes: (issue.refs ?? []).map((pr) => ({ source: { state: 'OPEN', ...pr } })) },
          closedByPullRequestsReferences: { nodes: (issue.prs ?? []).map((pr) => ({ state: 'OPEN', ...pr })) },
          comments: { pageInfo: { hasPreviousPage: Boolean(issue.moreComments) }, nodes: issue.comments.map((each, at) => ({ databaseId: 900 + at, author: { login: each.author.login, __typename: each.bot ? 'Bot' : 'User' }, createdAt: each.createdAt ?? '2026-01-01T00:00:00Z', body: each.body })) },
        }
      : fields
      ? { id: 'I_' + number, issueFieldValues: { nodes: [{}, ...(issue.priority ? [{ optionId: 'OPT_' + issue.priority, field: { id: 'FIELD_PRIORITY' } }] : []), ...(issue.scopes ? [{ options: issue.scopes.map((each) => ({ id: 'OPT_' + each })), field: { id: 'FIELD_SCOPE' } }] : [])] } }
      : { timelineItems: { nodes: issue.reopened ? [{ id: issue.reopened }] : [] } };
  }
  const options = (names) => names.map((name) => ({ id: 'OPT_' + name, name }));
  const organization = { issueFields: { nodes: fixture.issueFields ?? [{}, { __typename: 'IssueFieldSingleSelect', id: 'FIELD_PRIORITY', name: 'Priority', options: options(['P0', 'P1', 'P2', 'P3']) }, { __typename: 'IssueFieldMultiSelect', id: 'FIELD_SCOPE', name: 'Scope', options: options(['editing', 'paste']) }] } };
  console.log(JSON.stringify({ data: fields ? { organization, repository } : { repository } }));
} else { console.error('gh stub: ' + args.join(' ')); process.exit(1); }
`;
// Orphans the fake runtime so no real agent process is its ancestor.
const LAUNCHER = `import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
const [out, err, cwd, ...command] = process.argv.slice(2);
spawn(command[0], command.slice(1), { cwd, detached: true, env: { ...process.env, TRIAGE_LAUNCHER: String(process.pid) }, stdio: ['ignore', openSync(out, 'w'), openSync(err, 'w')] }).unref();
`;
// A CI runner's subreaper, not pid 1, may adopt the orphan, so the runtime waits only for the launcher to let go.
const RUNTIME = `import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const [status, ...command] = process.argv.slice(2);
while (status !== '-' && process.ppid === Number(process.env.TRIAGE_LAUNCHER)) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
const result = spawnSync(command[0], command.slice(1), { stdio: 'inherit' });
if (status === '-') process.exit(result.status ?? 1);
writeFileSync(status, String(result.status ?? 1));
`;
// The apps sit in their own folder because macOS folds case.
const BINARIES = {
  claude: 'claude',
  codex: 'codex',
  disclaimer: 'disclaimer',
  Claude: 'app/Claude',
  ChatGPT: 'app/ChatGPT',
};

const gitEnv = (home) => ({
  ...Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !/^(CLAUDE|CODEX)/u.test(key))
  ),
  HOME: home,
  GIT_AUTHOR_NAME: 'Test',
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'Test',
  GIT_COMMITTER_EMAIL: 'test@example.com',
});

function git(box, cwd, ...args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf-8',
    env: gitEnv(box.home),
  });
  assert.equal(
    result.status,
    0,
    `git ${args.join(' ')} in ${cwd}: ${result.stderr}`
  );
  return result.stdout.trim();
}

const config = (policy) =>
  `${JSON.stringify({ branch: 'next', maxEffort: 'xhigh', ...(policy === null ? {} : { triage: policy }) }, null, 2)}\n`;
const POLICY = {
  repo: 'udecode/plate',
  floor: FLOOR,
  owners: ['zbeyens'],
  rev: 1,
};

const issue = (number, extra = {}) => ({
  number,
  title: `Issue ${number}`,
  body: `Steps for ${number}: type, then press Enter.`,
  state: 'OPEN',
  comments: [],
  labels: [],
  ...extra,
});
const comment = (login, association, body) => ({
  author: { login },
  authorAssociation: association,
  body,
});

const scopeFile = (owners) => `${JSON.stringify({ owners, members: [] })}\n`;

function sandbox({ ledger = '' } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'triage-'));
  const box = {
    dir,
    home: join(dir, 'home'),
    bin: join(dir, 'bin'),
    codexHome: join(dir, 'codex'),
    fixture: join(dir, 'gh.json'),
    edits: join(dir, 'gh-edits.log'),
    origin: join(dir, 'origin.git'),
    work: join(dir, 'work'),
    runs: 0,
  };
  mkdirSync(join(box.bin, 'app'), { recursive: true });
  mkdirSync(join(box.home, '.claude', 'projects', 'p'), { recursive: true });
  mkdirSync(join(box.codexHome, 'sessions', '2026', '10', '25'), {
    recursive: true,
  });
  writeFileSync(join(box.bin, 'gh'), GH);
  chmodSync(join(box.bin, 'gh'), 0o755);
  writeFileSync(join(box.bin, 'launcher.mjs'), LAUNCHER);
  writeFileSync(join(box.bin, 'runtime.mjs'), RUNTIME);
  for (const path of Object.values(BINARIES)) {
    symlinkSync(NODE, join(box.bin, path));
  }
  setIssues(box, [issue(5250), issue(5251)]);

  git(box, dir, 'init', '--quiet', '--bare', '-b', 'next', box.origin);
  git(box, dir, 'init', '--quiet', '-b', 'next', box.work);
  const files = {
    '.agents/pstack.json': config(POLICY),
    '.gitattributes': 'docs/triage/issues.tsv merge=union\n',
    'docs/triage/issues.tsv': HEADER,
    'docs/law.md': '# Law\n\nEnter splits a list item.\n',
    'docs/research/review-scopes/editing.json': scopeFile(['packages/a/']),
    'docs/research/review-scopes/paste.json': scopeFile(['packages/a/']),
    'docs/research/review-scopes/tables.json': scopeFile(['packages/b/']),
    'packages/a/src/owner.ts':
      'export const a = 1;\nexport const b = 2;\nexport const c = 3;\n',
  };
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(box.work, path)), { recursive: true });
    writeFileSync(join(box.work, path), text);
  }
  git(box, box.work, 'add', '-A');
  git(box, box.work, 'commit', '--quiet', '-m', 'base');
  git(box, box.work, 'remote', 'add', 'origin', box.origin);
  git(box, box.work, 'push', '--quiet', '-u', 'origin', 'next');
  if (ledger !== null) setLedger(box, ledger);
  return box;
}

function setIssues(box, issues, extra = {}) {
  writeFileSync(
    box.fixture,
    JSON.stringify({
      issues: Object.fromEntries(
        issues.map((each) => [String(each.number), each])
      ),
      ...extra,
    })
  );
}

function setRef(box, ref, file, text) {
  const blob = spawnSync('git', ['hash-object', '-w', '--stdin'], {
    cwd: box.work,
    input: text,
    encoding: 'utf-8',
    env: gitEnv(box.home),
  }).stdout.trim();
  const tree = spawnSync('git', ['mktree'], {
    cwd: box.work,
    input: `100644 blob ${blob}\t${file}\n`,
    encoding: 'utf-8',
    env: gitEnv(box.home),
  }).stdout.trim();
  const commit = git(box, box.work, 'commit-tree', tree, '-m', file);
  git(
    box,
    box.work,
    'push',
    '--quiet',
    '--force',
    'origin',
    `${commit}:${ref}`
  );
}

const setLedger = (box, rows) =>
  setRef(
    box,
    'refs/pstack/ledger',
    'suggested-tasks.decisions.tsv',
    `${LEDGER_HEADER}${rows}`
  );

function land(box, path, text) {
  const other = join(box.dir, `other-${(box.runs += 1)}`);
  git(box, box.dir, 'clone', '--quiet', '-b', 'next', box.origin, other);
  mkdirSync(dirname(join(other, path)), { recursive: true });
  writeFileSync(join(other, path), text);
  git(box, other, 'add', '-A');
  git(box, other, 'commit', '--quiet', '-m', `change ${path}`);
  git(box, other, 'push', '--quiet', 'origin', 'next');
}

async function triage(
  box,
  args,
  { runtime = 'claude', chain = [runtime], cwd = box.work, env = {} } = {}
) {
  box.runs += 1;
  const out = join(box.dir, `run-${box.runs}.out`);
  const err = join(box.dir, `run-${box.runs}.err`);
  const status = join(box.dir, `run-${box.runs}.status`);
  const runtimeEnv =
    runtime === 'claude'
      ? { CLAUDE_CODE_SESSION_ID: SESSION }
      : {
          CODEX_THREAD_ID: THREAD,
          CODEX_SESSION_ID: THREAD,
          CODEX_TOOL_CALL_ID: 'exec-0f0f0f0f-0000-4000-8000-000000000000',
          CODEX_HOME: box.codexHome,
        };
  const command = chain.flatMap((name, at) => [
    join(box.bin, BINARIES[name]),
    join(box.bin, 'runtime.mjs'),
    at === 0 ? status : '-',
  ]);
  const launched = spawnSync(
    NODE,
    [
      join(box.bin, 'launcher.mjs'),
      out,
      err,
      cwd,
      ...command,
      NODE,
      script,
      ...args,
    ],
    {
      encoding: 'utf-8',
      env: {
        ...gitEnv(box.home),
        PATH: `${box.bin}:${process.env.PATH}`,
        GH_FIXTURE: box.fixture,
        GH_EDITS: box.edits,
        ...runtimeEnv,
        ...env,
      },
    }
  );
  assert.equal(launched.status, 0, launched.stderr);
  const deadline = Date.now() + 60_000;
  while (!existsSync(status) && Date.now() < deadline) {
    await delay(25);
  }
  assert.ok(
    existsSync(status),
    `triage ${args.join(' ')} finished within a minute`
  );
  return {
    status: Number(readFileSync(status, 'utf-8')),
    stdout: readFileSync(out, 'utf-8'),
    stderr: readFileSync(err, 'utf-8'),
  };
}

const seenOf = (output, number) => {
  const block = output.slice(output.indexOf(`#${number} `));
  const match = /seen: ([0-9a-f]{16})/u.exec(block);
  assert.ok(match, `show printed a seen for #${number}:\n${output}`);
  return match[1];
};

const assistant = (effort, blocks, model = OPUS) =>
  JSON.stringify({
    type: 'assistant',
    effort,
    timestamp: new Date().toISOString(),
    message: { model, content: blocks },
  });
const said = (effort, text) => assistant(effort, [{ type: 'text', text }]);
const toolUse = (id, command) => ({
  type: 'tool_use',
  id,
  name: 'Bash',
  input: { command },
});
const toolResult = (id, text) =>
  JSON.stringify({
    type: 'user',
    message: {
      content: [{ type: 'tool_result', tool_use_id: id, content: text }],
    },
  });
const transcriptPath = (box, id = SESSION) =>
  join(box.home, '.claude', 'projects', 'p', `${id}.jsonl`);

function claudeSession(
  box,
  shown,
  {
    effort = 'xhigh',
    before = [],
    file = transcriptPath(box),
    outputs = [shown],
  } = {}
) {
  mkdirSync(dirname(file), { recursive: true });
  const calls = outputs.flatMap((text, at) => [
    assistant(effort, [toolUse(`t${at}`, 'pnpm triage show')]),
    toolResult(`t${at}`, text),
  ]);
  writeFileSync(
    file,
    lines([
      ...before,
      ...calls,
      assistant(effort, [toolUse('tr', 'pnpm triage record')]),
    ])
  );
}

function codexSession(
  box,
  shown,
  { effort = 'xhigh', thread = THREAD, parent = null } = {}
) {
  const records = [
    {
      type: 'session_meta',
      payload: {
        id: thread,
        session_id: THREAD,
        ...(parent ? { parent_thread_id: parent } : {}),
      },
    },
    {
      type: 'turn_context',
      timestamp: new Date().toISOString(),
      payload: { model: SOL, effort, turn_id: 'turn-1' },
    },
    // Codex 0.163's exec tool returns a command's result to the model as JSON text.
    {
      type: 'response_item',
      payload: {
        type: 'custom_tool_call_output',
        call_id: 'call-1',
        output: [
          {
            type: 'input_text',
            text: 'Script completed\nWall time 3.1 seconds\nOutput:\n',
          },
          {
            type: 'input_text',
            text: JSON.stringify({
              chunk_id: '417f49',
              exit_code: 0,
              output: shown,
            }),
          },
        ],
      },
    },
  ];
  writeFileSync(
    join(
      box.codexHome,
      'sessions',
      '2026',
      '10',
      '25',
      `rollout-2026-10-25T10-00-00-${thread}.jsonl`
    ),
    lines(records.map((record) => JSON.stringify(record)))
  );
}

// A compaction as Claude Code writes it, and the copy of its opening that a relaunch or a fork puts atop a new transcript.
const boundary = JSON.stringify({
  type: 'system',
  subtype: 'compact_boundary',
  uuid: 'boundary-1',
  logicalParentUuid: 'tail-1',
  compactMetadata: { trigger: 'auto' },
});
const dated = JSON.stringify({
  type: 'attachment',
  uuid: 'date-1',
  attachment: { type: 'date' },
});
const compactSummary = JSON.stringify({
  type: 'user',
  isCompactSummary: true,
  uuid: 'summary-1',
  parentUuid: 'date-1',
  message: { content: 'This session is being continued' },
});
const copiedOpening = [
  boundary,
  dated,
  compactSummary,
  said('xhigh', 'carried on'),
];
const compactedAfter = (effort) => [
  said(effort, 'judged it'),
  JSON.stringify({ type: 'user', uuid: 'tail-1', message: { content: 'ok' } }),
  ...copiedOpening,
];

const recordArgs = (number, seen, outcome = 'kind', detail = KIND) => [
  'record',
  String(number),
  '--outcome',
  outcome,
  '--detail',
  detail,
  '--seen',
  seen,
  '--why',
  'read the steps and the owner',
];

async function recordIn(box, records, session = {}) {
  const shown = await stdoutOf(box, [
    'show',
    ...records.map(([number]) => String(number)),
  ]);
  claudeSession(box, shown, session);
  const results = [];
  for (const [number, outcome, detail] of records) {
    results.push(
      await triage(
        box,
        recordArgs(number, seenOf(shown, number), outcome, detail)
      )
    );
  }
  return { shown, results };
}

const statusOf = async (...args) => {
  const { status } = await triage(...args);
  return status;
};

const stdoutOf = async (...args) => {
  const { stdout } = await triage(...args);
  return stdout;
};

const firstResult = async (...args) => {
  const { results } = await recordIn(...args);
  return results[0];
};

const recordStatus = async (...args) => {
  const { status } = await firstResult(...args);
  return status;
};

const recordAll = async (box, records) => {
  const { results } = await recordIn(box, records);
  assert.deepEqual(
    results.map((result) => result.status),
    records.map(() => 0)
  );
};

const registerRows = (box, cwd = box.work) =>
  readFileSync(join(cwd, 'docs/triage/issues.tsv'), 'utf-8')
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((line) => line.split('\t'));

const stateLine = async (box, number, options) => {
  const { stdout } = await triage(
    box,
    ['show', String(number), '--brief'],
    options
  );
  return stdout.split('\n').find((line) => line.startsWith(`#${number} `));
};

function cloneOf(box, name) {
  const path = join(box.dir, `clone-${name}`);
  git(box, box.dir, 'clone', '--quiet', '-b', 'next', box.origin, path);
  return path;
}

const claimRows = (box) => {
  const shown = spawnSync(
    'git',
    ['--git-dir', box.origin, 'show', 'refs/triage/claims:claims.tsv'],
    { encoding: 'utf-8' }
  );
  return shown.status === 0
    ? shown.stdout
        .split('\n')
        .slice(1)
        .filter(Boolean)
        .map((line) => line.split('\t'))
    : [];
};

// Runs another clone's claim once this clone has fetched the claims tip, so that claim lands between this one's fetch
// and its push. A pre-push hook runs too late: git's own check of the advertised tip then rejects even a forced push.
function claimAfterFetch(box, clone, other, args, { first = ':' } = {}) {
  setClaims(box, []);
  const result = join(box.dir, `after-fetch-${basename(other)}`);
  const hook = join(clone, '.git', 'hooks', 'reference-transaction');
  writeFileSync(
    hook,
    [
      '#!/bin/sh',
      '[ "$1" = committed ] || exit 0',
      'grep -q refs/triage/claims || exit 0',
      `[ -e '${result}.status' ] && exit 0`,
      'unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE',
      first,
      `cd '${other}' && '${NODE}' '${script}' ${args.map((arg) => `'${arg}'`).join(' ')} > '${result}.out' 2>&1`,
      `echo $? > '${result}.status'`,
      'exit 0',
      '',
    ].join('\n')
  );
  chmodSync(hook, 0o755);
  return () => ({
    status: existsSync(`${result}.status`)
      ? Number(readFileSync(`${result}.status`, 'utf-8'))
      : null,
    output: existsSync(`${result}.out`)
      ? readFileSync(`${result}.out`, 'utf-8')
      : '',
  });
}

const ago = (hours) => new Date(Date.now() - hours * 3_600_000).toISOString();
const CLAIMS_HEADER =
  'ts\tissue\tmove\twho\tsession\ttranscript\ttask\tdrives\tover\twhy\n';
const held = ({
  ts = ago(1),
  issue: number = 5250,
  move = 'claim',
  who = 'zbeyens',
  session = 'A',
  task = '-',
  over = '-',
} = {}) =>
  [ts, String(number), move, who, session, '-', task, '-', over, 'seeded'].join(
    '\t'
  );
const setClaims = (box, rows) =>
  setRef(
    box,
    'refs/triage/claims',
    'claims.tsv',
    `${CLAIMS_HEADER}${rows.map((row) => `${row}\n`).join('')}`
  );

const recordsText = (records) =>
  `${HEADER}${records
    .map(
      ([number, outcome, detail, ts = '2026-10-20T10:00:00.000Z']) =>
        `${[`${number}-${ts}-aaaaaa`, ts, String(number), outcome, detail, 'a'.repeat(40), 'b'.repeat(16), '1', `${OPUS} @xhigh`, 'zbeyens', 'none', 'triaged'].join('\t')}\n`
    )
    .join('')}`;
// Register rows written straight into the checkout, which a claim reads beside next's.
const setRecords = (box, records) =>
  writeFileSync(join(box.work, 'docs/triage/issues.tsv'), recordsText(records));
const kind = (scope = 'editing', extra = '') =>
  `scope: ${scope}; priority: P0; owner: packages/a/src/owner.ts:3; cause: read${extra}`;

const chip = (id, result, why, evidence, ts = '2026-10-24T10:00:00Z') =>
  `${ts}\tchip\t${id} Fix Enter in lists\t${why}\t${evidence}\t${result}\n`;
const offer = (id, repro, why = 'Enter splits wrong') =>
  chip(
    id,
    'offered',
    why,
    `writes: packages/a; topic: lists; kind: fix; priority: P0; repro: ${repro} holds the steps`
  );
const startedIn = (id, session, ts = '2026-10-24T11:00:00Z') =>
  chip(id, 'started', 'started it', `session: ${session}`, ts);

const claim = (box, args, options) => triage(box, ['claim', ...args], options);
const claimed = (box) => claimRows(box).map((row) => [row[1], row[2]]);
const edits = (box) =>
  existsSync(box.edits)
    ? readFileSync(box.edits, 'utf-8').split('\n').filter(Boolean)
    : [];

// Each test builds its own sandbox, so they run side by side.
describe('triage', { concurrency: 8 }, () => {
  test('show prints an untriaged issue with its text and the fingerprint to record against', async () => {
    const box = sandbox();
    const { status, stdout } = await triage(box, ['show', '5250']);
    assert.equal(status, 0);
    assert.match(stdout, /^#5250 untriaged$/mu);
    assert.match(stdout, /^5250:4 Steps for 5250: type, then press Enter\.$/mu);
    assert.match(stdout, /^seen: [0-9a-f]{16}$/mu);
    const json = JSON.parse(await stdoutOf(box, ['show', '5250', '--json']));
    assert.equal(json.issues[0].state, 'untriaged');
    assert.doesNotMatch(JSON.stringify(json), /seen|Steps for/u);
  });

  test('a Claude root session at xhigh records a kind row and the issue reads current', async () => {
    const box = sandbox();
    const { results } = await recordIn(box, [[5250]]);
    assert.equal(results[0].status, 0, results[0].stderr);
    const [row] = registerRows(box);
    assert.match(row[0], /^5250-\d{4}-\d{2}-\d{2}T[\d:.]+Z-[0-9a-f]{6}$/u);
    assert.equal(row[8], 'claude-opus-5-5 @xhigh');
    assert.equal(row[10], 'none');
    assert.equal(row[7], '1');
    assert.equal(await stateLine(box, 5250), '#5250 current');
    assert.equal(await statusOf(box, ['check']), 0);
  });

  test('dry run prints the row and writes nothing', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    claudeSession(box, shown);
    const result = await triage(box, [
      ...recordArgs(5250, seenOf(shown, 5250)),
      '--dry-run',
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stdout,
      /dry run, nothing written: 1 row\(s\) would be recorded by zbeyens on claude-opus-5-5 @xhigh/u
    );
    assert.deepEqual(registerRows(box), []);
  });

  for (const [name, effort, named] of [
    [
      'refuses a session below the floor and names the floor',
      'high',
      'claude-opus-5 @xhigh or gpt-6.1-sol @xhigh',
    ],
    ['refuses a session above maxEffort', 'max', 'at most xhigh'],
  ]) {
    test(name, async () => {
      const box = sandbox();
      const { results } = await recordIn(box, [[5250]], { effort });
      assert.equal(results[0].status, 1);
      assert.match(
        results[0].stderr,
        new RegExp(
          `\\(${SESSION}\\) have turns at claude-opus-5-5 @${effort}`,
          'u'
        )
      );
      assert.ok(results[0].stderr.includes(named), results[0].stderr);
      assert.deepEqual(registerRows(box), []);
    });
  }

  test('a dry run in a session that may not record still checks its rows', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    claudeSession(box, shown, { effort: 'max' });
    const seen = seenOf(shown, 5250);
    const bad = await triage(box, [
      ...recordArgs(5250, seen, 'kind', 'scope: editing'),
      '--dry-run',
    ]);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /#5250: a kind detail needs priority:/u);
    const good = await triage(box, [...recordArgs(5250, seen), '--dry-run']);
    assert.equal(good.status, 1);
    assert.match(
      good.stderr,
      /1 row\(s\) pass the checks that need no session, but this session's transcripts .* have turns at claude-opus-5-5 @max/u
    );
    assert.deepEqual(registerRows(box), []);
  });

  test('reads the whole transcript, past the tail lead.mjs reads', async () => {
    const box = sandbox();
    const padding = Array.from({ length: 700 }, () =>
      said('xhigh', 'x'.repeat(1000))
    );
    const { results } = await recordIn(box, [[5250]], {
      before: [said('high', 'judged it'), ...padding],
    });
    assert.equal(results[0].status, 1);
    assert.match(results[0].stderr, /turns at claude-opus-5-5 @high/u);
  });

  test('a continued transcript reads the file where its compaction happened, never a copy of its opening', async () => {
    for (const [effort, expected] of [
      ['high', 1],
      ['xhigh', 0],
    ]) {
      const box = sandbox();
      const predecessor = transcriptPath(
        box,
        '99999999-2222-4333-8444-555555555555'
      );
      writeFileSync(predecessor, lines(compactedAfter(effort)));
      // A sibling relaunch copied the same opening and holds the same records, but none of the turns before the compaction.
      writeFileSync(
        transcriptPath(box, '88888888-2222-4333-8444-555555555555'),
        lines([...copiedOpening, said('xhigh', 'sibling')])
      );
      const { results } = await recordIn(box, [[5250]], {
        before: copiedOpening,
      });
      assert.equal(
        results[0].status,
        expected,
        `${effort}: ${results[0].stderr}`
      );
      if (expected === 1) {
        assert.match(
          results[0].stderr,
          new RegExp(
            `\\(${SESSION}, ${basename(predecessor, '.jsonl')}\\) have turns at claude-opus-5-5 @high`,
            'u'
          )
        );
      }
    }
  });

  test('a continued transcript reads the file it continues only up to the compaction, never another branch after it', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    writeFileSync(
      transcriptPath(box, '99999999-2222-4333-8444-555555555555'),
      lines([
        ...compactedAfter('xhigh'),
        assistant('xhigh', [toolUse('s1', 'pnpm triage show')]),
        toolResult('s1', shown),
        said('high', 'another branch'),
      ])
    );
    claudeSession(box, shown, { before: copiedOpening, outputs: [] });
    const result = await triage(box, recordArgs(5250, seenOf(shown, 5250)));
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /line\(s\) of the issue's text never came back to this session/u
    );
  });

  test('refuses a continued transcript whose predecessor is gone or not one file', async () => {
    const gone = sandbox();
    writeFileSync(
      transcriptPath(gone, '88888888-2222-4333-8444-555555555555'),
      lines([...copiedOpening, said('xhigh', 'sibling')])
    );
    const missing = await firstResult(gone, [[5250]], {
      before: copiedOpening,
    });
    assert.equal(missing.status, 1);
    assert.match(
      missing.stderr,
      /continues the transcript where compaction boundary-1 happened, and no transcript in .+ holds the turns before it/u
    );

    const doubled = sandbox();
    for (const id of [
      '99999999-2222-4333-8444-555555555555',
      '77777777-2222-4333-8444-555555555555',
    ]) {
      writeFileSync(
        transcriptPath(doubled, id),
        lines(compactedAfter('xhigh'))
      );
    }
    const ambiguous = await firstResult(doubled, [[5250]], {
      before: copiedOpening,
    });
    assert.equal(ambiguous.status, 1);
    assert.match(
      ambiguous.stderr,
      /and 2 transcripts \(.+\) in .+ hold the turns before it/u
    );
  });

  test('refuses a subagent transcript', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    writeFileSync(transcriptPath(box), lines([said('xhigh', 'delegating')]));
    claudeSession(box, shown, {
      file: join(
        box.home,
        '.claude',
        'projects',
        'p',
        SESSION,
        'subagents',
        'agent-1.jsonl'
      ),
    });
    const result = await triage(box, recordArgs(5250, seenOf(shown, 5250)));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /subagent's transcript/u);
  });

  test('refuses a session another agent session started', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    claudeSession(box, shown);
    const result = await triage(box, recordArgs(5250, seenOf(shown, 5250)), {
      chain: ['codex', 'claude'],
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /runs under another codex process/u);
  });

  test('accepts a session the desktop app started, which runs under Claude and disclaimer, and one under ChatGPT', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    claudeSession(box, shown);
    const desktop = await triage(
      box,
      [...recordArgs(5250, seenOf(shown, 5250)), '--dry-run'],
      { chain: ['Claude', 'disclaimer', 'claude'] }
    );
    assert.equal(desktop.status, 0, desktop.stderr);
    codexSession(box, shown);
    const codex = await triage(
      box,
      [...recordArgs(5250, seenOf(shown, 5250)), '--dry-run'],
      { runtime: 'codex', chain: ['ChatGPT', 'codex'] }
    );
    assert.equal(codex.status, 0, codex.stderr);
  });

  test('refuses when the session cannot be identified', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    claudeSession(box, shown);
    const result = await triage(box, recordArgs(5250, seenOf(shown, 5250)), {
      env: { CLAUDE_CODE_SESSION_ID: '' },
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /model and effort could not be read/u);
  });

  test('refuses a session whose tool results never held the issue text, even with its seen', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    const seen = seenOf(shown, 5250);
    for (const outputs of [
      ['ran something else'],
      [`seen: ${seen}`],
      [`5250\tkind\t${KIND}\t${seen}\tread it`],
    ]) {
      claudeSession(box, shown, { outputs });
      const result = await triage(box, recordArgs(5250, seen));
      assert.equal(result.status, 1, outputs[0]);
      assert.match(
        result.stderr,
        /line\(s\) of the issue's text never came back to this session/u
      );
    }
  });

  test('accepts an issue text read back in pieces from a saved output, long lines included', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250, {
        body: `Steps:\n1. paste ${'x'.repeat(2500)}\n2. press Enter`,
      }),
      issue(5251),
    ]);
    const shown = await stdoutOf(box, ['show', '5250']);
    const numbered = shown
      .split('\n')
      .map((line, at) =>
        `${String(at + 1).padStart(6)}\t${line}`.slice(0, 2000)
      );
    const half = Math.floor(numbered.length / 2);
    claudeSession(box, shown, {
      outputs: [
        `Output too large. Preview (first 2KB):\n${shown.slice(0, 200)}`,
        numbered.slice(0, half).join('\n'),
        numbered.slice(half).join('\n'),
      ],
    });
    const result = await triage(box, [
      ...recordArgs(5250, seenOf(shown, 5250)),
      '--dry-run',
    ]);
    assert.equal(result.status, 0, result.stderr);
  });

  test('refuses lines read in another order than the issue now holds them', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250, { body: 'Expected:\nA\nActual:\nB' }),
      issue(5251),
    ]);
    const before = await stdoutOf(box, ['show', '5250']);
    setIssues(box, [
      issue(5250, { body: 'Expected:\nB\nActual:\nA' }),
      issue(5251),
    ]);
    const seen = seenOf(await stdoutOf(box, ['show', '5250']), 5250);
    claudeSession(box, before, { outputs: [before, `seen: ${seen}`] });
    const result = await triage(box, recordArgs(5250, seen));
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /line\(s\) of the issue's text never came back to this session/u
    );
  });

  test('records an issue whose long line wraps inside an emoji', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250, { body: `${'a'.repeat(399)}😀 then press Enter` }),
      issue(5251),
    ]);
    const result = await firstResult(box, [[5250]]);
    assert.equal(result.status, 0, result.stderr);
  });

  test('a newline where a long line wraps makes the record stale', async () => {
    const box = sandbox();
    const long = 'x'.repeat(400);
    setIssues(box, [issue(5250, { body: `${long}y` }), issue(5251)]);
    assert.equal(await recordStatus(box, [[5250]]), 0);
    setIssues(box, [issue(5250, { body: `${long}\ny` }), issue(5251)]);
    assert.equal(await stateLine(box, 5250), '#5250 stale (issue-changed)');
  });

  test('refuses a fingerprint the issue no longer matches', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    claudeSession(box, shown);
    setIssues(box, [
      issue(5250, {
        comments: [comment('reporter', 'NONE', 'Also fails on Safari.')],
      }),
      issue(5251),
    ]);
    const result = await triage(box, recordArgs(5250, seenOf(shown, 5250)));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /the issue changed since it was read/u);
  });

  test('a failed fetch refuses record, and show reads the refs fetched last as unchecked', async () => {
    const box = sandbox();
    const { shown, results } = await recordIn(box, [[5250]]);
    assert.equal(results[0].status, 0, results[0].stderr);
    git(
      box,
      box.work,
      'remote',
      'set-url',
      'origin',
      join(box.dir, 'missing.git')
    );
    const result = await triage(box, recordArgs(5251, seenOf(shown, 5250)));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /origin\/next could not be read/u);
    const { stdout } = await triage(box, ['show', '5250', '--brief']);
    assert.match(stdout, /note: could not fetch origin\/next/u);
    assert.match(
      stdout,
      /^#5250 unchecked \(origin\/next and refs\/pstack\/ledger as fetched last say current\)$/mu
    );
  });

  test('refuses when next has no triage floor', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    claudeSession(box, shown);
    land(box, '.agents/pstack.json', config(null));
    const result = await triage(box, recordArgs(5250, seenOf(shown, 5250)));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /has no triage key/u);
  });

  test('refuses an owner path that does not exist', async () => {
    const box = sandbox();
    const { results } = await recordIn(box, [
      [
        5250,
        'kind',
        'scope: editing; priority: P0; owner: packages/a/src/missing.ts; cause: read',
      ],
    ]);
    assert.equal(results[0].status, 1);
    assert.match(
      results[0].stderr,
      /packages\/a\/src\/missing\.ts does not exist/u
    );
  });

  test('refuses a kind record whose scope has no review-scope file', async () => {
    const box = sandbox();
    const { results } = await recordIn(box, [[5250, 'kind', kind('docs')]]);
    assert.equal(results[0].status, 1);
    assert.match(
      results[0].stderr,
      /scope: docs has no docs\/research\/review-scopes\/docs\.json/u
    );
  });

  test('warns when a kind record names a scope that lists none of its owner files', async () => {
    const box = sandbox();
    const { results } = await recordIn(box, [
      [5250, 'kind', kind('tables')],
      [5251, 'kind', kind('editing')],
    ]);
    assert.deepEqual(
      results.map((result) => result.status),
      [0, 0]
    );
    assert.match(
      results[0].stderr,
      /the tables scope lists none of packages\/a\/src\/owner\.ts/u
    );
    assert.doesNotMatch(results[1].stderr, /scope lists none/u);
  });

  test('refuses a fixed record whose commit is not on next', async () => {
    const box = sandbox();
    writeFileSync(
      join(box.work, 'packages/a/src/owner.ts'),
      'export const a = 4;\n'
    );
    git(box, box.work, 'commit', '--quiet', '-am', 'a local fix');
    const commit = git(box, box.work, 'rev-parse', 'HEAD');
    const result = await firstResult(box, [
      [
        5250,
        'fixed',
        `commit: ${commit}; owner: packages/a/src/owner.ts; proof: the owner test`,
      ],
    ]);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      new RegExp(`commit ${commit} is not on origin/next`, 'u')
    );
  });

  test('refuses retest: none on a fixed record whose kind, or the kind its dup leads to, needs a device', async () => {
    const box = sandbox();
    const commit = git(box, box.work, 'rev-parse', 'HEAD');
    const fixed = (retest) =>
      `commit: ${commit}; owner: packages/a/src/owner.ts; proof: the owner test; retest: ${retest}`;
    const { results } = await recordIn(box, [
      [5250, 'kind', kind('editing', '; device: ios')],
      [5251, 'dup', 'of: 5250'],
      [5250, 'fixed', fixed('none')],
      [5250, 'fixed', fixed('an iPhone with Safari')],
      [5251, 'fixed', fixed('none')],
      [5250, 'kind', kind('editing')],
      [5250, 'fixed', fixed('none')],
    ]);
    assert.deepEqual(
      results.map(({ status, stderr }) => [
        status,
        /its kind needs ios/u.test(stderr),
      ]),
      [
        [0, false],
        [0, false],
        [1, true],
        [0, false],
        [1, true],
        [0, false],
        [0, false],
      ]
    );
  });

  test('refuses a duplicate of an issue that is not open', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250, { state: 'CLOSED' }), issue(5251)]);
    const result = await firstResult(box, [[5251, 'dup', 'of: 5250']]);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /#5250 is closed, so a duplicate of it reads stale at once/u
    );
  });

  test('check refuses a malformed register row', async () => {
    const box = sandbox();
    assert.equal(await statusOf(box, ['check']), 0);
    writeFileSync(
      join(box.work, 'bad.tsv'),
      `${HEADER}5250-x\t2026-10-25T10:00:00.000Z\t5250\tkind\tscope: editing\tabc\tseen\t1\topus\tzbeyens\tnone\twhy\n(\t(\t(\tdup\tof: 5250\tabc\tseen\t1\topus\tzbeyens\tnone\twhy\n`
    );
    const result = await triage(box, ['check', 'bad.tsv']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /bad\.tsv:2: id is <issue>-<ts>-<6 hex>/u);
    assert.match(result.stderr, /a kind detail needs owner:/u);
    assert.match(result.stderr, /read "abc" is malformed/u);
    assert.match(result.stderr, /bad\.tsv:3: issue "\(" is malformed/u);
    writeFileSync(
      join(box.work, '.agents/pstack.json'),
      config({ ...POLICY, owners: [] })
    );
    const ownerless = await triage(box, ['check']);
    assert.equal(ownerless.status, 1);
    assert.match(
      ownerless.stderr,
      /triage\.owners lists at least one GitHub login/u
    );
  });

  test('check accepts a prev that names a row below it, as a merge orders them', async () => {
    const box = sandbox();
    const row = (id, ts, prev) =>
      [
        id,
        ts,
        '5250',
        'needs-repro',
        'missing: the steps',
        'a'.repeat(40),
        'b'.repeat(16),
        '1',
        'claude-opus-5-5 @xhigh',
        'zbeyens',
        prev,
        'asked for the steps',
      ].join('\t');
    const first = '5250-2026-10-25T10:00:00.000Z-aaaaaa';
    writeFileSync(
      join(box.work, 'merged.tsv'),
      `${HEADER}${row('5250-2026-10-25T10:00:01.000Z-bbbbbb', '2026-10-25T10:00:01.000Z', first)}\n${row(first, '2026-10-25T10:00:00.000Z', 'none')}\n`
    );
    const result = await triage(box, ['check', 'merged.tsv']);
    assert.equal(result.status, 0, result.stderr);
  });

  test('a Codex root session at xhigh records, and a child thread is refused', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250']);
    codexSession(box, shown);
    const root = await triage(
      box,
      [...recordArgs(5250, seenOf(shown, 5250)), '--dry-run'],
      { runtime: 'codex' }
    );
    assert.equal(root.status, 0, root.stderr);
    assert.match(root.stdout, /recorded by zbeyens on gpt-6\.1-sol @xhigh/u);
    codexSession(box, shown, { thread: CHILD, parent: THREAD });
    const child = await triage(box, recordArgs(5250, seenOf(shown, 5250)), {
      runtime: 'codex',
      env: { CODEX_THREAD_ID: CHILD },
    });
    assert.equal(child.status, 1);
    assert.match(child.stderr, /is a child of session/u);
  });

  test('a commit to an owner path makes the record stale', async () => {
    const box = sandbox();
    assert.equal(await recordStatus(box, [[5250]]), 0);
    land(box, 'packages/a/src/owner.ts', 'export const a = 10;\n');
    assert.equal(await stateLine(box, 5250), '#5250 stale (owner-moved)');
  });

  test('a commit to the owner path of a fixed record leaves it current', async () => {
    const box = sandbox();
    const commit = git(box, box.work, 'rev-parse', 'HEAD');
    assert.equal(
      await recordStatus(box, [
        [
          5250,
          'fixed',
          `commit: ${commit}; owner: packages/a/src/owner.ts; proof: the owner test`,
        ],
      ]),
      0
    );
    land(box, 'packages/a/src/owner.ts', 'export const a = 10;\n');
    assert.equal(await stateLine(box, 5250), '#5250 current');
  });

  test('new comments from anyone make the record stale, and an unchanged triage draft from the team does not', async () => {
    const box = sandbox();
    assert.equal(await recordStatus(box, [[5250]]), 0);
    const draftFile = join(box.dir, 'draft.md');
    writeFileSync(
      draftFile,
      'Closing as a duplicate of #5251, which has the same steps.\n'
    );
    const { status, stdout: draft } = await triage(box, ['mark', draftFile]);
    assert.equal(status, 0);
    assert.match(draft, /<!-- triage:[0-9a-f]{12} -->$/mu);
    setIssues(box, [
      issue(5250, {
        comments: [
          comment('zbeyens', 'OWNER', draft.trim()),
          comment('dosubot', 'NONE', 'Similar issues'),
        ],
      }),
      issue(5251),
    ]);
    assert.equal(await stateLine(box, 5250), '#5250 current');
    const edited = draft.replace(
      'same steps.',
      'same steps.\n\nRetested: still crashes after a paste.'
    );
    for (const comments of [
      [comment('tester', 'MEMBER', 'Repro 4: paste then Enter.')],
      [comment('reporter', 'NONE', 'Still fails.')],
      [comment('zbeyens', 'OWNER', edited)],
      [comment('reporter', 'NONE', draft.trim())],
    ]) {
      setIssues(box, [issue(5250, { comments }), issue(5251)]);
      assert.equal(
        await stateLine(box, 5250),
        '#5250 stale (issue-changed)',
        JSON.stringify(comments)
      );
    }
  });

  test('a reopen makes the record stale, a later close keeps it current, and another reopen makes it stale again', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250, { reopened: 'RE_1' }), issue(5251)]);
    assert.equal(await recordStatus(box, [[5250]]), 0);
    assert.equal(await stateLine(box, 5250), '#5250 current');
    setIssues(box, [
      issue(5250, { reopened: 'RE_1', state: 'CLOSED' }),
      issue(5251),
    ]);
    assert.equal(await stateLine(box, 5250), '#5250 current');
    setIssues(box, [issue(5250, { reopened: 'RE_2' }), issue(5251)]);
    assert.equal(await stateLine(box, 5250), '#5250 stale (issue-changed)');
  });

  test('a duplicate goes stale while its target is not current', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250', '5251']);
    claudeSession(box, shown);
    assert.equal(
      await statusOf(
        box,
        recordArgs(5251, seenOf(shown, 5251), 'dup', 'of: 5250')
      ),
      0
    );
    assert.equal(await stateLine(box, 5251), '#5251 stale (dup-target)');
    assert.equal(await statusOf(box, recordArgs(5250, seenOf(shown, 5250))), 0);
    assert.equal(await stateLine(box, 5251), '#5251 current');
    setIssues(box, [issue(5250, { state: 'CLOSED' }), issue(5251)]);
    assert.equal(await stateLine(box, 5251), '#5251 stale (dup-target)');
  });

  test('a linked task that ends without landing makes a kind record stale', async () => {
    const offered =
      '2026-10-24T10:00:00Z\tchip\tt_aaaa1111 Fix Enter in lists (xhigh)\tEnter splits wrong\twrites: packages/a; topic: lists; kind: fix; priority: P0; repro: plate#5250 holds the steps\toffered\n';
    const mentioned =
      '2026-10-24T10:00:00Z\tchip\tt_bbbb2222 Fix paste\tunlike plate#5250 this one pastes\twrites: packages/b; topic: paste; kind: fix; priority: P1; repro: #5251 holds the steps\toffered\n';
    const box = sandbox({ ledger: `${offered}${mentioned}` });
    assert.equal(await recordStatus(box, [[5250]]), 0);
    const { stdout } = await triage(box, ['show', '5250', '--brief']);
    assert.match(stdout, /^tasks: t_aaaa1111 offered$/mu);
    setLedger(
      box,
      `${offered}${mentioned}${later()}\tchip\tt_aaaa1111 Fix Enter in lists (xhigh)\tthe owner dropped it\tcard: none\tdismissed declined\n`
    );
    assert.equal(await stateLine(box, 5250), '#5250 stale (task-ended)');
  });

  test('a linked task replaced by an open one, or dismissed done, leaves a kind record current', async () => {
    const offered = (id) =>
      `2026-10-24T10:00:00Z\tchip\t${id} Fix Enter in lists\tEnter splits wrong\twrites: packages/a; topic: lists; kind: fix; priority: P0; repro: plate#5250 holds the steps\toffered\n`;
    const tasks = `${offered('t_aaaa1111')}${offered('t_cccc3333').replace('repro: plate#5250', 'repro: the same steps')}`;
    for (const result of ['dismissed replaced t_cccc3333', 'dismissed done']) {
      const box = sandbox({ ledger: tasks });
      assert.equal(await recordStatus(box, [[5250]]), 0);
      setLedger(
        box,
        `${tasks}${later()}\tchip\tt_aaaa1111 Fix Enter in lists\tits work moved\tcard: none\t${result}\n`
      );
      assert.equal(await stateLine(box, 5250), '#5250 current', result);
    }
  });

  test('raising triage.rev or the floor on next makes older records stale', async () => {
    for (const { policy, reason } of [
      { policy: { ...POLICY, rev: 2 }, reason: 'method-changed' },
      {
        policy: { ...POLICY, floor: ['claude-opus-6 @xhigh'] },
        reason: 'below-floor',
      },
    ]) {
      const box = sandbox();
      assert.equal(await recordStatus(box, [[5250]]), 0);
      land(box, '.agents/pstack.json', config(policy));
      assert.equal(await stateLine(box, 5250), `#5250 stale (${reason})`);
    }
  });

  test('record refuses when the suggested-task ledger cannot be read', async () => {
    const box = sandbox({ ledger: null });
    const result = await firstResult(box, [[5250]]);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /a record needs the suggested-task ledger from origin/u
    );
  });

  test('a kind record is unchecked when the ledger cannot be read', async () => {
    const box = sandbox();
    assert.equal(await recordStatus(box, [[5250]]), 0);
    git(box, box.work, 'push', '--quiet', 'origin', ':refs/pstack/ledger');
    git(box, box.work, 'update-ref', '-d', 'refs/pstack/triage-ledger');
    assert.equal(
      await stateLine(box, 5250),
      '#5250 unchecked (the suggested-task ledger could not be read)'
    );
  });

  test('a fork clone that lands through PRs reads the floor from upstream', async () => {
    const box = sandbox();
    const fork = join(box.dir, 'fork.git');
    git(box, box.dir, 'clone', '--quiet', '--bare', box.origin, fork);
    const clone = join(box.dir, 'fork-clone');
    git(box, box.dir, 'clone', '--quiet', '-b', 'next', fork, clone);
    writeFileSync(join(clone, '.agents/pstack.json'), config(null));
    git(box, clone, 'commit', '--quiet', '-am', 'fork drops the floor');
    git(box, clone, 'push', '--quiet', 'origin', 'next');
    git(box, clone, 'remote', 'add', 'upstream', box.origin);
    const shown = await stdoutOf(box, ['show', '5250'], { cwd: clone });
    claudeSession(box, shown);
    const result = await triage(
      box,
      [...recordArgs(5250, seenOf(shown, 5250)), '--dry-run'],
      { cwd: clone }
    );
    assert.equal(result.status, 0, result.stderr);
  });

  test('a clone that pushes reads origin even when it has an upstream remote', async () => {
    const box = sandbox();
    const elsewhere = join(box.dir, 'elsewhere.git');
    git(box, box.dir, 'clone', '--quiet', '--bare', box.origin, elsewhere);
    const writer = join(box.dir, 'elsewhere-writer');
    git(box, box.dir, 'clone', '--quiet', '-b', 'next', elsewhere, writer);
    writeFileSync(join(writer, '.agents/pstack.json'), config(null));
    git(box, writer, 'commit', '--quiet', '-am', 'no floor here');
    git(box, writer, 'push', '--quiet', 'origin', 'next');
    git(box, box.work, 'remote', 'add', 'upstream', elsewhere);
    git(box, box.work, 'config', 'pstack.delivery', 'push');
    const shown = await stdoutOf(box, ['show', '5250']);
    claudeSession(box, shown);
    const pushed = await triage(box, [
      ...recordArgs(5250, seenOf(shown, 5250)),
      '--dry-run',
    ]);
    assert.equal(pushed.status, 0, pushed.stderr);
    git(box, box.work, 'config', '--unset', 'pstack.delivery');
    const viaPr = await triage(box, [
      ...recordArgs(5250, seenOf(shown, 5250)),
      '--dry-run',
    ]);
    assert.equal(viaPr.status, 1);
    assert.match(viaPr.stderr, /upstream\/next/u);
  });

  test('records that land concurrently show a conflict until a later record replaces every head', async () => {
    const box = sandbox();
    const [a, b, c] = ['a', 'b', 'c'].map((name) => {
      const path = join(box.dir, `clone-${name}`);
      git(box, box.dir, 'clone', '--quiet', '-b', 'next', box.origin, path);
      return path;
    });
    const shown = await stdoutOf(box, ['show', '5250']);
    claudeSession(box, shown);
    const seen = seenOf(shown, 5250);
    const landFrom = (clone) => {
      git(box, clone, 'commit', '--quiet', '-am', 'triage 5250');
      git(box, clone, 'fetch', '--quiet', 'origin');
      git(box, clone, 'rebase', '--quiet', 'origin/next');
      git(box, clone, 'push', '--quiet', 'origin', 'HEAD:next');
    };
    // B records before A lands, A lands, C records after A and lands, and B lands last, so C and B are both heads.
    assert.equal(await statusOf(box, recordArgs(5250, seen), { cwd: b }), 0);
    assert.equal(await statusOf(box, recordArgs(5250, seen), { cwd: a }), 0);
    landFrom(a);
    assert.equal(await statusOf(box, recordArgs(5250, seen), { cwd: c }), 0);
    landFrom(c);
    landFrom(b);
    assert.match(
      await stateLine(box, 5250, { cwd: b }),
      /^#5250 conflict \(5250-.+; 5250-.+\)$/u
    );
    assert.equal(await statusOf(box, recordArgs(5250, seen), { cwd: b }), 0);
    const rows = registerRows(box, b);
    assert.equal(rows.length, 4);
    assert.equal(rows.at(-1)[10].split(',').length, 2);
    assert.equal(await stateLine(box, 5250, { cwd: b }), '#5250 current');
  });

  test('labels prints the gh commands that make the triaged and outcome labels and the issue type match a current record, and runs none', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250, {
        labels: [{ name: 'needs-triage' }, { name: 'needs reproduction' }],
        priority: 'P0',
        scopes: ['editing'],
      }),
      issue(5251, {
        labels: [{ name: 'triaged' }, { name: 'needs reproduction' }],
      }),
      issue(5252, { labels: [{ name: 'needs-triage' }] }),
      issue(5253),
      issue(5254, {
        labels: [{ name: 'triaged' }],
        issueType: { name: 'Bug' },
      }),
      issue(5255, {
        labels: [{ name: 'triaged' }],
        issueType: { name: 'Bug' },
        priority: 'P0',
        scopes: ['editing'],
      }),
    ]);
    await recordAll(box, [
      [5250],
      [5253, 'needs-repro', 'missing: the steps'],
      [5254, 'spec', 'question: should Tab indent a list item?'],
      [5255],
    ]);
    const { status, stdout } = await triage(box, ['labels']);
    assert.equal(status, 0);
    assert.deepEqual(stdout.trim().split('\n'), [
      'gh label create triaged --repo udecode/plate --color 0e8a16 --description "Has a current record in docs/triage/issues.tsv" --force',
      `gh label create 'needs retest' --repo udecode/plate --color fbca04 --description "A candidate fix landed on next; the reporter retests it on beta.platejs.org and closes it" --force`,
      "gh issue edit 5250 --repo udecode/plate --add-label triaged --remove-label 'needs reproduction' --type Bug",
      'gh issue edit 5251 --repo udecode/plate --remove-label triaged',
      "gh issue edit 5253 --repo udecode/plate --add-label triaged --add-label 'needs reproduction'",
      'gh issue edit 5254 --repo udecode/plate --type Feature',
    ]);
  });

  test('labels closes a fixed issue only when its proof replays the report, and labels every other fixed issue needs retest', async () => {
    const box = sandbox();
    const commit = git(box, box.work, 'rev-parse', 'HEAD');
    const fixed = (retest) =>
      `commit: ${commit}; owner: packages/a/src/owner.ts; proof: the owner test${retest}`;
    const waiting = [{ name: 'triaged' }, { name: 'needs retest' }];
    setIssues(box, [
      issue(5250, { labels: [{ name: 'triaged' }] }),
      issue(5251),
      issue(5252, { labels: waiting }),
      issue(5253, {
        labels: waiting,
        issueType: { name: 'Bug' },
        priority: 'P0',
        scopes: ['editing'],
      }),
    ]);
    await recordAll(box, [
      [5250, 'fixed', fixed('; retest: none')],
      [5251, 'fixed', fixed('')],
      [5252, 'fixed', fixed('; retest: Safari with a real input method')],
      [5253],
    ]);
    land(
      box,
      'docs/triage/issues.tsv',
      readFileSync(join(box.work, 'docs/triage/issues.tsv'), 'utf-8')
    );
    const { status, stdout } = await triage(box, ['labels']);
    assert.equal(status, 0);
    assert.deepEqual(stdout.trim().split('\n').slice(1), [
      `gh label create 'needs retest' --repo udecode/plate --color fbca04 --description "A candidate fix landed on next; the reporter retests it on beta.platejs.org and closes it" --force`,
      'gh issue close 5250 --repo udecode/plate --reason completed',
      "gh issue edit 5251 --repo udecode/plate --add-label triaged --add-label 'needs retest'",
      "gh issue edit 5253 --repo udecode/plate --remove-label 'needs retest'",
    ]);
  });

  test('labels prints no close for a fixed record that has not landed, that went stale, or whose kind now needs a device', async () => {
    const box = sandbox();
    const commit = git(box, box.work, 'rev-parse', 'HEAD');
    const none = `commit: ${commit}; owner: packages/a/src/owner.ts; proof: the owner test; retest: none`;
    const open = (body5250) => [
      issue(5250, body5250 ? { body: body5250 } : {}),
      issue(5251),
      issue(5252, { priority: 'P0', scopes: ['editing'] }),
      issue(5253),
    ];
    setIssues(box, open());
    await recordAll(box, [
      [5250, 'fixed', none],
      [5252],
      [5251, 'dup', 'of: 5252'],
      [5251, 'fixed', none],
    ]);
    land(
      box,
      'docs/triage/issues.tsv',
      readFileSync(join(box.work, 'docs/triage/issues.tsv'), 'utf-8')
    );
    await recordAll(box, [
      [5252, 'kind', kind('editing', '; device: ios')],
      [5253, 'fixed', none],
    ]);
    setIssues(box, open('Steps for 5250, edited after the fix.'));
    const { status, stdout } = await triage(box, ['labels']);
    assert.equal(status, 0);
    assert.deepEqual(
      stdout.split('\n').filter((line) => line.startsWith('gh issue close')),
      []
    );
  });

  test('labels sets the Priority and Scope fields from a current kind record only where they differ, and names a scope the field has no option for', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250),
      issue(5251, { priority: 'P3', scopes: ['editing'] }),
      issue(5252, { priority: 'P0', scopes: ['editing'] }),
      issue(5253, { priority: 'P3' }),
      issue(5254, { priority: 'P0', scopes: ['editing', 'paste'] }),
      issue(5255, { priority: 'P0', scopes: ['editing'] }),
      issue(5256, { priority: 'P3' }),
    ]);
    await recordAll(box, [
      [5250],
      [5251, 'kind', KIND.replace('P0', 'P2')],
      [5252],
      [5253, 'needs-repro', 'missing: the steps'],
      [5254],
      [5255, 'kind', kind('paste')],
      [5256, 'kind', kind('tables')],
    ]);
    const { status, stdout, stderr } = await triage(box, ['labels']);
    assert.equal(status, 0);
    assert.match(stderr, /the Scope field has no option for #5256 tables;/u);
    const set = (id, fields) =>
      `gh api graphql -f query='mutation { setIssueFieldValue(input: { clientMutationId: "${id}", issueId: "I_${id.slice(1, 5)}", issueFields: [${fields}] }) { clientMutationId } }'`;
    assert.deepEqual(
      stdout.split('\n').filter((line) => line.startsWith('gh api graphql')),
      [
        set(
          '#5250 P0 editing',
          '{ fieldId: "FIELD_PRIORITY", singleSelectOptionId: "OPT_P0" }, { fieldId: "FIELD_SCOPE", multiSelectOptionIds: ["OPT_editing"] }'
        ),
        set(
          '#5251 P2 editing',
          '{ fieldId: "FIELD_PRIORITY", singleSelectOptionId: "OPT_P2" }'
        ),
        set(
          '#5254 P0 editing',
          '{ fieldId: "FIELD_SCOPE", multiSelectOptionIds: ["OPT_editing"] }'
        ),
        set(
          '#5255 P0 paste',
          '{ fieldId: "FIELD_SCOPE", multiSelectOptionIds: ["OPT_paste"] }'
        ),
        set(
          '#5256 P0 tables',
          '{ fieldId: "FIELD_PRIORITY", singleSelectOptionId: "OPT_P0" }'
        ),
      ]
    );
  });

  test('labels refuses and prints no command when the organization has no Priority field', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250), issue(5251)], {
      issueFields: [{}, { id: 'FIELD_STATUS', name: 'Status', options: [] }],
    });
    await recordAll(box, [[5250]]);
    const { status, stdout, stderr } = await triage(box, ['labels']);
    assert.equal(status, 1);
    assert.equal(stdout, '');
    assert.match(stderr, /no single-select issue field named Priority/u);
  });

  test('queue counts every open issue by state and lists the ones that need triage', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250),
      issue(5251),
      issue(5252, { state: 'CLOSED' }),
    ]);
    assert.equal(await recordStatus(box, [[5250]]), 0);
    const { status, stdout } = await triage(box, ['queue']);
    assert.equal(status, 0);
    assert.match(
      stdout,
      /^2 open issues: 0 conflict, 0 stale, 0 unchecked, 1 untriaged, 0 unconfirmed, 1 current$/mu
    );
    assert.match(stdout, /^#5251\tuntriaged\t-\t-\t-\tIssue 5251$/mu);
    assert.doesNotMatch(stdout, /^#5250\t/mu);
  });

  test("a record by a login that is not an owner reads unconfirmed, leaves that login's queue and counts once an owner records again", async () => {
    const box = sandbox();
    const issues = [issue(5250), issue(5251)];
    setIssues(box, issues, { login: 'natamox' });
    assert.equal(await recordStatus(box, [[5250]]), 0);
    assert.equal(await stateLine(box, 5250), '#5250 unconfirmed (by natamox)');
    const theirs = await stdoutOf(box, ['queue']);
    assert.match(
      theirs,
      /^2 open issues: 0 conflict, 0 stale, 0 unchecked, 1 untriaged, 1 unconfirmed, 0 current$/mu
    );
    assert.doesNotMatch(theirs, /^#5250\t/mu);
    setIssues(box, issues);
    assert.match(
      await stdoutOf(box, ['queue']),
      /^#5250\tunconfirmed\tby natamox\t/mu
    );
    assert.equal(await recordStatus(box, [[5250]]), 0);
    assert.equal(await stateLine(box, 5250), '#5250 current');
    const [first, second] = registerRows(box);
    assert.equal(second[10], first[0]);
  });

  test('record refuses and writes nothing when gh cannot say which account runs the session', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250), issue(5251)], { login: null });
    const result = await firstResult(box, [[5250]]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /gh could not say which GitHub account/u);
    assert.deepEqual(registerRows(box), []);
  });

  test('show reads every issue unchecked when gh fails', async () => {
    const box = sandbox();
    assert.equal(await recordStatus(box, [[5250]]), 0);
    setIssues(box, [issue(5250)], { fail: true });
    assert.equal(
      await stateLine(box, 5250),
      '#5250 unchecked (gh could not read #5250)'
    );
  });

  test('show reads an issue with no record unchecked when gh cannot read it', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250)], { fail: true });
    assert.equal(
      await stateLine(box, 5251),
      '#5251 unchecked (gh could not read #5251)'
    );
  });

  test('a batch records all of its rows or none', async () => {
    const box = sandbox();
    const shown = await stdoutOf(box, ['show', '5250', '5251']);
    claudeSession(box, shown);
    const batch = join(box.dir, 'batch.tsv');
    writeFileSync(
      batch,
      `issue\toutcome\tdetail\tseen\twhy\n5250\tkind\t${KIND}\t${seenOf(shown, 5250)}\tread it\n5251\tdup\tof: 5250\t0000000000000000\tsame steps\n`
    );
    const refused = await triage(box, ['record', '--from', batch]);
    assert.equal(refused.status, 1);
    assert.deepEqual(registerRows(box), []);
    writeFileSync(
      batch,
      `issue\toutcome\tdetail\tseen\twhy\n5250\tkind\t${KIND}\t${seenOf(shown, 5250)}\tread it\n5251\tdup\tof: 5250\t${seenOf(shown, 5251)}\tsame steps\n`
    );
    assert.equal(await statusOf(box, ['record', '--from', batch]), 0);
    assert.equal(registerRows(box).length, 2);
  });

  test('record appends after a register that ends without a newline', async () => {
    const box = sandbox();
    writeFileSync(join(box.work, 'docs/triage/issues.tsv'), HEADER.trimEnd());
    assert.equal(await recordStatus(box, [[5250]]), 0);
    assert.equal(registerRows(box).length, 1);
    assert.equal(await statusOf(box, ['check']), 0);
  });
});

describe('triage claim', { concurrency: 8 }, () => {
  test('two sessions that claim one issue at once leave exactly one holder and one claim row', async () => {
    const box = sandbox();
    const [a, b] = [cloneOf(box, 'a'), cloneOf(box, 'b')];
    const during = claimAfterFetch(box, a, b, [
      'claim',
      '5250',
      '--session',
      'B',
    ]);
    const first = await triage(box, ['claim', '5250', '--session', 'A'], {
      cwd: a,
    });
    assert.deepEqual(
      {
        a: first.status,
        b: during().status,
        holders: claimRows(box).map((row) => row[4]),
      },
      { a: 1, b: 0, holders: ['B'] },
      `${first.stdout}${first.stderr}${during().output}`
    );
  });

  test('a claim whose push another claim beat decides again on the new tip and lands', async () => {
    const box = sandbox();
    const [a, b] = [cloneOf(box, 'a'), cloneOf(box, 'b')];
    claimAfterFetch(box, a, b, ['claim', '5251', '--session', 'B']);
    const result = await claim(box, ['5250', '--session', 'A'], { cwd: a });
    assert.deepEqual(
      {
        status: result.status,
        rows: claimRows(box).map((row) => [row[1], row[4]]),
      },
      {
        status: 0,
        rows: [
          ['5251', 'B'],
          ['5250', 'A'],
        ],
      },
      result.stderr
    );
  });

  test('a rerun by the session that holds the claim writes nothing', async () => {
    const box = sandbox();
    await claim(box, ['5250', '--session', 'A']);
    const again = await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(
      { status: again.status, rows: claimRows(box).length },
      { status: 0, rows: 1 },
      again.stdout
    );
  });

  for (const { name, key, arrange } of [
    {
      name: "another session's live claim",
      key: 'claim:zbeyens/A',
      arrange: (box) => setClaims(box, [held()]),
    },
    {
      name: 'another login assigned on GitHub',
      key: 'assignee:natamox',
      arrange: (box) =>
        setIssues(box, [issue(5250, { assignees: ['natamox'] })]),
    },
    {
      name: 'an open PR that closes it',
      key: 'pr:77',
      arrange: (box) =>
        setIssues(box, [
          issue(5250, {
            prs: [
              {
                number: 77,
                author: { login: 'zbeyens' },
                createdAt: ago(2),
                updatedAt: ago(1),
              },
            ],
          }),
        ]),
    },
    {
      name: 'an open PR into another branch whose body says it fixes it',
      key: 'pr:5316',
      arrange: (box) =>
        setIssues(box, [
          issue(5250, {
            refs: [
              {
                number: 5316,
                author: { login: 'dylans' },
                title: 'fix lists',
                body: 'Fixes #5250',
                createdAt: ago(2),
                updatedAt: ago(1),
              },
            ],
          }),
        ]),
    },
    {
      name: 'a started task whose started row names no session',
      key: 'task:t_aaaa1111',
      arrange: (box) =>
        setLedger(
          box,
          `${offer('t_aaaa1111', 'plate#5250')}${chip('t_aaaa1111', 'started', 'started it', 'writes: packages/a', '2026-10-24T11:00:00Z')}`
        ),
    },
    {
      name: "another login's recent comment that claims it",
      key: 'comment:900',
      arrange: (box) =>
        setIssues(box, [
          issue(5250, {
            comments: [
              {
                ...comment('natamox', 'NONE', "I'll take this one tonight."),
                createdAt: ago(5),
              },
            ],
          }),
        ]),
    },
    {
      name: 'a started task no claim row names',
      key: 'task:t_aaaa1111',
      arrange: (box) =>
        setLedger(
          box,
          `${offer('t_aaaa1111', 'plate#5250')}${startedIn('t_aaaa1111', 'local_old')}`
        ),
    },
  ]) {
    test(`${name} holds the issue and the claim writes nothing`, async () => {
      const box = sandbox();
      arrange(box);
      const result = await claim(box, ['5250', '--session', 'B']);
      assert.deepEqual(
        {
          status: result.status,
          key: new RegExp(`^ {2}${key}[ ,]`, 'mu').test(result.stdout),
          rows: claimRows(box).filter((row) => row[4] === 'B').length,
        },
        { status: 1, key: true, rows: 0 },
        result.stdout + result.stderr
      );
    });
  }

  test('an open PR that only mentions the issue leaves it free', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250, {
        refs: [
          {
            number: 5316,
            author: { login: 'dylans' },
            title: 'fix lists',
            body: 'Unlike #5250, this one pastes',
            createdAt: ago(2),
            updatedAt: ago(1),
          },
        ],
      }),
    ]);
    const result = await claim(box, ['5250', '--session', 'B']);
    assert.equal(result.status, 0, result.stdout);
  });

  test('a claim refuses when one read returns fewer of the last 30 days of comments than there are', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250, {
        moreComments: true,
        comments: [
          { ...comment('natamox', 'NONE', 'Same here.'), createdAt: ago(1) },
        ],
      }),
    ]);
    const result = await claim(box, ['5250', '--session', 'B']);
    assert.deepEqual(
      {
        status: result.status,
        rows: claimRows(box).length,
        said: /more comments than one read returns/u.test(result.stderr),
      },
      { status: 1, rows: 0, said: true },
      result.stdout + result.stderr
    );
  });

  test('a claim without --session names the desktop session first', async () => {
    const box = sandbox();
    const result = await claim(box, ['5250'], {
      env: { CLAUDE_CODE_HOST_SESSION_ID: 'local_host' },
    });
    assert.match(
      result.stdout,
      /^actor: zbeyens, session local_host\b/mu,
      result.stdout
    );
  });

  test('a push the remote refuses for another reason stops at once', async () => {
    const box = sandbox();
    writeFileSync(
      join(box.origin, 'hooks', 'pre-receive'),
      '#!/bin/sh\nexit 1\n'
    );
    chmodSync(join(box.origin, 'hooks', 'pre-receive'), 0o755);
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.match(
      result.stderr,
      /could not push refs\/triage\/claims/u,
      result.stderr
    );
  });

  test('a retry after another claim beat the push reads GitHub again', async () => {
    const box = sandbox();
    const [a, b] = [cloneOf(box, 'a'), cloneOf(box, 'b')];
    const assigned = join(box.dir, 'assigned.json');
    writeFileSync(
      assigned,
      JSON.stringify({
        issues: {
          5250: issue(5250, { assignees: ['natamox'] }),
          5251: issue(5251),
        },
      })
    );
    claimAfterFetch(box, a, b, ['claim', '5251', '--session', 'B'], {
      first: `cp '${assigned}' '${box.fixture}'`,
    });
    const result = await claim(box, ['5250', '--session', 'A'], { cwd: a });
    assert.deepEqual(
      {
        status: result.status,
        rows: claimRows(box).map((row) => [row[1], row[4]]),
      },
      { status: 1, rows: [['5251', 'B']] },
      result.stdout + result.stderr
    );
  });

  test('a comment that claims nothing, a claim comment older than 30 days and a bot comment leave the issue free', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250, {
        comments: [
          {
            ...comment('natamox', 'NONE', 'Same here on Safari, thanks.'),
            createdAt: ago(2),
          },
          {
            ...comment('sin', 'NONE', "I'll take this."),
            createdAt: ago(31 * 24),
          },
          {
            ...comment('helper', 'NONE', "I'll work on it."),
            createdAt: ago(1),
            bot: true,
          },
        ],
      }),
    ]);
    const result = await claim(box, ['5250', '--session', 'B']);
    assert.equal(result.status, 0, result.stdout);
  });

  test('a merged PR that closed the issue before it reopened leaves it free', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250, {
        prs: [
          {
            number: 77,
            state: 'MERGED',
            author: { login: 'sin' },
            createdAt: ago(48),
            updatedAt: ago(47),
          },
        ],
      }),
    ]);
    const result = await claim(box, ['5250', '--session', 'B']);
    assert.equal(result.status, 0, result.stdout);
  });

  test('a branch and an offered task that name the issue only print notes', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250), issue(5251)]);
    setLedger(
      box,
      offer('t_bbbb2222', '#5251', 'unlike plate#5250 this one pastes')
    );
    git(box, box.work, 'push', '--quiet', 'origin', 'next:fix-5250-enter');
    const result = await claim(box, ['5250', '--session', 'B']);
    assert.deepEqual(
      {
        status: result.status,
        notes: result.stdout
          .split('\n')
          .filter((line) => line.startsWith('note:')),
      },
      {
        status: 0,
        notes: [
          'note: t_bbbb2222 (offered) names #5250 in its finding, not in repro:',
          'note: branch fix-5250-enter names #5250',
          'note: no task covers #5250, which has no record yet, so the claim offers none; run it again once the records are written',
        ],
      },
      result.stdout
    );
  });

  test("a hold newer than the session's own claim still holds the issue", async () => {
    const box = sandbox();
    setClaims(box, [held({ ts: ago(2) })]);
    setIssues(box, [
      issue(5250, {
        assignees: ['natamox'],
        assignedAt: { natamox: ago(1) },
      }),
    ]);
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(
      {
        status: result.status,
        held: result.stdout.includes('\n  assignee:natamox by natamox'),
      },
      { status: 1, held: true },
      result.stdout
    );
  });

  test('a commit on the owner file of a quiet claim keeps it from reading stale', async () => {
    const box = sandbox();
    git(box, box.work, 'checkout', '--quiet', '-b', 'side');
    writeFileSync(
      join(box.work, 'packages/a/src/owner.ts'),
      'export const a = 9;\n'
    );
    git(box, box.work, 'commit', '--quiet', '-am', 'work on the owner');
    git(box, box.work, 'checkout', '--quiet', 'next');
    setRecords(box, [[5250, 'kind', kind()]]);
    setClaims(box, [held({ ts: ago(49) })]);
    const result = await claim(box, ['5250', '--session', 'B']);
    assert.deepEqual(
      {
        status: result.status,
        stale: /^ {2}claim:zbeyens\/A .*, stale$/mu.test(result.stdout),
      },
      { status: 1, stale: false },
      result.stdout
    );
  });

  test('a hold quiet for 48 hours prints stale and still holds', async () => {
    const box = sandbox();
    setClaims(box, [held({ ts: ago(49) })]);
    const result = await claim(box, ['5250', '--session', 'B']);
    assert.deepEqual(
      {
        status: result.status,
        stale: /^ {2}claim:zbeyens\/A .*, stale$/mu.test(result.stdout),
      },
      { status: 1, stale: true },
      result.stdout
    );
  });

  const TAKE = [
    '--take',
    'assignee:natamox',
    '--why',
    'take it, natamox moved to mobile',
  ];

  test('an owner takes over exactly the holds it names', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250, { assignees: ['natamox'] })]);
    const result = await claim(box, ['5250', '--session', 'B', ...TAKE]);
    assert.deepEqual(
      {
        status: result.status,
        rows: claimRows(box).map((row) => [row[1], row[2], row[8]]),
      },
      { status: 0, rows: [['5250', 'take', 'assignee:natamox']] },
      result.stdout + result.stderr
    );
  });

  test('a take leaves the unassign to the owner and prints its command', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250, { assignees: ['natamox'] })]);
    const result = await claim(box, ['5250', '--session', 'B', ...TAKE]);
    assert.deepEqual(
      {
        printed: result.stdout.includes(
          'gh issue edit 5250 --repo udecode/plate --remove-assignee natamox'
        ),
        removed: edits(box).filter((line) =>
          line.includes('--remove-assignee')
        ),
      },
      { printed: true, removed: [] },
      result.stdout
    );
  });

  test("a login that is not a triage owner cannot take another login's hold", async () => {
    const box = sandbox();
    setIssues(box, [issue(5250, { assignees: ['natamox'] })], { login: 'sin' });
    const result = await claim(box, ['5250', '--session', 'B', ...TAKE]);
    assert.deepEqual(
      {
        status: result.status,
        rows: claimRows(box).length,
        said: /only zbeyens takes over another login's hold \(assignee:natamox\)/u.test(
          result.stderr
        ),
      },
      { status: 1, rows: 0, said: true },
      result.stderr
    );
  });

  test('any login takes over a hold of its own login from another session', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250)], { login: 'natamox' });
    setClaims(box, [held({ who: 'natamox' })]);
    const result = await claim(box, [
      '5250',
      '--session',
      'B',
      '--take',
      'claim:natamox/A',
      '--why',
      'my old session died',
    ]);
    assert.deepEqual(
      { status: result.status, last: claimRows(box).at(-1)[2] },
      { status: 0, last: 'take' },
      result.stdout + result.stderr
    );
  });

  test('a hold the take does not name still holds', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250, {
        assignees: ['natamox'],
        prs: [
          {
            number: 77,
            author: { login: 'sin' },
            createdAt: ago(2),
            updatedAt: ago(1),
          },
        ],
      }),
    ]);
    const result = await claim(box, ['5250', '--session', 'B', ...TAKE]);
    assert.deepEqual(
      {
        status: result.status,
        rows: claimRows(box).length,
        held: result.stdout.includes('\n  pr:77 by sin'),
      },
      { status: 1, rows: 0, held: true },
      result.stdout
    );
  });

  test("a take names again each hold that another session's take covered", async () => {
    const box = sandbox();
    setIssues(box, [issue(5250, { assignees: ['natamox'] })]);
    setClaims(box, [held({ move: 'take', over: 'assignee:natamox' })]);
    const result = await claim(box, [
      '5250',
      '--session',
      'B',
      '--take',
      'claim:zbeyens/A',
      '--why',
      'my old session died',
    ]);
    assert.deepEqual(
      {
        status: result.status,
        rows: claimRows(box).length,
        held: result.stdout.includes('\n  assignee:natamox '),
      },
      { status: 1, rows: 1, held: true },
      result.stdout + result.stderr
    );
  });

  test('the holder releases its claim and another session then claims the issue', async () => {
    const box = sandbox();
    setClaims(box, [held()]);
    const released = await triage(box, [
      'release',
      '5250',
      '--session',
      'A',
      '--why',
      'stopped: no repro',
    ]);
    const next = await claim(box, ['5250', '--session', 'B']);
    assert.deepEqual(
      { released: released.status, claimed: next.status },
      { released: 0, claimed: 0 },
      released.stderr + next.stdout
    );
  });

  test("a triage owner releases another login's claim", async () => {
    const box = sandbox();
    setClaims(box, [held({ who: 'natamox', session: 'X' })]);
    const result = await triage(box, [
      'release',
      '5250',
      '--session',
      'B',
      '--why',
      'natamox moved on',
    ]);
    assert.deepEqual(
      { status: result.status, last: claimRows(box).at(-1)[2] },
      { status: 0, last: 'release' },
      result.stderr
    );
  });

  test('a login that neither holds the claim nor owns triage cannot release it', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250)], { login: 'sin' });
    setClaims(box, [held({ who: 'natamox', session: 'X' })]);
    const result = await triage(box, [
      'release',
      '5250',
      '--session',
      'B',
      '--why',
      'mine now',
    ]);
    assert.deepEqual(
      { status: result.status, rows: claimRows(box).length },
      { status: 1, rows: 1 },
      result.stderr
    );
  });

  const FIXED =
    'commit: abc1234; owner: packages/a/src/owner.ts; proof: the owner test';
  const claimLineOf = async (box) => {
    const shown = await stdoutOf(box, ['show', '5250', '--brief']);
    return shown.split('\n').find((line) => line.startsWith('claim: '));
  };
  for (const { name, ends, arrange } of [
    {
      name: 'the issue closes',
      ends: true,
      arrange: (box) => setIssues(box, [issue(5250, { state: 'CLOSED' })]),
    },
    {
      name: 'its record reads fixed on next after the claim',
      ends: true,
      arrange: (box) =>
        land(
          box,
          'docs/triage/issues.tsv',
          recordsText([[5250, 'fixed', FIXED, ago(0.5)]])
        ),
    },
    {
      name: 'a fixed record newer than the claim waits unlanded in this checkout',
      ends: false,
      arrange: (box) => setRecords(box, [[5250, 'fixed', FIXED, ago(0.5)]]),
    },
    {
      name: 'its task lands after the claim',
      ends: true,
      arrange: (box) =>
        setLedger(
          box,
          `${offer('t_aaaa1111', 'plate#5250')}${startedIn('t_aaaa1111', 'A', ago(1))}${chip('t_aaaa1111', 'landed', 'fixed', 'commit: abc1234', ago(0.5))}`
        ),
    },
    {
      name: "its task is dismissed after the claim's own session started it",
      ends: true,
      arrange: (box) =>
        setLedger(
          box,
          `${offer('t_aaaa1111', 'plate#5250')}${startedIn('t_aaaa1111', 'A', ago(1))}${chip('t_aaaa1111', 'dismissed stopped', 'stopped', 'session: local_sweep', ago(0.5))}`
        ),
    },
    {
      name: 'its task is dismissed after another session started it',
      ends: false,
      arrange: (box) =>
        setLedger(
          box,
          `${offer('t_aaaa1111', 'plate#5250')}${startedIn('t_aaaa1111', 'local_card', ago(0.8))}${chip('t_aaaa1111', 'dismissed stopped', 'card session archived', 'session: local_sweep', ago(0.5))}`
        ),
    },
    {
      name: 'its record read fixed before the claim',
      ends: false,
      arrange: (box) => setRecords(box, [[5250, 'fixed', FIXED, ago(2)]]),
    },
  ]) {
    test(`a claim ${ends ? 'ends with no row once' : 'stays live when'} ${name}`, async () => {
      const box = sandbox();
      setClaims(box, [held({ task: 't_aaaa1111' })]);
      arrange(box);
      assert.match(
        await claimLineOf(box),
        ends ? /^claim: none$/u : /^claim: zbeyens session A since /u
      );
    });
  }

  test("a claim ends once the task that the holder's later claim row names lands", async () => {
    const box = sandbox();
    setClaims(box, [
      held({ ts: ago(2) }),
      held({ ts: ago(1.5), task: 't_aaaa1111' }),
    ]);
    setLedger(
      box,
      `${offer('t_aaaa1111', 'plate#5250')}${startedIn('t_aaaa1111', 'A', ago(1))}${chip('t_aaaa1111', 'landed', 'fixed', 'commit: abc1234', ago(0.5))}`
    );
    assert.equal(await claimLineOf(box), 'claim: none');
  });

  test('show prints the live claim and the open tasks whose findings name the issue, and tasks: stays with repro:', async () => {
    const box = sandbox();
    const since = ago(1);
    setClaims(box, [held({ ts: since })]);
    setLedger(
      box,
      offer('t_bbbb2222', '#5251', 'unlike plate#5250 this one pastes')
    );
    const shown = await stdoutOf(box, ['show', '5250', '--brief']);
    assert.deepEqual(
      shown
        .split('\n')
        .filter((line) => /^(?:tasks|claim|mentions): /u.test(line)),
      [
        'tasks: -',
        `claim: zbeyens session A since ${since}, last activity ${since}`,
        'mentions: t_bbbb2222 offered',
      ]
    );
  });

  const issues = (...numbers) => numbers.map((number) => issue(number));
  const claimedIssues = (box) =>
    claimed(box)
      .map(([number]) => number)
      .sort();

  test("a held member of the issue's group stops the issue target whole", async () => {
    const box = sandbox();
    setIssues(box, [issue(5250), issue(5251, { assignees: ['natamox'] })]);
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'dup', 'of: 5250'],
    ]);
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(
      { status: result.status, rows: claimRows(box).length },
      { status: 1, rows: 0 },
      result.stdout
    );
  });

  test('an issue target whose root is a device kind claims none of its group', async () => {
    const box = sandbox();
    setRecords(box, [
      [5250, 'kind', kind('editing', '; device: ios')],
      [5251, 'kind', kind()],
    ]);
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(
      { status: result.status, rows: claimRows(box).length },
      { status: 1, rows: 0 },
      result.stdout
    );
  });

  test('an issue target claims a split issue with its parts', async () => {
    const box = sandbox();
    setIssues(box, issues(5250, 5251, 5252));
    setRecords(box, [[5252, 'split', 'into: 5250, 5251']]);
    await claim(box, ['5252', '--session', 'A']);
    assert.deepEqual(claimedIssues(box), ['5250', '5251', '5252']);
  });

  const chain = (box, assigned) => {
    setIssues(box, [
      issue(5250),
      issue(5251),
      issue(5252, { assignees: [assigned] }),
    ]);
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'dup', 'of: 5250'],
      [5252, 'dup', 'of: 5251'],
    ]);
  };

  test('an issue target checks every dup down a chain of dups', async () => {
    const box = sandbox();
    chain(box, 'natamox');
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(
      { status: result.status, rows: claimRows(box).length },
      { status: 1, rows: 0 },
      result.stdout
    );
  });

  test('an issue at the end of a dup chain belongs to its own group', async () => {
    const box = sandbox();
    chain(box, 'natamox');
    const result = await claim(box, ['5252', '--session', 'A']);
    assert.deepEqual(
      { status: result.status, rows: claimRows(box).length },
      { status: 1, rows: 0 },
      result.stdout
    );
  });

  test('an issue target stops whole when an open task of its group names a held issue', async () => {
    const box = trunkSandbox(offer('t_aaaa1111', 'plate#5250 and plate#5251'));
    setIssues(box, [issue(5250), issue(5251, { assignees: ['natamox'] })]);
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'kind', kind('paste').replace('owner.ts', 'other.ts')],
    ]);
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(
      {
        status: result.status,
        rows: claimRows(box).length,
        started: /\tstarted\n/u.test(ledgerOnOrigin(box)),
      },
      { status: 1, rows: 0, started: false },
      result.stdout
    );
  });

  test('a domain target skips an issue whose open task names a held issue of another domain', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250), issue(5251, { assignees: ['natamox'] })]);
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'kind', kind('paste')],
    ]);
    setLedger(box, offer('t_aaaa1111', 'plate#5250 and plate#5251'));
    const result = await claim(box, ['--domain', 'editing', '--session', 'A']);
    assert.deepEqual(
      { status: result.status, claimed: claimedIssues(box) },
      { status: 1, claimed: [] },
      result.stdout
    );
  });

  test('a domain target leaves a free issue of another domain that its open task names, and the task with it', async () => {
    const box = sandbox();
    setIssues(box, issues(5250, 5251, 5252));
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'kind', kind('paste')],
      [5252, 'kind', kind()],
    ]);
    setLedger(box, offer('t_aaaa1111', 'plate#5250 and plate#5251'));
    const result = await claim(box, ['--domain', 'editing', '--session', 'A']);
    assert.deepEqual(
      {
        status: result.status,
        claimed: claimedIssues(box),
        said: result.stdout.includes('skipped #5251: outside this target'),
      },
      { status: 0, claimed: ['5252'], said: true },
      result.stdout
    );
  });

  test("an agent's domain claim skips the dup of a device kind with it", async () => {
    const box = sandbox();
    setRecords(box, [
      [5250, 'kind', kind('editing', '; device: ios')],
      [5251, 'dup', 'of: 5250'],
    ]);
    setLedger(box, offer('t_aaaa1111', 'plate#5250 and plate#5251'));
    const result = await claim(box, ['--domain', 'editing', '--session', 'A']);
    assert.deepEqual(
      { status: result.status, claimed: claimedIssues(box) },
      { status: 1, claimed: [] },
      result.stdout
    );
  });

  test('a person who drives the device claims its kind with its dup and leaves the desktop kind on its owner file', async () => {
    const box = sandbox();
    setIssues(box, issues(5250, 5251, 5252));
    setRecords(box, [
      [5250, 'kind', kind('editing', '; device: ios')],
      [5251, 'dup', 'of: 5250'],
      [5252, 'kind', kind()],
    ]);
    const result = await claim(box, [
      '5250',
      '--session',
      'P',
      '--drives',
      'ios',
    ]);
    assert.deepEqual(
      { status: result.status, claimed: claimedIssues(box) },
      { status: 0, claimed: ['5250', '5251'] },
      result.stdout
    );
  });

  test('an issue target claims the open issues whose kind shares an owner file', async () => {
    const box = sandbox();
    setIssues(box, issues(5250, 5251, 5252));
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'kind', kind('paste').replace(':3', ':1')],
      [5252, 'kind', kind().replace('owner.ts:3', 'other.ts:3')],
    ]);
    await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(claimedIssues(box), ['5250', '5251']);
  });

  test('a domain target skips the unit a held member holds and claims the rest', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250),
      issue(5251),
      issue(5252, { assignees: ['natamox'] }),
    ]);
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'kind', kind()],
      [5252, 'dup', 'of: 5250'],
    ]);
    const result = await claim(box, ['--domain', 'editing', '--session', 'A']);
    assert.deepEqual(
      { status: result.status, claimed: claimedIssues(box) },
      { status: 0, claimed: ['5251'] },
      result.stdout
    );
  });

  test('a domain target skips every issue of an open task that a held member holds', async () => {
    const box = sandbox();
    setIssues(box, [
      issue(5250, { assignees: ['natamox'] }),
      issue(5251),
      issue(5252),
    ]);
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'kind', kind()],
      [5252, 'kind', kind()],
    ]);
    setLedger(box, offer('t_aaaa1111', 'plate#5250 and plate#5251'));
    const result = await claim(box, ['--domain', 'editing', '--session', 'A']);
    assert.deepEqual(
      { status: result.status, claimed: claimedIssues(box) },
      { status: 0, claimed: ['5252'] },
      result.stdout
    );
  });

  test("--domain without --task claims the domain's kinds and skips the issues of a task another session started", async () => {
    const box = sandbox();
    setIssues(box, issues(5250, 5251));
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'kind', kind()],
    ]);
    setLedger(
      box,
      `${offer('t_bbbb2222', '#5251')}${startedIn('t_bbbb2222', 'local_old')}`
    );
    await claim(box, ['--domain', 'editing', '--session', 'A']);
    assert.deepEqual(claimedIssues(box), ['5250']);
  });

  test('--next claims the domain whose worst kind nobody holds ranks first', async () => {
    const box = trunkSandbox('');
    setIssues(box, [
      issue(5250, { assignees: ['natamox'] }),
      issue(5251),
      issue(5252),
    ]);
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'kind', kind('table').replace('P0', 'P1')],
      [5252, 'kind', kind('list').replace('P0', 'P2')],
    ]);
    const result = await claim(box, ['--next', '--session', 'A']);
    assert.deepEqual(
      { status: result.status, claimed: claimedIssues(box) },
      { status: 0, claimed: ['5251'] },
      result.stdout + result.stderr
    );
  });

  test("--domain with --task claims the task's issues and the domain's kinds with no open task", async () => {
    const box = sandbox();
    setIssues(box, issues(5250, 5251, 5252));
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'kind', kind()],
      [5252, 'kind', kind('paste')],
    ]);
    setLedger(
      box,
      `${offer('t_aaaa1111', '#5252')}${offer('t_cccc3333', '#5251')}`
    );
    await claim(box, [
      '--domain',
      'editing',
      '--task',
      't_aaaa1111',
      '--session',
      'A',
    ]);
    assert.deepEqual(claimedIssues(box), ['5250', '5252']);
  });

  test('a claim skips a device kind unless --drives names its device', async () => {
    const box = sandbox();
    setRecords(box, [[5250, 'kind', kind('editing', '; device: ios')]]);
    const skipped = await claim(box, ['5250', '--session', 'A']);
    const driven = await claim(box, [
      '5250',
      '--session',
      'A',
      '--drives',
      'ios',
    ]);
    assert.deepEqual(
      {
        skipped: skipped.status,
        driven: driven.status,
        rows: claimRows(box).map((row) => [row[1], row[7]]),
      },
      { skipped: 1, driven: 0, rows: [['5250', 'ios']] },
      skipped.stdout + driven.stdout
    );
  });

  test('lane lists the open device kinds with their holders, highest priority first', async () => {
    const box = sandbox();
    setIssues(box, issues(5250, 5251, 5252, 5253));
    setRecords(box, [
      [5250, 'kind', kind('editing', '; device: ios').replace('P0', 'P2')],
      [5251, 'kind', kind('editing', '; device: android, ime')],
      [5252, 'kind', kind('editing', '; device: ios').replace('P0', 'P1')],
      [5253, 'kind', kind()],
    ]);
    setClaims(box, [held({ issue: 5252, who: 'natamox', session: 'X' })]);
    const listed = await stdoutOf(box, ['lane']);
    assert.deepEqual(listed.trim().split('\n'), [
      '#5251\tP0\tediting\tandroid,ime\tfree\tIssue 5251',
      '#5252\tP1\tediting\tios\tnatamox/X\tIssue 5252',
      '#5250\tP2\tediting\tios\tfree\tIssue 5250',
    ]);
  });

  test('record refuses a device other than ios, android or ime', async () => {
    const box = sandbox();
    const result = await firstResult(box, [
      [5250, 'kind', `${KIND}; device: ipad`],
    ]);
    assert.match(result.stderr, /#5250: device: "ipad" is not a valid value/u);
  });

  test('record accepts a kind whose device lists ios and ime', async () => {
    const box = sandbox();
    assert.equal(
      await recordStatus(box, [[5250, 'kind', `${KIND}; device: ios, ime`]]),
      0
    );
  });

  test('a claim assigns the login only where GitHub does not show it assigned', async () => {
    const box = sandbox();
    setIssues(box, [issue(5250), issue(5251, { assignees: ['zbeyens'] })]);
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'kind', kind()],
    ]);
    await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(edits(box), [
      'issue edit 5250 --repo udecode/plate --add-assignee @me',
    ]);
  });

  test('a claim whose assignment GitHub does not show keeps the claim and exits 1', async () => {
    const box = sandbox();
    setIssues(box, issues(5250), { assignable: false });
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(
      {
        status: result.status,
        rows: claimRows(box).length,
        said: result.stdout.includes('running this claim again repairs it'),
      },
      { status: 1, rows: 1, said: true },
      result.stdout
    );
  });

  const ledgerOnOrigin = (box) =>
    spawnSync(
      'git',
      [
        '--git-dir',
        box.origin,
        'show',
        'refs/pstack/ledger:suggested-tasks.decisions.tsv',
      ],
      { encoding: 'utf-8' }
    ).stdout;
  function trunkSandbox(ledger) {
    const box = sandbox({ ledger });
    writeFileSync(
      join(box.work, '.agents/pstack.json'),
      `${JSON.stringify({ branch: 'next', delivery: 'trunk', plans: 'docs/plans', maxEffort: 'xhigh', triage: POLICY }, null, 2)}\n`
    );
    git(box, box.work, 'commit', '--quiet', '-am', 'trunk delivery');
    git(box, box.work, 'push', '--quiet', 'origin', 'next');
    return box;
  }

  test('a claim that covers an offered, ready task whole logs its started row on the ledger ref', async () => {
    const box = trunkSandbox(offer('t_aaaa1111', 'plate#5250'));
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.match(
      ledgerOnOrigin(box),
      /\tchip\tt_aaaa1111 Fix Enter in lists\t[^\t]+\tsession: A\tstarted\n/u,
      result.stdout + result.stderr
    );
  });

  test('a task another session starts after the claim decided stays with that session', async () => {
    const box = trunkSandbox(offer('t_aaaa1111', 'plate#5250'));
    const other = join(box.dir, 'start-other.mjs');
    writeFileSync(
      other,
      `import { spawnSync } from 'node:child_process';
const put = (args, input = '') => spawnSync('git', ['--git-dir', ${JSON.stringify(box.origin)}, ...args], { encoding: 'utf-8', input }).stdout.trim();
const tip = put(['rev-parse', 'refs/pstack/ledger']);
const text = put(['show', tip + ':suggested-tasks.decisions.tsv']) + '\\n' + ${JSON.stringify(startedIn('t_aaaa1111', 'local_other', ago(0)))};
const blob = put(['hash-object', '-w', '--stdin'], text);
const tree = put(['mktree'], '100644 blob ' + blob + '\\tsuggested-tasks.decisions.tsv\\n');
const commit = put(['commit-tree', tree, '-p', tip, '-m', 'other start']);
put(['update-ref', 'refs/pstack/ledger', commit]);
`
    );
    const done = join(box.dir, 'start-other.done');
    const hook = join(box.work, '.git', 'hooks', 'reference-transaction');
    writeFileSync(
      hook,
      [
        '#!/bin/sh',
        '[ "$1" = committed ] || exit 0',
        'grep -q refs/triage/claims || exit 0',
        `[ -e '${done}' ] && exit 0`,
        `touch '${done}'`,
        `'${NODE}' '${other}'`,
        'exit 0',
        '',
      ].join('\n')
    );
    chmodSync(hook, 0o755);
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(
      {
        status: result.status,
        sessions: ledgerOnOrigin(box)
          .split('\n')
          .filter((line) => line.endsWith('\tstarted'))
          .map((line) => line.split('\t')[4]),
      },
      { status: 0, sessions: ['session: local_other'] },
      result.stdout + result.stderr
    );
  });

  const offeredFixes = (box) =>
    ledgerOnOrigin(box).match(
      /\tchip\tt_[0-9a-f]{8} Fix plate#[^\n]*\toffered$/gmu
    ) ?? [];

  test('a claim on kinds no task covers offers one task at their worst priority and starts it for the session', async () => {
    const box = trunkSandbox('');
    setIssues(box, [issue(5250), issue(5251), issue(5252)]);
    setRecords(box, [
      [5250, 'kind', kind().replace('P0', 'P2')],
      [5251, 'kind', kind()],
      [5252, 'dup', 'of: 5251'],
    ]);
    const result = await claim(box, ['5251', '--session', 'A']);
    assert.match(
      ledgerOnOrigin(box),
      /\tchip\t(t_[0-9a-f]{8}) Fix plate#5250 plate#5251 and plate#5252\t[^\t]*plate#5252 \(dup of plate#5251\) "Issue 5252"\.\twrites: packages\/a\/src\/owner\.ts; topic: plate-5250; kind: fix; priority: P0; repro: plate#5250 plate#5251 and plate#5252 numbered repros hold the exact steps; session: A[^\t]*\toffered\n(?:[^\n]*\n)*?[^\n]*\tchip\t\1 Fix plate#5250 plate#5251 and plate#5252\t[^\t]+\tsession: A[^\t]*\tstarted\n/u,
      result.stdout + result.stderr
    );
  });

  test("a session's second claim writes no claim row and offers no second task", async () => {
    const box = trunkSandbox('');
    setRecords(box, [[5250, 'kind', kind()]]);
    await claim(box, ['5250', '--session', 'A']);
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.deepEqual(
      { offers: offeredFixes(box).length, rows: claimRows(box).length },
      { offers: 1, rows: 1 },
      result.stdout + result.stderr
    );
  });

  test('a rerun whose earlier offer never reached the shared ledger offers no second task', async () => {
    const box = trunkSandbox('');
    setRecords(box, [[5250, 'kind', kind()]]);
    const hook = join(box.origin, 'hooks', 'pre-receive');
    writeFileSync(hook, '#!/bin/sh\n! grep -q refs/pstack/ledger\n');
    chmodSync(hook, 0o755);
    await claim(box, ['5250', '--session', 'A']);
    const result = await claim(box, ['5250', '--session', 'A']);
    const local = readFileSync(
      join(box.work, 'docs/plans/artifacts/suggested-tasks.decisions.tsv'),
      'utf-8'
    );
    assert.equal(
      local.match(/\tchip\tt_[0-9a-f]{8} Fix plate#5250\t[^\n]*\toffered$/gmu)
        ?.length,
      1,
      result.stdout + result.stderr
    );
  });

  test('a released claim frees the task it offered for the next session', async () => {
    const first = trunkSandbox('');
    setRecords(first, [[5250, 'kind', kind()]]);
    await claim(first, ['5250', '--session', 'A']);
    const rerun = trunkSandbox('');
    await claim(rerun, ['5250', '--session', 'A']);
    setRecords(rerun, [[5250, 'kind', kind()]]);
    await claim(rerun, ['5250', '--session', 'A']);
    const next = [];
    for (const box of [first, rerun]) {
      await triage(box, [
        'release',
        '5250',
        '--session',
        'A',
        '--why',
        'stopped: no repro',
      ]);
      next.push(await claim(box, ['5250', '--session', 'B']));
    }
    assert.deepEqual(
      {
        offers: [offeredFixes(first).length, offeredFixes(rerun).length],
        claimed: next.map((result) => result.status),
      },
      { offers: [1, 1], claimed: [0, 0] },
      next.map((result) => result.stdout).join('\n')
    );
  });

  test('a claim on a P2 kind no task covers offers no task and says why', async () => {
    const box = sandbox();
    setRecords(box, [[5250, 'kind', kind().replace('P0', 'P2')]]);
    const result = await claim(box, ['5250', '--session', 'A']);
    assert.match(
      result.stdout,
      /^note: no task covers #5250, whose worst kind is P2, so the claim offers none; a run offers only P0 or P1 tasks$/mu
    );
  });

  test('a task claim and a device claim offer no task', async () => {
    const task = trunkSandbox(offer('t_aaaa1111', 'plate#5251'));
    setRecords(task, [[5250, 'kind', kind()]]);
    const device = trunkSandbox('');
    setRecords(device, [[5250, 'kind', kind('editing', '; device: ios')]]);
    const results = [
      await claim(task, [
        '--domain',
        'editing',
        '--task',
        't_aaaa1111',
        '--session',
        'A',
      ]),
      await claim(device, ['5250', '--drives', 'ios', '--session', 'A']),
    ];
    assert.deepEqual(
      [offeredFixes(task).length, offeredFixes(device).length],
      [0, 0],
      results.map((result) => result.stdout + result.stderr).join('\n')
    );
  });

  test('a dup of an issue an open task covers gets no task of its own', async () => {
    const box = trunkSandbox(offer('t_aaaa1111', 'plate#5250'));
    setRecords(box, [
      [5250, 'kind', kind()],
      [5251, 'dup', 'of: 5250'],
    ]);
    const result = await claim(box, ['5251', '--session', 'A']);
    assert.deepEqual(offeredFixes(box), [], result.stdout + result.stderr);
  });

  test('usage errors exit 2', async () => {
    const box = sandbox();
    const calls = [
      ['claim'],
      ['claim', '5250', '--domain', 'editing'],
      ['claim', '--next', '--domain', 'editing'],
      ['claim', 'x5250'],
      ['claim', '5250', '--drives', 'ipad'],
      ['claim', '5250', '--take', 'assignee:natamox'],
      ['claim', '5250', '--session', 'two words'],
      ['release', '5250'],
      ['lane', 'ipad'],
    ];
    const statuses = [];
    for (const args of calls) statuses.push(await statusOf(box, args));
    assert.deepEqual(
      statuses,
      calls.map(() => 2)
    );
  });
});
