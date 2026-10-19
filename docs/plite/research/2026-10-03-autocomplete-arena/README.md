# Autocomplete ownership arena

Question: what is the best owner and public shape for ordinary-text autocomplete in Plate v2, measured against the design built by `docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md` at commit `fe0e9599a6`?

Scope: `autocomplete`, with Plite input facts. Method: `pstack:architect` Phase B through `pstack:arena`. Three Opus runners each got `task.md` with one direction, the contract in `contract.md` and the traced built code in `grounding.md`. An Opus cross-judge scored the three candidates and the built design against `rubric.md`, which the runners never saw.

| Candidate | Direction | Judge score (of 24) |
| --- | --- | --- |
| `candidate-1.md` | Ideal target from first principles | 20 |
| `candidate-2.md` | A neutral Plite typeahead host per mounted Editable | 18 |
| built | The private per-Editable owner at `fe0e9599a6` | 15 |
| `candidate-3.md` | The query outside committed text, in a view-local input | 11 |

## Verdict

Candidate 1 is the base: a Plate host per mounted Editable, trigger policy compiled from a plugin declaration, a popup mounted only for its occurrence, and the input facts the built owner reconstructs moved into Plite. The judge's full scoring, the grafts it named and the claims it found false are in `judge.md`. The synthesis, with the grafts taken and refused, is in the plan `docs/plans/2026-10-03-autocomplete-occurrence-host.md`.

No runner or judge ran code. Every score rests on source reads at `fe0e9599a6`, and every cost figure in the candidates is a prediction.
