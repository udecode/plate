import { notFound } from 'next/navigation';

import { AIStreamingProof } from './proof';

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <AIStreamingProof />;
}
