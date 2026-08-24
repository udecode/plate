# Sources and synthesis notes

The master skill was built from the ten skills ranked in [Juampi's anti-slop post](https://x.com/juampitech/status/2090834948332655011). Sources were inspected at these commits on 2026-08-22.

| Skill | Source | Commit | Useful contribution | License at source |
| --- | --- | --- | --- | --- |
| stop-slop | [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) | `8da1f030185bdfe8471220585162991eaeb970e9` | Compact phrase and structure checks | MIT |
| no-ai-slop | [petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop) | `d30eddb9e04562234f2070b5ee63ca4649d9a05e` | Audit versus edit modes, minimum effective edit, portability test | MIT |
| humanizer | [blader/humanizer](https://github.com/blader/humanizer) | `e2e92e7b4b8229253ed5c8e81dc65463fdeddda5` | Broad pattern catalog, false-positive guidance, voice matching | MIT |
| unslop | [cursor/plugins](https://github.com/cursor/plugins) | `46125561306434d8a1d7745d540d8932ab0cd2a2` | Plain-language pass and positive voice guidance | MIT declared for `pstack` |
| slopbeth | [ehmo/slopkit](https://github.com/ehmo/slopkit) | `b33718bb9283c11b09567dc714f92d90ffb7bd16` | Evidence boundaries, preservation checks, density tests, detector limits | MIT |
| humanizer | [Aboudjem/humanizer-skill](https://github.com/Aboudjem/humanizer-skill) | `9a7f35b7b9ad8c3abd71f10757ec9f91fb8ae165` | File modes, artifact masking, emerging copy-paste tells, medium profiles | MIT |
| deslop | [stephenturner/skills](https://github.com/stephenturner/skills) | `48287d806e61534bc14939b55b72c3f3f11a7db5` | Scientific register and composition-level tropes | MIT |
| anti-slop | [elithrar/dotfiles](https://github.com/elithrar/dotfiles) | `36b4a7e8d41b55ff5dff568a22f62bb0214967df` | Candidate validation and restraint | MIT |
| humanize | [aashaexo/soundshuman](https://github.com/aashaexo/soundshuman) | `a45cfbba9fde843d670e553a0aa98f6a23d7fb28` | Repo audit workflow and deterministic scanning | MIT |
| anti-ai-slop-writing | [jalaalrd/anti-ai-slop-writing](https://github.com/jalaalrd/anti-ai-slop-writing) | `63255f9bbb75a265dc5786a04535cd033f487756` | Destination formatting and explicit anti-fabrication rules | No license file found; reviewed only, no source text or code copied |

Several sources derive parts of their catalogs from [Wikipedia's Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing). This synthesis uses the underlying observations and rewrites the instructions for this skill.

## Deliberate exclusions

- AI-authorship probability and claims that a detector can prove who wrote text
- guaranteed detector evasion or "undetectable" output
- blanket bans on all adverbs, passive voice, formal words, questions, triads, or sentence openers
- fabricated facts and anecdotes added to make prose feel personal
- arbitrary sentence-length targets, forced uncommon words, fake mistakes, and Unicode evasion
- automatic rewrites based only on a linter threshold

The bundled script reports literal patterns and preservation-sensitive changes. Human judgment remains the release gate.
