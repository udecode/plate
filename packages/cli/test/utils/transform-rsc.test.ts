import { expect, test } from 'vitest';

import { transform } from '../../src/utils/transformers';

test('transform rsc', async () => {
  expect(
    await transform({
      config: {
        rsc: true,
      } as any,
      filename: 'test.ts',
      raw: `import * as React from 'react'
import { Foo } from 'bar'
    `,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      config: {
        rsc: true,
      } as any,
      filename: 'test.ts',
      raw: `'use client'

      import * as React from 'react'
import { Foo } from 'bar'
    `,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      config: {
        rsc: false,
      } as any,
      filename: 'test.ts',
      raw: `'use client'

     import * as React from 'react'
import { Foo } from 'bar'
    `,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      config: {
        rsc: false,
      } as any,
      filename: 'test.ts',
      raw: `'use foo'

      import * as React from 'react'
import { Foo } from 'bar'

'use client'
    `,
    })
  ).toMatchSnapshot();
});
