---
name: lfg
description: Full autonomous engineering workflow
argument-hint: '[feature description]'
disable-model-invocation: true
---

Run these slash commands in order. Do not do anything else. Do not stop between steps — complete every step through to the end.

1. **Optional:** If the `ralph-wiggum` skill is available, run `/ralph-wiggum:ralph-loop "finish all slash commands" --completion-promise "DONE"`. If not available or it fails, skip and continue to step 2 immediately.
2. `/workflows:plan $ARGUMENTS`
3. `/compound-engineering:deepen-plan`
4. `/workflows:work`
5. `/workflows:review`
6. `/compound-engineering:resolve_todo_parallel`
7. `/compound-engineering:test-browser`
8. `/compound-engineering:feature-video`
9. Output `<promise>DONE</promise>` when video is in PR

Start with step 2 now (or step 1 if ralph-wiggum is available).
