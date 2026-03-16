---
name: vercel-react-best-practices
description: >-
  React and Next.js performance optimization guidelines from Vercel Engineering
  covering 45 rules across 8 priority categories: eliminating waterfalls,
  bundle size optimization, server-side performance, client-side data fetching,
  re-render optimization, rendering performance, JavaScript performance, and
  advanced patterns. Use when writing, reviewing, or refactoring React/Next.js
  components, optimizing data fetching, reducing bundle size, or improving load
  times. Not for non-React code, backend-only services, or infrastructure
  configuration.
license: MIT
metadata:
  author: vercel
  version: 1.0.0
---

## Overview

A prioritized catalog of 45 performance rules for React and Next.js from Vercel
Engineering, organized by impact level. Critical rules cover async waterfall
elimination (Promise.all, Suspense boundaries, deferred awaits) and bundle size
reduction (tree-shaking barrel imports, dynamic imports, deferred third-party
scripts). High-impact rules address server-side caching (React.cache, LRU) and
data serialization. Medium rules cover re-render optimization (memoization,
derived state, transitions) and rendering patterns (content-visibility, SVG
precision, hydration). Each rule includes incorrect/correct code examples.

@.claude/skills/vercel-react-best-practices/vercel-react-best-practices.mdc
