import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { basename } from 'path';
import qs from 'qs';
import {
  ClientConfig,
  SendTextMessageParams,
  SendMediaMessageParams,
  SendLocationMessageParams,
  SendTemplateMessageParams,
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
  WhatsAppApiError
} from './types';

export class WhatsAppCloudAPI {
  private axiosInstance: AxiosInstance;
  private config: ClientConfig;
  private baseUrl: string;

  constructor(config: ClientConfig) {
    this.config = {
      version: 'v22.0', // Default to v22.0
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

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.data?.error) {
          const apiError = error.response.data.error;
          throw new WhatsAppApiError(
            apiError.message,
            apiError.type,
            apiError.code,
            apiError.error_subcode,
            apiError.fbtrace_id
          );
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
  }

  async sendMediaMessage(params: SendMediaMessageParams): Promise<SendMessageResponse> {
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
  }

  async sendLocationMessage(params: SendLocationMessageParams): Promise<SendMessageResponse> {
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
  }

  async sendTemplateMessage(params: SendTemplateMessageParams): Promise<SendMessageResponse> {
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
  }

  async sendInteractiveMessage(params: SendInteractiveMessageParams): Promise<SendMessageResponse> {
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
  }

  async sendContactMessage(params: SendContactMessageParams): Promise<SendMessageResponse> {
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
  }

  async sendReaction(params: SendReactionParams): Promise<SendMessageResponse> {
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
  }

  async markMessageAsRead(params: MarkMessageAsReadParams): Promise<SendMessageResponse> {
    const { messageId } = params;
    
    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };
    
    const response = await this.axiosInstance.post(this.getMessagesUrl(), payload);
    return response.data;
  }

  async uploadMedia(params: UploadMediaParams): Promise<UploadMediaResponse> {
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
  }

  async retrieveMediaUrl(params: RetrieveMediaUrlParams): Promise<RetrieveMediaUrlResponse> {
    const { mediaId } = params;
    
    const response = await this.axiosInstance.get(`/${mediaId}`);
    return response.data;
  }

  async deleteMedia(params: DeleteMediaParams): Promise<void> {
    const { mediaId } = params;
    
    await this.axiosInstance.delete(`/${mediaId}`);
  }

  async setBusinessProfile(params: BusinessProfileParams): Promise<BusinessProfileResponse> {
    const payload = {
      messaging_product: 'whatsapp',
      ...params
    };
    
    const response = await this.axiosInstance.post(
      `/${this.config.phoneNumberId}/whatsapp_business_profile`,
      payload
    );
    
    return response.data;
  }

  async getBusinessProfile(): Promise<BusinessProfileResponse> {
    const fields = [
      'about', 'address', 'description', 'email', 'websites', 
      'profile_picture_url', 'vertical'
    ].join(',');
    
    const response = await this.axiosInstance.get(
      `/${this.config.phoneNumberId}/whatsapp_business_profile`,
      { params: { fields } }
    );
    
    return response.data;
  }

  async retrievePhoneNumbers(): Promise<RetrievePhoneNumbersResponse> {
    const response = await this.axiosInstance.get(
      `/${this.config.businessAccountId}/phone_numbers`
    );
    
    return response.data;
  }

  async registerPhoneNumber(params: RegisterPhoneNumberParams): Promise<PhoneNumberResponse> {
    const response = await this.axiosInstance.post(
      `/${this.config.businessAccountId}/phone_numbers`,
      params
    );
    
    return response.data;
  }

  async deregisterPhoneNumber(params: DeregisterPhoneNumberParams): Promise<PhoneNumberResponse> {
    const response = await this.axiosInstance.delete(
      `/${params.phoneNumberId}`
    );
    
    return response.data;
  }

  async updatePhoneNumberSettings(
    params: UpdatePhoneNumberSettings
  ): Promise<PhoneNumberResponse> {
    const response = await this.axiosInstance.post(
      `/${params.phoneNumberId}/settings`,
      params.settings
    );
    
    return response.data;
  }

  async getTemplates(params?: GetTemplatesParams): Promise<GetTemplatesResponse> {
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
  }

  async createTemplate(params: CreateTemplateParams): Promise<CreateTemplateResponse> {
    const response = await this.axiosInstance.post(
      `/${this.config.businessAccountId}/message_templates`,
      params
    );
    
    return response.data;
  }

  async deleteTemplate(params: DeleteTemplateParams): Promise<void> {
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
  }

  async updateAccessToken(accessToken: string): Promise<void> {
    this.config.accessToken = accessToken;
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }
}
