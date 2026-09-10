# Architectural Critique Rubric

Review through whichever of these lenses are relevant. Not every lens applies to every subsystem.

## Abstraction Fit

Are the abstractions pulling their weight?

- Does each abstraction represent a real concept, or is it an indirection layer "in case we need it"?
- Are the boundaries in the right place? Do they separate things that change independently?
- Is there accidental coupling where components share implementation details they shouldn't need to know about?
- Is business logic entangled with framework wiring, or cleanly separated?

Over-abstraction is as much a problem as under-abstraction. A flat, simple design is fine when the domain is simple.

## Data Model

Do the data structures fit the actual usage patterns?

- Are the data models designed for how data is actually accessed, or for how it was conceptually modeled?
- Are there impedance mismatches, places where code constantly reshapes data because the model doesn't match the access pattern?
- Are types honest? Do they represent what data actually looks like at runtime, or claim more structure than exists?

## Boundary Discipline

Are system boundaries clean and well-placed?

- Is validation concentrated at entry points, or scattered through internal code?
- Are errors handled at boundaries and propagated cleanly, or caught and re-thrown at every layer?
- Does data cross boundaries in well-typed shapes, or as bags of optional fields?
- Could this subsystem be tested in isolation, or does it require the entire system to be running?

## Evolution Readiness

How well will this architecture handle likely changes?

- If the most probable next requirement landed tomorrow, how much would change? "One file" or "everything"?
- Are there hardcoded assumptions that would need to be relaxed?
- Is the design bolted-on (integrated as an afterthought) or integrated (looks like it was always part of the plan)?
- Are legacy paths preserved for compatibility that no one depends on?

Don't penalize for not handling hypothetical changes. Focus on changes plausible given the codebase's trajectory.

## Complexity vs. Value

Is the complexity budget spent wisely?

- Is complexity concentrated in the parts that need it (core logic, tricky invariants) or in accidental places (boilerplate, unnecessary indirection, configuration)?
- Are there simpler ways to achieve the same behavior?
- Does every component earn its existence, or are there vestigial pieces from an earlier design?

## Consistency

Does this subsystem follow the patterns established elsewhere in the codebase?

- Are similar problems solved the same way here as elsewhere, or does this area invent its own patterns?
- If the patterns differ, is there a good reason, or did it just evolve independently?
- Inconsistency isn't automatically bad. But unexplained inconsistency is a maintenance burden.
