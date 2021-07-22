import 'twin.macro';
import React from 'react';

export const Demo = () => (
  <div tw="relative px-4 max-w-7xl -mt-72 mx-auto w-full">
    <iframe
      src="https://codesandbox.io/embed/plate-playground-v1-2mh1c?autoresize=1&fontsize=16&theme=dark"
      style={{
        width: '100%',
        height: '80vh',
        border: 0,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
      title="Plate Playground"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    />
  </div>
);
