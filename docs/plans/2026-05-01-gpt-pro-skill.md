# 2026-05-01 GPT Pro Skill

## Goal

Create a reusable `gpt-pro` skill that generates paste-ready external-review
prompts for ChatGPT/GPT Pro. The prompt must carry the full local context
because the external model has no repo access.

## Current Decisions

- Edit `.agents/rules/gpt-pro.mdc` as the source of truth.
- Run `pnpm install` to sync `.agents/skills/gpt-pro/SKILL.md`.
- Keep the skill focused on prompt generation, not implementation.
- Reuse `ralplan-creator` rigor: source-backed state, intent boundaries,
  decision brief, evidence ladder, pressure questions, objections, and review
  gates.

## Verification

- `pnpm install`: passed; `skiller apply` completed.
- `.agents/skills/gpt-pro/SKILL.md`: generated and points back to
  `.agents/rules/gpt-pro.mdc`.
- `bun run completion-check`: passed.
- Typecheck/browser proof: not applicable; this changes only markdown skill
  source and the generated skill mirror.
