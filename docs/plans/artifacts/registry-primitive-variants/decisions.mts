import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  EDITOR_REGISTRY_VARIANTS,
  PLATE_REGISTRY_VARIANT_ITEM_NAMES,
} from "../../../../apps/www/src/registry/registry-variants";

const MANIFEST_PATH = path.join(import.meta.dir, "manifest.json");

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const variantOwners = PLATE_REGISTRY_VARIANT_ITEM_NAMES;
const radixVariantSourceFiles = new Set(EDITOR_REGISTRY_VARIANTS.keys());
const baseDebt = new Set(
  manifest.items
    .filter(
      (item: any) =>
        item.classification === "base-primitive-direct" &&
        !variantOwners.has(item.name)
    )
    .map((item: any) => item.name)
);

function itemDecision(item: any) {
  if (item.sourceKind === "docs") {
    if (item.name === "fumadocs") {
      return {
        decision: "docs-provider-neutral-install",
        reason:
          "The installable docs block uses native disclosure and a shadcn Separator dependency, so one source works for Base and Radix.",
      };
    }

    return {
      decision: "docs-catalog-once",
      reason:
        "Docs source is generated once and remains provider-independent registry content.",
    };
  }

  if (variantOwners.has(item.name)) {
    return {
      decision: "provider-variant-owner",
      reason:
        "This component directly owns primitive interaction and has Base and Radix author sources targeting one installed file.",
    };
  }
  if (item.name.includes("classic")) {
    return {
      decision: "canonical-classic-maintenance",
      reason:
        "The public classic item stays maintenance-only but installs through every supported provider without its own source variant.",
    };
  }
  if (item.name === "inline-combobox") {
    return {
      decision: "independent-primitive-common",
      reason:
        "Ariakit is an explicit feature dependency independent of the shadcn Base/Radix selection.",
    };
  }
  if (item.type === "registry:style") {
    return {
      decision: "canonical-style-item",
      reason:
        "Plate CSS and token items do not vary with the shadcn provider or preset style.",
    };
  }
  if (item.classification === "shadcn-ui-direct") {
    return {
      decision: "canonical-shadcn-consumer",
      reason:
        "The item uses one provider-neutral Plate source while shadcn resolves its declared UI dependencies for the selected style.",
    };
  }
  if (item.effectiveClassification === "primitive-transitive") {
    return {
      decision: "canonical-transitive",
      reason:
        "Transitive provider reachability does not make this item a source variant.",
    };
  }

  return {
    decision: "canonical-common",
    reason: "No provider-sensitive source or metadata was found.",
  };
}

const itemRows = manifest.items.map((item: any) => ({
  ...itemDecision(item),
  ariaStatus: "unsupported-provider",
  baseStatus: baseDebt.has(item.name)
    ? "repair-required"
    : variantOwners.has(item.name)
    ? "authored-variant"
    : "compatible",
  classification: item.classification,
  effectiveClassification: item.effectiveClassification,
  name: item.name,
  sourceKind: item.sourceKind,
  type: item.type,
}));

const itemDecisionByName = new Map(
  itemRows.map((row: any) => [row.name, row.decision])
);

function fileDecision(file: any) {
  if (!file.isPublished) return "exclude-unpublished";
  if (file.path.startsWith("bases/base/")) return "keep-base-author-source";
  if (radixVariantSourceFiles.has(file.path)) {
    return "keep-radix-author-source";
  }

  const ownerDecisions = new Set(
    file.owners.map((owner: string) => itemDecisionByName.get(owner))
  );
  if (ownerDecisions.has("docs-provider-neutral-install")) {
    return "docs-provider-neutral-install";
  }
  if (ownerDecisions.has("docs-catalog-once")) return "docs-catalog-once";
  if (ownerDecisions.has("canonical-classic-maintenance")) {
    return "canonical-classic-maintenance";
  }

  return "canonical-source";
}

const fileRows = manifest.sourceFiles.map((file: any) => ({
  classification: file.classification,
  decision: fileDecision(file),
  owners: file.owners,
  path: file.path,
  published: file.isPublished,
  variant: file.isVariant,
}));

function counts(rows: any[], key: string) {
  return Object.fromEntries(
    [...new Set(rows.map((row) => row[key]))]
      .sort()
      .map((value) => [value, rows.filter((row) => row[key] === value).length])
  );
}

const summary = {
  baseDebt: {
    count: baseDebt.size,
    items: [...baseDebt].sort(),
  },
  fileDecisions: counts(fileRows, "decision"),
  fileRows: fileRows.length,
  itemDecisions: counts(itemRows, "decision"),
  itemRows: itemRows.length,
  unsupportedProviders: ["aria"],
  variantOwners: [...variantOwners].sort(),
};

writeFileSync(
  path.join(import.meta.dir, "decision-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`
);

const itemHeader = [
  "name",
  "sourceKind",
  "type",
  "classification",
  "effectiveClassification",
  "decision",
  "baseStatus",
  "ariaStatus",
  "reason",
].join("\t");
const itemLines = itemRows.map((row: any) =>
  [
    row.name,
    row.sourceKind,
    row.type,
    row.classification,
    row.effectiveClassification,
    row.decision,
    row.baseStatus,
    row.ariaStatus,
    row.reason,
  ].join("\t")
);
writeFileSync(
  path.join(import.meta.dir, "decisions.tsv"),
  `${[itemHeader, ...itemLines].join("\n")}\n`
);

const fileHeader = [
  "path",
  "published",
  "variant",
  "classification",
  "decision",
  "owners",
].join("\t");
const fileLines = fileRows.map((row: any) =>
  [
    row.path,
    row.published,
    row.variant,
    row.classification,
    row.decision,
    row.owners.join(","),
  ].join("\t")
);
writeFileSync(
  path.join(import.meta.dir, "file-decisions.tsv"),
  `${[fileHeader, ...fileLines].join("\n")}\n`
);

console.log(JSON.stringify(summary, null, 2));
