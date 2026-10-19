import type { Metadata } from 'next';

import { CreateClient } from './create-client';

export const metadata: Metadata = {
  title: 'Create a Plate editor',
  description:
    'Create a Plate editor with your preferred shadcn style and primitives.',
};

export default function CreatePage() {
  return <CreateClient />;
}
