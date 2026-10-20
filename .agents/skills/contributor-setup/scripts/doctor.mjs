#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const REPO = 'udecode/plate';
const MARKETPLACE = 'pstack-claude';
const PLUGIN = `pstack@${MARKETPLACE}`;
const SOURCE = 'michael-denyer/pstack-claude';
const AGENT_PATHS = ['AGENTS.md', '.agents', '.claude', '.codex', '.github/PULL_REQUEST_TEMPLATE.md'];

const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
};
const readJson = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null);

const root = run('git', ['rev-parse', '--show-toplevel']);
if (!root) {
  console.error('Run the doctor from a checkout of udecode/plate.');
  process.exit(2);
}
const main = dirname(run('git', ['-C', root, 'rev-parse', '--path-format=absolute', '--git-common-dir']));
const remote =
  run('git', ['-C', root, 'remote', '-v'])
    ?.split('\n')
    .find((line) => line.includes(`${REPO}.git`) || line.includes(`${REPO} `))
    ?.split(/\s+/u)[0] ?? 'origin';
if (run('git', ['-C', root, 'fetch', '--quiet', remote, 'next']) === null) {
  console.error(`Could not fetch next from ${remote}; check the network and that remote, then run the doctor again.`);
  process.exit(2);
}
const upstream = `${remote}/next`;
const { tag } = JSON.parse(run('git', ['-C', root, 'show', `${upstream}:.agents/pstack.json`]));
const version = tag.replace(/^v/u, '');
const home = homedir();
const findings = [];
const stale = (what, fix) => findings.push({ fix, what });

const behind = Number(run('git', ['-C', root, 'rev-list', '--count', `HEAD..${upstream}`, '--', ...AGENT_PATHS]));
if (behind > 0)
  stale(
    `This branch is ${behind} commits behind ${upstream} on agent instructions, so your agent reads old rules.`,
    `git merge ${upstream}, or rebase onto it, then start a new agent session and run the doctor again`
  );

const claude = join(home, '.claude');
if (existsSync(claude)) {
  const installs = readJson(join(claude, 'plugins/installed_plugins.json'))?.plugins?.[PLUGIN] ?? [];
  const mine = installs.filter((install) => install.scope === 'user' || install.projectPath === main);
  const ref = readJson(join(claude, 'plugins/known_marketplaces.json'))?.[MARKETPLACE]?.source?.ref;
  if (mine.length === 0)
    stale(
      'Claude Code has no pstack plugin for this checkout.',
      `trust the folder ${main} in Claude Code, then from it: claude plugin install ${PLUGIN} --scope project`
    );
  if (ref && ref !== tag)
    stale(
      `Claude Code's ${MARKETPLACE} marketplace is pinned to ${ref}, not ${tag}.`,
      `from the home directory: claude plugin marketplace add ${SOURCE}#${tag}`
    );
  for (const install of mine.filter((each) => each.version !== version))
    stale(
      `Claude Code's ${install.scope}-scope pstack is ${install.version}, not ${version}.`,
      `from ${install.scope === 'user' ? 'the home directory' : main}: claude plugin update ${PLUGIN}${install.scope === 'user' ? '' : ` --scope ${install.scope}`}`
    );
}

const config = join(home, '.codex/config.toml');
if (existsSync(config)) {
  const tables = new Map([['', new Map()]]);
  let table = tables.get('');
  for (const line of readFileSync(config, 'utf8').split('\n')) {
    const header = line.match(/^\s*\[([^\]]+)\]\s*$/u);
    if (header) tables.set(header[1], (table = new Map()));
    const entry = line.match(/^\s*([\w-]+)\s*=\s*"?([^"]*)"?\s*$/u);
    if (entry && !header) table.set(entry[1], entry[2]);
  }
  const budget = Number(tables.get('').get('project_doc_max_bytes') ?? 32_768);
  const size = statSync(join(root, 'AGENTS.md')).size;
  if (budget < size)
    stale(
      `Codex reads the first ${budget} bytes of AGENTS.md, which has ${size}.`,
      'put project_doc_max_bytes = 131072 above the first [table] in ~/.codex/config.toml'
    );
  const ref = tables.get(`marketplaces.${MARKETPLACE}`)?.get('ref');
  if (ref !== tag)
    stale(
      ref ? `Codex's ${MARKETPLACE} marketplace is pinned to ${ref}, not ${tag}.` : `Codex has no ${MARKETPLACE} marketplace.`,
      `from the home directory: ${ref ? `codex plugin marketplace remove ${MARKETPLACE} && ` : ''}codex plugin marketplace add ${SOURCE} --ref ${tag} && codex plugin add ${PLUGIN}`
    );
  else if (tables.get(`plugins."${PLUGIN}"`)?.get('enabled') !== 'true')
    stale('Codex has the pstack marketplace but not the plugin.', `from the home directory: codex plugin add ${PLUGIN}`);
  if (![...tables.keys()].some((name) => name.startsWith(`hooks.state."${PLUGIN}:`)))
    stale("Codex has not trusted pstack's session hook.", 'a human opens Codex, runs /hooks and trusts the pstack session hook');
}

if (!existsSync(claude) && !existsSync(config))
  stale('Neither Claude Code nor Codex is set up on this machine.', 'install one, then run the doctor again');

const prs = run('gh', ['pr', 'list', '--repo', REPO, '--author', '@me', '--base', 'next', '--state', 'open', '--json', 'number,url,statusCheckRollup']);
const failing = JSON.parse(prs ?? '[]').filter((pr) => pr.statusCheckRollup.some((check) => check.name === 'PR body' && check.conclusion === 'FAILURE'));

for (const { fix, what } of findings) console.log(`stale: ${what}\n  fix: ${fix}`);
if (findings.length === 0) console.log(`ok: this setup matches ${upstream} and pstack ${tag}.`);
if (prs === null) console.log(`skip: gh could not list your open PRs into next; run gh auth login to include them.`);
for (const pr of failing) console.log(`pr: ${pr.url} fails the PR body check.`);
process.exit(findings.length > 0 || failing.length > 0 ? 1 : 0);
