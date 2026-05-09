# Memory And DOM Tagging

Use this when a lane may explode heap, DOM nodes, component instances, listeners,
or cached indexes.

## Rule

Timing without memory and DOM tags is incomplete for repeated editor surfaces.

## Tags

- JS heap
- DOM node count
- React component count proxy
- mounted group/island count
- event listener count
- cached range/index sizes
- dirty id set sizes
- hidden boundary count
- decoration/comment/annotation count
- custom renderer flags

## Gate

For every large/stress benchmark, record both latency and memory/DOM pressure.
Do not accept a mode that improves timings by quietly exploding memory.
