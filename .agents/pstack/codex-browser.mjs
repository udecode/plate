// Installed by the sync-pstack skill.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ISOLATED_FEATURES, NO_EXEC_RULES, NO_WEB_OR_PROJECT_DOC } from './codex-isolation.mjs';

export const BROWSER_SERVER = 'cua_browser';

// The ids the bundled Chrome plugin's installer registers for Codex's extension.
const EXTENSION_IDS = ['hehggadaopoacecdllhhajmbjkdcmajg', 'odlomjlbamekndcpllcnffbgeohgkmjh'];

const NATIVE_HOST = 'com.openai.codexextension.json';

const FEATURES_OFF = [...ISOLATED_FEATURES.filter((feature) => !['browser_use', 'browser_use_external', 'computer_use'].includes(feature)), 'shell_tool', 'unified_exec', 'goals', 'view_image'];

const toml = (value) =>
  Array.isArray(value) ? `[${value.map(toml).join(',')}]` : typeof value === 'object' ? `{${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}=${toml(item)}`).join(',')}}` : JSON.stringify(value);

// The plugin's NODE_REPL_TRUSTED_SERVICES registers the desktop ("sky") service, and its
// launcher keeps any map it is given, so the copy names only the browser.
function browserServer(codexHome) {
  const root = join(codexHome, 'plugins/cache/openai-bundled/unified-computer-use');
  if (!existsSync(root)) throw new Error(`no computer-use plugin under ${root}`);
  const version = readdirSync(root)
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .at(-1);
  const source = JSON.parse(readFileSync(join(root, version, '.mcp.json'), 'utf8')).mcpServers.cua_repl;
  const { SKY_CUA_SERVICE_PATH: _desktop, ...env } = source.env;
  const app = source.command.slice(0, source.command.indexOf('.app/') + 4);
  const installed = readFileSync(join(app, 'Contents/Info.plist'), 'utf8').match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
  if (installed !== env.BROWSER_USE_CODEX_APP_VERSION) throw new Error(`the cached computer-use plugin is for app ${env.BROWSER_USE_CODEX_APP_VERSION}, but ${app} is ${installed}`);
  return {
    command: source.command,
    args: source.args,
    env: { ...env, CUA_REPL_ENABLED_SURFACES: 'browser', BROWSER_USE_AVAILABLE_BACKENDS: 'chrome', NODE_REPL_TRUSTED_SERVICES: JSON.stringify({ browser: '@oai/browser-desktop/service' }) },
    enabled_tools: source.enabled_tools,
    startup_timeout_sec: source.startup_timeout_sec,
  };
}

const attempt = (read) => {
  try {
    return read();
  } catch {
    return undefined;
  }
};

const readJson = (path) => attempt(() => JSON.parse(readFileSync(path, 'utf8')));

function browserRoots(supportDir) {
  const roots = [];
  const visit = (dir, depth) => {
    for (const entry of attempt(() => readdirSync(dir, { withFileTypes: true })) ?? []) {
      if (!entry.isDirectory()) continue;
      const path = join(dir, entry.name);
      if (existsSync(join(path, 'NativeMessagingHosts', NATIVE_HOST))) roots.push(path);
      else if (depth < 2) visit(path, depth + 1);
    }
  };
  visit(supportDir, 1);
  return roots;
}

function extensionProfiles(roots) {
  return roots.flatMap((root) => {
    const names = readJson(join(root, 'Local State'))?.profile?.info_cache ?? {};
    return readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) =>
        ['Preferences', 'Secure Preferences'].some((file) =>
          EXTENSION_IDS.some((id) => {
            const settings = readJson(join(root, entry.name, file))?.extensions?.settings?.[id];
            return settings && settings.state !== 0 && !settings.disable_reasons?.length;
          }),
        ),
      )
      .map((entry) => ({ root, dir: entry.name, name: names[entry.name]?.name ?? entry.name }));
  });
}


function enabledServers(args, cwd) {
  const run = spawnSync('codex', ['mcp', 'list', '--json', ...args], { cwd, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`codex mcp list failed: ${run.stderr.trim()}`);
  return JSON.parse(run.stdout)
    .filter((server) => server.enabled)
    .map((server) => server.name);
}

export async function browserLaunch({ cwd, chromeProfile, env = process.env }) {
  try {
    if (process.platform !== 'darwin') throw new Error('the browser lane runs only on macOS');
    const home = env.HOME ?? homedir();
    const roots = browserRoots(join(home, 'Library/Application Support'));
    const profiles = extensionProfiles(roots);
    if (!profiles.some((profile) => profile.name === chromeProfile))
      throw new Error(`Codex's extension is not enabled in the "${chromeProfile}" profile; it is enabled in ${profiles.map((p) => `${p.root}/${p.dir} (${p.name})`).join(', ') || 'no profile'}`);
    const base = [...FEATURES_OFF.flatMap((feature) => ['--disable', feature]), ...NO_WEB_OR_PROJECT_DOC, '-c', `mcp_servers.${BROWSER_SERVER}=${toml(browserServer(env.CODEX_HOME ?? join(home, '.codex')))}`];
    const others = enabledServers(base, cwd).filter((name) => name !== BROWSER_SERVER);
    const unaddressable = others.find((name) => !/^[A-Za-z0-9_-]+$/.test(name));
    if (unaddressable) throw new Error(`server "${unaddressable}" cannot be turned off from the command line`);
    const config = [...base, ...others.flatMap((name) => ['-c', `mcp_servers.${name}.enabled=false`])];
    const enabled = enabledServers(config, cwd);
    if (enabled.join() !== BROWSER_SERVER) throw new Error(`Codex still enables ${enabled.join(', ')}`);
    return { args: [...NO_EXEC_RULES, ...config] };
  } catch (error) {
    return { refusal: error.message };
  }
}
