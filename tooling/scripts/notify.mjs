#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { LAND_CHECK } from '../../.agents/pstack/proof.mjs';
import { findings } from '../../.agents/pstack/writing-check.mjs';
import {
  changedSince,
  run as gitAt,
  isSplit,
  landingPair,
  PRIVATE_DIR,
  privateGit,
  showAt,
  untrackedFiles,
  UPSTREAM,
} from './private-files.mjs';

const USAGE =
  'usage: notify send --to <login|dev|channel> [--file <png|jpg|gif|mp4|webm>]... [--no-media <reason>] <text...> | notify team <revision-range> | notify check';
export const DAY = 24 * 60 * 60 * 1000;
const MAX_SHOT_AGE = 2 * 60 * 60 * 1000;
const LIMIT = 2000;
const MAX_FILES = 4;
// Discord's default limits since 2026-09-03: 20 MiB per file, 25 MiB per message request.
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_MESSAGE_BYTES = 25 * 1024 * 1024;
const MEDIA = /\.(png|jpe?g|gif|mp4|webm)$/iu;
const TOKEN_FILE = join(homedir(), '.claude', 'channels', 'discord', '.env');

const fail = (code, message) => {
  console.error(message);
  process.exit(code);
};

const readProject = () =>
  JSON.parse(
    readFileSync(new URL('../../.agents/pstack.json', import.meta.url), 'utf-8')
  );

const readConfig = () => {
  const { notify, team } = readProject();
  return { ...notify, team };
};

const SHELL =
  /^(?:pnpm|npm|npx|node|bun|bunx|yarn|git|gh|claude|codex|curl|brew|cd|export|sh|bash|zsh|python3?|pip3?)(?:\s|$)|&&|\|\|/u;

const commandSpans = (text) =>
  [...text.matchAll(/`([^`\n]+)`/gu)]
    .map(([, span]) => span.trim())
    .filter((span) => SHELL.test(span));

const BETA = 'https://beta.platejs.org/';
const BETA_URL = /https:\/\/beta\.platejs\.org\/[^\s)>\]"'`]*/u;
const VISUAL_PATH =
  /^(?:apps\/(?:www|plite)\/src\/|packages\/(?:platejs\/src\/react|plitejs\/src\/(?:react|pagination))\/)/u;
const NON_VISUAL_PATH =
  /\.(?:spec|test)\.[^/]+$|(?:^|\/)(?:__tests__|generated|__registry__)\/|\.(?:mdx?)$/iu;

export const isVisualPath = (file) =>
  VISUAL_PATH.test(file) && !NON_VISUAL_PATH.test(file);

const requiresMedia = ({ commitFiles = [], text }) => {
  const triggers = [];
  const betaUrl = BETA_URL.exec(text)?.[0].replace(/[.,;:!?]+$/u, '');
  if (betaUrl) triggers.push(betaUrl);
  for (const { files, label } of commitFiles) {
    if (files.some(isVisualPath) && !triggers.includes(label)) {
      triggers.push(label);
    }
  }
  return triggers;
};

const unlinkedPage = (text) =>
  /\b(?:demos?|docs pages?)\b/iu.test(text) && !text.includes(BETA);
const PAGE_FIX = `link each page it names on ${BETA}, such as ${BETA}blocks/field-demo, and say clip when it means a clip, not a page`;

const gitDirs = () => {
  const { companion } = readProject();
  return [
    [],
    ...(existsSync(companion.dir)
      ? [[`--git-dir=${companion.dir}`, '--work-tree=.']]
      : []),
  ];
};

const git = (dir, args) =>
  spawnSync('git', [...dir, ...args], { encoding: 'utf-8' }).stdout.trim();

const commitLink = (repo, sha, text) =>
  `[${text}](<https://github.com/${repo}/commit/${sha}>)`;

const CODE_SPAN_LINK_OR_URL =
  /`[^`\n]*`|\[[^\]\n]*\]\([^)\n]*\)|<?https?:\/\/[^\s>]+>?/u;
const HEX_WORD = /(?<![\w./#-])[0-9a-f]{7,40}(?![\w/-]|\.\w)/u;
const MENTION = new RegExp(
  `(${CODE_SPAN_LINK_OR_URL.source})|(${HEX_WORD.source})`,
  'gu'
);
const namesCommit = (word) => /[a-f]/u.test(word);

const originRepo = (dir) =>
  /github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/u.exec(
    git(dir, ['remote', 'get-url', 'origin'])
  )?.[1];

const COMMIT_URL_HASH = /\/commit\/([0-9a-f]{7,40})(?![0-9a-f])/giu;

const linkCommits = (text) => {
  const repos = gitDirs().flatMap((dir) => {
    const repo = originRepo(dir);
    return repo ? [{ dir, repo }] : [];
  });
  const missing = [];
  const commits = [];
  const seen = new Set();
  const remember = (dir, sha, label) => {
    const key = `${dir.join(' ')}:${sha}`;
    if (seen.has(key)) return;
    seen.add(key);
    commits.push({ dir, label, sha });
  };
  const linked = text.replace(MENTION, (whole, kept, hash) => {
    if (kept) {
      if (!kept.startsWith('`')) {
        for (const [, urlHash] of kept.matchAll(COMMIT_URL_HASH)) {
          for (const { dir } of repos) {
            const sha = git(dir, [
              'rev-parse',
              '--verify',
              '--quiet',
              `${urlHash}^{commit}`,
            ]);
            if (sha) {
              remember(dir, sha, urlHash);
              break;
            }
          }
        }
      }
      return whole;
    }
    for (const { dir, repo } of repos) {
      const sha = git(dir, [
        'rev-parse',
        '--verify',
        '--quiet',
        `${hash}^{commit}`,
      ]);
      const pushed =
        sha &&
        git(dir, [
          'for-each-ref',
          '--count=1',
          '--contains',
          sha,
          'refs/remotes/origin',
        ]);
      if (pushed) {
        remember(dir, sha, hash);
        return commitLink(repo, sha, hash);
      }
    }
    if (namesCommit(hash)) missing.push(hash);
    return whole;
  });
  return { commits, linked, missing };
};

const TEAM_START = /^(?<kind>Team|Team-Action):[ \t]*(?<text>\S.*?)[ \t]*$/u;
const TRAILER =
  /^(?:(?:[A-Z][\w-]*|Beyond the ask|Not checked):[ \t]|Refs[ \t])/u;
const NONE_VALUE = /^none\.?$/iu;

const rawTeamLines = (message) => {
  const lines = [];
  let open = null;
  for (const line of message.split('\n').slice(1)) {
    const start = TEAM_START.exec(line);
    if (start) {
      const entry = { ...start.groups };
      lines.push(entry);
      open = NONE_VALUE.test(entry.text) ? null : entry;
    } else if (open && line.trim() && !TRAILER.test(line)) {
      open.text += ` ${line.trim()}`;
    } else {
      open = null;
    }
  }
  return lines;
};

export const teamLines = (message) =>
  rawTeamLines(message).filter(({ text }) => !NONE_VALUE.test(text));

const hasTeamTrailer = (message) =>
  rawTeamLines(message).some(
    ({ kind, text }) => kind === 'Team' || !NONE_VALUE.test(text)
  );

const PRIVATE_ISSUE = /\bplate-private#(\d+)\b/gu;

const openIssuesNamed = (bodies) => {
  const root = process.cwd();
  const privateDir = join(root, PRIVATE_DIR);
  const via = existsSync(privateDir) ? [`--git-dir=${privateDir}`] : [];
  const read = spawnSync(
    'git',
    [...via, 'show', 'refs/triage/state:plate-private.json'],
    { cwd: root, encoding: 'utf-8' }
  );
  if (read.status !== 0) return [];
  let records;
  try {
    records = JSON.parse(read.stdout);
  } catch {
    return [];
  }
  const named = bodies.flatMap((body) =>
    [...body.matchAll(PRIVATE_ISSUE)].map(([, issue]) => issue)
  );
  return [...new Set(named)].filter(
    (issue) => records?.[issue]?.outcome === 'kind'
  );
};

const recipients = ({ team, role }) => ({
  ...Object.fromEntries(
    Object.entries(team).map(([login, { discord }]) => [
      login,
      { mention: `<@${discord}>`, allowedMentions: { users: [discord] } },
    ])
  ),
  dev: { mention: `<@&${role}>`, allowedMentions: { roles: [role] } },
  channel: { allowedMentions: { parse: [] } },
});

const message = (recipient, text) => ({
  content: [recipient.mention, text].filter(Boolean).join(' '),
  allowed_mentions: recipient.allowedMentions,
  // Discord's SUPPRESS_EMBEDS: a beta link's preview card buries the message.
  flags: 4,
});

const checkLength = (messages) => {
  const long = messages.find(({ content }) => content.length > LIMIT);
  if (long) {
    fail(
      2,
      `message is ${long.content.length} characters, over Discord's ${LIMIT}: ${long.content.slice(0, 80)}…`
    );
  }
};

const readToken = () => {
  const token =
    process.env.DISCORD_BOT_TOKEN ||
    (existsSync(TOKEN_FILE) &&
      readFileSync(TOKEN_FILE, 'utf-8')
        .match(/^DISCORD_BOT_TOKEN=(.*)$/mu)?.[1]
        .trim());
  if (!token) {
    fail(
      1,
      `no Discord bot token: set DISCORD_BOT_TOKEN or put a DISCORD_BOT_TOKEN= line in ${TOKEN_FILE}`
    );
  }
  return token;
};

const post = async (channel, token, body, files = []) => {
  const api = process.env.DISCORD_API ?? 'https://discord.com/api/v10';
  const headers = { Authorization: `Bot ${token}` };
  let payload = JSON.stringify(body);
  if (files.length > 0) {
    payload = new FormData();
    payload.append(
      'payload_json',
      JSON.stringify({
        ...body,
        attachments: files.map((file, id) => ({
          id,
          filename: basename(file),
        })),
      })
    );
    for (const [id, file] of files.entries()) {
      payload.append(
        `files[${id}]`,
        new Blob([readFileSync(file)]),
        basename(file)
      );
    }
  } else {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${api}/channels/${channel}/messages`, {
    method: 'POST',
    headers,
    body: payload,
  });
  const text = await response.text();
  if (!response.ok) {
    fail(1, `Discord answered ${response.status}: ${text}`);
  }
  console.log(`sent ${JSON.parse(text).id}`);
};

export const statePath = () =>
  process.env.NOTIFY_STATE ||
  join(
    process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'),
    'plate-notify',
    'sent.json'
  );

export const readSent = (path) =>
  existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : [];

const send = async (args) => {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      options: {
        file: { type: 'string', multiple: true },
        'no-media': { type: 'string' },
        to: { type: 'string' },
      },
    });
  } catch {
    fail(2, USAGE);
  }
  const { file: files = [], 'no-media': noMedia, to } = parsed.values;
  const text = parsed.positionals.join(' ').trim();
  if (!to || !text) fail(2, USAGE);
  if (noMedia !== undefined && !noMedia.trim()) {
    fail(
      2,
      '--no-media needs a non-empty reason, such as --no-media "iOS hardware only"'
    );
  }
  if (files.length > MAX_FILES) fail(2, `attach at most ${MAX_FILES} files`);
  for (const file of files) {
    if (!MEDIA.test(file) || !existsSync(file)) {
      fail(2, `${file} is not a PNG, JPG, GIF, MP4 or WebM file on disk`);
    }
    if (statSync(file).size > MAX_FILE_BYTES) {
      fail(2, `${file} is over Discord's 20 MiB limit for one file`);
    }
  }
  const bytes = files.reduce((sum, file) => sum + statSync(file).size, 0);
  if (bytes > MAX_MESSAGE_BYTES) {
    fail(
      2,
      "the files together are over Discord's 25 MiB limit for one message"
    );
  }
  const broken = findings(text);
  if (broken.length > 0) {
    fail(
      1,
      `the text breaks the Writing rule in .agents/pstack/rules/writing.md:\n${broken
        .map(
          ({ line, rule, text: shown }) => `  line ${line}, ${rule}: ${shown}`
        )
        .join(
          '\n'
        )}\nReword each line, or put literal text in backticks, then send again.`
    );
  }
  const handed = commandSpans(text);
  if (handed.length > 0) {
    fail(
      1,
      `the text hands a teammate ${handed.map((span) => `\`${span}\``).join(', ')} to run, but teammates work through Claude; say what to ask Claude for instead, then send again.`
    );
  }
  if (unlinkedPage(text)) {
    fail(
      1,
      `the text names a demo or docs page without its link; ${PAGE_FIX}, then send again.`
    );
  }
  const { commits, linked, missing } = linkCommits(text);
  if (missing.length > 0) {
    fail(
      1,
      `the text names ${missing.join(', ')}, but neither this checkout nor its companion has pushed a commit with that hash; write each as a link, [<hash>](https://github.com/<owner>/<repo>/commit/<sha>), or put a word that names no commit in backticks, then send again.`
    );
  }
  if (files.length === 0 && !noMedia) {
    const commitFiles = commits.map(({ dir, label, sha }) => ({
      files: git(dir, [
        'diff-tree',
        '--root',
        '--no-commit-id',
        '--name-only',
        '-r',
        sha,
      ])
        .split('\n')
        .filter(Boolean),
      label,
    }));
    const triggers = requiresMedia({ commitFiles, text });
    if (triggers.length > 0) {
      fail(
        1,
        `this notice names a beta page or UI commit (${triggers.join(', ')}); attach a before-and-after clip or still with --file via the clip skill, or pass --no-media "<reason>" if genuinely non-visual.`
      );
    }
  }

  const config = readConfig();
  const team = recipients(config);
  const recipient = Object.hasOwn(team, to) ? team[to] : null;
  if (!recipient) {
    fail(
      2,
      `${to} is not on the team: add their GitHub login, role and Discord user ID to team in .agents/pstack.json`
    );
  }
  const body = message(recipient, linked);
  checkLength([body]);

  const path = statePath();
  const now = Date.now();
  const recent = readSent(path).filter((entry) => now - entry.at < DAY);
  const media = files.map((file) =>
    createHash('sha256').update(readFileSync(file)).digest('hex')
  );
  const earlier = recent.find(
    (entry) =>
      entry.to === to &&
      entry.text === text &&
      String(entry.media ?? []) === String(media)
  );
  if (earlier) {
    console.log(
      `skipped: the same message to ${to} went at ${new Date(earlier.at).toISOString()}`
    );
    return;
  }

  await post(config.channel, readToken(), body, files);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify(
      [
        ...recent,
        {
          to,
          text,
          media,
          ...(noMedia ? { noMedia: noMedia.trim() } : {}),
          at: now,
        },
      ],
      null,
      2
    )}\n`
  );
};

// zbot, outside this repository, runs this on a range of next and posts each message
// it prints, holding a UI commit's messages by sha until that commit's demo is ready.
const team = (args) => {
  if (args.length !== 1) fail(2, USAGE);
  const config = readConfig();
  const repo = originRepo([]);
  if (!repo) fail(1, 'notify team cannot read the GitHub repository of origin');
  const { channel, dev } = recipients(config);
  const kinds = {
    Team: channel,
    'Team-Action': dev,
  };
  const run = spawnSync(
    'git',
    ['log', '--reverse', '--format=%H%x00%B%x00', args[0]],
    { encoding: 'utf-8' }
  );
  if (run.status !== 0) {
    fail(1, `notify team cannot read ${args[0]}: ${run.stderr.trim()}`);
  }
  const fields = run.stdout.split('\0').map((field) => field.trim());
  const messages = [];
  for (let i = 0; i + 1 < fields.length; i += 2) {
    const sha = fields[i];
    const link = ` (${commitLink(repo, sha, sha.slice(0, 7))})`;
    for (const { kind, text } of teamLines(fields[i + 1])) {
      messages.push({
        sha,
        channel: config.channel,
        ...message(kinds[kind], `${text}${link}`),
      });
    }
  }
  console.log(JSON.stringify(messages));
};

const DATED_PLAN = /^docs\/plans\/\d{4}-\d{2}-\d{2}-[^/]+\.md$/u;
const STEP_BULLET = /^- \[[ xX]\][ \t]+/u;
const STEP =
  /^- \[(?<done>[ xX])\][ \t]+(?:\*\*)?(?:[Ss]tep[ \t]+)?(?<id>(?=\w*\d)\w+(?:\.\w+)*)(?:\*\*)?[.:)](?:$|[ \t*])/u;
const DEMO = /^Demo:[ \t]*(?<value>.*?)[ \t]*$/mu;
const DEMO_VALUE = /^(?:step (?<step>\w+(?:\.\w+)*)|none)[,.;:]?[ \t]+\S/u;
const SHOT = /^\[\[shot: (?<path>[^|\]]+?) *\|/gmu;
const SESSION_LINE = /^Session:[ \t]+(\S+)[ \t]*$/u;

const sessionFromBodies = (bodies) => {
  for (const body of bodies) {
    for (const line of body.split('\n')) {
      const match = SESSION_LINE.exec(line);
      if (match) return match[1];
    }
  }
  return null;
};

const sessionLastCommitIn = (runGit, session) => {
  const run = runGit([
    'log',
    UPSTREAM,
    '--fixed-strings',
    `--grep=Session: ${session}`,
    '--format=%H%x00%ct%x00%B%x00',
  ]);
  if (run.status !== 0 || !run.stdout) return null;
  const fields = run.stdout.split('\0');
  let latest = null;
  for (let i = 0; i + 2 < fields.length; i += 3) {
    const sha = fields[i].trim();
    const seconds = Number(fields[i + 1].trim());
    const body = fields[i + 2];
    if (!sha || !Number.isFinite(seconds)) continue;
    const matched = body
      .split('\n')
      .some((line) => SESSION_LINE.exec(line)?.[1] === session);
    if (!matched) continue;
    const at = seconds * 1000;
    if (!latest || at > latest.at) latest = { at, sha };
  }
  return latest;
};

const sessionLastCommit = (root, session) => {
  const candidates = [
    sessionLastCommitIn((args) => gitAt(root, args), session),
    ...(isSplit(root)
      ? [sessionLastCommitIn((args) => privateGit(root, args), session)]
      : []),
  ].filter(Boolean);
  if (candidates.length === 0) return null;
  return candidates.reduce((latest, item) =>
    item.at > latest.at ? item : latest
  );
};

const demoOf = (text) => DEMO.exec(text.split(/^## /mu)[0])?.groups.value;

const parseSteps = (text) => {
  const section =
    text.split(/^## /mu).find((part) => /^Steps[ \t]*\r?\n/u.test(part)) ?? '';
  const steps = new Map();
  let bullets = 0;
  for (const line of section.split('\n')) {
    if (!STEP_BULLET.test(line)) continue;
    bullets += 1;
    const step = STEP.exec(line);
    if (step) steps.set(step.groups.id, step.groups.done.toLowerCase() === 'x');
  }
  return { bullets, steps };
};

// zbot posts a landing's Team line with the files that this folder's shots.md
// names, and posts none when one lies outside the folder or it names more than four.
const shotsProblem = (path, id, { bodies, root }) => {
  const session =
    sessionFromBodies(bodies) ||
    process.env.CLAUDE_CODE_HOST_SESSION_ID ||
    process.env.CLAUDE_CODE_SESSION_ID ||
    process.env.CODEX_SESSION_ID ||
    process.env.T3CODE_THREAD_ID;
  const demo = `step ${id} of ${path} is the plan's Demo step`;
  if (!session) {
    return `${demo}, but no session id is set, so its demo cannot be found. Land it from the agent session that recorded the clip.`;
  }
  const dir = join(homedir(), '.local/share/plate-bot/shots/landed', session);
  const file = join(dir, 'shots.md');
  const shots = existsSync(file)
    ? [...readFileSync(file, 'utf-8').matchAll(SHOT)].map(({ groups }) =>
        groups.path.trim()
      )
    : [];
  const posts = (shot) =>
    MEDIA.test(shot) &&
    !shot.includes('..') &&
    shot.startsWith(`${dir}/`) &&
    existsSync(shot);
  if (shots.length === 0 || shots.length > 4 || !shots.every(posts)) {
    return `${demo}, and ${file} must name one to four clips or stills that exist in that folder, or zbot posts none. Record the demo with the clip skill, copy its files into ${dir} and write one [[shot: <absolute path> | <a few words>]] line per file in shots.md, as AGENTS.md's Team section says.`;
  }
  const now = Date.now();
  const files = [file, ...shots].map((target) => ({
    mtimeMs: statSync(target).mtimeMs,
    path: target,
  }));
  const previous = sessionLastCommit(root, session);
  if (previous) {
    const older = files.find(({ mtimeMs }) => mtimeMs < previous.at);
    if (older) {
      return `${demo}, but ${older.path} was last modified at ${new Date(older.mtimeMs).toISOString()}, which is older than this session's previous landed commit (${previous.sha.slice(0, 7)} at ${new Date(previous.at).toISOString()}). Record a fresh clip for this landing and overwrite ${file}, as AGENTS.md's Team section says.`;
    }
  }
  const expired = files.find(({ mtimeMs }) => now - mtimeMs > MAX_SHOT_AGE);
  if (expired) {
    return `${demo}, but ${expired.path} was last modified at ${new Date(expired.mtimeMs).toISOString()}, which is more than 2 hours old. Record a fresh clip for this landing and overwrite ${file}, as AGENTS.md's Team section says.`;
  }
  return null;
};

const demoProblems = (bodies) => {
  const root = process.cwd();
  const base = gitAt(root, ['merge-base', 'HEAD', UPSTREAM]).stdout.trim();
  const pairing = { pair: landingPair };
  const changed = base ? changedSince(root, base, pairing) : null;
  if (!changed) {
    return [
      `notify check cannot diff the plans against where HEAD meets ${UPSTREAM}`,
    ];
  }
  const committed = process.env[LAND_CHECK] === '1';
  const announced =
    bodies.some((body) => teamLines(body).length > 0) ||
    openIssuesNamed(bodies).length > 0;
  return [...new Set([...changed, ...untrackedFiles(root, ['docs/plans'])])]
    .filter((path) => DATED_PLAN.test(path) && existsSync(join(root, path)))
    .flatMap((path) => {
      const after = readFileSync(join(root, path), 'utf-8');
      const { bullets, steps } = parseSteps(after);
      if (steps.size === 0) {
        if (bullets === 0) return [];
        return [
          `${path} has checkbox bullets under ## Steps, but none parse into a step id. Number each step (such as "- [ ] 1. ..." or "- [ ] **Step 1:** ...") so its Demo line can be checked.`,
        ];
      }
      const shown = showAt(root, base, path, pairing);
      const before = shown.status === 0 ? shown.stdout : null;
      const demo = demoOf(after);
      if (demo === undefined) {
        return before === null || demoOf(before) !== undefined
          ? [
              `${path} has steps and no Demo line. Under its Status line write "Demo: step <id>, <what the clip shows>" for the step whose landing first gives a teammate something to try on a page, or "Demo: none, <why nothing in it is worth a clip>".`,
            ]
          : [];
      }
      const named = DEMO_VALUE.exec(demo)?.groups;
      if (!named) {
        return [
          `${path} has the Demo line "Demo: ${demo}". Write "Demo: step <id>, <what the clip shows>" or "Demo: none, <why>".`,
        ];
      }
      const { step } = named;
      if (!step) return [];
      if (!steps.has(step)) {
        return [
          `${path}'s Demo line names step ${step}, which its Steps lack. Move the line to the step whose landing now first gives a teammate something to try, or write "Demo: none, <why>".`,
        ];
      }
      if (!steps.get(step) || parseSteps(before ?? '').steps.get(step)) {
        return [];
      }
      return [
        shotsProblem(path, step, { bodies, root }),
        committed && !announced
          ? `step ${step} of ${path} is the plan's Demo step, and the land message has no Team line. Say what teammates can now try, then run land.mjs again with --message.`
          : null,
      ].filter(Boolean);
    });
};

const TEAM_AFFECTING_PATHS = new Set([
  '.agents/pstack.json',
  'AGENTS.md',
  '.claude/settings.json',
  '.agents/rules/verify/references/sweep.md',
  '.agents/playbooks/triage.md',
  'package.json',
]);

const BREAKING_SUBJECT = /^[a-z]+(?:\([^)\n]+\))?!:/u;
const BREAKING_BODY = /^BREAKING[ -]CHANGE:/mu;
const PACKAGE_JSON_PATH = /^(?:packages\/[^/]+|apps\/www)\/package\.json$/u;
const DEP_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'];

const parseJsonOrEmpty = (raw) => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
};

const depKeysChanged = (before, after) =>
  DEP_FIELDS.some((field) => {
    const prev = Object.keys(before?.[field] ?? {}).sort();
    const next = Object.keys(after?.[field] ?? {}).sort();
    return (
      prev.length !== next.length ||
      prev.some((key, index) => key !== next[index])
    );
  });

const packageTeamReasons = (root, base, changed) => {
  const pairing = { pair: landingPair };
  const reasons = [];
  for (const path of changed) {
    if (!PACKAGE_JSON_PATH.test(path)) continue;
    const shown = showAt(root, base, path, pairing);
    const before = parseJsonOrEmpty(shown.status === 0 ? shown.stdout : '');
    const full = join(root, path);
    const after = parseJsonOrEmpty(
      existsSync(full) ? readFileSync(full, 'utf-8') : ''
    );
    const changes = [];
    if (depKeysChanged(before, after)) changes.push('dependencies');
    if (
      stableJson(before.exports ?? null) !== stableJson(after.exports ?? null)
    ) {
      changes.push('exports');
    }
    if (changes.length > 0) reasons.push(`${path} (${changes.join(', ')})`);
  }
  return reasons;
};

const workflowTeamProblems = (bodies) => {
  if (process.env[LAND_CHECK] !== '1') return [];
  if (bodies.some((body) => hasTeamTrailer(body))) return [];
  const root = process.cwd();
  const base = gitAt(root, ['merge-base', 'HEAD', UPSTREAM]).stdout.trim();
  const changed = base ? changedSince(root, base, { pair: landingPair }) : null;
  if (!changed) return [];
  const touched = [...new Set(changed)].filter((path) =>
    TEAM_AFFECTING_PATHS.has(path)
  );
  if (touched.length === 0) return [];
  return [
    `this landing changes teammate-affecting workflow/config paths (${touched.join(', ')}) without a Team: or Team-Action: trailer. Add a Team: or Team-Action: line explaining what changed for teammates (or Team: none for a silent internal tweak), then run land.mjs again with --message.`,
  ];
};

const breakingTeamProblems = (bodies) => {
  if (process.env[LAND_CHECK] !== '1') return [];
  if (bodies.some((body) => hasTeamTrailer(body))) return [];
  const reasons = [];
  if (bodies.some((body) => BREAKING_SUBJECT.test(body.split('\n')[0] ?? ''))) {
    reasons.push('breaking commit subject (!:)');
  }
  if (bodies.some((body) => BREAKING_BODY.test(body))) {
    reasons.push('BREAKING CHANGE: trailer');
  }
  const root = process.cwd();
  const base = gitAt(root, ['merge-base', 'HEAD', UPSTREAM]).stdout.trim();
  const changed = base ? changedSince(root, base, { pair: landingPair }) : null;
  if (changed) {
    reasons.push(...packageTeamReasons(root, base, [...new Set(changed)]));
  }
  if (reasons.length === 0) return [];
  return [
    `this landing has breaking or package-contract changes (${reasons.join('; ')}) without a Team: or Team-Action: trailer. Add a plain-English Team: or Team-Action: line explaining what changed for teammates and apps with zero code internals (or Team: none for a truly silent internal tweak), then run land.mjs again with --message.`,
  ];
};

// land.mjs runs this as a land check, after it squashes the task's commit and
// before it pushes, so a Team line that would hand teammates a command never posts.
const check = (args) => {
  if (args.length !== 0) fail(2, USAGE);
  const { branch } = readProject();
  const landing = new Set(
    gitDirs().flatMap((dir) => {
      const run = spawnSync(
        'git',
        [...dir, 'log', '--format=%B%x00', `origin/${branch}..HEAD`],
        { encoding: 'utf-8' }
      );
      if (run.status !== 0) {
        fail(
          1,
          `notify check cannot read the commits to land: ${run.stderr.trim()}`
        );
      }
      return run.stdout
        .split('\0')
        .map((body) => body.trim())
        .filter(Boolean);
    })
  );
  const lines = [...landing].flatMap((body) => teamLines(body));
  const refused = lines.flatMap(({ kind, text }) =>
    commandSpans(text).map((span) => `${kind}: ... \`${span}\``)
  );
  if (refused.length > 0) {
    fail(
      1,
      `a Team line hands teammates a command to run, but they work through Claude:\n${refused.map((line) => `  ${line}`).join('\n')}\nSay in plain words what changed for them, or what to ask Claude for, then run land.mjs again with --message.`
    );
  }
  const retests = lines.filter(({ text }) => /\/triage retest\b/u.test(text));
  if (retests.length > 0) {
    fail(
      1,
      `a Team line asks for a retest, but the triage run sends each teammate reporter their retests through /notify:\n${retests.map(({ kind, text }) => `  ${kind}: ${text}`).join('\n')}\nSay what changed and drop the retests, then run land.mjs again with --message.`
    );
  }
  const fixing = openIssuesNamed([...landing]);
  if (lines.length > 0 && fixing.length > 0) {
    fail(
      1,
      `this landing names ${fixing.map((issue) => `plate-private#${issue}`).join(', ')}, open in the triage register, and the triage run's message to each teammate reporter says what changed once the fixed records land. Drop the Team line and put what it says in that message, then run land.mjs again with --message.`
    );
  }
  const unlinked = lines.filter(({ text }) => unlinkedPage(text));
  if (unlinked.length > 0) {
    fail(
      1,
      `a Team line names a demo or docs page without its link:\n${unlinked.map(({ kind, text }) => `  ${kind}: ${text}`).join('\n')}\nIn it, ${PAGE_FIX}, then run land.mjs again with --message.`
    );
  }
  const missing = [
    ...demoProblems([...landing]),
    ...workflowTeamProblems([...landing]),
    ...breakingTeamProblems([...landing]),
  ];
  if (missing.length > 0) fail(1, missing.join('\n'));
};

const isMain =
  Boolean(process.argv[1]) &&
  existsSync(process.argv[1]) &&
  realpathSync(fileURLToPath(import.meta.url)) ===
    realpathSync(process.argv[1]);

if (isMain) {
  const [command, ...rest] = process.argv.slice(2);
  const commands = { check, send, team };
  if (!Object.hasOwn(commands, command ?? '')) fail(2, USAGE);
  await commands[command](rest);
}
