Static cells on the final demo: snapshot pp2 of the working tree, taken 2026-09-30T01:18:59Z.
HEAD is a5d07011f3 plus 161 working-tree files, with no deletions (fingerprint b47954ac73674842; snapshot-files.sha256, snapshot-deleted.txt).
Among the files the cells load, only markdown-streaming-demo.tsx differs from snapshot pp (a81769be3c5bdc22 instead of 35ff37f8918718f9): in static mode its status, parse error and document now come from one deferred snapshot. The other ten checked hashes match pp. The extra files are the updated contract and lifetime specs, registry output, the changelog entry, the plan and this lane's own receipts.

Candidate: pp2, a production webpack build with --no-mangling (build-candidate.log, 98 s), served on :3613.
Baseline: the pp-base server (:3612), reused as is. Applying ../baseline.patch to the pp2 demo gives a file byte-identical to pp-base's demo, and every other file those cells load is unchanged.
Matrix: S5_CELLS=static-, the same protocol as ../ (../scripts/run-matrix-static2.sh). It took 9.1 min for 32 streams at load 1.7-2.9, with no errors and no timeouts.

Results (candidate medians; the full rows are in ../summary-pp.json under finalTree)
  cell               verdict  c (ms)   busy (ms)  final p95 B->C   arrival p95 B->C  (a)+(b) per pair
  static-rich-10000  pass      200.5     558.4    47.4 -> 7.6      69.8 -> 40.7      -93.5% to -94.1%
  static-cjk-10000   pass      303.4     773.8    76.0 -> 11.5     105.7 -> 44.7     -96.2% to -96.4%
  static-rich-50000  pass     2794.8    4899.4    197.1 -> 12.8    200.6 -> 44.0     -98.9%
  static-cjk-50000   pass     4322.8    7286.9    352.0 -> 32.0    382.4 -> 48.9     -99.1%
  Against the pp static cells (compare-pp.txt): c -4.5% to +5.4%, busy -4.9% to +0.5%, and baseline drift within 5%. The demo change has no measurable cost.
  Parity (parity.json): final text and HTML match between arms, and are byte-identical to the pp run and to w.
  Commits (chunking/commit-cost.json): no skipped publication. React per commit is 4.9 to 14.2 ms (rich) and 7.1 to 21.2 ms (CJK), 10 to 50 KB, the same as pp.
  Decoration reads (decor-sources/all-reads-pp2.json): 31, 54, 645 and 1,419 ms per stream, against 28, 55, 639 and 1,432 in pp.

Correctness on pp2 (reruns/)
  - Contract spec as updated in the checkout: 8 of 8 on the candidate and 8 of 8 on the baseline.
  - deferred-lag: after a reset and a strict parse, the status and output commit together (lag 0, 5 of 5). After Previous and then Next chunk, the heading, which stays urgent, still leads the output by one commit, and the output converges every time.
  - stale-render: streamed equals fresh for reuse (chunks 16 and 64), code (16), rich (64) and CJK (64), identical to the pp probes.
