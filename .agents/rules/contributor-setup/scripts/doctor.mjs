#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, readlinkSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { hookPayload, sessionCheckout } from '../../../pstack/checkout.mjs';

const hook = process.argv.includes('--hook');
const payload = hook ? hookPayload() : {};
const isAgy = Boolean(payload.isAgy);
const readJson = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null);

const checkout = sessionCheckout(hook ? payload.cwd : undefined);
if (!checkout) {
  if (hook) {
    if (isAgy) console.log('{}');
    process.exit(0);
  }
  console.error('Run the doctor from a checkout of the repository.');
  process.exit(2);
}
const { main, root } = checkout;
const pinsOf = (settings) =>
  Object.entries(settings?.enabledPlugins ?? {}).flatMap(([plugin, enabled]) => {
    const marketplace = plugin.split('@')[1];
    const source = settings.extraKnownMarketplaces?.[marketplace]?.source;
    if (!enabled || !source?.ref) return [];
    const version = /^v?\d+\.\d+/u.test(source.ref) ? source.ref.replace(/^v/u, '') : null;
    return [{ marketplace, name: plugin.split('@')[0], plugin, ref: source.ref, repo: source.repo, version }];
  });
const newer = (a, b) => {
  if (!a.version || !b.version) return false;
  const [x, y] = [a, b].map((pin) => pin.version.split('.').map(Number));
  const at = x.findIndex((part, index) => part !== y[index]);
  return at >= 0 && x[at] > (y[at] ?? 0);
};
const trunk = spawnSync('git', ['-C', root, 'show', 'origin/HEAD:.claude/settings.json'], { encoding: 'utf8' });
const trunkPins = new Map(pinsOf(trunk.status === 0 ? JSON.parse(trunk.stdout) : null).map((pin) => [pin.plugin, pin]));
const newestPins = pinsOf(readJson(join(root, '.claude/settings.json'))).map((pin) => {
  const other = trunkPins.get(pin.plugin);
  return other && newer(other, pin) ? other : pin;
});
const home = homedir();
const findings = [];
const stale = (what, fix) => findings.push({ fix, what: `stale: ${what}` });

const claude = join(home, '.claude');
if (existsSync(claude)) {
  const installed = readJson(join(claude, 'plugins/installed_plugins.json'))?.plugins ?? {};
  const marketplaces = readJson(join(claude, 'plugins/known_marketplaces.json')) ?? {};
  for (const { marketplace, plugin, ref, repo, version } of newestPins) {
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
  for (const { marketplace, name, plugin, ref, repo, version } of newestPins) {
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

const gemini = join(home, '.gemini');
const t3Antigravity = join(home, '.t3/userdata/providers/antigravity');
if (existsSync(gemini) || existsSync(t3Antigravity)) {
  const AGY_RULE_MAX_BYTES = 24_000;
  const AGY_RULE_SAFE_BYTES = 22_500;
  const AGY_SKILL_DESC_BUDGET = 16_000;
  const agentsMdSize = existsSync(join(root, 'AGENTS.md')) ? statSync(join(root, 'AGENTS.md')).size : 0;
  const rulesDir = join(root, '.agents/rules');
  const agyRuleFiles = existsSync(rulesDir) ? readdirSync(rulesDir).filter((name) => name.endsWith('.md')) : [];
  if (agentsMdSize > AGY_RULE_SAFE_BYTES && agyRuleFiles.length === 0)
    stale(
      `Antigravity truncates rule files past ${AGY_RULE_MAX_BYTES} bytes, and AGENTS.md is ${agentsMdSize} bytes (safe cap ${AGY_RULE_SAFE_BYTES}).`,
      'trim AGENTS.md or move extended rules to docs/development/plate-workflow.md (keeping AGENTS.md <= 22.5 KB)'
    );
  for (const name of agyRuleFiles) {
    const ruleSize = statSync(join(rulesDir, name)).size;
    if (ruleSize > AGY_RULE_MAX_BYTES)
      stale(
        `Antigravity truncates .agents/rules/${name} past ${AGY_RULE_MAX_BYTES} bytes (currently ${ruleSize}).`,
        `trim or split .agents/rules/${name} under ${AGY_RULE_MAX_BYTES} bytes`
      );
  }
  const claudeSettings = readJson(join(root, '.claude/settings.json'));
  if (claudeSettings?.hooks && !existsSync(join(root, '.agents/hooks.json')))
    stale(
      'Claude Code hooks exist in .claude/settings.json, but .agents/hooks.json is missing for Antigravity.',
      'add .agents/hooks.json bridging Antigravity lifecycle events to the repository guards'
    );
  if (existsSync(join(root, '.mcp.json')) && !existsSync(join(root, '.agents/mcp_config.json')))
    stale(
      'Repo .mcp.json exists, but Antigravity .agents/mcp_config.json is missing.',
      'enable "antigravity" in .agents/skiller.toml and run pnpm run prepare'
    );
  const skillsDir = join(root, '.agents/skills');
  if (existsSync(skillsDir)) {
    const descLens = readdirSync(skillsDir)
      .map((name) => {
        const skillFile = join(skillsDir, name, 'SKILL.md');
        if (!existsSync(skillFile)) return null;
        const fm = readFileSync(skillFile, 'utf8').match(/^---\n([\s\S]*?)\n---/u)?.[1] ?? '';
        const desc = fm.match(/description:\s*([\s\S]*?)(?=\n[a-zA-Z0-9_-]+:|$)/u)?.[1]?.trim() ?? '';
        return { len: desc.length, name };
      })
      .filter(Boolean);
    const totalDesc = descLens.reduce((sum, item) => sum + item.len, 0);
    if (totalDesc > AGY_SKILL_DESC_BUDGET) {
      const top = descLens
        .sort((a, b) => b.len - a.len)
        .slice(0, 3)
        .map((item) => `${item.name} (${item.len})`)
        .join(', ');
      stale(
        `Antigravity skill descriptions total ${totalDesc} chars (budget ${AGY_SKILL_DESC_BUDGET}; largest: ${top}), risking dropped skills.`,
        'trim verbose description frontmatter in .agents/rules/*.mdc and run pnpm run prepare'
      );
    }
  }
  const homeAgentsSkills = join(home, '.agents/skills');
  const skillsJsonPath = join(gemini, 'config/skills.json');
  if (existsSync(homeAgentsSkills)) {
    const entries = readJson(skillsJsonPath)?.entries ?? [];
    const hasAgentsSkills = entries.some((entry) => typeof entry?.path === 'string' && (entry.path === '~/.agents/skills' || resolve(entry.path.replace(/^~(?=\/|$)/u, home)) === homeAgentsSkills));
    if (!hasAgentsSkills)
      stale(
        'Antigravity global config does not include ~/.agents/skills in ~/.gemini/config/skills.json.',
        'add {"entries":[{"path":"~/.agents/skills"}]} to ~/.gemini/config/skills.json'
      );
  }
  const globalPluginsDir = join(gemini, 'config/plugins');
  for (const { name, plugin, version } of newestPins) {
    const manifestPath = join(globalPluginsDir, name, '.antigravity-plugin/plugin.json');
    const manifest = readJson(manifestPath);
    if (!manifest)
      stale(
        `Antigravity has no ${plugin} plugin in ~/.gemini/config/plugins/${name}.`,
        `install ${name} for Antigravity (e.g. open-pstack or agy plugin install <path>/plugins/${name})`
      );
    else if (version && manifest.version !== version)
      stale(
        `Antigravity's ${plugin} plugin is ${manifest.version}, not ${version}.`,
        `update ${name} for Antigravity to ${version}`
      );
  }
  const globalMcpPath = join(gemini, 'config/mcp_config.json');
  if (existsSync(t3Antigravity)) {
    for (const entry of readdirSync(t3Antigravity, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (existsSync(globalMcpPath) && statSync(globalMcpPath).size > 0) {
        const profileMcp = join(t3Antigravity, entry.name, 'config/mcp_config.json');
        const linked = existsSync(profileMcp) && (() => {
          try {
            return resolve(join(t3Antigravity, entry.name, 'config'), readlinkSync(profileMcp)) === globalMcpPath;
          } catch {
            return statSync(profileMcp).size > 0;
          }
        })();
        if (!linked)
          stale(
            `T3 Code Antigravity profile ${entry.name.slice(0, 12)} has an isolated/empty mcp_config.json instead of ~/.gemini/config/mcp_config.json.`,
            `ln -sfn ~/.gemini/config/mcp_config.json "${profileMcp}"`
          );
      }
      if (existsSync(globalPluginsDir)) {
        const profilePlugins = join(t3Antigravity, entry.name, 'config/plugins');
        const pluginsLinked = existsSync(profilePlugins) && (() => {
          try {
            return resolve(join(t3Antigravity, entry.name, 'config'), readlinkSync(profilePlugins)) === globalPluginsDir;
          } catch {
            return readdirSync(profilePlugins).length > 0;
          }
        })();
        if (!pluginsLinked)
          stale(
            `T3 Code Antigravity profile ${entry.name.slice(0, 12)} does not link ~/.gemini/config/plugins.`,
            `ln -sfn ~/.gemini/config/plugins "${profilePlugins}"`
          );
      }
    }
  }
}

if (process.platform === 'darwin') {
  const rssKb = Number(spawnSync('ps', ['-axo', 'rss=,comm='], { encoding: 'utf8' }).stdout?.match(/^\s*(\d+)\s.*\/fseventsd$/mu)?.[1] ?? 0);
  if (rssKb > 1024 ** 2 && !['dev.dotai.mac-watchdog.fseventsd', 'dev.dotai.fseventsd-watchdog'].some((label) => spawnSync('launchctl', ['print', `system/${label}`], { stdio: 'ignore' }).status === 0))
    findings.push({
      fix: 'a human runs npx -y skills add udecode/dotai --skill mac-watchdog --agent claude-code --global -y && sudo zsh ~/.claude/skills/mac-watchdog/scripts/install-fseventsd.sh, which installs a root job that restarts fseventsd past 1 GB',
      what: `leak: fseventsd holds ${(rssKb / 1024 ** 2).toFixed(1)} GB. macOS 15.6 to 27.x leaks fseventsd memory on every changed path, and each worktree install changes about 170,000 paths, so the Mac swaps and freezes.`,
    });
}

if (findings.length > 0) {
  const lines = [
    'Your setup needs the fixes below. Run each in order; give a fix that names a human to the human as one line. A `claude plugin` command may rewrite .claude/settings.json, so restore it with git when it changes. After a plugin fix, ask the human to start a new session, which loads the updated plugins.',
    ...findings.map(({ fix, what }) => `${what}\n  fix: ${fix}`),
  ];
  if (hook && isAgy) {
    console.log(JSON.stringify({ injectSteps: [{ systemMessage: { systemMessage: lines.join('\n') } }] }));
  } else {
    console.log(lines.join('\n'));
  }
} else if (hook && isAgy) {
  console.log('{}');
} else if (!hook) console.log('ok: this agent setup matches the plugins this repository pins.');
process.exit(hook || findings.length === 0 ? 0 : 1);
