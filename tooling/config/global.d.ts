/// <reference types="bun-types/test-globals" />

type AnyTestMock = ((...args: any[]) => any) & {
  mock: { calls: any[]; instances: any[]; results: any[] };
  mockClear(): AnyTestMock;
  mockImplementation(fn: (...args: any[]) => any): AnyTestMock;
  mockReset(): AnyTestMock;
  mockRestore(): void;
  mockReturnValue(value: any): AnyTestMock;
  mockReturnValueOnce(value: any): AnyTestMock;
};

interface Spy extends AnyTestMock {}

declare namespace jasmine {
  interface Spy extends AnyTestMock {}
}

declare var mock: ((
  implementation?: (...args: any[]) => any
) => AnyTestMock) & {
  module(id: string, factory: () => any): void | Promise<void>;
  restore(): void;
};
declare function spyOn(...args: any[]): Spy;

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
