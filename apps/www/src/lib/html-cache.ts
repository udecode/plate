import * as React from 'react';

import fs from 'node:fs/promises';
import path from 'node:path';

export const getCachedTailwindCss = React.cache(async () => {
  const cssPath = path.join(process.cwd(), 'public', 'tailwind.css');

  return await fs.readFile(cssPath, 'utf8');
});
