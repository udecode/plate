import { createPlateTargetScope } from './createPlateTargetScope';

test('primary fallback, focus and retirement use target identity even with equal application IDs', () => {
  const scope = createPlateTargetScope();
  const a = { id: 'same' };
  const b = { id: 'same' };
  const c = { id: 'same' };
  const removeA = scope.register(a, true);
  const removeB = scope.register(b, false);
  expect(scope.getSnapshot()).toBe(a);
  scope.focus(b);
  expect(scope.getSnapshot()).toBe(b);
  scope.setPrimary(c, true);
  scope.focus(c);
  expect(scope.getSnapshot()).toBe(b);
  scope.setPrimary(b, true);
  removeA();
  expect(scope.getSnapshot()).toBe(b);
  scope.register(c, true);
  removeB();
  expect(scope.getSnapshot()).toBe(c);
  removeB();
  scope.focus(b);
  expect(scope.getSnapshot()).toBe(c);
});

test('focus changes notify once regardless of the number of mounted targets', () => {
  const scope = createPlateTargetScope();
  const targets = Array.from({ length: 1000 }, () => ({}));
  const remove = targets.map((target) => scope.register(target, true));
  const updates: unknown[] = [];
  const unsubscribe = scope.subscribe(() => updates.push(scope.getSnapshot()));
  scope.focus(targets[999]);
  scope.focus(targets[999]);
  expect(updates).toEqual([targets[999]]);
  remove[999]();
  expect(updates).toEqual([targets[999], targets[0]]);
  unsubscribe();
  remove.forEach((dispose) => dispose());
  expect(scope.getSnapshot()).toBeNull();
  expect(updates).toHaveLength(2);
});
