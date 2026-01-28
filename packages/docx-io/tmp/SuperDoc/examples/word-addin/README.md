# SuperDoc MS Add-in Sync

Real-time document synchronization between Microsoft Word Add-in and web editor using WebSocket communication.

## Architecture

The system consists of three main components:
- **MS Word Add-in** (`src/taskpane/taskpane.js`) - Runs inside Microsoft Word
- **Web Editor** (`server/public/editor.js`) - Browser-based document editor
- **Node.js Server** (`server/server.js`) - WebSocket server handling real-time sync

## WebSocket Events

The WebSocket communication uses the following event types:

### `client_ready`
**Sent by:** Web Editor  
**Handled by:** Server (broadcasts to other clients)  
**Purpose:** Signals that a browser client has loaded and is ready to receive authentication

```javascript
// Sent by editor.js
websocket.send(JSON.stringify({
    type: 'client_ready'
}));

// Broadcasted by server.js to other clients
{
    type: 'client_ready',
    timestamp: '2024-01-01T00:00:00.000Z'
}
```

### `token_transfer`
**Sent by:** MS Word Add-in  
**Handled by:** Server (validates and broadcasts to other clients), Web Editor  
**Purpose:** Transfers authentication token from Word add-in to web editor

```javascript
// Sent by taskpane.js
websocket.send(JSON.stringify({
    type: 'token_transfer',
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik...'
}));

// Broadcasted by server.js after validation
{
    type: 'token_transfer',
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik...',
    user: {
        email: 'user@example.com',
        name: 'User Name',
        picture: 'https://example.com/avatar.jpg'
    },
    timestamp: '2024-01-01T00:00:00.000Z'
}

// Error response
{
    type: 'token_transfer',
    error: 'Invalid token',
    timestamp: '2024-01-01T00:00:00.000Z'
}
```

### `document_update`
**Sent by:** MS Word Add-in, Web Editor  
**Handled by:** Server (validates and broadcasts to other clients), MS Word Add-in, Web Editor  
**Purpose:** Real-time document synchronization between clients

```javascript
// Sent by taskpane.js or editor.js
websocket.send(JSON.stringify({
    type: 'document_update',
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik...',
    document: 'UEsDBBQABgAIAAAAIQDb4fbL7...' // Base64 encoded .docx
}));

// Broadcasted by server.js after validation
{
    type: 'document_update',
    document: 'UEsDBBQABgAIAAAAIQDb4fbL7...',
    author: 'user@example.com',
    timestamp: '2024-01-01T00:00:00.000Z'
}
```

### `close`
**Sent by:** Server  
**Handled by:** MS Word Add-in, Web Editor  
**Purpose:** Notifies clients when another connection closes

```javascript
// Broadcasted by server.js
{
    type: 'close',
    timestamp: '2024-01-01T00:00:00.000Z'
}
```

### `error`
**Sent by:** Server  
**Handled by:** MS Word Add-in, Web Editor  
**Purpose:** Notifies clients when a connection error occurs

```javascript
// Broadcasted by server.js
{
    type: 'error',
    timestamp: '2024-01-01T00:00:00.000Z'
}
```

## Authentication Flow

1. Web editor loads and sends `client_ready` to server
2. Server broadcasts `client_ready` to Word add-in
3. Word add-in sends `token_transfer` with user's authentication token
4. Server validates token against Auth0 and broadcasts `token_transfer` with user info to web editor
5. Both clients are now authenticated and can send `document_update` events

## Real-time Synchronization

- Document changes in Word trigger `document_update` events via selection change detection
- Document changes in web editor trigger `document_update` events via SuperDoc's `onEditorUpdate` callback
- All `document_update` events include the full document as Base64-encoded .docx
- Server validates authentication token before broadcasting updates
- Clients update their document content when receiving `document_update` events

## Setup

1. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   ```

2. Configure environment variables:
   
   **Auth0 Configuration** - Set up `src/auth0-config.js`:
   - Get your Auth0 domain, client ID, and audience from your [Auth0 Dashboard](https://manage.auth0.com/)
   - Create a new application or use an existing Single Page Application
   - Configure the redirect URLs to include your add-in's domain
   
   **Server Configuration** - Set up `server/.env`:
   - `AUTH0_DOMAIN`: Your Auth0 domain (e.g., `yourapp.us.auth0.com`)
   - `AUTH0_AUDIENCE`: Your Auth0 API identifier
   - Any additional environment variables required by your cloud function
   
   These environment variables are required for:
   - **Auth0**: Authenticating users and validating JWT tokens
   - **Cloud Function**: Server-side token validation and WebSocket communication

   You can reference the example files in the same directories.

3. Start the server:
   ```bash
   npm run server
   ```

4. Build and run the add-in:
   ```bash
   npm run build
   npm start
   ```