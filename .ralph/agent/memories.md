# Memories

## Patterns

## Decisions

## Fixes

### mem-1771384936-e708
> SuggestionLeafDocx tests: needed React import for Bun JSX. formatCommentDate tests: needed @platejs/comment build.
<!-- tags: testing, bun, react | created: 2026-02-18 -->

### mem-1771384347-7c55
> failure: cmd=yarn turbo build --filter=./apps/www, exit=129, error=www#build exited 129 during Next production build, next=retry focused build to classify infra-vs-code failure
<!-- tags: build, testing, error-handling | created: 2026-02-18 -->

### mem-1771384110-8210
> failure: cmd=rg --line-number "setSystemTime\(|useFakeTimers\(|mock\.date" apps packages, exit=1, error=no matches found, next=do direct Bun API check + implement deterministic clock mock in spec
<!-- tags: testing, tooling | created: 2026-02-18 -->

### mem-1771383891-2743
> failure: cmd=bun test apps/www/src/registry/ui/table-node-static.spec.tsx, exit=1, error=ReferenceError React is not defined + strict rgb assertion mismatch, next=import React in spec and loosen color assertion
<!-- tags: testing, bun, react | created: 2026-02-18 -->

## Context
