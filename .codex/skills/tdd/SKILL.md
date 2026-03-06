---
name: tdd
description: Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
---

# Test-Driven Development

## Philosophy

**Core principle**: Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

```typescript
// GOOD: Tests observable behavior
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

Characteristics of good tests:

- Tests behavior users/callers care about
- Uses public API only
- Survives internal refactors
- Describes WHAT, not HOW
- One logical assertion per test

**Bad tests** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). The warning sign: your test breaks when you refactor, but behavior hasn't changed.

```typescript
// BAD: Tests implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});

// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});
```

Red flags:

- Mocking internal collaborators
- Testing private methods
- Asserting on call counts/order
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT

Prefer writing tests before implementation. If you've already written code, consider starting fresh from tests rather than retrofitting — tests written after tend to verify what you built, not what's required.

## Mocking

Mock at **system boundaries** only:

- External APIs (payment, email, etc.)
- Databases (sometimes - prefer test DB)
- Time/randomness
- File system (sometimes)

Don't mock:

- Your own classes/modules
- Internal collaborators
- Anything you control

**Use dependency injection** — pass external dependencies in rather than creating them internally:

```typescript
// Easy to mock
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Hard to mock
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**Prefer SDK-style interfaces** — specific functions for each external operation:

```typescript
// GOOD: Each function is independently mockable
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch("/orders", { method: "POST", body: data }),
};

// BAD: Mocking requires conditional logic inside the mock
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

## Interface Design for Testability

1. **Accept dependencies, don't create them**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **Return results, don't produce side effects**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **Small surface area** — fewer methods = fewer tests needed, fewer params = simpler test setup

**Deep modules** (from "A Philosophy of Software Design"): small interface + lots of implementation. When designing, ask: Can I reduce methods? Simplify params? Hide more complexity inside?

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning

Before writing any code:

- [ ] Confirm with user what interface changes are needed
- [ ] Confirm with user which behaviors to test (prioritize)
- [ ] Identify opportunities for deep modules (small interface, deep implementation)
- [ ] Design interfaces for testability
- [ ] List the behaviors to test (not implementation steps)
- [ ] Get user approval on the plan

Ask: "What should the public interface look like? Which behaviors are most important to test?"

**You can't test everything.** Confirm with the user exactly which behaviors matter most. Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test → run test → confirm it FAILS correctly
GREEN: Write minimal code → run test → confirm it PASSES
```

- Test passes immediately? You're testing existing behavior. Fix the test.
- Test errors (not assertion failure)? Fix the error first — erroring is not the same as failing.

This is your tracer bullet - proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → run test → confirm it FAILS correctly
GREEN: Write minimal code → run test → confirm it PASSES
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior

### 4. Refactor

After all tests pass, look for refactor candidates:

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

Refactor candidates: duplication → extract function/class, long methods → break into private helpers, shallow modules → combine or deepen, feature envy → move logic to where data lives, primitive obsession → introduce value objects.

**Never refactor while RED.** Get to GREEN first.

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
[ ] Watched test fail before writing code
[ ] Failure was for expected reason (missing feature, not typo)
[ ] All other tests still pass
```

## Bug Fix Example

TDD applies to bug fixes — write a test that reproduces the bug first.

```
# Bug: empty email passes validation

RED:   test("rejects empty email", () => {
         const result = validateEmail("");
         expect(result.valid).toBe(false);
       });
       → Run test → FAILS (empty string passes validation) ✓

GREEN: Add check: if (!email || !email.includes("@")) return { valid: false }
       → Run test → PASSES ✓

       Verify all other validation tests still pass.
```

## Type Testing

Compile-time type assertions. No runtime — just `bun typecheck`. Catches regressions in generics, conditional types, and type constraints that runtime tests can't see.

**When:** generic APIs, utility types, complex inference, mapped/conditional types, ensuring invalid usage errors. **Not:** trivial stuff like `string` prop accepts `string`.

### Utilities

Search for a file exporting `Expect` and `Equal`. If none exists, create one:

```typescript
export function Expect<T extends true>() {}
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;
export type Not<T extends boolean> = T extends true ? false : true;
export type IsAny<T> = 0 extends 1 & T ? true : false;
export type IsNever<T> = [T] extends [never] ? true : false;
```

- `Expect<T extends true>` — compile error = test failure
- `Equal<X, Y>` — exact type equality (defeats `any` widening)
- `Not`, `IsAny`, `IsNever` — edge case guards (`any`/`never` break naive comparisons)

### Positive Assertions

```typescript
import { Expect, Equal, Not, IsAny } from "./utils";

// Block scope each test to avoid name collisions
{
  type Result = ReturnType<typeof myGenericFn<SomeInput>>;
  Expect<Equal<Result, { id: string; name: string }>>;
  Expect<Not<IsAny<Result>>>;
}
```

### Negative Tests

`@ts-expect-error` **must** be on the line immediately before the error. Always include a reason. Unused directive = failing test (constraint is missing).

```typescript
// ✅ directive on line immediately before error
doSomething({
  // @ts-expect-error - name must be string
  name: 123,
});

// ❌ directive too far from error
doSomething({
  // @ts-expect-error - name must be string
  ...defaults,
  name: 123,
});
```

### Tips

- **`declare const`** for mock values without runtime: `declare const ctx: SomeCtx;`
- **`type _name = Expect<...>`** when you need a type-level-only assertion (no runtime `Expect()` call needed)
- **`/* biome-ignore-all lint */`** at file top for type-only files — suppresses unused variable warnings

Run with `bun typecheck`. If it compiles, it passes.
