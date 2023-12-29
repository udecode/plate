import { expect, test } from 'vitest';

import { transform } from '../../src/utils/transformers';
import stone from '../fixtures/colors/stone.json';

test('transform css vars true', async () => {
  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from 'react'
export function Foo() {
	return <div className="bg-background hover:bg-muted text-primary-foreground sm:focus:text-accent-foreground">foo</div>
}
    `,
      config: {
        tailwind: {
          baseColor: 'stone',
          cssVariables: true,
        },
        aliases: {
          components: '@/components',
        },
      },
      baseColor: stone,
    })
  ).toMatchSnapshot();
});

test('transform css vars false', async () => {
  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from 'react'
export function Foo() {
	return <div className="bg-background hover:bg-muted text-primary-foreground sm:focus:text-accent-foreground">foo</div>
}
    `,
      config: {
        tailwind: {
          baseColor: 'stone',
          cssVariables: false,
        },
        aliases: {
          components: '@/components',
        },
      },
      baseColor: stone,
    })
  ).toMatchSnapshot();
});

test('transform css vars false with cn', async () => {
  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from 'react'
export function Foo() {
	return <div className={cn('bg-background hover:bg-muted', true && 'text-primary-foreground sm:focus:text-accent-foreground')}>foo</div>
}"
    `,
      config: {
        tsx: true,
        tailwind: {
          baseColor: 'stone',
          cssVariables: false,
        },
        aliases: {
          components: '@/components',
        },
      },
      baseColor: stone,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from "react"
export function Foo() {
  return <div className={cn("bg-background border border-input")}>foo</div>
}"
    `,
      config: {
        tailwind: {
          baseColor: 'stone',
          cssVariables: false,
        },
        aliases: {
          components: '@/components',
        },
      },
      baseColor: stone,
    })
  ).toMatchSnapshot();
});
