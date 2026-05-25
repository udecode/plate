---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 set_node needs prop-preserving draft and snapshot paths
tags:
  - slate-v2
  - set-node
  - transforms
  - snapshots
  - props
severity: medium
---

# Slate v2 set_node needs prop-preserving draft and snapshot paths

## What happened

The next `slate` op-family slice looked small on paper:

- add `set_node`
- add `Transforms.setNodes(...)`

The first red showed the real problem immediately: replacement snapshots were already dropping custom node props.

That meant a shallow `setNodes` wrapper would have been fake. Even if the op existed, the runtime would still erase custom props when nodes moved through draft and snapshot paths.

## What fixed it

The honest fix had two parts:

1. add a real `set_node` operation and path-based `Transforms.setNodes(...)`
2. preserve custom props through the current draft/snapshot seam

That required keeping props alive through:

- `createDraftTree(...)`
- `materializeSnapshot(...)`
- descendant cloning
- text splitting helpers
- the current normalization path for adjacent text nodes

The key rule for normalization was simple too: adjacent text nodes should only merge when their custom props still match.

## Reusable rule

For Slate v2 node-property updates:

- never add `set_node` on top of a draft model that already drops props
- if snapshots erase custom props, the transform API is lying
- prop-preserving draft/snapshot paths are a prerequisite for honest node-property transforms
- text normalization must respect formatting props when deciding whether adjacent text nodes can merge

If a node-property API lands before those rules hold, it is not a feature. It is debt with a nicer name.
