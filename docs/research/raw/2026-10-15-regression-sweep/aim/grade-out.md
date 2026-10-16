| Bug | X | Y |
|---|---|---|
| K1 | no — No check inserts `/quote` and immediately types inside the new quote. | no — BB-1 uses Markdown; SC-1 and SC-2 never insert a quote. |
| K2 | no — TA-02 uses mouse dragging; no cell-end Shift+Right transition is tested. | no — TB-2 specifies neither the cell-end start nor watching for a transient text-selection flash. |
| K3 | no — No check reopens the block context menu at a different location. | no — No check reopens the block context menu at a different location. |
| K4 | no — No check marquee-selects paragraphs and types to replace them. | no — BB-2 changes headings through text selection; no marquee-selection replacement occurs. |
| K5 | no — SG-01 never presses Enter inside a bulleted item while suggesting. | no — SG-1 through SG-3 never press Enter inside a bulleted item while suggesting. |
| K6 | no — No check replaces a handle-selected paragraph, undoes, then types without clicking. | no — No check replaces a handle-selected paragraph, undoes, then types without clicking. |
| K7 | no — No check copies whole blocks containing an empty paragraph and pastes without formatting. | no — No check copies whole blocks containing an empty paragraph and pastes without formatting. |
| K8 | no — No check drags a table row by its row handle. | no — No check drags a table row by its row handle. |
| K9 | no — No check drags a horizontally scrolled table and compares its preview. | no — No check drags a horizontally scrolled table and compares its preview. |
| K10 | no — LI-01 never creates numbered items separated by a bullet through block-menu conversion. | no — LI-1 through LI-3 never create numbered items separated by a bullet through block-menu conversion. |
| K11 | no — No check chooses `/text` in an empty paragraph and checks for an extra paragraph. | no — No check chooses `/text` in an empty paragraph and checks for an extra paragraph. |
| K12 | no — No check opens Text color → + and adjusts the native picker. | no — No check opens Text color → + and adjusts the native picker. |

X: 0/12 bugs caught; 145 total estimated minutes; 145 minutes counted; 0 checks lacking a page, steps or expected result.  
Y: 0/12 bugs caught; 141 total estimated minutes; 141 minutes counted; 0 checks lacking a page, steps or expected result.
seat: gpt-6-astra @xhigh
exit=0
