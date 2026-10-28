#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

const USAGE =
  'usage: notify send --to <login|dev> <text...> | notify landed <push-event.json>';
const DAY = 24 * 60 * 60 * 1000;
const LIMIT = 2000;
const TOKEN_FILE = join(homedir(), '.claude', 'channels', 'discord', '.env');

const fail = (code, message) => {
  console.error(message);
  process.exit(code);
};

const readConfig = () =>
  JSON.parse(
    readFileSync(new URL('../../.agents/pstack.json', import.meta.url), 'utf-8')
  ).notify;

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

const TEAM_LINE = /^(?<kind>Team|Team-Action):[ \t]*(?<text>\S.*?)[ \t]*$/gmu;

const landed = async (args) => {
  if (args.length !== 1) fail(2, USAGE);
  const event = JSON.parse(readFileSync(args[0], 'utf-8'));
  const config = readConfig();
  const kinds = {
    Team: { allowedMentions: { parse: [] } },
    'Team-Action': recipients(config).dev,
  };
  const messages = (event.commits ?? []).flatMap((commit) => {
    const body = commit.message.split('\n').slice(1).join('\n');
    const link = ` ([${commit.id.slice(0, 7)}](<https://github.com/${event.repository.full_name}/commit/${commit.id}>))`;
    return [...body.matchAll(TEAM_LINE)]
      .map((match) => match.groups)
      .filter(({ text }) => text.toLowerCase() !== 'none')
      .map(({ kind, text }) => message(kinds[kind], `${text}${link}`));
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

const [command, ...rest] = process.argv.slice(2);
const commands = { landed, send };
if (!Object.hasOwn(commands, command ?? '')) fail(2, USAGE);
await commands[command](rest);
