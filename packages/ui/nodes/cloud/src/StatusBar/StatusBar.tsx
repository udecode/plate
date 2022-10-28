import React, { useEffect, useRef, useState } from 'react';
import { Upload, UploadProgress } from '@udecode/plate-cloud';

export function ProgressBar({ upload }: { upload: UploadProgress }) {
  const [width, setWidth] = useState<null | number>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) setWidth(ref.current.offsetWidth);
  }, []);
  /**
   * This formula looks a little funny because we want the `0` value of the
   * progress bar to have a width that is still the height of the progress bar.
   *
   * This is for a few reasons:
   *
   * 1. We want the zero point to start with the progress bar being a circle
   * 2. If we want rounded edges, if the width is shorter than the height,
   *    we get an oval instead of a circle
   * 3. The halfway point looks visually wrong because of the circle progress
   *    bar when it is technically at the halfway point.
   */
  const progressWidth =
    width == null
      ? 0
      : (upload.sentBytes / upload.totalBytes) * (width - 16) + 16;

  return (
    <div
      ref={ref}
      style={{
        height: 16,
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 0 1px 0px rgba(0,0,0,1)',
      }}
    >
      <div
        style={{
          background: 'DodgerBlue',
          width: progressWidth,
          transition: 'width 0.1s',
          height: 16,
          borderRadius: 8,
        }}
      />
    </div>
  );
}

export function FailBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: 16,
        fontFamily: 'sans-serif',
        fontSize: '75%',
        fontWeight: 'bold',
        lineHeight: '16px',
        color: 'rgba(255, 255, 255, 0.9)',
        background: 'FireBrick',
        textAlign: 'center',
        textTransform: 'uppercase',
        borderRadius: 8,
        boxShadow: '0 0 1px 0px rgba(0,0,0,1)',
      }}
    >
      {children}
    </div>
  );
}

export function StatusBar(props: { upload: Upload; children: JSX.Element }) {
  const { upload, children } = props;
  switch (upload.status) {
    case 'progress':
      return <ProgressBar upload={upload} />;
    case 'error':
      return <FailBar>Upload Failed</FailBar>;
    case 'not-found':
      return <FailBar>Upload State Not Found</FailBar>;
    case 'success':
      return children;
    default:
      throw new Error(`Should be unreachable`);
  }
}
