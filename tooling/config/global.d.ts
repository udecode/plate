/// <reference types="bun-types/test-globals" />

declare var mock: typeof import('bun:test').mock;
declare var spyOn: typeof import('bun:test').spyOn;

// Extend Bun's Spy/Mock type with Jest-compatible methods for typecheck
declare module 'bun:test' {
  interface Mock<T extends (...args: any[]) => any = any> {
    mock: { calls: any[]; results: any[]; instances: any[] };
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    mockImplementation(fn: T): this;
    mockReturnValue(value: any): this;
    mockReturnValueOnce(value: any): this;
  }
  // Spy is alias for Mock in jest compatibility
  interface Spy extends Mock {}
}
