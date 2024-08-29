import { expect, test } from 'vitest';

import { transform } from '../../src/utils/transformers';
import stone from '../fixtures/colors/stone.json';

test('transform css vars true', async () => {
  expect(
    await transform({
      baseColor: stone,
      config: {
        aliases: {
          components: '@/components',
        },
        tailwind: {
          baseColor: 'stone',
          cssVariables: true,
        },
      } as any,
      filename: 'test.ts',
      raw: `import * as React from 'react'
export function Foo() {
	return <div className="bg-background hover:bg-muted text-primary-foreground sm:focus:text-accent-foreground">foo</div>
}
    `,
    })
  ).toMatchSnapshot();
});

test('transform css vars false', async () => {
  expect(
    await transform({
      baseColor: stone,
      config: {
        aliases: {
          components: '@/components',
        },
        tailwind: {
          baseColor: 'stone',
          cssVariables: false,
        },
      } as any,
      filename: 'test.ts',
      raw: `import * as React from 'react'
export function Foo() {
	return <div className="bg-background hover:bg-muted text-primary-foreground sm:focus:text-accent-foreground">foo</div>
}
    `,
    })
  ).toMatchSnapshot();
});

test('transform css vars false with cn', async () => {
  expect(
    await transform({
      baseColor: stone,
      config: {
        aliases: {
          components: '@/components',
        },
        tailwind: {
          baseColor: 'stone',
          cssVariables: false,
        },
        tsx: true,
      } as any,
      filename: 'test.ts',
      raw: `import * as React from 'react'
export function Foo() {
	return <div className={cn('bg-background hover:bg-muted', true && 'text-primary-foreground sm:focus:text-accent-foreground')}>foo</div>
}"
    `,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      baseColor: stone,
      config: {
        aliases: {
          components: '@/components',
        },
        tailwind: {
          baseColor: 'stone',
          cssVariables: false,
        },
      } as any,
      filename: 'test.ts',
      raw: `import * as React from "react"
export function Foo() {
  return <div className={cn("bg-background border border-input")}>foo</div>
}"
    `,
    })
  ).toMatchSnapshot();
});
