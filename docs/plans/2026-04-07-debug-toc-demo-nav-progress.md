# Progress

- Reproduced on `/blocks/toc-demo`.
- Increased nav flash duration to 10s and added visible heading highlight styling, but the standalone route still does not navigate.
- Registry rebuild did not fix the standalone route.

- Confirmed port 3002 serves /Users/zbeyens/git/plate-2/apps/www, not this checkout.
- Next step: sanity check current repo on port 3001 and report the mismatch clearly.
- Verified `pnpm --filter www typecheck` passed.
- Verified `pnpm lint:fix` passed.
- Browser proof on `http://localhost:3001/blocks/toc-demo`: clicking `Benefits of Using TOC` produced one `aria-current="location"` row and one `data-nav-target="true"` heading highlight.
