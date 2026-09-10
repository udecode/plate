# Agent Browser Issue

Handle $ARGUMENTS.

Use this only for likely reusable agent/browser tooling bugs. Do not use it for:

- auth or SSO gates
- manual human gates
- product bugs on the site itself
- one-off flaky noise with no minimal repro

## Collect

Capture only the minimum:

- page or URL
- action attempted
- exact block
- expected vs actual
- minimal repro
- screenshot only if it adds signal

## Issue

Prepare a GitHub issue draft with the details below. Publish it only when
the user explicitly authorizes that message; a browser blocker is not
publication authority. Complete the draft and other useful proof first.

The draft needs:

- a short title focused on the browser/tool failure
- label `agent:browser`
- concise body

Body shape:

```md
## URL
<url>

## Action
<what the agent tried>

## Block
<what failed>

## Expected
<what should have happened>

## Actual
<what happened instead>

## Repro
1. ...
2. ...
3. ...
```

## After

- if the browser/tool failure exposes a user-action parity gap, load `agent-native-reviewer` and note that gap in the issue
- link the issue in the task caveat or handoff
- keep moving if the product task is still otherwise fixable
