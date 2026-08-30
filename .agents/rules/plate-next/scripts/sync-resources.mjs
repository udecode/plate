#!/usr/bin/env node

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), "../../../..");
export const resourcePairs = [
  [
    ".agents/rules/github-issue-reporter/agents/openai.yaml",
    ".agents/skills/github-issue-reporter/agents/openai.yaml",
  ],
  [
    ".agents/rules/github-issue-reporter/assets/intake-cases.json",
    ".agents/skills/github-issue-reporter/assets/intake-cases.json",
  ],
  [
    ".agents/rules/github-issue-reporter/assets/issue-body.example.md",
    ".agents/skills/github-issue-reporter/assets/issue-body.example.md",
  ],
  [
    ".agents/rules/github-issue-reporter/assets/issue-body.md",
    ".agents/skills/github-issue-reporter/assets/issue-body.md",
  ],
  [
    ".agents/rules/github-issue-reporter/assets/title.example.txt",
    ".agents/skills/github-issue-reporter/assets/title.example.txt",
  ],
  [
    ".agents/rules/github-issue-reporter/references/github-api-boundaries.md",
    ".agents/skills/github-issue-reporter/references/github-api-boundaries.md",
  ],
  [
    ".agents/rules/github-issue-reporter/scripts/prepare-video-evidence.sh",
    ".agents/skills/github-issue-reporter/scripts/prepare-video-evidence.sh",
  ],
  [
    ".agents/rules/github-issue-reporter/scripts/publish-issue.sh",
    ".agents/skills/github-issue-reporter/scripts/publish-issue.sh",
  ],
  [
    ".agents/rules/github-issue-reporter/scripts/self-test.sh",
    ".agents/skills/github-issue-reporter/scripts/self-test.sh",
  ],
  [
    ".agents/rules/benchmark/references/methodology.md",
    ".agents/skills/benchmark/references/methodology.md",
  ],
  [
    ".agents/rules/benchmark/scripts/benchmark-contract.test.mjs",
    ".agents/skills/benchmark/scripts/benchmark-contract.test.mjs",
  ],
  [
    ".agents/rules/benchmark/scripts/validate-benchmark-plan.mjs",
    ".agents/skills/benchmark/scripts/validate-benchmark-plan.mjs",
  ],
  [
    ".agents/rules/regression/references/methodology.md",
    ".agents/skills/regression/references/methodology.md",
  ],
  [
    ".agents/rules/regression/scripts/test-first-contract.test.mjs",
    ".agents/skills/regression/scripts/test-first-contract.test.mjs",
  ],
  [
    ".agents/rules/regression/scripts/capture-proof-receipt.mjs",
    ".agents/skills/regression/scripts/capture-proof-receipt.mjs",
  ],
  [
    ".agents/rules/regression/scripts/proof-receipt-contract.mjs",
    ".agents/skills/regression/scripts/proof-receipt-contract.mjs",
  ],
  [
    ".agents/rules/regression/scripts/validate-regression-plan.mjs",
    ".agents/skills/regression/scripts/validate-regression-plan.mjs",
  ],
  [
    ".agents/rules/regression/scripts/validate-regression-plan.test.mjs",
    ".agents/skills/regression/scripts/validate-regression-plan.test.mjs",
  ],
  [
    ".agents/rules/performance/rules/effect-subscription-budget.md",
    ".agents/skills/performance/rules/effect-subscription-budget.md",
  ],
  [
    ".agents/rules/best-api/rules/authoring-and-inference.md",
    ".agents/skills/best-api/rules/authoring-and-inference.md",
  ],
  [
    ".agents/rules/best-api/rules/behavior-and-ownership.md",
    ".agents/skills/best-api/rules/behavior-and-ownership.md",
  ],
  [
    ".agents/rules/best-api/rules/schema-and-identity.md",
    ".agents/skills/best-api/rules/schema-and-identity.md",
  ],
  [
    ".agents/rules/docs-creator/rules/lane-templates.md",
    ".agents/skills/docs-creator/rules/lane-templates.md",
  ],
  [
    ".agents/rules/docs-creator/rules/style-and-structure.md",
    ".agents/skills/docs-creator/rules/style-and-structure.md",
  ],
  [
    ".agents/rules/plate-feature/rules/manifest.md",
    ".agents/skills/plate-feature/rules/manifest.md",
  ],
  [
    ".agents/rules/plate-feature/rules/phases.md",
    ".agents/skills/plate-feature/rules/phases.md",
  ],
  [
    ".agents/rules/plate-feature/rules/proof-routing.md",
    ".agents/skills/plate-feature/rules/proof-routing.md",
  ],
  [
    ".agents/rules/plate-next/rules/audit-modes.md",
    ".agents/skills/plate-next/rules/audit-modes.md",
  ],
  [
    ".agents/rules/plate-next/rules/ownership-and-correction.md",
    ".agents/skills/plate-next/rules/ownership-and-correction.md",
  ],
  [
    ".agents/rules/plate-next/rules/review-law.md",
    ".agents/skills/plate-next/rules/review-law.md",
  ],
  [
    ".agents/rules/plate-plugin-creator/references/plugin-authoring-audit.md",
    ".agents/skills/plate-plugin-creator/references/plugin-authoring-audit.md",
  ],
  [
    ".agents/rules/plate-plugin-creator/rules/creation-flow.md",
    ".agents/skills/plate-plugin-creator/rules/creation-flow.md",
  ],
  [
    ".agents/rules/plate-plugin-creator/rules/capabilities.md",
    ".agents/skills/plate-plugin-creator/rules/capabilities.md",
  ],
  [
    ".agents/rules/plate-plugin-creator/rules/typing.md",
    ".agents/skills/plate-plugin-creator/rules/typing.md",
  ],
  [
    ".agents/rules/plate-ui/references/component-audit.md",
    ".agents/skills/plate-ui/references/component-audit.md",
  ],
  [
    ".agents/rules/plate-ui/rules/component-shape.md",
    ".agents/skills/plate-ui/rules/component-shape.md",
  ],
  [
    ".agents/rules/plate-ui/rules/component-family.md",
    ".agents/skills/plate-ui/rules/component-family.md",
  ],
  [
    ".agents/rules/plate-ui/rules/cross-platform.md",
    ".agents/skills/plate-ui/rules/cross-platform.md",
  ],
  [
    ".agents/rules/plate-ui/rules/ownership.md",
    ".agents/skills/plate-ui/rules/ownership.md",
  ],
  [
    ".agents/rules/plate-ui/rules/react-performance.md",
    ".agents/skills/plate-ui/rules/react-performance.md",
  ],
  [
    ".agents/rules/plate-ui/rules/registry.md",
    ".agents/skills/plate-ui/rules/registry.md",
  ],
  [
    ".agents/rules/plate-ui/rules/shadcn-proofing.md",
    ".agents/skills/plate-ui/rules/shadcn-proofing.md",
  ],
];
export const retiredGeneratedPaths = [
  ".agents/skills/auto/references/regression-methodology.md",
  ".agents/skills/auto/scripts/validate-regression-ledger.mjs",
  ".agents/skills/auto/scripts/validate-regression-ledger.test.mjs",
  ".claude/skills/auto/references/regression-methodology.md",
  ".claude/skills/auto/scripts/validate-regression-ledger.mjs",
  ".claude/skills/auto/scripts/validate-regression-ledger.test.mjs",
];
export const syncResources = (workspaceRoot, { check = false } = {}) => {
  const stale = [];

  for (const [sourcePath, generatedPath] of resourcePairs) {
    const source = join(workspaceRoot, sourcePath);
    const generated = join(workspaceRoot, generatedPath);
    const matches =
      existsSync(source) &&
      existsSync(generated) &&
      readFileSync(source).equals(readFileSync(generated));

    if (matches) continue;
    if (check) {
      stale.push(generatedPath);

      continue;
    }

    mkdirSync(dirname(generated), { recursive: true });
    copyFileSync(source, generated);
  }

  for (const generatedPath of retiredGeneratedPaths) {
    const generated = join(workspaceRoot, generatedPath);

    if (!existsSync(generated)) continue;
    if (check) {
      stale.push(generatedPath);

      continue;
    }

    rmSync(generated);
  }

  return stale;
};

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const check = process.argv.slice(2).includes("--check");
  const stale = syncResources(root, { check });

  if (stale.length > 0) {
    throw new Error(`Stale generated skill resources: ${stale.join(", ")}`);
  }

  console.log(
    check
      ? "Required skill resources: exact."
      : "Required skill resources: synced."
  );
}
