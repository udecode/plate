// Installed by the sync-pstack skill.

import { existsSync } from 'node:fs';
import { userInfo } from 'node:os';

// --ignore-user-config still loads execpolicy rules, and an allow rule runs its
// command outside the sandbox (codex-rs/core/src/exec_policy.rs:440).
export const NO_EXEC_RULES = ['--ignore-rules'];

export const ISOLATED_FEATURES = ['apps', 'plugins', 'remote_plugin', 'browser_use', 'browser_use_external', 'browser_use_full_cdp_access', 'computer_use', 'in_app_browser', 'in_app_local_automation', 'image_generation', 'skill_mcp_dependency_install', 'tool_suggest', 'multi_agent', 'multi_agent_v2', 'memories', 'chronicle'];

export const NO_WEB_OR_PROJECT_DOC = ['-c', 'web_search="disabled"', '-c', 'project_doc_max_bytes=0'];

export const ISOLATED_CODEX_ARGS = ['--ignore-user-config', ...NO_EXEC_RULES, ...NO_WEB_OR_PROJECT_DOC, ...ISOLATED_FEATURES.flatMap((feature) => ['--disable', feature])];

// Codex loads system and MDM-managed config above the command line, so either can
// turn back on what the arguments turn off.
export function managedCodexConfig() {
  let user;
  try {
    user = userInfo().username;
  } catch {
    return 'managed config for a user with no passwd entry';
  }
  return ['/etc/codex', '/Library/Managed Preferences/com.openai.codex.plist', `/Library/Managed Preferences/${user}/com.openai.codex.plist`].find((path) => existsSync(path));
}
