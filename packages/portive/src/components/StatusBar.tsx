import React from 'react';
import { useHostedImageStore } from '../hostedImageStore';

export function ProgressBar({
  className,
  style,
  width,
  height = 16,
}: {
  className?: string;
  style?: React.CSSProperties;
  width: number;
  height?: number;
}) {
  const origin = useHostedImageStore().get.origin();

  if (!origin || origin.status !== 'uploading') {
    return null;
  }
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
    (origin.sentBytes / origin.totalBytes) * (width - height) + height;
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: 'white',
        borderRadius: height / 2,
        boxShadow: '0 0 1px 0px rgba(0,0,0,1)',
        ...style,
      }}
    >
      <div
        style={{
          background: 'DodgerBlue',
          width: progressWidth,
          transition: 'width 0.1s',
          height,
          borderRadius: height / 2,
        }}
      />
    </div>
  );
}

export function ErrorBar({
  className,
  style,
  width,
  height = 16,
}: {
  className?: string;
  style?: React.CSSProperties;
  width: number;
  height?: number;
}) {
  const origin = useHostedImageStore().get.origin();

  if (!origin || origin.status !== 'error') {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        width,
        height,
        fontFamily: 'sans-serif',
        fontSize: '75%',
        fontWeight: 'bold',
        lineHeight: `${height}px`,
        color: 'rgba(255, 255, 255, 0.9)',
        background: 'FireBrick',
        textAlign: 'center',
        textTransform: 'uppercase',
        borderRadius: height / 2,
        boxShadow: '0 0 1px 0px rgba(0,0,0,1)',
        ...style,
      }}
    >
      Upload Failed
    </div>
  );
}

export function StatusBar(props: {
  className?: string;
  style?: React.CSSProperties;
  width: number;
  height?: number;
  children?: React.ReactNode;
}) {
  const origin = useHostedImageStore().get.origin();

  const { children, className, height, style, width } = props;

  console.log(origin?.status);

  switch (origin?.status) {
    case 'uploading':
      return <ProgressBar {...props} />;
    case 'error':
      return <ErrorBar {...props} />;
    case 'complete':
      return children ? (
        <div
          className={className}
          style={{
            width,
            height,
            ...style,
          }}
        >
          {children}
        </div>
      ) : null;
    default:
      return null;
  }
}
