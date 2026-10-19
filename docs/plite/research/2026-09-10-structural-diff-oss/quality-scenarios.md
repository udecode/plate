# Structural comparison quality scenarios

These requirements cover exact content, structural continuity, review and readable output. The 14 fixture recipes comprise four list-order, three section-order, three cross-move and four table/format cases. They specify acceptance behavior; they are not passing production tests.

Production coverage remains **0/43 acceptance families certified by this research**.

| Required job | Plan coverage | Proof boundary |
| --- | --- | --- |
| JSON/rich-text comparison and exact visible changes | F01-F02, F13-F18; valid JSON and compiled schema | No production parity pass |
| Comparing saved versions and confirming no changes | Two-way compare; F01-F02/F43 | Missing lineage is distinct from equality |
| Reordering sections/list items with internal edits | F03-F06/F36; L01-L04/S01-S03 | Mapping and highlight masks both need proof |
| Logical headings and depth when heading text changes | F06/F16/F40 | Physical JSON nesting alone is insufficient |
| Tables, formatting and combined structural edits | F02/F15/F16/F36/F41; T01-T04 | Combined row/column/delete/edit cases are required |
| Section, line, word and character highlighting | F37 | Logical lines, exact UTF-16/grapheme boundaries; no viewport-driven rematching |
| Editing while viewing differences | F23-F30; native editable authored views | Read-only comparison creates no persisted proposal |
| Three-way branch contributions and alternatives | F31-F35 | Branch origin never authenticates an author |
| Automatic detached merging and explicit conflict choices | Three-way compare plus resolveComparison; F31-F33/F41 | Usable without a live editor |
| Separate patches, including relocation and styling | DocumentChange; F01/F20-F22/F27 | Native import validates the exact live baseline |
| Counting/filtering changes | F38 | Group/effect and filtered totals; selection cannot silently broaden |
| Readable output | F39; all 14 classes below | Readability/detection benchmark, not latency |

## Fixture specifications

At implementation, create original input documents, semantic effect/group expectations and visible highlight masks under the existing Plite diff test/browser owners. Exercise ordinary anonymous snapshots and native recorded identities. Both preserve payloads; evidence and ambiguity may differ.

| ID | Category / difficulty | Input recipe | Required oracle | Plan families |
| --- | --- | --- | --- | --- |
| L01 | list order / easy | Rotate a uniquely worded three-item list | Show the reorder through correspondence; unchanged item text has no insertion/deletion highlight. | F03 |
| L02 | list order / medium | Rotate the list and change one word in the relocated item | Keep the movement relation and show only the changed word as text modification. | F04 |
| L03 | list order / hard | Relocate an item and edit two separated passages inside it | Expose both edits within the same relocated content; preserve unchanged text between them. | F04,F38 |
| L04 | list order / very hard | Reverse a four-item list and edit one of its interior items | Account for all original item correspondences and changed relative order; retain the interior edit despite reversal. | F03,F04,F11 |
| S01 | section order / easy | Swap two headings together with their multi-paragraph bodies | Group section movement; do not manufacture independent moves for every descendant. | F03,F06 |
| S02 | section order / medium | Swap those sections and alter one word in one body | Preserve section membership and expose the small interior edit. | F04,F06 |
| S03 | section order / hard | Swap sections, rename a heading and edit several body passages | Match section content using hierarchy and text evidence; changed heading wording cannot erase its body correspondence. | F04,F06 |
| X01 | cross moves / easy | Introduce a section wrapper and relocate existing content into it | Show new wrapper/placement effects while keeping the enclosed content unchanged. | F05,F40 |
| X02 | cross moves / medium | Perform the wrapper/relocation change with one interior edit | Represent wrapper, placement and text edit together with correct source/target ranges. | F04,F36,F40 |
| X03 | cross moves / hard | Move several existing fragments across introduced structure and edit them | Every changed fragment is exposed once; no unchanged fragment is hidden by an opaque whole-region replacement. | F09,F36,F40 |
| T01 | tables, format / easy | Change list presentation from bullets to numbering while retaining its text | Report the list-style/marker effect without reporting unchanged labels as text edits. | F02,F16,F37 |
| T02 | tables, format / medium | Move a table row and edit one of its cells | Preserve row and cell correspondence and retain the cell edit inside the moved row. | F15 |
| T03 | tables, format / hard | Reorder a column, delete a row and edit a surviving cell | Distinct column-position, row-deletion and cell-edit effects account for every payload. | F15,F36 |
| T04 | tables, format / very hard | Combine column reorder, row reorder, row deletion and cell edits | All four effect classes remain visible; remaining cells retain correct logical coordinates and values. | F15,F36,F41 |

For each fixture, assert exact application/inversion, visibility of every edited payload, valid logical coordinates, stable correspondence and no misleading insert/delete noise on known unchanged content. Enumerate permitted equivalent reorder explanations; arbitrary whole-document replacement cannot pass these normal inputs. Visual masks must support navigation to both sides of moves and every interior edit.

Add OSS-derived cases for wrap/unwrap and wrapper-type change, mixed atom/real-NUL payloads, ambiguous repeats, same-length stale baselines, unilateral branch deletion, identical branch edits, order/ancestry conflicts, dependency-filtered review and locale/soft-wrap changes. F35-F43 specify these boundaries.

Splits, merges and many-to-many continuity are explicit user requirements and Plite targets. Their full matching quality remains a production proof obligation.
