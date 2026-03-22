import { mock } from 'bun:test';
import type { Mock } from 'bun:test';

export type MockFn<T extends (...args: any[]) => any> = Mock<T> & T;

export const asMock = <T extends (...args: any[]) => any>(fn: T) =>
  fn as MockFn<T>;

export const mockFn = <T extends (...args: any[]) => any>(fn: T) =>
  mock(fn) as MockFn<T>;
