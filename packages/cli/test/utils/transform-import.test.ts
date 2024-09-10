import { expect, test } from 'vitest';

import { transform } from '../../src/utils/transformers';

test('transform import', async () => {
  expect(
    await transform({
      config: {
        aliases: {
          components: '@/components',
        },
        tailwind: {
          baseColor: 'neutral',
          cssVariables: true,
        },
      } as any,
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"

    import { cn } from "@udecode/cn"
    `,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      config: {
        aliases: {
          components: '~/src/components',
        },
      } as any,
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"

    import { cn, foo, bar } from "@udecode/cn"
    `,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      config: {
        aliases: {
          components: '~/src/components',
        },
      } as any,
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"

    import { cn } from "@udecode/cn"
    `,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      config: {
        aliases: {
          components: '~/src/components',
          'plate-ui': '~/src/components',
        },
      } as any,
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"
    import { cn } from "@/lib/utils"
    import { bar } from "@/lib/utils/bar"
    `,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      config: {
        aliases: {
          components: '~/src/components',
          'plate-ui': '~/src/plate-ui',
        },
      } as any,
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"
    import { cn } from "@/lib/utils"
    import { bar } from "@/lib/utils/bar"
    `,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      config: {
        aliases: {
          components: '~/src/components',
          ui: '~/src/components',
        },
      } as any,
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"
    import { cn } from "@/lib/utils"
    import { bar } from "@/lib/utils/bar"
    `,
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      config: {
        aliases: {
          components: '~/src/components',
          ui: '~/src/ui',
        },
      } as any,
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"
    import { cn } from "@/lib/utils"
    import { bar } from "@/lib/utils/bar"
    `,
    })
  ).toMatchSnapshot();
});
