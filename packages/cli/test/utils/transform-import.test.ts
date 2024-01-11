import { expect, test } from 'vitest';

import { transform } from '../../src/utils/transformers';

test('transform import', async () => {
  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"

    import { cn } from "@udecode/cn"
    `,
      config: {
        tailwind: {
          baseColor: 'neutral',
          cssVariables: true,
        },
        aliases: {
          components: '@/components',
        },
      },
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"

    import { cn, foo, bar } from "@udecode/cn"
    `,
      config: {
        aliases: {
          components: '~/src/components',
        },
      },
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"

    import { cn } from "@udecode/cn"
    `,
      config: {
        aliases: {
          components: '~/src/components',
        },
      },
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"
    import { cn } from "@/lib/utils"
    import { bar } from "@/lib/utils/bar"
    `,
      config: {
        aliases: {
          components: '~/src/components',
          'plate-ui': '~/src/components',
        },
      },
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"
    import { cn } from "@/lib/utils"
    import { bar } from "@/lib/utils/bar"
    `,
      config: {
        aliases: {
          components: '~/src/components',
          'plate-ui': '~/src/plate-ui',
        },
      },
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"
    import { cn } from "@/lib/utils"
    import { bar } from "@/lib/utils/bar"
    `,
      config: {
        aliases: {
          components: '~/src/components',
          ui: '~/src/components',
        },
      },
    })
  ).toMatchSnapshot();

  expect(
    await transform({
      filename: 'test.ts',
      raw: `import * as React from "react"
import { Foo } from "bar"
    import { Button } from "@/registry/default/plate-ui/button"
    import { Label} from "ui/label"
    import { Box } from "@/registry/default/box"
    import { cn } from "@/lib/utils"
    import { bar } from "@/lib/utils/bar"
    `,
      config: {
        aliases: {
          components: '~/src/components',
          ui: '~/src/ui',
        },
      },
    })
  ).toMatchSnapshot();
});
