import React, { HTMLAttributes, useEffect, useRef, useState } from 'react';
import { Upload, UploadProgress } from '@udecode/plate-cloud';
import { cn } from '@udecode/plate-styled-components';

export function ProgressBar({
  upload,
  className,
  ...props
}: {
  upload: UploadProgress;
} & HTMLAttributes<HTMLDivElement>) {
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
      className={cn('h-4 rounded-lg bg-gray-100 shadow-md', className)}
      {...props}
    >
      <div
        className="h-4 rounded-lg bg-blue-500 duration-100"
        style={{
          width: progressWidth,
        }}
      />
    </div>
  );
}

export function FailBar({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'h-4 rounded-lg border bg-red-700 text-center text-xs font-bold uppercase leading-tight text-white shadow-md',
        className
      )}
      {...props}
    />
  );
}

export function StatusBar(props: { upload: Upload; children?: JSX.Element }) {
  const { upload, children } = props;
  switch (upload.status) {
    case 'progress':
      return <ProgressBar upload={upload} />;
    case 'error':
      return <FailBar>Upload Failed</FailBar>;
    case 'not-found':
      return <FailBar>Uploading...</FailBar>;
    case 'success':
      return children || null;
    default:
      throw new Error(`Should be unreachable`);
  }
}
