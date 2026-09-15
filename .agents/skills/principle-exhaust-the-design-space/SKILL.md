---
name: principle-exhaust-the-design-space
description: "Compare concrete alternatives when a consequential interaction or architecture choice remains unsettled."
---

# Exhaust the Design Space

When a novel interaction or architectural decision has no established precedent, explore several concrete alternatives before implementation. Building the wrong thing costs more than exploring three options.

**The rule.** When the right answer is not obvious, build 2-3 competing prototypes or sketches. Compare them side by side. Only then commit. Design it twice is this rule by another name. A second flavor of the first shape does not count.

**When it applies:**
- Novel UI interactions (no prior art in the codebase)
- Architectural choices with multiple viable approaches
- Product design decisions where user experience depends on feel, not logic

**When it doesn't:**
- Mechanical implementation where the pattern is established
- Bug fixes or refactors with a clear target state
- Changes where constraints dictate a single viable approach
