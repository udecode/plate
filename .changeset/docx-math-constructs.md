---
'platejs': patch
---

Convert Word equation arrays, matrices and pre-scripts to TeX in `importDocx`. An equation array keeps one line per row, aligned where Word marks an alignment point and centered where it marks none. A matrix keeps its rows and cells, and pre-scripts stay before their base, as in an isotope. The import no longer reports these equations as simplified.
