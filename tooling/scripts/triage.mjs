#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { closeReleasedIssues } from './close-released-issues.mjs';
import { BRANCH, PRIVATE_DIR } from './private-files.mjs';
import {
  CLAIM_COLUMNS,
  CLAIMS_FILE,
  CLAIMS_REF,
  DEVICES,
  RELEASED_SITES,
  byRegressionThenPriority,
  claimLine,
  decide,
  decideNext,
  devicesOf,
  foldClaims,
  nextTargets,
  parseClaims,
  rankOf,
  regressionOf,
  sameActor,
  targetMembers,
} from './triage-claims.mjs';

const CONFIG = '.agents/pstack.json';
const STATE_REF = 'refs/triage/state';
const DISCUSSIONS = 'discussions';
const PRIORITY_ORDER = ['P0', 'P1', 'P2', 'P3'];
const LEANS = ['planned', 'pro', 'not-planned'];
const TRIAGED = 'Triaged';
const NEEDS_REPRO = 'Needs reproduction';
const NEEDS_RETEST = 'Needs retest';
const FIXED_IN_NEXT_RELEASE = 'Fixed in next release';
const DUPLICATE = 'Duplicate';
const PRIORITY_FIELD = 'Priority';
const SCOPE_FIELD = 'Scope';
const TRIAGE_FIELD = 'Triage';
const PLATFORM_FIELD = 'Platform';
const PLATFORM_DEVICES = new Map([
  ['Android', 'android'],
  ['iOS', 'ios'],
]);
const SCOPES_KEPT_BESIDE_RECORD = ['accessibility', 'performance'];
const IME_LABEL = 'ime';
const OUTCOME_TYPES = { kind: 'Bug', spec: 'Feature' };
const CLOSED_BY_BETA = new Set(['fixed', 'works-on-beta']);
const ISSUE_OUTCOMES = new Set([
  'kind',
  'dup',
  'needs-repro',
  'not-bug',
  'spec',
  'split',
  'fixed',
  'works-on-beta',
]);
const DISCUSSION_OUTCOMES = new Set([
  'answered',
  'outdated',
  'moved',
  'dup',
  'feature',
]);
const CLOSE_REASONS = {
  answered: 'RESOLVED',
  outdated: 'OUTDATED',
  moved: 'RESOLVED',
  dup: 'DUPLICATE',
  feature: 'RESOLVED',
};
const BOTS = new Set(['dependabot[bot]', 'github-actions[bot]']);
const TEAM_ROLES = new Set(['maintainer', 'qa']);
const DRAFT_MARK = /\n\n<!-- triage:([0-9a-f]{12}) -->$/u;
const GH_FIELDS =
  'number,title,body,state,author,labels,milestone,issueType,assignees,comments';
const LIST_FIELDS =
  'number,title,state,author,labels,milestone,issueType,assignees,comments';
const GRAPHQL_BATCH = 50;
const DISCUSSION_BATCH = 20;
const NETWORK_MS = 60_000;
const PUSH_TRIES = 4;
const BETA = 'beta.platejs.org';
const ISSUE_RE = /^[1-9]\d*$/u;
const SCOPE_RE = /^[a-z0-9][a-z0-9-]*$/u;
const COMMIT_RE = /^[0-9a-f]{7,40}$/u;
const BETA_RELEASE_RE = /^\d+\.\d+\.\d+-beta\.\d+$/u;
const LOGIN_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\[bot\])?$/u;
const STATE_ORDER = ['stale', 'untriaged', 'unconfirmed', 'current'];
const RETEST_VERDICTS = {
  pass: { closes: true, verb: 'passed' },
  fail: { closes: false, verb: 'failed' },
};

class RefusalError extends Error {
  name = 'RefusalError';
}
class UsageError extends Error {
  name = 'UsageError';
}

const refuse = (message) => {
  throw new RefusalError(message);
};
const usage = (message) => {
  throw new UsageError(message);
};

const root = (() => {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf-8',
  });
  return result.status === 0 ? result.stdout.trim() : process.cwd();
})();

const run = (command, args, options = {}) =>
  spawnSync(command, args, {
    cwd: root,
    encoding: 'utf-8',
    maxBuffer: 256 * 1024 * 1024,
    ...options,
  });

const gitOut = (...args) => {
  const result = run('git', args);
  return result.status === 0 ? result.stdout : null;
};

const teamVia = existsSync(join(root, PRIVATE_DIR))
  ? [`--git-dir=${join(root, PRIVATE_DIR)}`]
  : [];
const teamRemote = (remote) => (teamVia.length > 0 ? 'origin' : remote);
const teamRun = (args, options) => run('git', [...teamVia, ...args], options);
const teamOut = (...args) => {
  const result = teamRun(args);
  return result.status === 0 ? result.stdout : null;
};

const readJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const localConfig = () =>
  existsSync(join(root, CONFIG))
    ? readJson(readFileSync(join(root, CONFIG), 'utf-8'))
    : null;

const repoNameOf = (repo) => repo.split('/')[1];

const unixText = (text) => (text ?? '').replace(/\r\n?/gu, '\n');

const markOf = (text) =>
  createHash('sha256').update(unixText(text).trim()).digest('hex').slice(0, 12);

const marked = (text) =>
  `${unixText(text).trim()}\n\n<!-- triage:${markOf(text)} -->`;

const isDraft = (comment) => {
  const body = unixText(comment.body).trim();
  const match = DRAFT_MARK.exec(body);
  return Boolean(
    match &&
    ['COLLABORATOR', 'MEMBER', 'OWNER'].includes(comment.authorAssociation) &&
    markOf(body.slice(0, match.index)) === match[1]
  );
};

const isBot = (comment) => BOTS.has(comment.author?.login ?? '');

const ghProblem = (result) =>
  result.error?.code === 'ETIMEDOUT'
    ? `no answer in ${NETWORK_MS / 1000} s`
    : result.stderr?.trim().split('\n')[0] || `gh exited ${result.status}`;

const ghGraphql = (query) => {
  const result = spawnSync('gh', ['api', 'graphql', '-f', `query=${query}`], {
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: NETWORK_MS,
  });
  return { data: readJson(result.stdout)?.data ?? null, result };
};

const repositoryOf = (repo) => {
  const [owner, name] = repo.split('/');
  return `repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)})`;
};

let cachedLogin = undefined;
// REST /user refuses GitHub App installation tokens; GraphQL viewer returns the bot login too.
function ghLogin() {
  if (cachedLogin !== undefined) return cachedLogin;
  const result = run(
    'gh',
    [
      'api',
      'graphql',
      '-f',
      'query={viewer{login}}',
      '--jq',
      '.data.viewer.login',
    ],
    { timeout: NETWORK_MS }
  );
  const login = result.status === 0 ? result.stdout.trim() : '';
  cachedLogin = LOGIN_RE.test(login) ? login : null;
  return cachedLogin;
}

const betaMilestones = (policy) => [
  ...[policy.milestones?.slate, policy.milestones?.plate].flatMap((layer) => [
    layer?.regression,
    layer?.new,
  ]),
  policy.milestones?.experimental,
];

function policyProblems(config) {
  const problems = [];
  const triage = config?.triage;
  if (!triage || typeof triage !== 'object') {
    return [`${CONFIG} has no triage object`];
  }
  const repos = Array.isArray(triage.repos) ? triage.repos : [];
  if (
    repos.length === 0 ||
    repos.some((entry) => !/^[^/\s]+\/[^/\s]+$/u.test(entry))
  ) {
    problems.push('triage.repos is empty or has a bad owner/name');
  }
  if (new Set(repos.map(repoNameOf)).size !== repos.length) {
    problems.push('triage.repos names two repositories with the same name');
  }
  const titles = betaMilestones(triage);
  if (
    titles.some((title) => typeof title !== 'string' || !title.trim()) ||
    new Set(titles).size !== titles.length
  ) {
    problems.push(
      'triage.milestones needs five distinct names: slate.{regression,new}, plate.{regression,new}, experimental'
    );
  }
  if (
    !Array.isArray(triage.experimental) ||
    triage.experimental.some(
      (scope) => typeof scope !== 'string' || !SCOPE_RE.test(scope)
    )
  ) {
    problems.push('triage.experimental must list scope slugs');
  }
  if (
    !Array.isArray(triage.slatePaths) ||
    triage.slatePaths.length === 0 ||
    triage.slatePaths.some((entry) => typeof entry !== 'string' || !entry)
  ) {
    problems.push('triage.slatePaths must list non-empty path prefixes');
  }
  if (triage.focus !== 'next' && triage.focus !== 'all') {
    problems.push('triage.focus must be next or all');
  }
  const team = config?.team;
  const members =
    team && typeof team === 'object' && !Array.isArray(team)
      ? Object.entries(team)
      : [];
  if (
    members.length === 0 ||
    members.some(
      ([login, entry]) => !LOGIN_RE.test(login) || !TEAM_ROLES.has(entry?.role)
    )
  ) {
    problems.push('team must map GitHub logins to maintainer or qa');
  }
  if (!members.some(([, entry]) => entry?.role === 'maintainer')) {
    problems.push('team needs at least one maintainer');
  }
  const gated = triage.gated ?? [];
  if (
    !Array.isArray(gated) ||
    gated.some((login) => typeof login !== 'string' || !LOGIN_RE.test(login))
  ) {
    problems.push('triage.gated must list GitHub logins');
  }
  return problems;
}

function loadPolicy(targetRepo) {
  const config = localConfig();
  const problems = policyProblems(config);
  if (problems.length > 0) {
    refuse(`invalid triage policy in ${CONFIG}: ${problems.join('; ')}`);
  }
  const { triage, team } = config;
  const isDiscussions = targetRepo === DISCUSSIONS;
  const repo = isDiscussions
    ? triage.repos[0]
    : targetRepo === null
      ? triage.repos[0]
      : triage.repos.find(
          (entry) => entry === targetRepo || repoNameOf(entry) === targetRepo
        );
  if (!repo) {
    usage(
      `--repo must be one of ${[...triage.repos.map(repoNameOf), DISCUSSIONS].join(', ')}`
    );
  }
  const primary = !isDiscussions && repo === triage.repos[0];
  const stateKey = isDiscussions ? DISCUSSIONS : repoNameOf(repo);
  const claimsRef =
    primary || isDiscussions ? CLAIMS_REF : `${CLAIMS_REF}-${repoNameOf(repo)}`;
  const maintainers = Object.entries(team)
    .filter(([, entry]) => entry.role === 'maintainer')
    .map(([login]) => login);
  const members = Object.keys(team);
  const gated = triage.gated ?? [];
  return {
    repo,
    first: triage.repos[0],
    repos: triage.repos,
    primary,
    isDiscussions,
    stateKey,
    stateFile: `${stateKey}.json`,
    claimsRef,
    milestones: triage.milestones,
    experimental: new Set(triage.experimental),
    slatePaths: triage.slatePaths,
    focus: triage.focus,
    maintainers,
    maintainersText: maintainers.join(', '),
    team: members,
    gated,
  };
}

function canonicalRemote() {
  const remotes = (gitOut('remote') ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (remotes.includes('origin')) return 'origin';
  if (remotes.includes('upstream')) return 'upstream';
  return remotes[0] ?? 'origin';
}

const fetchRef = (remote, refspec, via = []) => {
  const result = run('git', [...via, 'fetch', '--quiet', remote, refspec], {
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    timeout: NETWORK_MS,
  });
  if (result.status === 0) return null;
  if (result.error?.code === 'ETIMEDOUT') {
    return {
      timedOut: true,
      message: `git fetch gave no answer in ${NETWORK_MS / 1000} s`,
    };
  }
  return {
    timedOut: false,
    message:
      result.stderr.trim().split('\n')[0] ||
      `git fetch exited ${result.status}`,
  };
};

function readStateTree(tip) {
  if (!tip) return {};
  const list = teamOut('ls-tree', '--name-only', tip);
  if (!list) return {};
  const files = {};
  for (const name of list
    .split('\n')
    .filter((line) => line.endsWith('.json'))) {
    files[name] = readJson(teamOut('show', `${tip}:${name}`) ?? '') ?? {};
  }
  return files;
}

function fetchState(remote, { fallback = false } = {}) {
  const error = fetchRef(
    teamRemote(remote),
    `+${STATE_REF}:${STATE_REF}`,
    teamVia
  );
  const missing = error && /couldn't find remote ref/u.test(error.message);
  if (error && !missing && !fallback) {
    refuse(`could not fetch ${STATE_REF} from ${remote} (${error.message})`);
  }
  const tip = missing
    ? null
    : teamOut(
        'rev-parse',
        '--verify',
        '--quiet',
        `${STATE_REF}^{commit}`
      )?.trim() || null;
  return {
    tip,
    files: readStateTree(tip),
    note:
      error && !missing ? `using cached ${STATE_REF} (${error.message})` : null,
  };
}

const sortedJson = (records) => {
  const ordered = Object.fromEntries(
    Object.entries(records).sort(([a], [b]) => Number(a) - Number(b))
  );
  return `${JSON.stringify(ordered, null, 2)}\n`;
};

function pushState(remote, stateFile, mutate) {
  for (let attempt = 0; attempt < PUSH_TRIES; attempt += 1) {
    const { tip, files } = fetchState(remote, { fallback: false });
    const current = { ...files[stateFile] };
    const { next, changed, summary } = mutate(current, attempt);
    if (!changed) return summary;
    const allFiles = { ...files, [stateFile]: next };
    const entries = Object.keys(allFiles)
      .sort()
      .map((name) => {
        const blob = teamRun(['hash-object', '-w', '--stdin'], {
          input: sortedJson(allFiles[name]),
        }).stdout.trim();
        return `100644 blob ${blob}\t${name}`;
      });
    const tree = teamRun(['mktree'], {
      input: `${entries.join('\n')}\n`,
    }).stdout.trim();
    const commit = teamRun([
      'commit-tree',
      tree,
      ...(tip ? ['-p', tip] : []),
      '-m',
      summary.commitMessage ?? `triage: update ${stateFile}`,
    ]).stdout.trim();
    const pushed = teamRun(
      ['push', '--quiet', teamRemote(remote), `${commit}:${STATE_REF}`],
      {
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
        timeout: NETWORK_MS,
      }
    );
    if (pushed.status === 0) {
      teamRun(['update-ref', STATE_REF, commit]);
      return summary;
    }
    if (!/\[rejected\]/u.test(pushed.stderr)) {
      refuse(
        `could not push ${STATE_REF} to ${remote}: ${pushed.stderr.trim().split('\n')[0] || `git push exited ${pushed.status}`}`
      );
    }
  }
  throw new RefusalError(
    `${STATE_REF} moved ${PUSH_TRIES} times during write; run again`
  );
}

function fetchClaims(remote, claimsRef, { fallback = false } = {}) {
  const error = fetchRef(
    teamRemote(remote),
    `+${claimsRef}:${claimsRef}`,
    teamVia
  );
  const missing = error && /couldn't find remote ref/u.test(error.message);
  if (error && !missing && !fallback) {
    refuse(`could not fetch ${claimsRef} from ${remote} (${error.message})`);
  }
  const tip = missing
    ? null
    : teamOut(
        'rev-parse',
        '--verify',
        '--quiet',
        `${claimsRef}^{commit}`
      )?.trim() || null;
  return {
    tip,
    text: tip ? (teamOut('show', `${tip}:${CLAIMS_FILE}`) ?? '') : '',
    note:
      error && !missing ? `using cached ${claimsRef} (${error.message})` : null,
  };
}

function pushClaims(remote, claimsRef, decideOn) {
  for (let attempt = 0; attempt < PUSH_TRIES; attempt += 1) {
    const { tip, text } = fetchClaims(remote, claimsRef, { fallback: false });
    const { lines, result } = decideOn(text, attempt);
    if (lines.length === 0) return result;
    const base = text || `${CLAIM_COLUMNS.join('\t')}\n`;
    const blob = teamRun(['hash-object', '-w', '--stdin'], {
      input: `${base}${base.endsWith('\n') ? '' : '\n'}${lines.join('\n')}\n`,
    }).stdout.trim();
    const tree = teamRun(['mktree'], {
      input: `100644 blob ${blob}\t${CLAIMS_FILE}\n`,
    }).stdout.trim();
    const commit = teamRun([
      'commit-tree',
      tree,
      ...(tip ? ['-p', tip] : []),
      '-m',
      `${lines.length} triage claim move(s)`,
    ]).stdout.trim();
    const pushed = teamRun(
      ['push', '--quiet', teamRemote(remote), `${commit}:${claimsRef}`],
      {
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
        timeout: NETWORK_MS,
      }
    );
    if (pushed.status === 0) {
      teamRun(['update-ref', claimsRef, commit]);
      return result;
    }
    if (!/\[rejected\]/u.test(pushed.stderr)) {
      refuse(
        `could not push ${claimsRef} to ${remote}: ${pushed.stderr.trim().split('\n')[0] || `git push exited ${pushed.status}`}`
      );
    }
  }
  throw new RefusalError(
    `${claimsRef} on ${remote} moved ${PUSH_TRIES} times while this claim decided; run it again`
  );
}

function toClaimHead(record) {
  if (!record) return undefined;
  const fields = new Map();
  for (const key of [
    'priority',
    'scope',
    'owner',
    'device',
    'regression',
    'of',
    'into',
    'commit',
    'retest',
    'proof',
    'issue',
    'lean',
  ]) {
    if (
      record[key] !== undefined &&
      record[key] !== null &&
      record[key] !== ''
    ) {
      fields.set(key, String(record[key]));
    }
  }
  return {
    outcome: record.outcome,
    ts: record.ts,
    who: record.who,
    why: record.why ?? '',
    record,
    fields,
  };
}

const devicesOfRecord = (record) => {
  const raw = record?.device ?? record?.kind?.device ?? '';
  return raw
    ? String(raw)
        .split(/,\s*/u)
        .filter((item) => DEVICES.includes(item))
    : [];
};

const scopeOfRecord = (record) => record?.scope ?? record?.kind?.scope ?? null;
const priorityOfRecord = (record) =>
  record?.priority ?? record?.kind?.priority ?? null;
const regressionOfRecord = (record) =>
  record?.regression ?? record?.kind?.regression ?? null;
const ownerOfRecord = (record) => record?.owner ?? record?.kind?.owner ?? null;

function stateOf(record, ghItem, policy) {
  if (!record) return { state: 'untriaged', reasons: [], record: null };
  const reasons = [];
  if (record.retestFailed) reasons.push('retest-failed');
  const recordedAt = Date.parse(record.ts ?? '');
  if (ghItem && Number.isFinite(recordedAt)) {
    const newer = (ghItem.comments ?? []).some(
      (comment) =>
        !isBot(comment) &&
        !isDraft(comment) &&
        Date.parse(comment.createdAt ?? '') > recordedAt
    );
    if (newer) reasons.push('new-comment');
  }
  if (reasons.length > 0) return { state: 'stale', reasons, record };
  if (policy.gated.includes(record.who)) {
    return { state: 'unconfirmed', reasons: [`by ${record.who}`], record };
  }
  return { state: 'current', reasons: [], record };
}

const mainReport = (policy, milestone) =>
  policy.primary && !betaMilestones(policy).includes(milestone);

const inFocus = (policy, issue) =>
  policy.focus === 'all' || !mainReport(policy, issue.milestone?.title ?? null);

const issuePrefix = (policy) =>
  policy.primary ? '#' : `${repoNameOf(policy.repo)}#`;

function milestoneFor(policy, current, record) {
  if (!record) return current;
  const scope = scopeOfRecord(record);
  const isKindOrFixed =
    record.outcome === 'kind' || (record.outcome === 'fixed' && Boolean(scope));
  if (!isKindOrFixed || !scope) return current;
  if (policy.experimental.has(scope)) return policy.milestones.experimental;
  const owner = ownerOfRecord(record) ?? '';
  const files = owner
    .split(/,\s*/u)
    .filter(Boolean)
    .map((ref) => ref.replace(/:\d+(?:-\d+)?$/u, ''));
  const layer =
    files.length > 0 &&
    files.every((file) =>
      policy.slatePaths.some((prefix) => file.startsWith(prefix))
    )
      ? 'slate'
      : 'plate';
  const reg = regressionOf(regressionOfRecord(record));
  if (reg === 'slate') return policy.milestones.slate.regression;
  if (reg === 'plate') return policy.milestones.plate.regression;
  return policy.milestones[layer].new;
}

function openIssues(repo, label = null) {
  const args = [
    'issue',
    'list',
    '--repo',
    repo,
    '--state',
    'open',
    '--limit',
    '1000',
    '--json',
    LIST_FIELDS,
    ...(label ? ['--label', label] : []),
  ];
  const result = run('gh', args, { timeout: NETWORK_MS });
  if (result.status !== 0) {
    refuse(`gh could not list open issues of ${repo}: ${ghProblem(result)}`);
  }
  return readJson(result.stdout) ?? [];
}

function viewIssue(repo, number) {
  const result = run(
    'gh',
    ['issue', 'view', String(number), '--repo', repo, '--json', GH_FIELDS],
    { timeout: NETWORK_MS }
  );
  if (result.status !== 0) return null;
  return readJson(result.stdout);
}

const POST_FIELDS =
  'id isAnswer createdAt authorAssociation author { login } body';
const DISCUSSION_FIELDS = `id number title body closed category { name isAnswerable } labels(first: 100) { nodes { id name } } author { login } comments(first: 100) { pageInfo { hasNextPage } nodes { ${POST_FIELDS} replies(first: 100) { pageInfo { hasNextPage } nodes { ${POST_FIELDS} } } } }`;

const flattenDiscussion = ({ closed, comments, labels, ...node }) => ({
  ...node,
  state: closed ? 'CLOSED' : 'OPEN',
  labels: labels.nodes,
  comments: comments.nodes.flatMap(({ replies, ...comment }) => [
    comment,
    ...replies.nodes.map((reply) => ({ ...reply, reply: true })),
  ]),
});

function viewDiscussions(repo, numbers) {
  const found = new Map();
  for (let at = 0; at < numbers.length; at += DISCUSSION_BATCH) {
    const part = numbers.slice(at, at + DISCUSSION_BATCH);
    const fields = part.map(
      (number) =>
        `d${number}: discussion(number: ${number}) { ${DISCUSSION_FIELDS} }`
    );
    const { data, result } = ghGraphql(
      `query { ${repositoryOf(repo)} { ${fields.join(' ')} } }`
    );
    if (!data?.repository) {
      refuse(`gh could not read discussions of ${repo}: ${ghProblem(result)}`);
    }
    for (const number of part) {
      const node = data.repository[`d${number}`];
      found.set(String(number), node ? flattenDiscussion(node) : null);
    }
  }
  return found;
}

function openDiscussions(repo, category = null) {
  const listed = [];
  let after = null;
  do {
    const page = `first: 100${after ? `, after: ${JSON.stringify(after)}` : ''}, states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC }`;
    const { data, result } = ghGraphql(
      `query { ${repositoryOf(repo)} { discussions(${page}) { pageInfo { hasNextPage endCursor } nodes { number title category { name isAnswerable } author { login } } } } }`
    );
    const discussions = data?.repository?.discussions;
    if (!discussions) {
      refuse(
        `gh could not list open discussions of ${repo}: ${ghProblem(result)}`
      );
    }
    listed.push(...discussions.nodes);
    after = discussions.pageInfo.hasNextPage
      ? discussions.pageInfo.endCursor
      : null;
  } while (after);
  return category === null
    ? listed
    : listed.filter((each) => each.category.name === category);
}

function platformDevices(repo, numbers) {
  const found = new Map();
  for (let at = 0; at < numbers.length; at += GRAPHQL_BATCH) {
    const part = numbers.slice(at, at + GRAPHQL_BATCH);
    const fields = part.map(
      (number) =>
        `i${number}: issue(number: ${number}) { issueFieldValues(first: 20) { nodes { ... on IssueFieldMultiSelectValue { field { ... on IssueFieldMultiSelect { name } } options { name } } } } }`
    );
    const { data, result } = ghGraphql(
      `query { ${repositoryOf(repo)} { ${fields.join(' ')} } }`
    );
    const repository = data?.repository;
    for (const number of part) {
      const nodes = repository?.[`i${number}`]?.issueFieldValues?.nodes;
      if (!Array.isArray(nodes)) {
        refuse(
          `gh could not read ${PLATFORM_FIELD} of ${repo}#${number}: ${ghProblem(result)}`
        );
      }
      const platform = nodes.find(
        (node) => node?.field?.name === PLATFORM_FIELD
      );
      found.set(
        String(number),
        (platform?.options ?? []).flatMap(
          (option) => PLATFORM_DEVICES.get(option.name) ?? []
        )
      );
    }
  }
  return found;
}

function fieldValues(repo, numbers) {
  const issues = new Map();
  let fields = null;
  for (let at = 0; at < numbers.length; at += GRAPHQL_BATCH) {
    const part = numbers.slice(at, at + GRAPHQL_BATCH);
    const aliases = part.map(
      (number) =>
        `i${number}: issue(number: ${number}) { id issueFieldValues(first: 20) { nodes { ... on IssueFieldSingleSelectValue { optionId field { ... on IssueFieldSingleSelect { id } } } ... on IssueFieldMultiSelectValue { options { id } field { ... on IssueFieldMultiSelect { id } } } } } }`
    );
    const { data, result } = ghGraphql(
      `query { ${repositoryOf(repo)} { issueFields(first: 50) { nodes { __typename ... on IssueFieldSingleSelect { id name options { id name } } ... on IssueFieldMultiSelect { id name options { id name } } } } ${aliases.join(' ')} } }`
    );
    if (!data) {
      refuse(`could not read issue fields of ${repo}: ${ghProblem(result)}`);
    }
    fields ??= data.repository?.issueFields?.nodes ?? [];
    if (fields.length === 0) {
      refuse(`no issue fields returned for ${repo}`);
    }
    for (const number of part) {
      const node = data.repository?.[`i${number}`];
      if (!node?.id) refuse(`could not read issue id of ${repo}#${number}`);
      issues.set(number, node);
    }
  }
  const fieldOf = (fieldName, kind, wanted) => {
    const field = fields.find(
      (node) =>
        node?.name === fieldName &&
        node.__typename === `IssueField${kind}Select`
    );
    if (!field) {
      refuse(
        `${repo} has no ${kind.toLowerCase()}-select issue field named ${fieldName}`
      );
    }
    const optionIds = new Map(
      field.options.map((option) => [option.name, option.id])
    );
    const missing = wanted.filter((option) => !optionIds.has(option));
    if (missing.length > 0) {
      refuse(
        `${repo} ${fieldName} field is missing option(s): ${missing.join(', ')}`
      );
    }
    return { id: field.id, optionIds };
  };
  const priority = fieldOf(PRIORITY_FIELD, 'Single', PRIORITY_ORDER);
  const scope = fieldOf(SCOPE_FIELD, 'Multi', []);
  const triage = fieldOf(TRIAGE_FIELD, 'Single', [
    TRIAGED,
    NEEDS_REPRO,
    NEEDS_RETEST,
    FIXED_IN_NEXT_RELEASE,
    DUPLICATE,
  ]);
  const values = new Map(
    [...issues].map(([number, node]) => {
      const valueOf = (field) =>
        node.issueFieldValues?.nodes?.find(
          (value) => value?.field?.id === field.id
        );
      return [
        number,
        {
          issueId: node.id,
          priority: valueOf(priority)?.optionId ?? null,
          scopes: (valueOf(scope)?.options ?? []).map((option) => option.id),
          triage: valueOf(triage)?.optionId ?? null,
        },
      ];
    })
  );
  return { priority, scope, triage, values };
}

function liveSignals(repo, numbers) {
  const found = new Map();
  for (let at = 0; at < numbers.length; at += GRAPHQL_BATCH) {
    const part = numbers.slice(at, at + GRAPHQL_BATCH);
    const aliases = part.map(
      (number) =>
        `i${number}: issue(number: ${number}) {
          assignees(first: 20) { nodes { login } }
          assigned: timelineItems(itemTypes: [ASSIGNED_EVENT], last: 20) {
            nodes { ... on AssignedEvent { createdAt assignee { ... on User { login } } } }
          }
          closedBy: closedByPullRequestsReferences(first: 20, includeClosedPrs: false) {
            nodes { number state createdAt updatedAt author { login } }
          }
          refs: timelineItems(itemTypes: [CROSS_REFERENCED_EVENT], last: 20) {
            nodes {
              ... on CrossReferencedEvent {
                willCloseTarget
                source { ... on PullRequest { number state createdAt updatedAt author { login } } }
              }
            }
          }
          comments(last: 30) {
            nodes { databaseId createdAt authorAssociation author { login } body }
          }
        }`
    );
    const { data, result } = ghGraphql(
      `query { ${repositoryOf(repo)} { ${aliases.join(' ')} } }`
    );
    if (!data?.repository) {
      refuse(`gh could not read live signals of ${repo}: ${ghProblem(result)}`);
    }
    for (const number of part) {
      const node = data.repository[`i${number}`];
      if (!node) {
        found.set(String(number), { assignees: [], prs: [], comments: [] });
        continue;
      }
      const assignedAt = new Map();
      for (const event of node.assigned?.nodes ?? []) {
        const login = event?.assignee?.login;
        if (login) assignedAt.set(login, event.createdAt);
      }
      const assignees = (node.assignees?.nodes ?? [])
        .map((user) => user?.login)
        .filter(Boolean)
        .map((login) => ({ login, at: assignedAt.get(login) ?? null }));
      const prMap = new Map();
      for (const pr of node.closedBy?.nodes ?? []) {
        if (pr?.state === 'OPEN') prMap.set(pr.number, pr);
      }
      for (const event of node.refs?.nodes ?? []) {
        const pr = event?.source;
        if (event?.willCloseTarget && pr?.state === 'OPEN') {
          prMap.set(pr.number, pr);
        }
      }
      const prs = [...prMap.values()].map((pr) => ({
        number: pr.number,
        author: pr.author?.login ?? 'unknown',
        createdAt: pr.createdAt,
        updatedAt: pr.updatedAt,
      }));
      const comments = (node.comments?.nodes ?? []).map((comment) => ({
        id: String(comment.databaseId),
        author: comment.author?.login ?? '',
        bot: isBot(comment) || isDraft(comment),
        createdAt: comment.createdAt,
        body: comment.body ?? '',
      }));
      found.set(String(number), { assignees, prs, comments });
    }
  }
  return found;
}

const actorOf = (options) => {
  const who = ghLogin();
  if (!who) {
    refuse('gh is not logged in; run gh auth login');
  }
  const session =
    options.session ||
    process.env.CLAUDE_CODE_HOST_SESSION_ID ||
    process.env.CLAUDE_CODE_SESSION_ID ||
    process.env.CODEX_SESSION_ID ||
    process.env.CODEX_THREAD_ID ||
    process.env.T3CODE_THREAD_ID ||
    'person';
  return { who, session, transcript: null };
};

const openMap = (issues) =>
  new Map(
    issues.map((issue) => [
      String(issue.number),
      {
        title: issue.title,
        milestone: issue.milestone?.title ?? null,
        assignees: (issue.assignees ?? [])
          .map((assignee) =>
            typeof assignee === 'string' ? assignee : assignee?.login
          )
          .filter(Boolean),
        raw: issue,
      },
    ])
  );

function liveClaims(records, claimRows, isOpen, policy) {
  return foldClaims(claimRows, {
    maintainers: policy.maintainers,
    endedAt(issue, claim) {
      if (!isOpen(issue)) return 'closed';
      const rec = records[issue];
      if (
        rec?.outcome === 'fixed' &&
        !rec.retestFailed &&
        Date.parse(rec.ts) > Date.parse(claim.since)
      ) {
        return rec.ts;
      }
      return null;
    },
  });
}

function claimWorld(policy, records, open, claimRows, live, actor) {
  const claims = liveClaims(
    records,
    claimRows,
    (issue) => open.has(issue),
    policy
  );
  const heads = new Map(
    Object.entries(records).map(([issue, rec]) => [issue, toClaimHead(rec)])
  );
  return {
    actor,
    maintainers: policy.maintainers,
    now: Date.now(),
    open,
    claims,
    live,
    head: (issue) => heads.get(issue),
    main: (issue) => mainReport(policy, open.get(issue)?.milestone ?? null),
    activity: () => null,
  };
}

const othersOf = (assignees, self) =>
  (assignees ?? []).filter((login) => login && login !== self);

function parseDetail(text) {
  const map = new Map();
  if (!text?.trim()) return map;
  for (const part of text.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(':');
    if (colon <= 0) {
      refuse(
        `bad detail entry ${JSON.stringify(trimmed)}: expected "key: value"`
      );
    }
    const key = trimmed.slice(0, colon).trim().toLowerCase();
    const value = trimmed.slice(colon + 1).trim();
    if (value) map.set(key, value);
  }
  return map;
}

function normalizeDevices(raw) {
  if (!raw) return undefined;
  const list = [
    ...new Set(
      (Array.isArray(raw) ? raw : String(raw).split(/,\s*/u))
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
  const bad = list.filter((item) => !DEVICES.includes(item));
  if (bad.length > 0) {
    refuse(`invalid device ${bad.join(', ')}; allowed: ${DEVICES.join(', ')}`);
  }
  return list.length > 0 ? list.join(',') : undefined;
}

function normalizeRegression(raw) {
  if (!raw) return undefined;
  const value = String(raw).trim();
  if (value === 'slate' || value === 'plate') return value;
  const urls = value
    .split(/,\s*/u)
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (
    urls.length > 0 &&
    urls.every((url) => RELEASED_SITES.has(URL.parse(url)?.hostname))
  ) {
    return urls.join(', ');
  }
  throw new RefusalError(
    `invalid regression ${JSON.stringify(value)}; use slate, plate, or a slatejs.org/platejs.org URL`
  );
}

function buildRecord(raw, policy, existing) {
  const issue = String(raw.issue ?? '')
    .replace(/^#/u, '')
    .trim();
  if (!ISSUE_RE.test(issue)) {
    refuse(`invalid issue number ${JSON.stringify(raw.issue)}`);
  }
  const outcome = String(raw.outcome ?? '').trim();
  const allowed = policy.isDiscussions ? DISCUSSION_OUTCOMES : ISSUE_OUTCOMES;
  if (!allowed.has(outcome)) {
    refuse(
      `invalid outcome ${JSON.stringify(outcome)} for ${policy.stateKey}; allowed: ${[...allowed].join(', ')}`
    );
  }
  if (outcome === 'works-on-beta' && !policy.primary) {
    refuse('works-on-beta is only for the primary public repository');
  }
  const detail = parseDetail(raw.detail);
  const pick = (key) => {
    const val = raw[key] ?? detail.get(key);
    return val === undefined || val === null
      ? undefined
      : String(val).trim() || undefined;
  };
  const why =
    pick('why') ??
    pick('missing') ??
    pick('question') ??
    pick('law') ??
    pick('answer') ??
    '';

  const rec = { outcome };
  if (policy.isDiscussions) {
    if (outcome === 'feature') {
      const priority = pick('priority');
      const lean = pick('lean');
      if (!PRIORITY_ORDER.includes(priority)) {
        refuse(
          `#${issue}: feature requires priority (${PRIORITY_ORDER.join('|')})`
        );
      }
      if (!LEANS.includes(lean)) {
        refuse(`#${issue}: feature requires lean (${LEANS.join('|')})`);
      }
      rec.priority = priority;
      rec.lean = lean;
    } else if (outcome === 'moved') {
      const target = (pick('issue') ?? '').replace(/^#/u, '');
      if (!ISSUE_RE.test(target)) {
        refuse(`#${issue}: moved requires issue number`);
      }
      rec.issue = target;
    } else if (outcome === 'dup') {
      const target = (pick('of') ?? '').replace(/^#/u, '');
      if (!ISSUE_RE.test(target) || target === issue) {
        refuse(`#${issue}: dup requires another discussion number in of`);
      }
      rec.of = target;
    }
  } else if (outcome === 'kind') {
    const priority = pick('priority');
    const scope = pick('scope');
    if (!PRIORITY_ORDER.includes(priority)) {
      refuse(`#${issue}: kind requires priority (${PRIORITY_ORDER.join('|')})`);
    }
    if (!scope || !SCOPE_RE.test(scope)) {
      refuse(`#${issue}: kind requires scope slug (e.g. table, selection)`);
    }
    rec.priority = priority;
    rec.scope = scope;
    const owner = pick('owner');
    if (owner) rec.owner = owner;
    const device = normalizeDevices(raw.device ?? detail.get('device'));
    if (device) rec.device = device;
    const regression = normalizeRegression(
      raw.regression ?? detail.get('regression')
    );
    if (regression) rec.regression = regression;
  } else if (outcome === 'dup') {
    const target = (pick('of') ?? '').replace(/^#/u, '');
    if (!ISSUE_RE.test(target) || target === issue) {
      refuse(`#${issue}: dup requires another issue number in of`);
    }
    rec.of = target;
  } else if (outcome === 'split') {
    const targets = (pick('into') ?? '')
      .split(/,\s*/u)
      .map((val) => val.replace(/^#/u, '').trim())
      .filter(Boolean);
    if (
      targets.length === 0 ||
      targets.some((val) => !ISSUE_RE.test(val) || val === issue)
    ) {
      refuse(`#${issue}: split requires target issue numbers in into`);
    }
    rec.into = targets.join(', ');
  } else if (outcome === 'fixed' || outcome === 'works-on-beta') {
    const commit = pick('commit');
    if (!commit || !COMMIT_RE.test(commit)) {
      refuse(`#${issue}: ${outcome} requires commit SHA (7-40 hex chars)`);
    }
    rec.commit = commit;
    const owner = pick('owner');
    if (owner) rec.owner = owner;
    const proof = pick('proof');
    if (proof) rec.proof = proof;
    const retest = pick('retest');
    if (retest) rec.retest = retest;
    const prior =
      existing?.outcome === 'kind' ? existing : (existing?.kind ?? null);
    if (prior) {
      const saved = {};
      for (const k of ['priority', 'scope', 'owner', 'device', 'regression']) {
        if (prior[k]) saved[k] = prior[k];
      }
      if (Object.keys(saved).length > 0) rec.kind = saved;
    }
  } else if (!why) {
    refuse(`#${issue}: ${outcome} requires --why (or detail note)`);
  }
  if (why) rec.why = why;
  return { issue, record: rec };
}

function parseBatchFile(filePath) {
  if (!existsSync(filePath)) {
    usage(`batch file not found: ${filePath}`);
  }
  const text = readFileSync(filePath, 'utf-8').trim();
  if (!text) usage(`batch file is empty: ${filePath}`);
  if (text.startsWith('[') || text.startsWith('{')) {
    const parsed = readJson(text);
    if (!parsed) usage(`batch file is invalid JSON: ${filePath}`);
    return Array.isArray(parsed) ? parsed : [parsed];
  }
  const lines = text.split('\n').filter((line) => line.trim());
  const first = lines[0].split('\t').map((cell) => cell.trim());
  const hasHeader = first[0] === 'issue';
  const rows = hasHeader ? lines.slice(1) : lines;
  return rows.map((line) => {
    const cells = line.split('\t');
    const hasLegacySeenColumn =
      cells.length >= 5 && (!hasHeader || first[3] === 'seen');
    if (hasLegacySeenColumn) {
      return {
        issue: cells[0],
        outcome: cells[1],
        detail: cells[2],
        why: cells[4],
      };
    }
    return {
      issue: cells[0],
      outcome: cells[1],
      detail: cells[2] ?? '',
      why: cells[3] ?? '',
    };
  });
}

function syncIssuesGitHub(policy, records, issuesList, { apply }) {
  if (issuesList.length === 0) return { commands: [], unscoped: [] };
  const fields = fieldValues(
    policy.repo,
    issuesList.map((issue) => issue.number)
  );
  const clearedIds = new Set(
    [TRIAGED, DUPLICATE, FIXED_IN_NEXT_RELEASE].map((name) =>
      fields.triage.optionIds.get(name)
    )
  );
  const keptScopeIds = new Set(
    SCOPES_KEPT_BESIDE_RECORD.map((name) =>
      fields.scope.optionIds.get(name)
    ).filter(Boolean)
  );
  const planned = [];
  const unscoped = [];

  for (const issue of issuesList) {
    const number = String(issue.number);
    const record = records[number];
    const { state } = stateOf(record, issue, policy);
    const names = new Set((issue.labels ?? []).map((label) => label.name));
    const edits = [];
    const { issueId, priority, scopes, triage } = fields.values.get(
      issue.number
    );
    const changes = [];
    const mutationId = [`#${issue.number}`];
    const devices = devicesOfRecord(record);
    const closes =
      state === 'current' &&
      record?.outcome === 'fixed' &&
      record.retest === 'none' &&
      devices.length === 0;
    const awaitsRelease =
      policy.primary &&
      state === 'current' &&
      CLOSED_BY_BETA.has(record?.outcome);
    const declined =
      policy.primary && state === 'current' && record?.outcome === 'not-bug';

    if (state === 'current' && record) {
      const triageId = fields.triage.optionIds.get(
        awaitsRelease
          ? FIXED_IN_NEXT_RELEASE
          : record.outcome === 'needs-repro'
            ? NEEDS_REPRO
            : record.outcome === 'dup'
              ? DUPLICATE
              : record.outcome === 'fixed' && !closes
                ? NEEDS_RETEST
                : TRIAGED
      );
      if (triage !== triageId) {
        changes.push(
          `{ fieldId: "${fields.triage.id}", singleSelectOptionId: "${triageId}" }`
        );
      }
      const ime = devices.includes(IME_LABEL);
      if (ime && !names.has(IME_LABEL)) edits.push('--add-label', IME_LABEL);
      else if (!ime && names.has(IME_LABEL)) {
        edits.push('--remove-label', IME_LABEL);
      }
      const type = OUTCOME_TYPES[record.outcome];
      if (type && issue.issueType?.name !== type) edits.push('--type', type);
      if (record.outcome === 'kind') {
        const level = record.priority;
        const { scope } = record;
        const priorityId = fields.priority.optionIds.get(level);
        const scopeId = fields.scope.optionIds.get(scope);
        mutationId.push(level, scope);
        if (priority !== priorityId) {
          changes.push(
            `{ fieldId: "${fields.priority.id}", singleSelectOptionId: "${priorityId}" }`
          );
        }
        if (scopeId === undefined) {
          unscoped.push(`#${issue.number} ${scope}`);
        } else {
          const wanted = [
            ...new Set([
              scopeId,
              ...scopes.filter((id) => keptScopeIds.has(id)),
            ]),
          ];
          if (
            wanted.length !== scopes.length ||
            wanted.some((id) => !scopes.includes(id))
          ) {
            changes.push(
              `{ fieldId: "${fields.scope.id}", multiSelectOptionIds: [${wanted.map((id) => `"${id}"`).join(', ')}] }`
            );
          }
        }
      }
    } else if (
      clearedIds.has(triage) ||
      (triage === fields.triage.optionIds.get(NEEDS_RETEST) &&
        record?.outcome !== 'fixed')
    ) {
      changes.push(`{ fieldId: "${fields.triage.id}", delete: true }`);
    }

    const milestone = issue.milestone?.title ?? null;
    const target = milestoneFor(policy, milestone, record);
    if (target && target !== milestone) {
      edits.push('--milestone', target);
    }

    if (edits.length > 0) {
      planned.push({
        args: ['issue', 'edit', number, '--repo', policy.repo, ...edits],
        display: `gh issue edit ${number} --repo ${policy.repo} ${edits.map((arg) => (arg.includes(' ') ? `'${arg}'` : arg)).join(' ')}`,
      });
    }
    if (closes && !policy.primary) {
      planned.push({
        args: [
          'issue',
          'close',
          number,
          '--repo',
          policy.repo,
          '--reason',
          'completed',
        ],
        display: `gh issue close ${number} --repo ${policy.repo} --reason completed`,
      });
    }
    if (declined) {
      planned.push({
        args: [
          'issue',
          'close',
          number,
          '--repo',
          policy.repo,
          '--reason',
          'not planned',
        ],
        display: `gh issue close ${number} --repo ${policy.repo} --reason 'not planned'`,
      });
    }
    if (changes.length > 0) {
      const query = `mutation { setIssueFieldValue(input: { clientMutationId: "${mutationId.join(' ')}", issueId: "${issueId}", issueFields: [${changes.join(', ')}] }) { clientMutationId } }`;
      planned.push({
        args: ['api', 'graphql', '-f', `query=${query}`],
        display: `gh api graphql -f query='${query}'`,
      });
    }
  }

  if (unscoped.length > 0) {
    console.error(
      `triage labels: the ${SCOPE_FIELD} field has no option for ${unscoped.join(', ')}; add the option in org issue field settings when ready`
    );
  }
  if (apply) {
    for (const step of planned) {
      const result = run('gh', step.args, { timeout: NETWORK_MS });
      if (result.status !== 0) {
        refuse(`failed to sync GitHub (${step.display}): ${ghProblem(result)}`);
      }
    }
  }
  return { commands: planned.map((step) => step.display), unscoped };
}

function syncDiscussionsGitHub(policy, records, discussionsList, { apply }) {
  const numbers = discussionsList
    .map((each) => String(each.number))
    .filter((number) => Boolean(records[number]));
  if (numbers.length === 0) return { commands: [] };
  const details = viewDiscussions(policy.repo, numbers);
  const planned = [];
  const neededLabels = new Set();

  for (const number of numbers) {
    const record = records[number];
    const discussion = details.get(number);
    if (!discussion) continue;
    const { state } = stateOf(record, discussion, policy);
    if (state !== 'current') continue;
    if (record.outcome === 'feature') {
      const ids = new Map(
        discussion.labels.map((label) => [label.name, label.id])
      );
      if (!ids.has(record.lean)) {
        neededLabels.add(record.lean);
        planned.push({
          kind: 'add-label',
          discussionId: discussion.id,
          label: record.lean,
          display: `gh api graphql -f query='mutation($label: ID!) { addLabelsToLabelable(input: { labelableId: "${discussion.id}", labelIds: [$label] }) { clientMutationId } }' -f label="$(gh api repos/${policy.repo}/labels/${record.lean} --jq .node_id)"`,
        });
      }
      const others = LEANS.filter(
        (name) => name !== record.lean && ids.has(name)
      );
      if (others.length > 0) {
        const query = `mutation { removeLabelsFromLabelable(input: { labelableId: "${discussion.id}", labelIds: [${others.map((name) => `"${ids.get(name)}"`).join(', ')}] }) { clientMutationId } }`;
        planned.push({
          args: ['api', 'graphql', '-f', `query=${query}`],
          display: `gh api graphql -f query='${query}'`,
        });
      }
    }
    const reply = discussion.comments.findLast(
      (comment) =>
        isDraft(comment) &&
        Date.parse(comment.createdAt) > Date.parse(record.ts)
    );
    const closes =
      record.outcome === 'dup' ||
      (reply !== undefined &&
        (record.outcome !== 'feature' || record.lean === 'not-planned'));
    if (!closes) continue;
    if (
      record.outcome === 'answered' &&
      discussion.category.isAnswerable &&
      !reply.isAnswer
    ) {
      const query = `mutation { markDiscussionCommentAsAnswer(input: { id: "${reply.id}" }) { clientMutationId } }`;
      planned.push({
        args: ['api', 'graphql', '-f', `query=${query}`],
        display: `gh api graphql -f query='${query}'`,
      });
    }
    const closeQuery = `mutation { closeDiscussion(input: { discussionId: "${discussion.id}", reason: ${CLOSE_REASONS[record.outcome]} }) { clientMutationId } }`;
    planned.push({
      args: ['api', 'graphql', '-f', `query=${closeQuery}`],
      display: `gh api graphql -f query='${closeQuery}'`,
    });
  }

  const labelIds = new Map();
  if (neededLabels.size > 0) {
    const names = [...neededLabels];
    const queryFields = names.map(
      (name, at) => `l${at}: label(name: ${JSON.stringify(name)}) { id }`
    );
    const { data, result } = ghGraphql(
      `query { ${repositoryOf(policy.repo)} { ${queryFields.join(' ')} } }`
    );
    if (!data?.repository) {
      refuse(
        `gh could not read labels of ${policy.repo}: ${ghProblem(result)}`
      );
    }
    for (const [at, name] of names.entries()) {
      const id = data.repository[`l${at}`]?.id;
      if (id) labelIds.set(name, id);
      else {
        planned.unshift({
          kind: 'create-label',
          label: name,
          args: ['label', 'create', name, '--repo', policy.repo],
          display: `gh label create ${name} --repo ${policy.repo}`,
        });
      }
    }
  }

  if (apply) {
    for (const step of planned) {
      if (step.kind === 'add-label') {
        let labelId = labelIds.get(step.label);
        if (!labelId) {
          const read = run(
            'gh',
            [
              'api',
              `repos/${policy.repo}/labels/${step.label}`,
              '--jq',
              '.node_id',
            ],
            { timeout: NETWORK_MS }
          );
          if (read.status !== 0) {
            refuse(`could not look up label ${step.label}: ${ghProblem(read)}`);
          }
          labelId = read.stdout.trim();
          labelIds.set(step.label, labelId);
        }
        const query = `mutation { addLabelsToLabelable(input: { labelableId: "${step.discussionId}", labelIds: ["${labelId}"] }) { clientMutationId } }`;
        const res = run('gh', ['api', 'graphql', '-f', `query=${query}`], {
          timeout: NETWORK_MS,
        });
        if (res.status !== 0) {
          refuse(`failed to add label ${step.label}: ${ghProblem(res)}`);
        }
      } else {
        const res = run('gh', step.args, { timeout: NETWORK_MS });
        if (res.status !== 0) {
          refuse(
            `failed to sync discussion (${step.display}): ${ghProblem(res)}`
          );
        }
      }
    }
  }
  return { commands: planned.map((step) => step.display) };
}

function formatRecordLine(record) {
  if (!record) return 'none';
  const parts = [record.outcome];
  if (record.priority) parts.push(record.priority);
  if (record.scope) parts.push(`scope:${record.scope}`);
  if (record.device) parts.push(`device:${record.device}`);
  if (record.regression) parts.push(`regression:${record.regression}`);
  if (record.owner) parts.push(`owner:${record.owner}`);
  if (record.of) parts.push(`of:#${record.of}`);
  if (record.into) parts.push(`into:${record.into}`);
  if (record.commit) parts.push(`commit:${record.commit.slice(0, 10)}`);
  if (record.retest) parts.push(`retest:${record.retest}`);
  if (record.lean) parts.push(`lean:${record.lean}`);
  if (record.issue) parts.push(`issue:#${record.issue}`);
  if (record.why) parts.push(`why:${record.why}`);
  return `${parts.join(' | ')} (by ${record.who} at ${record.ts})`;
}

function showCommand(policy, options) {
  const numbers = parseIssueNumbers(options.positional, 'show');
  if (numbers.length === 0) usage('show takes one or more issue numbers');
  const remote = canonicalRemote();
  const { files, note } = fetchState(remote, { fallback: true });
  const records = files[policy.stateFile] ?? {};
  const claimsData = policy.isDiscussions
    ? { text: '' }
    : fetchClaims(remote, policy.claimsRef, { fallback: true });
  const claims = policy.isDiscussions
    ? new Map()
    : liveClaims(records, parseClaims(claimsData.text), () => true, policy);
  const discussions = policy.isDiscussions
    ? viewDiscussions(policy.repo, numbers)
    : null;
  const out = [];

  for (const number of numbers) {
    const item = policy.isDiscussions
      ? discussions.get(number)
      : viewIssue(policy.repo, number);
    if (!item) refuse(`gh could not read #${number} from ${policy.repo}`);
    const record = records[number] ?? null;
    const { state, reasons } = stateOf(record, item, policy);
    const claim = claims.get(number) ?? null;
    out.push({ number, item, state, reasons, record, claim });
  }

  if (options.json) {
    console.log(JSON.stringify({ note, items: out }, null, 2));
    return;
  }
  if (note) console.log(`note: ${note}`);
  for (const [
    idx,
    { number, item, state, reasons, record, claim },
  ] of out.entries()) {
    if (idx > 0) console.log('');
    const prefix = policy.isDiscussions
      ? `${DISCUSSIONS}#`
      : issuePrefix(policy);
    console.log(
      `${prefix}${number} ${state}${reasons.length ? ` (${reasons.join('; ')})` : ''}`
    );
    console.log(`title: ${item.title}`);
    console.log(`opened by ${item.author?.login ?? 'unknown'}`);
    if (item.milestone?.title) {
      console.log(`milestone: ${item.milestone.title}`);
    }
    if (item.category?.name) console.log(`category: ${item.category.name}`);
    console.log(`record: ${formatRecordLine(record)}`);
    if (!policy.isDiscussions) {
      console.log(
        `claim: ${claim ? `${claim.actor.who}/${claim.actor.session} since ${claim.since}` : 'none'}`
      );
    }
    if (options.brief) continue;
    console.log('---');
    console.log(unixText(item.body).trim() || '(empty body)');
    const visible = (item.comments ?? []).filter((comment) => !isBot(comment));
    for (const comment of visible) {
      console.log(
        `\n[comment by ${comment.author?.login ?? 'unknown'} at ${comment.createdAt}${isDraft(comment) ? ' (marked)' : ''}]`
      );
      console.log(unixText(comment.body).trim());
    }
  }
}

function queueCommand(policy, options) {
  const remote = canonicalRemote();
  const { files, note } = fetchState(remote, { fallback: true });
  const records = files[policy.stateFile] ?? {};
  const login = ghLogin();
  const isMaintainer = login && policy.maintainers.includes(login);

  if (policy.isDiscussions) {
    if (options.limit !== undefined && !ISSUE_RE.test(options.limit)) {
      usage('--limit takes a positive whole number');
    }
    const listed = openDiscussions(policy.repo, options.category ?? null);
    const recordedNums = listed
      .map((each) => String(each.number))
      .filter((number) => Boolean(records[number]));
    const full =
      recordedNums.length > 0
        ? viewDiscussions(policy.repo, recordedNums)
        : new Map();
    const results = listed.map((each) => {
      const number = String(each.number);
      const { state, reasons } = stateOf(
        records[number],
        full.get(number) ?? null,
        policy
      );
      return {
        issue: number,
        state,
        reasons,
        category: each.category.name,
        title: each.title,
      };
    });
    const waiting = results
      .filter(
        (each) =>
          each.state !== 'current' &&
          (isMaintainer || each.state !== 'unconfirmed')
      )
      .slice(0, Number(options.limit ?? Infinity));
    if (options.json) {
      console.log(JSON.stringify({ note, discussions: waiting }, null, 2));
      return;
    }
    if (note) console.log(`note: ${note}`);
    console.log(
      `${results.length} open discussions${options.category ? ` in ${options.category}` : ''}: ${waiting.length} waiting`
    );
    for (const item of waiting) {
      console.log(
        [
          `${DISCUSSIONS}#${item.issue}`,
          item.state,
          item.reasons.join('; ') || '-',
          item.category,
          item.title,
        ].join('\t')
      );
    }
    return;
  }

  const listed = openIssues(policy.repo, options.label ?? null).filter(
    (issue) => inFocus(policy, issue)
  );
  const results = listed.map((issue) => {
    const number = String(issue.number);
    const record = records[number] ?? null;
    const { state, reasons } = stateOf(record, issue, policy);
    return {
      issue: number,
      state,
      reasons,
      scope: scopeOfRecord(record) ?? '-',
      title: issue.title,
    };
  });
  const waiting = results
    .filter(
      (each) =>
        each.state !== 'current' &&
        (isMaintainer || each.state !== 'unconfirmed')
    )
    .sort(
      (a, b) =>
        STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) ||
        a.scope.localeCompare(b.scope) ||
        Number(a.issue) - Number(b.issue)
    );
  if (options.json) {
    console.log(JSON.stringify({ note, issues: waiting }, null, 2));
    return;
  }
  if (note) console.log(`note: ${note}`);
  const prefix = issuePrefix(policy);
  console.log(
    `${results.length} open issues in ${policy.repo}: ${waiting.length} waiting`
  );
  for (const item of waiting) {
    console.log(
      [
        `${prefix}${item.issue}`,
        item.state,
        item.scope,
        item.reasons.join('; ') || '-',
        item.title,
      ].join('\t')
    );
  }
}

function recordCommand(policy, options) {
  const entries = options.from
    ? parseBatchFile(options.from)
    : (() => {
        const numbers = parseIssueNumbers(options.positional, 'record');
        if (numbers.length !== 1) {
          usage(
            'record takes one issue number with --outcome, or --from <file>'
          );
        }
        return [
          {
            issue: numbers[0],
            outcome: options.outcome,
            priority: options.priority,
            scope: options.scope,
            owner: options.owner,
            device: options.device,
            regression: options.regression,
            of: options.of,
            into: options.into,
            commit: options.commit,
            retest: options.retest,
            proof: options.proof,
            issueTarget: options.issue,
            lean: options.lean,
            detail: options.detail,
            why: options.why,
          },
        ].map(({ issueTarget, ...rest }) => ({
          ...rest,
          ...(issueTarget
            ? {
                detail: [rest.detail, `issue: ${issueTarget}`]
                  .filter(Boolean)
                  .join('; '),
              }
            : {}),
        }));
      })();

  if (entries.length === 0) usage('record received no entries');
  const who = ghLogin();
  if (!who) refuse('gh is not logged in; run gh auth login');
  const remote = canonicalRemote();
  const stageFile = process.env.TRIAGE_STAGE_FILE;

  const { files } = fetchState(remote, { fallback: true });
  const existingMap = files[policy.stateFile] ?? {};
  const ts = new Date().toISOString();
  const built = entries.map((entry) => {
    const { issue, record } = buildRecord(
      entry,
      policy,
      existingMap[
        String(entry.issue ?? '')
          .replace(/^#/u, '')
          .trim()
      ]
    );
    return { issue, record: { ...record, who, ts } };
  });

  if (options['dry-run']) {
    for (const { issue, record } of built) {
      console.log(`dry-run #${issue}: ${formatRecordLine(record)}`);
    }
    return;
  }

  if (stageFile) {
    const lines = built.map(({ issue, record }) =>
      JSON.stringify({ repo: policy.stateKey, issue: Number(issue), record })
    );
    appendFileSync(stageFile, `${lines.join('\n')}\n`);
    for (const { issue, record } of built) {
      console.log(`staged #${issue}: ${formatRecordLine(record)}`);
    }
    return;
  }

  const savedRecords = pushState(remote, policy.stateFile, (current) => {
    const next = { ...current };
    for (const { issue, record } of built) {
      next[issue] = record;
    }
    return {
      next,
      changed: true,
      summary: {
        records: next,
        commitMessage: `triage(${policy.stateKey}): record ${built.map(({ issue }) => `#${issue}`).join(', ')}`,
      },
    };
  }).records;

  for (const { issue, record } of built) {
    console.log(`recorded #${issue}: ${formatRecordLine(record)}`);
  }

  if (options['no-sync']) return;

  const targetIssues = built.map(({ issue }) => issue);
  if (policy.isDiscussions) {
    const discussions = [
      ...viewDiscussions(policy.repo, targetIssues).values(),
    ].filter(Boolean);
    syncDiscussionsGitHub(policy, savedRecords, discussions, { apply: true });
  } else {
    const fetched = targetIssues
      .map((number) => viewIssue(policy.repo, number))
      .filter((issue) => issue && issue.state === 'OPEN');
    if (fetched.length > 0) {
      syncIssuesGitHub(policy, savedRecords, fetched, { apply: true });
    }
  }
}

function labelsCommand(repoArg, options) {
  if (repoArg === null) {
    for (const repo of localConfig().triage.repos) {
      const args = [
        fileURLToPath(import.meta.url),
        'labels',
        '--repo',
        repoNameOf(repo),
        ...(options.apply ? ['--apply'] : []),
      ];
      const { status } = spawnSync(process.execPath, args, {
        stdio: 'inherit',
      });
      if (status !== 0) process.exit(status ?? 1);
    }
    return;
  }
  const policy = loadPolicy(repoArg);
  const remote = canonicalRemote();
  const { files } = fetchState(remote, { fallback: false });
  const records = files[policy.stateFile] ?? {};
  const filterIssues = options.issue
    ? new Set(
        String(options.issue)
          .split(',')
          .map((value) => value.replace(/^#/u, '').trim())
          .filter(Boolean)
      )
    : null;

  if (policy.isDiscussions) {
    const listed = openDiscussions(policy.repo).filter(
      (each) => !filterIssues || filterIssues.has(String(each.number))
    );
    const { commands } = syncDiscussionsGitHub(policy, records, listed, {
      apply: Boolean(options.apply),
    });
    if (!options.apply && commands.length > 0) console.log(commands.join('\n'));
    return;
  }

  const listed = openIssues(policy.repo).filter(
    (issue) =>
      inFocus(policy, issue) &&
      (!filterIssues || filterIssues.has(String(issue.number)))
  );
  const { commands } = syncIssuesGitHub(policy, records, listed, {
    apply: Boolean(options.apply),
  });
  if (!options.apply && commands.length > 0) console.log(commands.join('\n'));
}

function markCommand(options) {
  const [filePath, extra] = options.positional;
  if (!filePath || extra !== undefined) {
    usage('mark takes one draft file path');
  }
  if (!existsSync(filePath)) usage(`draft file not found: ${filePath}`);
  console.log(marked(readFileSync(filePath, 'utf-8')));
}

function shippedCommand(repoArg, options) {
  const [version, extra] = options.positional;
  if (!BETA_RELEASE_RE.test(version ?? '') || extra !== undefined) {
    usage('shipped takes one published beta version, such as 54.0.0-beta.3');
  }
  const repo = localConfig().triage.repos[0];
  const primary = repoNameOf(repo);
  if (repoArg !== null && repoArg !== primary) {
    usage(
      `shipped closes ${primary} issues only, because ${repoArg} issues close on a passing retest`
    );
  }
  process.exitCode = closeReleasedIssues(
    [
      '--version',
      version,
      '--repo',
      repo,
      ...(options['dry-run'] ? ['--dry-run'] : []),
    ],
    { cwd: root }
  );
}

function deployedCommit(policy) {
  const result = run(
    'gh',
    [
      'run',
      'list',
      '--repo',
      policy.first,
      '--workflow',
      'deploy.yml',
      '--branch',
      BRANCH,
      '--status',
      'success',
      '--limit',
      '1',
      '--json',
      'headSha',
    ],
    { timeout: NETWORK_MS }
  );
  if (result.status !== 0) {
    refuse(
      `gh could not read deploy.yml on ${policy.first}: ${ghProblem(result)}`
    );
  }
  const sha = readJson(result.stdout)?.[0]?.headSha;
  if (!sha) {
    refuse(`no successful deploy.yml run found on ${policy.first} ${BRANCH}`);
  }
  return sha;
}

function retestCommand(policy, options) {
  const verdicts = Object.keys(RETEST_VERDICTS).filter((name) => options[name]);
  if (
    options.positional.length !== 1 ||
    verdicts.length !== 1 ||
    !options.on?.trim()
  ) {
    usage(
      'retest takes one issue, exactly one of --pass or --fail, and --on "<browser/device>"'
    );
  }
  if (options.device !== undefined && !DEVICES.includes(options.device)) {
    usage(`--device must be one of ${DEVICES.join(', ')}`);
  }
  const [verdictName] = verdicts;
  const verdict = RETEST_VERDICTS[verdictName];
  const [issue] = parseIssueNumbers(options.positional, 'retest');
  const found = [
    ...new Set(
      (options.found ? String(options.found).split(/,\s*/u) : [])
        .map((val) => val.replace(/^#/u, '').trim())
        .filter(Boolean)
    ),
  ];
  for (const num of found) {
    if (!ISSUE_RE.test(num) || num === issue) {
      usage(
        `--found takes other open issue numbers, not ${JSON.stringify(num)}`
      );
    }
  }
  if (found.length > 0 && policy.primary) {
    refuse(
      `comments on ${policy.repo} are public; open new bugs in plate-private instead of passing --found here`
    );
  }
  const login = ghLogin();
  if (!login) refuse('gh is not logged in; run gh auth login');
  if (!policy.team.includes(login)) {
    refuse(`${login} is not on the team in ${CONFIG}`);
  }
  const remote = canonicalRemote();
  const { files } = fetchState(remote, { fallback: false });
  const records = files[policy.stateFile] ?? {};
  const record = records[issue];
  if (!record || record.outcome !== 'fixed') {
    refuse(
      `#${issue} has outcome ${record?.outcome ?? 'untriaged'}; only a fixed issue can be retested`
    );
  }
  const current = viewIssue(policy.repo, issue);
  if (!current) refuse(`gh could not read #${issue} from ${policy.repo}`);
  const fix = gitOut(
    'rev-parse',
    '--verify',
    '--quiet',
    `${record.commit}^{commit}`
  )?.trim();
  if (!fix) {
    refuse(
      `fix commit ${record.commit} is not in this clone; fetch ${remote}/${BRANCH} first`
    );
  }
  const deployed = deployedCommit(policy);
  if (run('git', ['merge-base', '--is-ancestor', fix, deployed]).status !== 0) {
    refuse(
      `beta runs ${deployed.slice(0, 10)}, which does not include fix ${fix.slice(0, 10)}`
    );
  }
  const devices = devicesOfRecord(record);
  if (devices.length > 0 && !devices.includes(options.device)) {
    refuse(
      `#${issue} requires testing on ${devices.join(' or ')}; pass --device`
    );
  }
  const platform =
    verdictName === 'pass'
      ? (platformDevices(policy.repo, [issue]).get(issue) ?? [])
      : [];
  if (platform.length > 0 && !platform.includes(options.device)) {
    refuse(
      `#${issue}'s ${PLATFORM_FIELD} field lists ${platform.join(' and ')}; pass --device for a passing retest`
    );
  }
  for (const num of found) {
    const other = viewIssue(policy.repo, num);
    if (other?.state !== 'OPEN') {
      refuse(`#${num} is not an open issue in ${policy.repo}`);
    }
  }

  const text = [
    `Retest ${verdict.verb} on ${BETA}, which holds the fix ${fix.slice(0, 10)}, in ${options.on.trim()}${options.device ? ` on ${options.device}` : ''}.`,
    unixText(options.note).trim(),
    found.length > 0 &&
      `New bugs found while retesting: ${found.map((num) => `#${num}`).join(', ')}.`,
    `<!-- triage-retest:${verdictName}:${record.ts} -->`,
  ]
    .filter(Boolean)
    .join('\n\n');
  const body = verdict.closes ? marked(text) : text;

  if (current.state !== 'OPEN') {
    refuse(`#${issue} is closed; reopen it first if the bug returned`);
  }
  if (options['dry-run']) {
    console.log(body);
    return;
  }

  const posted = run(
    'gh',
    ['issue', 'comment', issue, '--repo', policy.repo, '--body-file', '-'],
    { input: body, timeout: NETWORK_MS }
  );
  if (posted.status !== 0) {
    refuse(`gh could not post the retest comment: ${ghProblem(posted)}`);
  }
  console.log(`commented ${posted.stdout.trim()}`);

  if (verdict.closes) {
    const closed = run(
      'gh',
      ['issue', 'close', issue, '--repo', policy.repo, '--reason', 'completed'],
      { timeout: NETWORK_MS }
    );
    if (closed.status !== 0) {
      refuse(
        `comment posted, but gh could not close #${issue}: ${ghProblem(closed)}`
      );
    }
    console.log(`closed #${issue} in ${policy.repo} as completed`);
    return;
  }

  const updatedRecords = pushState(remote, policy.stateFile, (stateMap) => {
    const next = { ...stateMap };
    const prev = next[issue];
    const restored = prev?.kind ?? {};
    next[issue] = {
      outcome: 'kind',
      priority: restored.priority ?? 'P1',
      scope: restored.scope ?? 'unknown',
      ...(restored.owner ? { owner: restored.owner } : {}),
      ...(restored.device ? { device: restored.device } : {}),
      ...(restored.regression ? { regression: restored.regression } : {}),
      why: `Retest failed on ${options.on.trim()}${options.note ? `: ${options.note.trim()}` : ''}`,
      who: login,
      ts: new Date().toISOString(),
      retestFailed: true,
    };
    return {
      next,
      changed: true,
      summary: {
        records: next,
        commitMessage: `triage(${policy.stateKey}): retest failed #${issue}`,
      },
    };
  }).records;

  syncIssuesGitHub(policy, updatedRecords, [current], { apply: true });
  console.log(
    `left #${issue} open; reverted to kind (retest-failed) so it returns to the fix queue`
  );
}

const holdText = (hold) =>
  `  ${hold.key}${hold.who ? ` by ${hold.who}` : ''}, since ${hold.since ?? 'unknown'}${hold.stale ? ', stale' : ''}`;

function claimCommand(repoArg, options) {
  const issues = parseIssueNumbers(options.positional, 'claim');
  const forms = [
    issues.length > 0,
    options.domain !== undefined,
    options.next === true,
  ].filter(Boolean).length;
  if (forms !== 1) {
    usage('claim takes issue numbers, --domain <scope>, or --next');
  }
  if (options.domain !== undefined && !SCOPE_RE.test(options.domain)) {
    usage(
      `--domain takes a scope slug such as editing, not ${JSON.stringify(options.domain)}`
    );
  }
  if (options.drives !== undefined && !DEVICES.includes(options.drives)) {
    usage(`--drives takes one of ${DEVICES.join(', ')}`);
  }
  const take = (options.take ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
  if (take.length > 0 && !options.why?.trim()) {
    usage("--take needs --why with the owner's words");
  }
  if (issues.length === 0 && repoArg === null) {
    usage('--domain and --next require --repo <name>');
  }
  if (take.length > 0 && options.next) {
    usage('--next takes no --take; name the issues or domain to take over');
  }
  if (options.why !== undefined && take.length === 0) {
    usage('--why goes with --take');
  }
  if (/[\t\n]/u.test(options.why ?? '')) usage('--why holds a tab or newline');

  const policy = loadPolicy(repoArg);
  if (policy.isDiscussions) usage('claim does not apply to discussions');
  const remote = canonicalRemote();
  const { files } = fetchState(remote, { fallback: false });
  const records = files[policy.stateFile] ?? {};
  const actor = actorOf(options);
  const open = openMap(openIssues(policy.repo));

  if (options.next) {
    const untriaged = [...open]
      .filter(
        ([issue, { milestone }]) =>
          !mainReport(policy, milestone) && !records[issue]
      )
      .map(([issue]) => `${issuePrefix(policy)}${issue}`);
    if (untriaged.length > 0) {
      console.error(
        `warning: skipping ${untriaged.length} untriaged issue(s): ${untriaged.join(' ')}`
      );
    }
  }

  const target =
    issues.length > 0
      ? { issues }
      : options.next
        ? null
        : { domain: options.domain };
  const request = { target, take, drives: options.drives ?? null };
  const scan = claimWorld(policy, records, open, [], new Map(), actor);
  const members = [
    ...new Set(
      (target ? [target] : nextTargets(scan)).flatMap(
        (each) => targetMembers(each, scan).members
      )
    ),
  ];
  const readGitHub = () =>
    liveSignals(
      policy.repo,
      members.filter((issue) => open.has(issue))
    );
  let live = readGitHub();
  const nameOf = (chosen) =>
    issues.length > 0
      ? issues.map((issue) => `#${issue}`).join(' ')
      : [
          options.next && '--next',
          chosen?.domain && `--domain ${chosen.domain}`,
        ]
          .filter(Boolean)
          .join(' ');
  let named = nameOf(target);

  const decision = pushClaims(remote, policy.claimsRef, (text, attempt) => {
    if (attempt > 0) live = readGitHub();
    const world = claimWorld(
      policy,
      records,
      open,
      parseClaims(text),
      live,
      actor
    );
    const result = target ? decide(request, world) : decideNext(request, world);
    if (result.refusal) refuse(result.refusal);
    named = nameOf(result.target ?? target);
    const start = Date.now();
    const written = result.writes.map((write, at) =>
      claimLine({
        ...write,
        ts: new Date(start + at).toISOString(),
        who: actor.who,
        session: actor.session,
        transcript: actor.transcript,
        why: options.why ?? `claim ${named}`,
      })
    );
    return { lines: written, result };
  });

  console.log(`actor: ${actor.who}, session ${actor.session}`);
  if (options.next) {
    console.log(
      decision.target
        ? `next: --domain ${decision.target.domain}, top kind is ${decision.kinds[0].priority} ${decision.kinds[0].regression ? 'regression' : 'new bug'}`
        : 'next: no domain has a claimable kind'
    );
  }
  console.log(
    `group: ${decision.members.map((issue) => `#${issue}`).join(' ') || 'none'}`
  );
  for (const result of decision.results) {
    const at = `#${result.issue}`;
    if (result.verdict === 'claim') console.log(`${at} claimed`);
    if (result.verdict === 'mine') console.log(`${at} yours already`);
    if (result.verdict === 'take') {
      console.log(
        `${at} taken over ${result.taken.map((hold) => hold.key).join(', ')}`
      );
    }
    if (result.verdict === 'held') {
      console.log(`held ${at}:`);
      for (const hold of result.holds) console.log(holdText(hold));
    }
    if (result.verdict === 'follows') {
      console.log(
        `skipped ${at}: grouped with #${result.blocker.issue} (${result.blocker.verdict})`
      );
    }
    if (result.verdict === 'device') {
      console.log(
        `skipped ${at}: device lane (${result.devices.join(', ')}); pass --drives ${result.devices[0]}`
      );
    }
    if (result.verdict === 'desktop') {
      console.log(`skipped ${at}: desktop issue; claim without --drives`);
    }
    if (result.verdict === 'outside') {
      console.log(`skipped ${at}: outside target`);
    }
    if (result.verdict === 'closed') console.log(`skipped ${at}: closed`);
    if (result.verdict === 'main') console.log(`skipped ${at}: main report`);
    if (result.verdict === 'fixed') console.log(`skipped ${at}: already fixed`);
  }

  if (decision.exit === 1) {
    console.log('nothing claimed');
    process.exitCode = 1;
    return;
  }

  const unassigned = decision.held.filter(
    (issue) =>
      !live
        .get(issue)
        ?.assignees.some((assignee) => assignee.login === actor.who)
  );
  for (const issue of unassigned) {
    run(
      'gh',
      ['issue', 'edit', issue, '--repo', policy.repo, '--add-assignee', '@me'],
      { timeout: NETWORK_MS }
    );
  }
  const back =
    unassigned.length > 0 ? liveSignals(policy.repo, unassigned) : new Map();
  const missing = unassigned.filter(
    (issue) =>
      !back
        .get(issue)
        ?.assignees.some((assignee) => assignee.login === actor.who)
  );
  if (unassigned.length > missing.length) {
    console.log(
      `assigned ${actor.who} on ${unassigned
        .filter((issue) => !missing.includes(issue))
        .map((issue) => `#${issue}`)
        .join(' ')}`
    );
  }
  if (missing.length > 0) {
    console.log(
      `GitHub did not assign ${actor.who} on ${missing.map((issue) => `#${issue}`).join(' ')}; claim stands, rerun to retry`
    );
    process.exitCode = 1;
  }
}

function releaseCommand(policy, options) {
  const issues = parseIssueNumbers(options.positional, 'release');
  if (issues.length === 0) usage('release takes one or more issue numbers');
  if (!options.why?.trim()) usage('release needs --why');
  if (/[\t\n]/u.test(options.why)) usage('--why holds a tab or newline');
  const remote = canonicalRemote();
  const { files } = fetchState(remote, { fallback: false });
  const records = files[policy.stateFile] ?? {};
  const actor = actorOf(options);
  const open = openMap(openIssues(policy.repo));

  const { claims, released } = pushClaims(remote, policy.claimsRef, (text) => {
    const live = liveClaims(
      records,
      parseClaims(text),
      (issue) => open.has(issue),
      policy
    );
    const theirs = issues.filter(
      (issue) =>
        live.has(issue) &&
        !sameActor(live.get(issue).actor, actor) &&
        !policy.maintainers.includes(actor.who)
    );
    if (theirs.length > 0) {
      refuse(
        `${theirs.map((issue) => `#${issue} is held by ${live.get(issue).actor.who}/${live.get(issue).actor.session}`).join('; ')}; only that session or ${policy.maintainersText} can release`
      );
    }
    const held = issues.filter((issue) => live.has(issue));
    const start = Date.now();
    return {
      lines: held.map((issue, at) =>
        claimLine({
          ts: new Date(start + at).toISOString(),
          issue,
          move: 'release',
          who: actor.who,
          session: actor.session,
          transcript: actor.transcript,
          task: live.get(issue).task,
          drives: null,
          over: [],
          why: options.why,
        })
      ),
      result: { claims: live, released: held },
    };
  });

  for (const issue of issues) {
    if (!released.includes(issue)) {
      console.log(`#${issue} has no live claim`);
      continue;
    }
    const { who } = claims.get(issue).actor;
    console.log(`#${issue} released`);
    if (!open.get(issue)?.assignees.includes(who)) continue;
    if (who === actor.who) {
      const res = run(
        'gh',
        [
          'issue',
          'edit',
          issue,
          '--repo',
          policy.repo,
          '--remove-assignee',
          '@me',
        ],
        { timeout: NETWORK_MS }
      );
      if (res.status === 0) console.log(`  unassigned ${who}`);
    }
  }
}

function laneCommand(policy, options) {
  const [device, extra] = options.positional;
  if (extra || (device !== undefined && !DEVICES.includes(device))) {
    usage(`lane takes one device of ${DEVICES.join(', ')}, or none`);
  }
  const remote = canonicalRemote();
  const { files, note } = fetchState(remote, { fallback: true });
  const records = files[policy.stateFile] ?? {};
  const claimsData = fetchClaims(remote, policy.claimsRef, { fallback: true });
  const open = openMap(openIssues(policy.repo));
  const claims = liveClaims(
    records,
    parseClaims(claimsData.text),
    (issue) => open.has(issue),
    policy
  );
  const self = ghLogin();
  const entries = [...open].flatMap(([issue, { title, assignees }]) => {
    const head = toClaimHead(records[issue]);
    const devices = devicesOf(head);
    if (devices.length === 0 || (device && !devices.includes(device))) {
      return [];
    }
    const claim = claims.get(issue);
    return [
      {
        issue,
        priority: head.fields.get('priority'),
        line: [
          `#${issue}`,
          head.fields.get('priority'),
          head.fields.get('scope'),
          devices.join(','),
          claim
            ? `${claim.actor.who}/${claim.actor.session}`
            : othersOf(assignees, self).join(',') || 'free',
          title,
        ].join('\t'),
      },
    ];
  });
  entries.sort(
    (a, b) =>
      PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority) ||
      Number(a.issue) - Number(b.issue)
  );
  if (note) console.log(`note: ${note}`);
  if (entries.length === 0) {
    console.log(`no open kind needs ${device ?? 'a device'}`);
  }
  for (const entry of entries) console.log(entry.line);
}

function collectStatusOrKinds(repoArg, mode) {
  const repos =
    repoArg === null ? localConfig().triage.repos.map(repoNameOf) : [repoArg];
  const remote = canonicalRemote();
  const { files, note } = fetchState(remote, { fallback: true });
  const notes = note ? [note] : [];
  const self = ghLogin();
  const unfixed = [];
  const claimed = [];
  const retest = [];
  const kindsList = [];
  const summaries = [];

  for (const name of repos) {
    const policy = loadPolicy(name);
    const records = files[policy.stateFile] ?? {};
    const claimsData = fetchClaims(remote, policy.claimsRef, {
      fallback: true,
    });
    if (claimsData.note) notes.push(`${name}: ${claimsData.note}`);
    const listed = openIssues(policy.repo);
    const focus = listed.filter((issue) => inFocus(policy, issue));
    const open = openMap(focus);
    const claims = liveClaims(
      records,
      parseClaims(claimsData.text),
      (issue) => open.has(issue),
      policy
    );
    const prefix = issuePrefix(policy);

    if (mode === 'status') {
      for (const [issue, { title, assignees }] of [...open].sort(
        ([a], [b]) => Number(a) - Number(b)
      )) {
        const record = records[issue] ?? null;
        const ref = `${prefix}${issue}`;
        const scope = scopeOfRecord(record) ?? '-';
        const priority = priorityOfRecord(record) ?? '-';
        if (record && CLOSED_BY_BETA.has(record.outcome)) {
          retest.push({
            commit: record.commit ?? null,
            issue: ref,
            outcome: record.outcome,
            scope,
            title,
          });
          continue;
        }
        const claim = claims.get(issue);
        const holder =
          (claim && `${claim.actor.who}/${claim.actor.session}`) ||
          assignees.join(',') ||
          null;
        if (holder) {
          claimed.push({ holder, issue: ref, priority, scope, title });
        } else {
          unfixed.push({
            issue: ref,
            outcome: record?.outcome ?? 'untriaged',
            priority,
            scope,
            title,
          });
        }
      }
    } else {
      const counts = new Map();
      const waiting = [];
      for (const issue of focus) {
        const number = String(issue.number);
        const record = records[number] ?? null;
        const { state, reasons } = stateOf(record, issue, policy);
        const label = record?.outcome ?? state;
        counts.set(label, (counts.get(label) ?? 0) + 1);
        if (state !== 'current') {
          waiting.push(
            `${prefix}${number}\t${state}\t${reasons.join('; ') || '-'}\t${issue.title}`
          );
        }
      }
      summaries.push({
        repo: name,
        count: focus.length,
        outside: listed.length - focus.length,
        counts: [...counts].sort(
          (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
        ),
        waiting,
      });
      for (const [issue, { title, assignees, milestone }] of [...open].sort(
        ([a], [b]) => Number(a) - Number(b)
      )) {
        const head = toClaimHead(records[issue]);
        if (head?.outcome !== 'kind') continue;
        const claim = claims.get(issue);
        const devices = devicesOf(head);
        const route =
          (claim && `${claim.actor.who}/${claim.actor.session}`) ||
          othersOf(assignees, self).join(',') ||
          (devices.length > 0 && 'lane') ||
          (mainReport(policy, milestone) && 'main') ||
          'free';
        kindsList.push({
          issue: `${prefix}${issue}`,
          ...rankOf(head),
          scope: head.fields.get('scope'),
          devices,
          route,
          title,
        });
      }
    }
  }
  kindsList.sort(byRegressionThenPriority);
  return { notes, unfixed, claimed, retest, kinds: kindsList, open: summaries };
}

function statusCommand(repoArg, options) {
  if (options.positional.length > 0) usage('status takes no issue numbers');
  const { notes, unfixed, claimed, retest } = collectStatusOrKinds(
    repoArg,
    'status'
  );
  if (options.json) {
    console.log(JSON.stringify({ notes, unfixed, claimed, retest }, null, 2));
    return;
  }
  for (const note of notes) console.log(`note: ${note}`);
  console.log(`unfixed (${unfixed.length}):`);
  for (const item of unfixed) {
    console.log(
      `  ${[item.issue, item.priority, item.scope, item.outcome, item.title].join('\t')}`
    );
  }
  console.log(`claimed (${claimed.length}):`);
  for (const item of claimed) {
    console.log(
      `  ${[item.issue, item.priority, item.scope, item.holder, item.title].join('\t')}`
    );
  }
  console.log(`ready to retest on beta (${retest.length}):`);
  for (const item of retest) {
    console.log(
      `  ${[item.issue, item.commit ? item.commit.slice(0, 10) : '-', item.scope, item.title].join('\t')}`
    );
  }
}

function kindsCommand(repoArg, options) {
  if (options.positional.length > 0) usage('kinds takes no issue numbers');
  const { notes, kinds, open } = collectStatusOrKinds(repoArg, 'kinds');
  if (options.json) {
    console.log(JSON.stringify({ notes, kinds, open }, null, 2));
    return;
  }
  for (const note of notes) console.log(`note: ${note}`);
  const waiting = open.flatMap((repo) => repo.waiting);
  if (waiting.length > 0) {
    console.log(`waiting (${waiting.length}):`);
    for (const line of waiting) console.log(`  ${line}`);
  }
  if (kinds.length === 0) console.log('no open kind');
  for (const entry of kinds) {
    console.log(
      [
        entry.issue,
        entry.regression ? `${entry.priority} regression` : entry.priority,
        entry.scope,
        entry.devices.join(',') || '-',
        entry.route,
        entry.title,
      ].join('\t')
    );
  }
  for (const { repo, count, counts, outside } of open) {
    console.log(
      [
        `${repo}: ${count} open issues`,
        ...counts.map(([outcome, n]) => `${n} ${outcome}`),
        ...(outside > 0 ? [`${outside} main reports outside focus`] : []),
      ].join(', ')
    );
  }
}

function featuresCommand(policy) {
  const remote = canonicalRemote();
  const { files, note } = fetchState(remote, { fallback: true });
  const records = files[policy.stateFile] ?? {};
  const found = openDiscussions(policy.repo).flatMap((listed) => {
    const rec = records[String(listed.number)];
    if (rec?.outcome !== 'feature') return [];
    return [
      {
        number: listed.number,
        priority: rec.priority,
        lean: rec.lean,
        title: listed.title,
      },
    ];
  });
  found.sort(
    (a, b) =>
      PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority) ||
      LEANS.indexOf(a.lean) - LEANS.indexOf(b.lean)
  );
  if (note) console.log(`note: ${note}`);
  for (const each of found) {
    console.log(
      [
        `${DISCUSSIONS}#${each.number}`,
        each.priority,
        each.lean,
        each.title,
      ].join('\t')
    );
  }
}

function checkCommand() {
  const problems = policyProblems(localConfig());
  if (problems.length > 0) {
    refuse(problems.join('\n'));
  }
  console.log('triage policy ok');
}

const VALUE_OPTIONS = new Set([
  'repo',
  'label',
  'category',
  'limit',
  'outcome',
  'priority',
  'scope',
  'owner',
  'device',
  'regression',
  'of',
  'into',
  'commit',
  'retest',
  'proof',
  'issue',
  'lean',
  'detail',
  'why',
  'from',
  'domain',
  'take',
  'drives',
  'session',
  'on',
  'found',
  'note',
]);
const BOOL_OPTIONS = new Set([
  'brief',
  'json',
  'dry-run',
  'no-sync',
  'apply',
  'next',
  'pass',
  'fail',
  'help',
]);

function parseArgs(argv) {
  const options = { positional: [] };
  let inferredRepo = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      options.help = true;
      continue;
    }
    if (arg.startsWith('--')) {
      const raw = arg.slice(2);
      if (raw.endsWith('-file') && VALUE_OPTIONS.has(raw.slice(0, -5))) {
        const key = raw.slice(0, -5);
        i += 1;
        const filePath = argv[i];
        if (!filePath || !existsSync(filePath)) {
          usage(`--${raw} file not found: ${filePath ?? ''}`);
        }
        options[key] = readFileSync(filePath, 'utf-8');
        continue;
      }
      if (BOOL_OPTIONS.has(raw)) {
        options[raw] = true;
        continue;
      }
      if (VALUE_OPTIONS.has(raw)) {
        i += 1;
        const val = argv[i];
        if (val === undefined) usage(`--${raw} requires a value`);
        options[raw] = val;
        continue;
      }
      usage(`unknown flag ${arg}`);
    }
    const prefixed = /^([a-z0-9-]+)#([1-9]\d*)$/u.exec(arg);
    if (prefixed) {
      if (inferredRepo && inferredRepo !== prefixed[1]) {
        usage('cannot mix repositories in one command');
      }
      inferredRepo = prefixed[1];
      options.positional.push(prefixed[2]);
    } else {
      options.positional.push(arg);
    }
  }
  if (options.repo && inferredRepo && options.repo !== inferredRepo) {
    usage(`--repo ${options.repo} conflicts with ${inferredRepo}#...`);
  }
  return { options, repoArg: options.repo ?? inferredRepo ?? null };
}

function parseIssueNumbers(values, cmd) {
  return values.map((val) => {
    const num = String(val).replace(/^#/u, '').trim();
    if (!ISSUE_RE.test(num)) {
      usage(`${cmd} expects issue numbers, not ${JSON.stringify(val)}`);
    }
    return num;
  });
}

const HELP = `Usage: pnpm triage <command> [args] [flags]

Commands:
  show <N>... [--brief] [--json]               Show issue/discussion details and triage record
  queue [--label L | --category C] [--json]    List untriaged, stale, or unconfirmed items
  record <N> --outcome <o> [fields] [--why]    Record triage to refs/triage/state and sync GitHub
  record --from <file.json|tsv> [--dry-run]    Batch record triage entries
  labels [--repo R] [--issue N,...] [--apply]  Print (or --apply) GitHub field/label/milestone sync
  claim <N>... | --domain <S> | --next         Atomically claim issues on refs/triage/claims
  release <N>... --why "<reason>"              Release claimed issues
  lane [ios|android|ime]                       List open device-lane kinds
  kinds [--repo R] [--json]                    List open kinds ranked by regression and priority
  status [--repo R] [--json]                   Show unfixed, claimed, and ready-to-retest buckets
  retest <N> --pass|--fail --on "<env>"        Record beta retest result and close or reopen queue
  mark <draft.md>                              Append triage hash marker to a comment draft
  shipped <X.Y.Z-beta.N> [--dry-run]           Close released public issues on beta publish
  features --repo discussions                  Rank open feature discussions
  check                                        Validate triage policy in .agents/pstack.json`;

function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === '-h' || command === '--help') {
    console.log(HELP);
    return;
  }
  const { options, repoArg } = parseArgs(rest);
  if (options.help) {
    console.log(HELP);
    return;
  }
  switch (command) {
    case 'show': {
      showCommand(loadPolicy(repoArg), options);
      break;
    }
    case 'queue': {
      queueCommand(loadPolicy(repoArg), options);
      break;
    }
    case 'record': {
      recordCommand(loadPolicy(repoArg), options);
      break;
    }
    case 'labels': {
      labelsCommand(repoArg, options);
      break;
    }
    case 'claim': {
      claimCommand(repoArg, options);
      break;
    }
    case 'release': {
      releaseCommand(loadPolicy(repoArg), options);
      break;
    }
    case 'lane': {
      laneCommand(loadPolicy(repoArg), options);
      break;
    }
    case 'kinds': {
      kindsCommand(repoArg, options);
      break;
    }
    case 'status': {
      statusCommand(repoArg, options);
      break;
    }
    case 'retest': {
      retestCommand(loadPolicy(repoArg), options);
      break;
    }
    case 'mark': {
      markCommand(options);
      break;
    }
    case 'shipped': {
      shippedCommand(repoArg, options);
      break;
    }
    case 'features': {
      featuresCommand(loadPolicy(repoArg ?? DISCUSSIONS));
      break;
    }
    case 'check': {
      checkCommand();
      break;
    }
    default: {
      usage(
        `unknown command ${JSON.stringify(command)}; run pnpm triage --help`
      );
    }
  }
}

try {
  main();
} catch (error) {
  if (error instanceof UsageError) {
    console.error(`triage: ${error.message}`);
    process.exit(2);
  }
  if (error instanceof RefusalError) {
    console.error(`triage: ${error.message}`);
    process.exit(1);
  }
  throw error;
}
