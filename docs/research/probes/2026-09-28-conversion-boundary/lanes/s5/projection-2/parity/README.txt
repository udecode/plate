CJK 50K final-text parity on snapshot s (main at 2026-09-29T18:03:53Z, fingerprint ded78166782fa152). The only product difference from snapshot r is the restored table padding: BaseTablePlugin.ts sha256 d3222422d48564b5… (snapshot r had 7a10bea192ab8f30…, taken during the length: 0 mutation test).
Both arms rebuilt (webpack, --no-mangling; blocks/[name] and the api routes only), with the same baseline patch as projection-2.
S5_PAIRS=1 per cell (warmup + 1 pair per arm). The timings here are not part of the projection-2 matrix.
final-texts.json: every stream in both cells and both arms has sha256 aedd05ac73564d32…, the verdict-2 text. It ends "a" + U+FEFF, the padded empty cell.
