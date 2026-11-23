import type * as React from 'react';

import LucideIcon from '@/__registry__/create-preview/icons/lucide';

export function IconPlaceholder({
  hugeicons: _hugeicons,
  lucide,
  phosphor: _phosphor,
  remixicon: _remixicon,
  tabler: _tabler,
  ...props
}: React.ComponentProps<'svg'> & {
  hugeicons: string;
  lucide: React.ComponentProps<typeof LucideIcon>['name'];
  phosphor: string;
  remixicon: string;
  tabler: string;
}) {
  return <LucideIcon {...props} name={lucide} />;
}
