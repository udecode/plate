'use client';

import { PlaceholderPlugin } from 'platejs/media/react';
import { EditorContent, EditorRoot, useCreateEditor } from 'platejs/react';

type ClipboardUploadProof = {
  aborted: boolean;
  exactFile: boolean;
  fileName: string | null;
  pastedFile: File | null;
  resolve: (() => void) | null;
  starts: number;
};

declare global {
  interface Window {
    __clipboardUploadProof?: ClipboardUploadProof;
  }
}

const getProof = () => {
  const existing = window.__clipboardUploadProof;

  if (existing) return existing;

  const proof: ClipboardUploadProof = {
    aborted: false,
    exactFile: false,
    fileName: null,
    pastedFile: null,
    resolve: null,
    starts: 0,
  };

  window.__clipboardUploadProof = proof;

  return proof;
};

const UploadPlaceholderPlugin = PlaceholderPlugin.configure({
  component: ({ attributes, children }) => (
    <div {...attributes} data-testid="upload-placeholder">
      {children}
    </div>
  ),
  initialState: {
    upload: (file, { signal }) => {
      const proof = getProof();

      proof.starts += 1;
      proof.exactFile = file === proof.pastedFile;
      proof.fileName = file.name;
      signal.addEventListener(
        'abort',
        () => {
          proof.aborted = true;
        },
        { once: true }
      );

      return new Promise((resolve) => {
        proof.resolve = () =>
          resolve({
            naturalHeight: 60,
            naturalWidth: 80,
            url: 'https://example.test/clipboard-upload.png',
          });
      });
    },
  },
});

export default function ClipboardUploadProofPage() {
  const editor = useCreateEditor({
    plugins: [UploadPlaceholderPlugin],
    initialValue: [{ children: [{ text: 'target' }], type: 'paragraph' }],
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContent aria-label="Upload clipboard proof" />
    </EditorRoot>
  );
}
