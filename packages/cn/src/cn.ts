import { cx } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

import type { CxOptions } from 'class-variance-authority';

/**
 * Tailwind CSS classnames merge.
 */
export function cn(...inputs: CxOptions) {
  return twMerge(cx(inputs));
}
