# WhatsApp Cloud SDK for Node.js

A comprehensive, developer-friendly Node.js wrapper for the WhatsApp Cloud API. This SDK provides intuitive access to all WhatsApp Business Platform features with strong typing, detailed documentation, and helpful abstractions.

[![npm version](https://img.shields.io/npm/v/whatsapp-cloud-sdk.svg)](https://www.npmjs.com/package/whatsapp-cloud-sdk)
[![License](https://img.shields.io/github/license/zenturocloud/whatsapp-cloud-sdk-node)](https://github.com/zenturocloud/whatsapp-cloud-sdk-node/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)](https://www.typescriptlang.org/)

## Features

- **Complete API Coverage**: Access all WhatsApp Cloud API endpoints including messaging, templates, media, contacts, and more
- **Type Safety**: Written in TypeScript with comprehensive type definitions for all API responses and requests
- **Authentication Handling**: Simple setup for access tokens with automatic token refresh
- **Webhook Support**: Easy webhook configuration and event handling
- **Error Handling**: Detailed error responses with helpful troubleshooting guidance
- **Rate Limiting**: Built-in mechanisms to handle API rate limits gracefully
- **Media Handling**: Simplified uploading, downloading, and managing media files
- **Template Management**: Create, update, and send message templates with ease
- **Conversation Features**: Support for all messaging types (text, media, interactive, etc.)
- **Minimal Dependencies**: Lightweight core with optional plugins

## Installation

```bash
npm install whatsapp-cloud-sdk
# or
yarn add whatsapp-cloud-sdk
```

## Quick Start

```javascript
const { WhatsAppCloudAPI } = require('whatsapp-cloud-sdk');
// or using ES modules
// import { WhatsAppCloudAPI } from 'whatsapp-cloud-sdk';

// Initialize the client
const whatsapp = new WhatsAppCloudAPI({
  accessToken: 'YOUR_ACCESS_TOKEN',
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
  version: 'v18.0', // Optional, defaults to latest version
});

// Send a text message
async function sendMessage() {
  try {
    const response = await whatsapp.sendTextMessage({
      to: '15551234567',
      text: 'Hello from WhatsApp Cloud SDK!',
    });
    console.log('Message sent:', response.messages[0].id);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

sendMessage();
```

## Documentation

For complete documentation, visit [our documentation site](#).

### Core Components

- Client Setup and Authentication
- Sending Messages (Text, Media, Interactive, etc.)
- Receiving and Processing Webhooks
- Managing Templates
- Handling Media
- Error Handling and Troubleshooting

## Examples

### Sending a Media Message

```javascript
// Send an image
const response = await whatsapp.sendMediaMessage({
  to: '15551234567',
  mediaType: 'image',
  mediaUrl: 'https://example.com/image.jpg',
  caption: 'Check out this image!'
});
```

### Sending an Interactive Message

```javascript
// Send an interactive button message
const response = await whatsapp.sendInteractiveMessage({
  to: '15551234567',
  interactive: {
    type: 'button',
    body: { text: 'Would you like to proceed?' },
    action: {
      buttons: [
        { type: 'reply', reply: { id: 'yes', title: 'Yes' } },
        { type: 'reply', reply: { id: 'no', title: 'No' } }
      ]
    }
  }
});
```

### Handling Webhooks

```javascript
const express = require('express');
const { createWebhookHandler } = require('whatsapp-cloud-sdk');

const app = express();
const port = 3000;

const webhookHandler = createWebhookHandler({
  appSecret: 'YOUR_APP_SECRET', // For validating signed requests
});

// Set up webhook endpoint
app.post('/webhook', express.json(), (req, res) => {
  // Validate and process the webhook
  webhookHandler.handleWebhook(req.body, {
    onMessage: async (message) => {
      console.log('Received message:', message.text?.body);
      // Respond to the message
    },
    onStatus: (status) => {
      console.log('Message status update:', status.status);
    },
  });
  
  res.status(200).send('OK');
});

// Set up webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === 'YOUR_VERIFY_TOKEN') {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.listen(port, () => {
  console.log(`Webhook server listening at http://localhost:${port}`);
});
```

## Project Status

This is a closed-source project maintained by ZenturoCloud. While we welcome feedback, bug reports, and feature requests through the Issues section, we are not accepting code contributions at this time.

The SDK is professionally maintained and regularly updated to ensure compatibility with the latest WhatsApp Cloud API versions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Maintenance & Version Support

This SDK is actively maintained with dedicated support for the following WhatsApp API versions:

- v19.0 (branch: `v19`)
- v20.0 (branch: `v20`)
- v21.0 (branch: `v21`) 
- v22.0 (branch: `v22`)

New API version branches will be added as Meta releases them, ensuring you always have access to the latest WhatsApp Cloud API features. Each branch is thoroughly tested against its respective API version.

We're committed to long-term maintenance of this SDK with:
- Regular updates for new API features
- Security patches
- Bug fixes
- Performance improvements

## Related Projects

- [whatsapp-cloud-sdk-python](https://github.com/zenturocloud/whatsapp-cloud-sdk-python)
- [whatsapp-cloud-sdk-rust](https://github.com/zenturocloud/whatsapp-cloud-sdk-rust)
