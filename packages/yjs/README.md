# Plate yjs plugin

This package implements the yjs plugin for Plate with support for both Hocuspocus and WebRTC providers.

## Documentation

Check out [Collaboration](https://platejs.org/docs/collaboration) for the main documentation.

### Provider Options

The plugin supports two types of providers:

1. **Hocuspocus Provider** (Default)
   - Server-based collaboration using WebSocket
   - Suitable for large-scale applications
   - Requires a Hocuspocus server
   - Configuration:
   ```typescript
   const options = {
     providerType: 'hocuspocus',
     hocuspocusProviderOptions: {
       url: 'ws://localhost:1234',
       name: 'document-name',
       // ... other Hocuspocus options
     }
   };
   ```

2. **WebRTC Provider**
   - Peer-to-peer collaboration using WebRTC
   - No server required (except for signaling)
   - Best for small to medium-sized groups
   - Configuration:
   ```typescript
   const options = {
     providerType: 'webrtc',
     webrtcProviderOptions: {
       roomName: 'your-room-name',
       password: 'optional-room-password',
       signaling: ['wss://signaling.yjs.dev'], // Optional custom signaling servers
       maxConns: 20, // Optional max connections
       filterBcConns: true, // Optional: filter broadcast channel connections
     }
   };
   ```

## Example Usage

```typescript
import { createPlateUI } from '@udecode/plate';
import { YjsPlugin } from '@udecode/plate-yjs';

const plugins = [
  // ... other plugins
  YjsPlugin({
    // Choose your provider type and options
    providerType: 'webrtc', // or 'hocuspocus'
    webrtcProviderOptions: {
      roomName: 'my-document',
      password: 'optional-password',
    },
    // Optional cursor options
    cursorOptions: {
      // ... cursor options
    },
  }),
];

const editor = createPlateUI({
  plugins,
});
```

## License

[MIT](../../LICENSE)
