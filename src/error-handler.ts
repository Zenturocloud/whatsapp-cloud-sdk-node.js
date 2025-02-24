import { WhatsAppApiError } from './types';

interface ErrorMapping {
  [key: string]: {
    message: string;
    solution: string;
  };
}

export class ErrorHandler {
  private static errorMappings: ErrorMapping = {
    // Authorization errors
    'OAuthException-190': {
      message: 'Invalid OAuth access token',
      solution: 'Check that your access token is valid and has not expired. You may need to generate a new one.'
    },
    'OAuthException-10': {
      message: 'Application does not have permission for this action',
      solution: 'Ensure your app has the required permissions. Check your app settings in the Meta Developer Portal.'
    },
    
    // Rate limiting errors
    'OAuthException-80004': {
      message: 'Rate limit hit',
      solution: 'Your application is making too many requests. Implement rate limiting or exponential backoff.'
    },
    '4-30': {
      message: 'Too many messages sent to this number',
      solution: 'You have exceeded the rate at which you can send messages to this user. Wait and try again later.'
    },
    
    // Message content errors
    'GraphMethodException-100': {
      message: 'Invalid parameter',
      solution: 'One or more parameters in your request are invalid. Check the error details for specific fields to fix.'
    },
    '131000': {
      message: 'Message failed to send',
      solution: 'The message failed to send. Check that the recipient is a valid WhatsApp user and try again.'
    },
    '131005': {
      message: 'Message content contains blocked keywords',
      solution: 'Your message contains content that is blocked by WhatsApp. Modify your message and try again.'
    },
    '131014': {
      message: 'Template not approved',
      solution: 'The template you are trying to use has not been approved. Check the status of your template in the Meta Business Manager.'
    },
    
    // Media errors
    '131009': {
      message: 'Media upload failed',
      solution: 'The media upload failed. Ensure the file is a supported format and size (images < 5MB, videos < 16MB, documents < 100MB).'
    },
    '131051': {
      message: 'Media file not found',
      solution: 'The media file you are trying to send could not be found. Check the media ID or URL.'
    },
    
    // Phone number errors
    '132000': {
      message: 'Phone number not WhatsApp enabled',
      solution: 'The phone number you are trying to use is not enabled for WhatsApp Business API. Verify the number in Meta Business Manager.'
    },
    '132001': {
      message: 'Phone number not verified',
      solution: 'The recipient phone number is not a verified WhatsApp user. Ensure the number is correct and the user has WhatsApp installed.'
    },
    
    // Default error
    'default': {
      message: 'An unexpected error occurred',
      solution: 'Please check the error details and try again. If the issue persists, contact Meta support.'
    }
  };
  
  static getErrorHelp(error: WhatsAppApiError): { message: string; solution: string } {
    const errorKey = `${error.type}-${error.code}`;
    
    return this.errorMappings[errorKey] || 
           this.errorMappings[`${error.code}`] || 
           this.errorMappings['default'];
  }
  
  static enhanceError(error: WhatsAppApiError): WhatsAppApiError {
    const help = this.getErrorHelp(error);
    
    error.message = `${error.message}\nDetails: ${help.message}\nSolution: ${help.solution}`;
    
    return error;
  }
}
