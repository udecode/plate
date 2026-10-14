import { io } from 'next/cache';
import * as React from 'react';

async function requestTime() {
  await io();

  return Date.now();
}

// Only the HTML parser runs this script, so a refresh or remount that renders a
// later time leaves the document's first render time in place.
export async function DriveStamp() {
  return (
    <div
      hidden
      // oxlint-disable-next-line react/no-danger -- the HTML is a fixed script around a server number; a <script> element makes React log an error when the client creates it
      dangerouslySetInnerHTML={{
        __html: `<script>window.__driveRendered = ${await requestTime()}</script>`,
      }}
    />
  );
}
