#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const hook = process.argv.includes('--hook');
const git = (...args) => {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
};
const readJson = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null);

const root = git('rev-parse', '--show-toplevel');
if (!root) {
  if (hook) process.exit(0);
  console.error('Run the doctor from a checkout of the repository.');
  process.exit(2);
}
const main = dirname(git('-C', root, 'rev-parse', '--path-format=absolute', '--git-common-dir'));
const settings = readJson(join(root, '.claude/settings.json')) ?? {};
const pins = Object.entries(settings.enabledPlugins ?? {}).flatMap(([plugin, enabled]) => {
  const marketplace = plugin.split('@')[1];
  const source = settings.extraKnownMarketplaces?.[marketplace]?.source;
  if (!enabled || !source?.ref) return [];
  const version = /^v?\d+\.\d+/u.test(source.ref) ? source.ref.replace(/^v/u, '') : null;
  return [{ marketplace, name: plugin.split('@')[0], plugin, ref: source.ref, repo: source.repo, version }];
});
const home = homedir();
const findings = [];
const stale = (what, fix) => findings.push({ fix, what });

const claude = join(home, '.claude');
if (existsSync(claude)) {
  const installed = readJson(join(claude, 'plugins/installed_plugins.json'))?.plugins ?? {};
  const marketplaces = readJson(join(claude, 'plugins/known_marketplaces.json')) ?? {};
  for (const { marketplace, plugin, ref, repo, version } of pins) {
    const known = marketplaces[marketplace]?.source?.ref;
    if (known && known !== ref)
      stale(
        `Claude Code's ${marketplace} marketplace is pinned to ${known}, not ${ref}.`,
        `from the home directory: claude plugin marketplace add ${repo}#${ref}`
      );
    const mine = (installed[plugin] ?? []).filter((install) => install.scope === 'user' || install.projectPath === main);
    if (mine.length === 0)
      stale(`Claude Code has no ${plugin} for this checkout.`, `from ${main}: claude plugin install ${plugin} --scope project`);
    for (const install of mine.filter((each) => version && each.version !== version))
      stale(
        `Claude Code's ${install.scope}-scope ${plugin} is ${install.version}, not ${version}.`,
        `from ${install.scope === 'user' ? 'the home directory' : main}: claude plugin update ${plugin}${install.scope === 'user' ? '' : ` --scope ${install.scope}`}`
      );
  }
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
  for (const { marketplace, name, plugin, ref, repo, version } of pins) {
    const known = tables.get(`marketplaces.${marketplace}`)?.get('ref');
    if (known !== ref)
      stale(
        known ? `Codex's ${marketplace} marketplace is pinned to ${known}, not ${ref}.` : `Codex has no ${marketplace} marketplace.`,
        `from the home directory: ${known ? `codex plugin marketplace remove ${marketplace} && ` : ''}codex plugin marketplace add ${repo} --ref ${ref} && codex plugin add ${plugin}`
      );
    else if (tables.get(`plugins."${plugin}"`)?.get('enabled') !== 'true')
      stale(`Codex has the ${marketplace} marketplace but not ${plugin}.`, `from the home directory: codex plugin add ${plugin}`);
    else if (
      existsSync(join(home, '.codex/plugins/cache', marketplace, name, version ?? ref, 'hooks/codex-hooks.json')) &&
      ![...tables.keys()].some((key) => key.startsWith(`hooks.state."${plugin}:`))
    )
      stale(`Codex has not trusted ${plugin}'s session hook.`, `a human opens Codex, runs /hooks and trusts the ${plugin} session hook`);
  }
}

if (findings.length > 0) {
  console.log(
    'Your agent setup is behind the plugins this checkout pins. Run each fix below in order; give a fix that names a human to the human as one line. A `claude plugin` command may rewrite .claude/settings.json, so restore it with git when it changes. Then ask the human to start a new session, which loads the updated plugins.'
  );
  for (const { fix, what } of findings) console.log(`stale: ${what}\n  fix: ${fix}`);
} else if (!hook) console.log('ok: this agent setup matches the plugins this checkout pins.');
process.exit(hook || findings.length === 0 ? 0 : 1);
