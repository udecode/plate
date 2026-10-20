const runtime = globalThis as { Bun?: { gc: (force: boolean) => void } };

export const facts = () => [
  Bun.version,
  Bun.env.CI,
  typeof Bun,
  runtime.Bun?.gc(true),
];
