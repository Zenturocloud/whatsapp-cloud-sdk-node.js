import { createClient } from '../src';

// Initialize the client
const whatsapp = createClient({
  accessToken: 'YOUR_ACCESS_TOKEN',
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
});

async function sendTextMessage() {
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

async function sendMediaMessage() {
  try {
    const response = await whatsapp.sendMediaMessage({
      to: '15551234567',
      mediaType: 'image',
      mediaUrl: 'https://example.com/image.jpg',
      mediaCaption: 'Check out this image!',
    });
    console.log('Image message sent:', response.messages[0].id);
  } catch (error) {
    console.error('Error sending image:', error);
  }
}

async function sendTemplateMessage() {
  try {
    const response = await whatsapp.sendTemplateMessage({
      to: '15551234567',
      templateName: 'sample_template',
      languageCode: 'en_US',
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: 'John Doe',
            },
            {
              type: 'text',
              text: '30',
            },
          ],
        },
      ],
    });
    console.log('Template message sent:', response.messages[0].id);
  } catch (error) {
    console.error('Error sending template:', error);
  }
}

async function sendInteractiveMessage() {
  try {
    const response = await whatsapp.sendInteractiveMessage({
      to: '15551234567',
      interactive: {
        type: 'button',
        body: {
          text: 'Would you like to proceed?',
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'yes',
                title: 'Yes',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'no',
                title: 'No',
              },
            },
          ],
        },
      },
    });
    console.log('Interactive message sent:', response.messages[0].id);
  } catch (error) {
    console.error('Error sending interactive message:', error);
  }
}

// Run examples
(async () => {
  await sendTextMessage();
  // Uncomment to try other examples
  // await sendMediaMessage();
  // await sendTemplateMessage();
  // await sendInteractiveMessage();
})();
