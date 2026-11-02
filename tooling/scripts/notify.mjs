#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

import { findings } from '../../.agents/pstack/writing-check.mjs';

const USAGE =
  'usage: notify send --to <login|dev> <text...> | notify landed <push-event.json> | notify check';
const DAY = 24 * 60 * 60 * 1000;
const LIMIT = 2000;
const TOKEN_FILE = join(homedir(), '.claude', 'channels', 'discord', '.env');

const fail = (code, message) => {
  console.error(message);
  process.exit(code);
};

const readProject = () =>
  JSON.parse(
    readFileSync(new URL('../../.agents/pstack.json', import.meta.url), 'utf-8')
  );

const readConfig = () => readProject().notify;

const SHELL =
  /^(?:pnpm|npm|npx|node|bun|bunx|yarn|git|gh|claude|codex|curl|brew|cd|export|sh|bash|zsh|python3?|pip3?)(?:\s|$)|&&|\|\|/u;

const commandSpans = (text) =>
  [...text.matchAll(/`([^`\n]+)`/gu)]
    .map(([, span]) => span.trim())
    .filter((span) => SHELL.test(span));

const TEAM_START = /^(?<kind>Team|Team-Action):[ \t]*(?<text>\S.*?)[ \t]*$/u;
const TRAILER = /^(?:[A-Z][\w-]*|Beyond the ask):[ \t]/u;

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

const recipients = ({ people, role }) => ({
  ...Object.fromEntries(
    Object.entries(people).map(([login, id]) => [
      login,
      { mention: `<@${id}>`, allowedMentions: { users: [id] } },
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

const post = async (channel, token, body) => {
  const api = process.env.DISCORD_API ?? 'https://discord.com/api/v10';
  const response = await fetch(`${api}/channels/${channel}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
      options: { to: { type: 'string' } },
    });
  } catch {
    fail(2, USAGE);
  }
  const { to } = parsed.values;
  const text = parsed.positionals.join(' ').trim();
  if (!to || !text) fail(2, USAGE);
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

  const config = readConfig();
  const team = recipients(config);
  const recipient = Object.hasOwn(team, to) ? team[to] : null;
  if (!recipient) {
    fail(
      2,
      `${to} is not on the team: add their GitHub login and Discord user ID to notify.people in .agents/pstack.json`
    );
  }
  const body = message(recipient, text);
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

  await post(config.channel, readToken(), body);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify([...recent, { to, text, at: now }], null, 2)}\n`
  );
};

const landed = async (args) => {
  if (args.length !== 1) fail(2, USAGE);
  const event = JSON.parse(readFileSync(args[0], 'utf-8'));
  const config = readConfig();
  const kinds = {
    Team: { allowedMentions: { parse: [] } },
    'Team-Action': recipients(config).dev,
  };
  const messages = (event.commits ?? []).flatMap((commit) => {
    const link = ` ([${commit.id.slice(0, 7)}](<https://github.com/${event.repository.full_name}/commit/${commit.id}>))`;
    return teamLines(commit.message).map(({ kind, text }) =>
      message(kinds[kind], `${text}${link}`)
    );
  });
  if (messages.length === 0) {
    console.log('no Team or Team-Action lines in this push');
    return;
  }
  checkLength(messages);
  const token = readToken();
  for (const body of messages) {
    await post(config.channel, token, body);
  }
};

// land.mjs runs this as a land check, after it squashes the task's commit and
// before it pushes, so a Team line that would hand teammates a command never posts.
const check = (args) => {
  if (args.length !== 0) fail(2, USAGE);
  const { branch, companion } = readProject();
  const gits = [
    [],
    ...(existsSync(companion.dir)
      ? [[`--git-dir=${companion.dir}`, '--work-tree=.']]
      : []),
  ];
  const landing = new Set(
    gits.flatMap((git) => {
      const run = spawnSync(
        'git',
        [...git, 'log', '--format=%B%x00', `origin/${branch}..HEAD`],
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
const commands = { check, landed, send };
if (!Object.hasOwn(commands, command ?? '')) fail(2, USAGE);
await commands[command](rest);
