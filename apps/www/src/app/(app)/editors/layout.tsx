import type { Metadata } from 'next';

import { EditorDescription } from './editor-description';

const title = 'Building Editors for the Web';
const description =
  'Clean, modern building editors. Copy and paste into your apps. Works with all React frameworks.';

export const metadata: Metadata = {
  description,
  openGraph: {
    images: [
      {
        url: `/og?title=${encodeURIComponent(
          title
        )}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
  title,
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: `/og?title=${encodeURIComponent(
          title
        )}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
};

export default function EditorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <EditorDescription />

      <div className="container-wrapper section-soft flex-1 md:py-12">
        <div className="container">
          <section id="blocks" className="scroll-mt-24">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
