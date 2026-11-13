import { type Clock, socketTransport, systemClock } from './transport';

const PROTOCOL = 'editor-sync.1';

/**
 * Browser WebSockets cannot set headers, so the token rides as the second
 * subprotocol to stay out of the URL.
 */
export const webSocketTransport = ({
  clock = systemClock,
  token,
  url,
}: Readonly<{ clock?: Clock; token: () => string; url: string }>) =>
  socketTransport((events) => {
    const socket = new WebSocket(url, [PROTOCOL, token()]);

    socket.addEventListener('open', events.open);
    socket.addEventListener('close', events.closed);
    socket.addEventListener('message', (event) => {
      if (typeof event.data === 'string') events.text(event.data);
    });

    return {
      close: () => socket.close(),
      send: (data) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(data);
      },
    };
  }, clock);
