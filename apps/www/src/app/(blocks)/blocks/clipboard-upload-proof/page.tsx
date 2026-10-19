'use client';

import { createFilesClient } from 'files-sdk/client';
import { BaseImagePlugin } from 'platejs/media';
import { EditorContent, EditorRoot, useCreateEditor } from 'platejs/react';
import { UploadPlugin } from 'platejs/upload/react';

import { MediaToolbarButton } from '@/registry/components/editor/media-toolbar-button';
import { Toolbar } from '@/registry/components/editor/toolbar';

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

const client = createFilesClient({ endpoint: '/api/files?documentId=proof' });

Object.assign(client, {
  upload: (file: File, { signal }: { signal?: AbortSignal } = {}) => {
    const proof = getProof();

    proof.starts += 1;
    proof.exactFile = file === proof.pastedFile;
    proof.fileName = file.name;
    signal?.addEventListener(
      'abort',
      () => {
        proof.aborted = true;
      },
      { once: true }
    );

    return new Promise((resolve) => {
      proof.resolve = () =>
        resolve({
          key: 'clipboard-upload.png',
          size: file.size,
          type: file.type,
        });
    });
  },
});

const ClipboardUploadPlugin = UploadPlugin.configure({
  component: ({ attributes, children }) => (
    <div {...attributes} data-testid="upload">
      {children}
    </div>
  ),
  initialState: {
    client,
    getUrl: ({ key }) => `https://example.test/${key}`,
  },
});

export default function ClipboardUploadProofPage() {
  const editor = useCreateEditor({
    plugins: [BaseImagePlugin, ClipboardUploadPlugin],
    initialValue: [{ children: [{ text: 'target' }], type: 'paragraph' }],
  });

  return (
    <EditorRoot editor={editor}>
      <Toolbar data-testid="upload-picker">
        <MediaToolbarButton plugin={BaseImagePlugin} />
      </Toolbar>
      <EditorContent aria-label="Upload clipboard proof" />
    </EditorRoot>
  );
}
