import { Command } from 'commander';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import prompts from 'prompts';
import { z } from 'zod';

const PROJECT_ROOT = process.cwd();
const CLAUDE_FILE = resolve(PROJECT_ROOT, 'CLAUDE.md');
const OUTPUT_FILE = resolve(PROJECT_ROOT, 'AGENTS.md');
const CLAUDE_LOCAL_FILE = resolve(PROJECT_ROOT, 'CLAUDE.local.md');
const CTX_COMMAND_FILE = resolve(PROJECT_ROOT, '.claude/commands/ctx.md');

// Color codes
const colors = {
  blue: '\u001B[34m',
  cyan: '\u001B[36m',
  green: '\u001B[32m',
  red: '\u001B[31m',
  reset: '\u001B[0m',
  yellow: '\u001B[33m',
} as const;

const log = {
  error: (msg: string) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg: string) =>
    console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  title: (msg: string) =>
    console.log(`\n${colors.cyan}${msg}${colors.reset}\n`),
  warn: (msg: string) =>
    console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

// Types
const RuleSchema = z.object({
  alwaysApply: z.boolean().optional(),
  description: z.string(),
  globs: z.string().optional(),
  name: z.string(),
  path: z.string(),
});

const PresetSchema = z.object({
  description: z.string(),
  name: z.string(),
  rules: z.union([z.array(z.string()), z.literal('all')]),
});

const ContextConfigSchema = z.object({
  defaultPreset: z.string().optional(),
  presets: z.record(PresetSchema),
  rules: z.array(RuleSchema),
});

type ContextConfig = z.infer<typeof ContextConfigSchema>;

// Load context configuration
function loadContextConfig(configPath: string): ContextConfig {
  try {
    const content = readFileSync(configPath, 'utf8');

    return ContextConfigSchema.parse(JSON.parse(content));
  } catch (error) {
    log.error(`Failed to load context configuration from ${configPath}`);

    throw error;
  }
}

// Save custom preset to config
function saveCustomPreset(configPath: string, ruleNames: string[]): void {
  try {
    const content = readFileSync(configPath, 'utf8');
    const config = JSON.parse(content);

    // Update or create custom preset
    config.presets.custom = {
      description: 'Your previously saved custom rule selection',
      name: 'Custom Selection',
      rules: ruleNames,
    };

    // Write back to file with formatting
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    log.success('Custom preset saved to config');
  } catch (error) {
    log.warn(`Failed to save custom preset: ${(error as Error).message}`);
  }
}

// Get always-apply rule files from config
function getAlwaysApplyRules(config: ContextConfig): string[] {
  return config.rules
    .filter((rule) => rule.alwaysApply === true)
    .map((rule) => rule.path);
}

// Get all available rule files from config (excluding always-apply)
function getAllRuleFiles(config: ContextConfig): string[] {
  return config.rules
    .filter((rule) => !rule.alwaysApply)
    .map((rule) => rule.path);
}

// Resolve rule names to paths (supports nested presets)
function resolveRuleNames(
  config: ContextConfig,
  ruleNames: string[],
  visitedPresets = new Set<string>()
): string[] {
  const resolvedPaths: string[] = [];

  for (const name of ruleNames) {
    // Check if it's a preset reference
    if (config.presets[name]) {
      // Prevent infinite recursion
      if (visitedPresets.has(name)) {
        log.warn(`Circular preset reference detected: ${name}`);

        continue;
      }

      visitedPresets.add(name);
      const preset = config.presets[name];

      if (preset.rules === 'all') {
        resolvedPaths.push(...getAllRuleFiles(config));
      } else {
        // Recursively resolve preset rules (may contain other presets)
        resolvedPaths.push(
          ...resolveRuleNames(config, preset.rules, visitedPresets)
        );
      }
    } else {
      // It's a rule name
      const rule = config.rules.find((r) => r.name === name);

      if (!rule) {
        log.warn(`Rule not found: ${name}`);

        continue;
      }

      resolvedPaths.push(rule.path);
    }
  }

  // Remove duplicates while preserving order
  return [...new Set(resolvedPaths)];
}

// Generate .claude/commands/ctx.md if it doesn't exist
function generateCtxCommandDoc(configPath: string): void {
  if (existsSync(CTX_COMMAND_FILE)) {
    return; // Already exists, don't overwrite
  }

  log.info('Generating .claude/commands/ctx.md...');

  const content = `# Context-Aware AGENTS.md Generation

Regenerate \`AGENTS.md\` with task-specific rules to reduce token usage and improve AI agent focus.

## Before Running the Command

**CRITICAL: Analyze the user's task to determine which rules are relevant.**

### Step 1: Understand the Task

Carefully read the user's prompt and identify:

- What files will be modified? (e.g., \`src/components/...\`, \`api/...\`, \`lib/...\`)
- What technologies are involved? (e.g., React, TypeScript, database, API)
- What features are being implemented? (e.g., authentication, UI components, API endpoints)

### Step 2: Match Rules to Task

Review @${configPath} to find relevant rules based on:

1. **File globs**: Match the files you'll be working with
   - Example: Working on \`src/components/ui/button.tsx\` → matches \`react\` (globs: \`*.tsx\`)
   - Example: Working on \`api/users.ts\` → matches \`api\` (globs: \`api/**\`)

2. **Description keywords**: Match the task description
   - Example: "implement authentication" → look for rules mentioning "auth", "security", "session"
   - Example: "optimize database queries" → look for rules mentioning "performance", "optimize", "database"

3. **Always-apply rules**: Automatically included, you don't need to include them manually.

### Step 3: Select Minimal Set

**Only include rules you will actually need.** More rules = larger context = slower responses.

**Good selection principles:**

- ✅ **Prefer presets** when all preset rules are needed (e.g., \`pnpm ctx frontend\` instead of listing all individual rules)
- ✅ Include rules matching file globs
- ✅ Include rules with relevant technology/patterns
- ⚠️ Consider dependent rules (e.g., if using a database ORM, include related database rules)
- ❌ Exclude unrelated rules (e.g., don't include \`backend\` rules if only working on frontend)
- ❌ Don't list individual rules when a preset covers them all

## Usage

\`\`\`bash
pnpm ctx <rule1> <rule2> <rule3> ...
\`\`\`

**Parameters:** Space-separated rule names from \`${configPath}\` (use \`--config <path>\` to specify a different config file)

### Examples

**Example 1: "I'll work on user authentication"**

\`\`\`bash
# Analysis: Working on authentication in backend
# Files: api/auth.ts, lib/session.ts
# Relevant rules: api (core patterns), auth (specific patterns)
pnpm ctx api auth
\`\`\`

**Example 2: "Build a React modal component"**

\`\`\`bash
# Analysis: Building UI component with React
# Files: src/components/modals/ExampleModal.tsx
# Relevant rules: All UI rules needed (react, styling, state management)
# ✅ PREFER: Use preset when all rules are covered
pnpm ctx ui
\`\`\`

**Example 3: "Optimize database search queries"**

\`\`\`bash
# Analysis: Backend optimization with search functionality
# Files: lib/search.ts, db/schema.ts
# Relevant rules: database (core), search (search patterns), performance (optimization)
pnpm ctx database search performance
\`\`\`

**Example 4: "Add payment integration"**

\`\`\`bash
# Analysis: Frontend + backend for payments
# Files: src/app/billing/page.tsx, api/payments.ts
# Relevant rules: Frontend (UI + API client) + specific payment patterns
# ✅ PREFER: Use frontend preset, add only the specific additional rule
pnpm ctx frontend payments
\`\`\`

**Example 5: "Update database schema with new relationships"**

\`\`\`bash
# Analysis: Schema design with entity relationships
# Files: db/schema.ts
# Relevant rules: database (core), relations (relationships)
pnpm ctx database relations
\`\`\`

## Configuration Structure

Rules are defined in \`${configPath}\` with:

- \`name\`: Identifier for the rule (use this in command)
- \`path\`: File location
- \`description\`: What the rule covers
- \`globs\`: File patterns this rule applies to (e.g., \`*.tsx\`, \`api/**\`)
- \`alwaysApply\`: If true, automatically included in every context

## Decision Tree

\`\`\`
User task → Analyze files/tech → Review ${configPath}
                                           ↓
                                  Match globs + descriptions
                                           ↓
                                  Select minimal rule set
                                           ↓
                                  pnpm ctx <rule1> <rule2> ...
                                           ↓
                                  AGENTS.md regenerated with focused context
\`\`\`

## Benefits

✅ **Faster Responses** - Smaller context = faster AI processing
✅ **Better Focus** - AI only sees relevant patterns
✅ **Token Efficiency** - Include only necessary rules
✅ **Task-Specific** - Custom context for each task
✅ **Always Include Essentials** - Global docs auto-included (\`alwaysApply: true\`)

## Notes

- \`AGENTS.md\` is auto-generated (don't edit directly)
- Always-apply rules (with \`alwaysApply: true\`) are automatically included
- Rules are centralized in \`${configPath}\`
- After running, the context is ready for the current task
`;

  // Create directory if it doesn't exist
  const dir = dirname(CTX_COMMAND_FILE);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(CTX_COMMAND_FILE, content);
  log.success('.claude/commands/ctx.md generated');
}

// Generate CLAUDE.local.md with @ references
function generateClaudeLocal(
  selectedRules: string[],
  contextName: string,
  config: ContextConfig
): void {
  log.info('Generating CLAUDE.local.md...');

  let content = '';

  // Add header comment
  content += `<!-- Auto-generated by generate-agents.ts -->\n`;
  content += `<!-- Context: ${contextName} -->\n`;
  content += `<!-- Generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} -->\n\n`;

  // Add @ references for each selected rule
  for (const filePath of selectedRules) {
    content += `@${filePath}\n`;
  }

  // Add available documentation section
  content += `\n## 📚 Available Documentation\n\n`;
  content += `**IMPORTANT**: The following documentation files are available but NOT currently loaded. You SHOULD read these files when you need information related to their topics during the conversation:\n\n`;

  const loadedPaths = new Set(selectedRules);
  const availableRules = config.rules.filter(
    (rule) => !rule.alwaysApply && !loadedPaths.has(rule.path)
  );

  if (availableRules.length > 0) {
    for (const rule of availableRules) {
      content += `- \`${rule.path}\` - ${rule.description}\n`;
    }
  } else {
    content += `_All available documentation is currently loaded._\n`;
  }

  writeFileSync(CLAUDE_LOCAL_FILE, content);
  log.success(`CLAUDE.local.md generated with ${selectedRules.length} rule(s)`);
}

// Generate AGENTS.md with selected files
function generateAgents(
  globalDocs: string[],
  selectedRules: string[],
  contextName: string,
  config: ContextConfig
): { includedCount: number; missingFiles: string[] } {
  log.info('Generating AGENTS.md...');

  const allSelectedFiles = [...globalDocs, ...selectedRules];
  const missingFiles: string[] = [];
  const processedFiles = new Set<string>();
  let content = '';
  let includedCount = 0;

  // Header
  content += '# AGENTS.md\n\n';
  content += '<!-- ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY -->\n';
  content += '<!-- Generated from CLAUDE.md and referenced files -->\n';
  content += `<!-- Generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} -->\n`;
  content += `<!-- Context: ${contextName} -->\n\n`;

  // Add currently loaded files section at the top
  content += '## 📋 Currently Loaded Documentation\n\n';
  content +=
    'The following documentation files are loaded in this context:\n\n';

  for (const file of allSelectedFiles) {
    content += `- \`${file}\`\n`;
  }

  content += '\n---\n\n';

  // Add available documentation section
  content += '## 📚 Available Documentation\n\n';
  content +=
    '**IMPORTANT**: The following documentation files are available but NOT currently loaded. You SHOULD read these files when you need information related to their topics during the conversation:\n\n';

  // Get all rules that are NOT in the current selection (excluding always-apply)
  const loadedPaths = new Set(allSelectedFiles);
  const availableRules = config.rules.filter(
    (rule) => !rule.alwaysApply && !loadedPaths.has(rule.path)
  );

  if (availableRules.length > 0) {
    for (const rule of availableRules) {
      content += `- \`${rule.path}\` - ${rule.description}\n`;
    }
  } else {
    content += '_All available documentation is currently loaded._\n';
  }

  content += '\n---\n\n';

  // Add CLAUDE.md content
  const claudeContent = readFileSync(CLAUDE_FILE, 'utf8');
  content += claudeContent + '\n\n';

  // Add separator
  content += '---\n\n';
  content += '# Referenced Files (Auto-Appended)\n\n';
  content += `> Context: **${contextName}**\n`;
  content +=
    '> The following files are automatically included based on the selected context.\n\n';

  // Add selected files
  for (const filePath of allSelectedFiles) {
    if (processedFiles.has(filePath)) continue;

    processedFiles.add(filePath);

    const fullPath = resolve(PROJECT_ROOT, filePath);

    if (existsSync(fullPath)) {
      log.success(`Including: ${filePath}`);
      let fileContent = readFileSync(fullPath, 'utf8');

      // Remove frontmatter from .mdc files
      if (filePath.endsWith('.mdc')) {
        fileContent = fileContent.replace(/^---\n[\s\S]*?\n---\n/, '');
      }

      content += '---\n\n';
      content += `## 📄 ${filePath}\n\n`;

      // Add content directly without code fences
      content += fileContent;
      content += '\n\n';

      includedCount++;
    } else {
      log.warn(`File not found: ${filePath}`);
      missingFiles.push(filePath);
    }
  }

  // Add missing files warning if needed
  if (missingFiles.length > 0) {
    content += '---\n\n';
    content += '## ⚠️  Missing Files\n\n';

    for (const file of missingFiles) {
      content += `- \`${file}\`\n`;
    }
  }

  // Write to file
  writeFileSync(OUTPUT_FILE, content);

  // Generate CLAUDE.local.md (include both global docs and selected rules)
  generateClaudeLocal([...globalDocs, ...selectedRules], contextName, config);

  // Summary
  log.title('✅ Files Generated Successfully!');
  console.log(`${colors.cyan}📊 Summary:${colors.reset}`);
  console.log(`   - Context: ${colors.green}${contextName}${colors.reset}`);
  console.log(
    `   - Files included: ${colors.green}${includedCount}${colors.reset}`
  );
  console.log(
    `   - Missing files: ${missingFiles.length > 0 ? colors.yellow : colors.green}${missingFiles.length}${colors.reset}`
  );
  console.log(`   - AGENTS.md: ${colors.green}${OUTPUT_FILE}${colors.reset}`);
  console.log(
    `   - CLAUDE.local.md: ${colors.green}${CLAUDE_LOCAL_FILE}${colors.reset}\n`
  );

  return { includedCount, missingFiles };
}

// Main execution
async function main() {
  const program = new Command();

  program
    .name('ctx')
    .description('Context-aware AGENTS.md generator')
    .version('1.0.0', '-v, --version', 'Display version number')
    .option('--init', 'Use default preset from config')
    .option('--clear', 'Remove generated files (AGENTS.md, CLAUDE.local.md)')
    .option(
      '--config <path>',
      'Path to context config file',
      '.claude/context.json'
    )
    .argument(
      '[rules...]',
      'Rule names or preset name (e.g., "convex convex-org" or "frontend")'
    )
    .action(
      async (
        ruleArgs: string[] | undefined,
        options: { config: string; clear?: boolean; init?: boolean }
      ) => {
        try {
          const configPath = resolve(PROJECT_ROOT, options.config);
          const config = loadContextConfig(configPath);

          // Handle --clear flag
          if (options.clear) {
            log.title('🧹 Clearing Generated Files');

            const filesToRemove = [OUTPUT_FILE, CLAUDE_LOCAL_FILE];
            let removedCount = 0;

            for (const file of filesToRemove) {
              if (existsSync(file)) {
                unlinkSync(file);
                log.success(`Removed: ${file}`);
                removedCount++;
              }
            }

            if (removedCount === 0) {
              log.info('No generated files found to remove');
            } else {
              log.success(`Cleared ${removedCount} file(s)`);
            }

            return;
          }
          // Handle --init flag
          if (options.init) {
            // Generate ctx.md command documentation if it doesn't exist
            generateCtxCommandDoc(options.config);

            // Check if AGENTS.md already exists
            if (existsSync(OUTPUT_FILE)) {
              return;
            }

            log.title('🤖 Context Generator');

            const defaultPreset = config.defaultPreset;

            if (!defaultPreset || !config.presets[defaultPreset]) {
              log.error(
                `Default preset "${defaultPreset}" not found in config`
              );
              process.exit(1);
            }

            log.info(`Using default preset: ${defaultPreset}`);
            const preset = config.presets[defaultPreset];
            const selectedRules =
              preset.rules === 'all'
                ? getAllRuleFiles(config)
                : resolveRuleNames(config, preset.rules);

            generateAgents(
              getAlwaysApplyRules(config),
              selectedRules,
              preset.name,
              config
            );

            return;
          }

          log.title('🤖 Context Generator');

          // Handle direct rule names or preset
          if (ruleArgs && ruleArgs.length > 0) {
            const firstArg = ruleArgs[0];

            // Check if it's a preset name
            if (ruleArgs.length === 1 && config.presets[firstArg]) {
              const preset = config.presets[firstArg];
              const selectedRules =
                preset.rules === 'all'
                  ? getAllRuleFiles(config)
                  : resolveRuleNames(config, preset.rules);

              generateAgents(
                getAlwaysApplyRules(config),
                selectedRules,
                preset.name,
                config
              );

              return;
            }

            // Treat as rule names
            const selectedRules = resolveRuleNames(config, ruleArgs);
            const contextName = `Custom (${ruleArgs.join(', ')})`;

            generateAgents(
              getAlwaysApplyRules(config),
              selectedRules,
              contextName,
              config
            );

            return;
          }

          // Interactive mode
          log.info('Select a context for AGENTS.md generation:\n');

          // Put custom first
          const presetChoices = [
            {
              title: '✨ Custom (Select Files)',
              value: 'custom',
            },
          ];

          // Add other presets
          presetChoices.push(
            ...Object.entries(config.presets)
              .filter(([key]) => key !== 'custom') // Exclude custom if it exists in config
              .map(([key, preset]) => ({
                title: `${key === 'frontend' ? '🎨' : key === 'backend' ? '⚙️' : key === 'app' ? '🚀' : '📦'} ${preset.name}`,
                value: key,
              }))
          );

          const response = await prompts({
            choices: presetChoices,
            initial: 0,
            message: 'Choose context',
            name: 'context',
            type: 'select',
          });

          if (!response.context) {
            log.warn('Generation cancelled');
            process.exit(0);
          }
          if (response.context === 'custom') {
            // Get previously saved custom preset if it exists
            const savedCustomRules = config.presets.custom?.rules || [];
            const savedRulePaths =
              Array.isArray(savedCustomRules) && savedCustomRules.length > 0
                ? resolveRuleNames(config, savedCustomRules)
                : [];

            const customResponse = await prompts({
              choices: config.rules
                .filter((rule) => !rule.alwaysApply)
                .map((rule) => ({
                  description: rule.description,
                  selected: savedRulePaths.includes(rule.path), // Pre-select saved rules
                  title: rule.name,
                  value: rule.path,
                })),
              hint: 'Space to select, Enter to confirm',
              message:
                savedRulePaths.length > 0
                  ? 'Select rule files to include (previously saved rules are pre-selected)'
                  : 'Select rule files to include',
              name: 'rules',
              type: 'multiselect',
            });

            if (!customResponse.rules) {
              log.warn('Generation cancelled');
              process.exit(0);
            }

            // Convert selected paths back to rule names for saving
            const selectedRuleNames = config.rules
              .filter((rule) => customResponse.rules.includes(rule.path))
              .map((rule) => rule.name);

            // Save custom preset to config
            saveCustomPreset(configPath, selectedRuleNames);

            generateAgents(
              getAlwaysApplyRules(config),
              customResponse.rules,
              'Custom Selection',
              config
            );
          } else {
            const preset = config.presets[response.context];
            const selectedRules =
              preset.rules === 'all'
                ? getAllRuleFiles(config)
                : resolveRuleNames(config, preset.rules);

            generateAgents(
              getAlwaysApplyRules(config),
              selectedRules,
              preset.name,
              config
            );
          }
        } catch (error) {
          log.error(`Fatal error: ${(error as Error).message}`);
          console.error(error);
          process.exit(1);
        }
      }
    );

  await program.parseAsync(process.argv);
}

main();
