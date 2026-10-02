# Plate playbooks on top of pstack

Status: done
Topic: pstack

## Outcome

Plate's lifecycle runs as project playbooks on top of pstack's, so a plain request reaches it through poteto-mode, and a pstack upgrade that rewrites a step fails loudly instead of dropping Plate's change. The v2 release loop stops at four points: the next ledger item, its review, the plan, and the build, which runs every slice at once.

## Scope

In: five playbooks in `.agents/playbooks/`, the `task`, `patch` and `autoclosure` aliases, lifecycle moved out of `architecture` and `best-api-review`, `review-ledger.mjs next` and `status`, `callSites` on Pursue records, the doctrine-bump warning, the entry-point docs, and the pin bump to pstack v0.9.54.

## Decisions

The reasons and evidence are in [the decision log](./2026-10-01-plate-playbooks.decisions.tsv).

## Steps

- [x] Playbooks render into the pstack block and their anchors hold at `v0.9.52`: `node ../dotai/skills/sync-pstack/scripts/sync-pstack.mjs verify .` passes.
- [x] Plain requests route to the Plate playbooks in both runtimes: four read-only smoke sessions, `scratchpad/smoke-pb/plain-*.txt` (local).
- [x] `review-ledger.mjs next` and `status`: `node --test tooling/scripts/review-ledger.test.mjs` passes 48 of 48.
- [x] `callSites` on Pursue records: the same suite, plus `docs/research/schema.md`.
- [x] Doctrine-bump warning: `node --test .agents/rules/plate-next/scripts/version.test.mjs` passes 15 of 15, and `version.mjs validate` passes.
- [x] Entry points: `docs/development/agent-skills.md` and the Routing table in `AGENTS.md`.
- [x] Pin bump to v0.9.54: `.claude/settings.json` and the pstack block here, and Ellie `4682b1696`; `sync-pstack verify` passes on both.

## Proof

The commands above ran on the final files. `review-ledger.mjs check` fails on inventory drift from another session's new browser specs, which this change does not touch. The Claude Code user-scope plugin refresh is still blocked on a CLI marketplace error; the project pins and Codex are on v0.9.54.
