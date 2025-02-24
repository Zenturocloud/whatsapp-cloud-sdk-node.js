import express from 'express';
import { createClient, createWebhookHandler, WebhookMessage, WebhookStatus } from '../src';

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure WhatsApp client
const whatsapp = createClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'YOUR_PHONE_NUMBER_ID',
});

// Configure webhook handler
const webhookHandler = createWebhookHandler({
  appSecret: process.env.WHATSAPP_APP_SECRET || 'YOUR_APP_SECRET',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'YOUR_VERIFY_TOKEN',
});

// Parse JSON request bodies
app.use(express.json());

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const result = webhookHandler.verifyWebhook(mode, token, challenge);
  if (result) {
    return res.status(200).send(result);
  }
  
  res.sendStatus(403);
});

// Webhook event handling
app.post('/webhook', (req, res) => {
  // Verify request signature
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!webhookHandler.validateSignature(signature, JSON.stringify(req.body))) {
    return res.sendStatus(403);
  }

  // Process webhook event
  webhookHandler.handleWebhook(req.body, {
    onMessage: async (message: WebhookMessage) => {
      console.log('Received message:', message);
      await handleIncomingMessage(message);
    },
    onStatus: (status: WebhookStatus) => {
      console.log('Message status update:', status);
    }
  });

  // Always respond with 200 OK quickly to acknowledge receipt
  res.status(200).send('OK');
});

// Handle incoming messages
async function handleIncomingMessage(message: WebhookMessage) {
  try {
    if (message.type === 'text') {
      const userMessage = message.text.body.toLowerCase();
      const sender = message.from;

      // Echo back the message
      await whatsapp.sendTextMessage({
        to: sender,
        text: `You said: ${userMessage}`,
      });
      
      // Or respond with a template if the message is "hello"
      if (userMessage === 'hello') {
        await whatsapp.sendInteractiveMessage({
          to: sender,
          interactive: {
            type: 'button',
            body: {
              text: 'Welcome! How can I help you today?',
            },
            action: {
              buttons: [
                {
                  type: 'reply',
                  reply: {
                    id: 'info',
                    title: 'Get Information',
                  },
                },
                {
                  type: 'reply',
                  reply: {
                    id: 'support',
                    title: 'Contact Support',
                  },
                },
              ],
            },
          },
        });
      }
    } else if (message.type === 'interactive') {
      const sender = message.from;
      const interactiveResponse = message.interactive;
      
      if (interactiveResponse.type === 'button_reply') {
        const buttonId = interactiveResponse.button_reply?.id;
        
        if (buttonId === 'info') {
          await whatsapp.sendTextMessage({
            to: sender,
            text: 'Here is some information about our services...',
          });
        } else if (buttonId === 'support') {
          await whatsapp.sendTextMessage({
            to: sender,
            text: 'Our support team will contact you shortly.',
          });
        }
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening at http://localhost:${port}`);
});
