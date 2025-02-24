import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { basename } from 'path';
import qs from 'qs';
import { RateLimiter } from './rate-limiter';
import { ErrorHandler } from './error-handler';
import {
  ClientConfig,
  SendTextMessageParams,
  SendMediaMessageParams,
  SendLocationMessageParams,
  SendTemplateMessageParams,
  ExtendedSendTemplateMessageParams,
  SendInteractiveMessageParams,
  SendContactMessageParams,
  SendReactionParams,
  MarkMessageAsReadParams,
  UploadMediaParams,
  RetrieveMediaUrlParams,
  DeleteMediaParams,
  UploadMediaResponse,
  RetrieveMediaUrlResponse,
  SendMessageResponse,
  BusinessProfileParams,
  BusinessProfileResponse,
  RetrievePhoneNumbersResponse,
  RegisterPhoneNumberParams,
  DeregisterPhoneNumberParams,
  UpdatePhoneNumberSettings,
  PhoneNumberResponse,
  GetTemplatesParams,
  CreateTemplateParams,
  DeleteTemplateParams,
  GetTemplatesResponse,
  CreateTemplateResponse,
  WhatsAppApiError,
  SendAddressMessageParams,
  SendInteractiveCtaUrlButtonMessageParams,
  InteractiveFlowParams,
  SendInteractiveLocationRequestParams,
  MessageContext
} from './types';

export interface ExtendedClientConfig extends ClientConfig {
  maxRequestsPerMinute?: number;
  retryAfterTooManyRequests?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class WhatsAppCloudAPI {
  private axiosInstance: AxiosInstance;
  private config: ExtendedClientConfig;
  private baseUrl: string;
  private rateLimiter: RateLimiter;

  constructor(config: ExtendedClientConfig) {
    this.config = {
      version: 'v22.0',
      maxRequestsPerMinute: 250,
      retryAfterTooManyRequests: true,
      maxRetries: 3,
      retryDelayMs: 1000,
      ...config,
    };
    
    this.baseUrl = `https://graph.facebook.com/${this.config.version}`;
    
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    this.rateLimiter = new RateLimiter({
      maxRequestsPerMinute: this.config.maxRequestsPerMinute,
      retryAfterTooManyRequests: this.config.retryAfterTooManyRequests,
      maxRetries: this.config.maxRetries,
      retryDelayMs: this.config.retryDelayMs
    });
    
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.data?.error) {
          const apiError = error.response.data.error;
          const enhancedError = ErrorHandler.enhanceError(
            new WhatsAppApiError(
              apiError.message,
              apiError.type,
              apiError.code,
              apiError.error_subcode,
              apiError.fbtrace_id
            )
          );
          throw enhancedError;
        }
        throw error;
      }
    );
  }

  private getPhoneNumberUrl(): string {
    return `/${this.config.phoneNumberId}`;
  }

  private getMessagesUrl(): string {
    return `/${this.config.phoneNumberId}/messages`;
  }

  private getMediaUrl(): string {
    return `/${this.config.phoneNumberId}/media`;
  }

  async sendTextMessage(params: SendTextMessageParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to,
        type: 'text',
        text: {
          body: params.text,
          preview_url: params.previewUrl
        }
      };

      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async sendMediaMessage(params: SendMediaMessageParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, mediaType, mediaId, mediaUrl, mediaCaption, filename } = params;
      
      const media: any = {};
      
      if (mediaId) {
        media.id = mediaId;
      } else if (mediaUrl) {
        media.link = mediaUrl;
      } else {
        throw new Error('Either mediaId or mediaUrl must be provided');
      }
      
      if (mediaCaption) {
        media.caption = mediaCaption;
      }
      
      if (filename) {
        media.filename = filename;
      }
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: mediaType,
        [mediaType]: media
      };
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async sendLocationMessage(params: SendLocationMessageParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, latitude, longitude, name, address } = params;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'location',
        location: {
          latitude,
          longitude,
          name,
          address
        }
      };
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async sendTemplateMessage(params: SendTemplateMessageParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, templateName, languageCode, components } = params;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components
        }
      };
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async sendInteractiveMessage(params: SendInteractiveMessageParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, interactive } = params;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive
      };
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async sendContactMessage(params: SendContactMessageParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, contacts } = params;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'contacts',
        contacts
      };
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async sendReaction(params: SendReactionParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, messageId, emoji } = params;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'reaction',
        reaction: {
          message_id: messageId,
          emoji
        }
      };
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async markMessageAsRead(params: MarkMessageAsReadParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { messageId } = params;
      
      const payload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      };
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async uploadMedia(params: UploadMediaParams): Promise<UploadMediaResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { file, type } = params;
      
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('file', createReadStream(file), {
        filename: basename(file),
        contentType: type
      });
      
      const response = await this.axiosInstance.post(
        this.getMediaUrl(), 
        formData, 
        {
          headers: {
            ...formData.getHeaders(),
            'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
          }
        }
      );
      
      return response.data;
    });
  }

  async retrieveMediaUrl(params: RetrieveMediaUrlParams): Promise<RetrieveMediaUrlResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { mediaId } = params;
      
      const response = await this.axiosInstance.get(`/${mediaId}`);
      return response.data;
    });
  }

  async deleteMedia(params: DeleteMediaParams): Promise<void> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { mediaId } = params;
      
      await this.axiosInstance.delete(`/${mediaId}`);
    });
  }

  async setBusinessProfile(params: BusinessProfileParams): Promise<BusinessProfileResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const payload = {
        messaging_product: 'whatsapp',
        ...params
      };
      
      const response = await this.axiosInstance.post(
        `/${this.config.phoneNumberId}/whatsapp_business_profile`,
        payload
      );
      
      return response.data;
    });
  }

  async getBusinessProfile(): Promise<BusinessProfileResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const fields = [
        'about', 'address', 'description', 'email', 'websites', 
        'profile_picture_url', 'vertical'
      ].join(',');
      
      const response = await this.axiosInstance.get(
        `/${this.config.phoneNumberId}/whatsapp_business_profile`,
        { params: { fields } }
      );
      
      return response.data;
    });
  }

  async retrievePhoneNumbers(): Promise<RetrievePhoneNumbersResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const response = await this.axiosInstance.get(
        `/${this.config.businessAccountId}/phone_numbers`
      );
      
      return response.data;
    });
  }

  async registerPhoneNumber(params: RegisterPhoneNumberParams): Promise<PhoneNumberResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const response = await this.axiosInstance.post(
        `/${this.config.businessAccountId}/phone_numbers`,
        params
      );
      
      return response.data;
    });
  }

  async deregisterPhoneNumber(params: DeregisterPhoneNumberParams): Promise<PhoneNumberResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const response = await this.axiosInstance.delete(
        `/${params.phoneNumberId}`
      );
      
      return response.data;
    });
  }

  async updatePhoneNumberSettings(
    params: UpdatePhoneNumberSettings
  ): Promise<PhoneNumberResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const response = await this.axiosInstance.post(
        `/${params.phoneNumberId}/settings`,
        params.settings
      );
      
      return response.data;
    });
  }

  async getTemplates(params?: GetTemplatesParams): Promise<GetTemplatesResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const queryParams: Record<string, any> = {
        limit: params?.limit || 20
      };
      
      if (params?.offset) {
        queryParams.offset = params.offset;
      }
      
      const response = await this.axiosInstance.get(
        `/${this.config.businessAccountId}/message_templates`,
        {
          params: queryParams,
          paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' })
        }
      );
      
      return response.data;
    });
  }

  async createTemplate(params: CreateTemplateParams): Promise<CreateTemplateResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const response = await this.axiosInstance.post(
        `/${this.config.businessAccountId}/message_templates`,
        params
      );
      
      return response.data;
    });
  }

  async deleteTemplate(params: DeleteTemplateParams): Promise<void> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const queryParams = {
        name: params.name
      };
      
      await this.axiosInstance.delete(
        `/${this.config.businessAccountId}/message_templates`,
        {
          params: queryParams,
          paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' })
        }
      );
    });
  }

  async updateAccessToken(accessToken: string): Promise<void> {
    this.config.accessToken = accessToken;
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  async sendAddressMessage(params: SendAddressMessageParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, requestType = 'HOME', buttonText = 'Send Address' } = params;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'address',
        address: {
          request_address: {
            type: requestType,
            button_text: buttonText
          }
        }
      };
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async sendInteractiveCtaUrlButtonMessage(params: SendInteractiveCtaUrlButtonMessageParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, body, buttons, headerText, footerText } = params;
      
      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          body: {
            text: body
          },
          action: {
            buttons: buttons.map(button => ({
              type: button.type,
              title: button.title,
              url: button.url
            }))
          }
        }
      };
      
      if (headerText) {
        payload.interactive.header = {
          type: 'text',
          text: headerText
        };
      }
      
      if (footerText) {
        payload.interactive.footer = {
          text: footerText
        };
      }
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async sendInteractiveFlowMessage(params: InteractiveFlowParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, flowId, flowToken, flowCta, flowTitle, flowDescription, screen, data } = params;
      
      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'flow',
          body: {
            text: flowDescription || 'Please complete this flow'
          },
          action: {
            name: flowTitle || 'flow',
            parameters: {
              flow_token: flowToken,
              flow_id: flowId,
              flow_cta: flowCta || 'Start'
            }
          }
        }
      };
      
      if (screen || data) {
        payload.interactive.flow = {
          id: flowId
        };
        
        if (screen) {
          payload.interactive.flow.data = { screen };
        }
        
        if (data) {
          payload.interactive.flow.data = {
            ...payload.interactive.flow.data,
            data
          };
        }
      }
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async sendInteractiveLocationRequestMessage(params: SendInteractiveLocationRequestParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, body, buttonText = 'Send Location', footerText } = params;
      
      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'location_request_message',
          body: {
            text: body
          },
          action: {
            name: 'send_location',
            button: buttonText
          }
        }
      };
      
      if (footerText) {
        payload.interactive.footer = {
          text: footerText
        };
      }
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }

  async sendContextualReply(context: MessageContext, messageFunc: () => Promise<SendMessageResponse>): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const originalRequest = this.axiosInstance.request;
      
      try {
        this.axiosInstance.request = async (config) => {
          if (config.data && typeof config.data === 'object') {
            config.data.context = {
              message_id: context.messageId
            };
          } else if (config.data && typeof config.data === 'string') {
            const data = JSON.parse(config.data);
            data.context = {
              message_id: context.messageId
            };
            config.data = JSON.stringify(data);
          }
          
          return originalRequest.call(this.axiosInstance, config);
        };
        
        return await messageFunc();
      } finally {
        this.axiosInstance.request = originalRequest;
      }
    });
  }

  async sendTemplateMessageWithTtl(params: ExtendedSendTemplateMessageParams): Promise<SendMessageResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { to, templateName, languageCode, components, ttl } = params;
      
      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          }
        }
      };
      
      if (components) {
        payload.template.components = components;
      }
      
      if (ttl) {
        payload.ttl = ttl;
      }
      
      const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
      return response.data;
    });
  }
}
