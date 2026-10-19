# Findings

- `toc-node.tsx` source already uses `aria-current={item.id === activeContentId ? 'location' : undefined}`.
- Rebuilt registry JSON still reflects that source.
- On `/blocks/toc-demo`, live DOM/React props show every TOC row has `aria-current=true`.
- On `/blocks/toc-demo`, TOC clicks do not change scroll position and do not produce `[data-nav-highlight]`.

- Port 3002 cwd: /Users/zbeyens/git/plate-2/apps/www
- plate-2 toc-node still has bare aria-current on every row and old click-only hook.
