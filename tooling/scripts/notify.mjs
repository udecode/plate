#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

import { findings } from '../../.agents/pstack/writing-check.mjs';

const USAGE =
  'usage: notify send --to <login|dev> [--file <png|jpg|gif|mp4|webm>]... <text...> | notify team <revision-range> | notify check';
const DAY = 24 * 60 * 60 * 1000;
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

const linkCommits = (text) => {
  const repos = gitDirs().flatMap((dir) => {
    const repo = originRepo(dir);
    return repo ? [{ dir, repo }] : [];
  });
  const missing = [];
  const linked = text.replace(MENTION, (whole, kept, hash) => {
    if (kept || !namesCommit(hash)) return whole;
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
      if (pushed) return commitLink(repo, sha, hash);
    }
    missing.push(hash);
    return whole;
  });
  return { linked, missing };
};

const TEAM_START = /^(?<kind>Team|Team-Action):[ \t]*(?<text>\S.*?)[ \t]*$/u;
const TRAILER = /^(?:[A-Z][\w-]*|Beyond the ask|Not checked):[ \t]/u;

const teamLines = (message) => {
  const lines = [];
  let open = null;
  for (const line of message.split('\n').slice(1)) {
    const start = TEAM_START.exec(line);
    if (start) {
      open = { ...start.groups };
      lines.push(open);
    } else if (open && line.trim() && !TRAILER.test(line)) {
      open.text += ` ${line.trim()}`;
    } else {
      open = null;
    }
  }
  return lines.filter(({ text }) => text.toLowerCase() !== 'none');
};

const recipients = ({ team, role }) => ({
  ...Object.fromEntries(
    Object.entries(team).map(([login, { discord }]) => [
      login,
      { mention: `<@${discord}>`, allowedMentions: { users: [discord] } },
    ])
  ),
  dev: { mention: `<@&${role}>`, allowedMentions: { roles: [role] } },
});

const message = (recipient, text) => ({
  content: [recipient.mention, text].filter(Boolean).join(' '),
  allowed_mentions: recipient.allowedMentions,
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

const statePath = () =>
  process.env.NOTIFY_STATE ??
  join(
    process.env.XDG_STATE_HOME ?? join(homedir(), '.local', 'state'),
    'plate-notify',
    'sent.json'
  );

const readSent = (path) =>
  existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : [];

const send = async (args) => {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      options: {
        file: { type: 'string', multiple: true },
        to: { type: 'string' },
      },
    });
  } catch {
    fail(2, USAGE);
  }
  const { file: files = [], to } = parsed.values;
  const text = parsed.positionals.join(' ').trim();
  if (!to || !text) fail(2, USAGE);
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
  const { linked, missing } = linkCommits(text);
  if (missing.length > 0) {
    fail(
      1,
      `the text names ${missing.join(', ')}, but neither this checkout nor its companion has pushed a commit with that hash; write each as a link, [<hash>](https://github.com/<owner>/<repo>/commit/<sha>), or put a word that names no commit in backticks, then send again.`
    );
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
  const earlier = recent.find(
    (entry) => entry.to === to && entry.text === text
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
    `${JSON.stringify([...recent, { to, text, at: now }], null, 2)}\n`
  );
};

// zbot, outside this repository, runs this on a range of next and posts each message
// it prints, holding a UI commit's messages by sha until that commit's demo is ready.
const team = (args) => {
  if (args.length !== 1) fail(2, USAGE);
  const config = readConfig();
  const repo = originRepo([]);
  if (!repo) fail(1, 'notify team cannot read the GitHub repository of origin');
  const kinds = {
    Team: { allowedMentions: { parse: [] } },
    'Team-Action': recipients(config).dev,
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
  const refused = [...landing].flatMap((body) =>
    teamLines(body).flatMap(({ kind, text }) =>
      commandSpans(text).map((span) => `${kind}: ... \`${span}\``)
    )
  );
  if (refused.length > 0) {
    fail(
      1,
      `a Team line hands teammates a command to run, but they work through Claude:\n${refused.map((line) => `  ${line}`).join('\n')}\nSay in plain words what changed for them, or what to ask Claude for, then run land.mjs again with --message.`
    );
  }
};

const [command, ...rest] = process.argv.slice(2);
const commands = { check, send, team };
if (!Object.hasOwn(commands, command ?? '')) fail(2, USAGE);
await commands[command](rest);
