import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import type * as React from 'react';

const LUCIDE_ICONS = {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  XIcon,
};

export function IconPlaceholder({
  hugeicons: _hugeicons,
  lucide,
  phosphor: _phosphor,
  remixicon: _remixicon,
  tabler: _tabler,
  ...props
}: React.ComponentProps<'svg'> & {
  hugeicons: string;
  lucide: keyof typeof LUCIDE_ICONS;
  phosphor: string;
  remixicon: string;
  tabler: string;
}) {
  const Icon = LUCIDE_ICONS[lucide];

  return <Icon {...props} />;
}
