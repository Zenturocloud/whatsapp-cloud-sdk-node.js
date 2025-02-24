import axios, { AxiosInstance } from 'axios';
import qs from 'qs';
import { RateLimiter } from './rate-limiter';
import { ErrorHandler } from './error-handler';
import { WhatsAppApiError } from './types';
import {
  BusinessInfo,
  WhatsAppBusinessAccountResponse,
  CreateBusinessParams,
  GetBusinessAssetsParams,
  BusinessAssetsResponse,
  WhatsAppBusinessAccountParams,
  AssignUserToWhatsAppBusinessParams,
  BusinessPhoneNumbersResponse,
  SystemUsersResponse,
  CreateSystemUserParams
} from './business-types';

export interface BusinessClientConfig {
  accessToken: string;
  businessId?: string;
  version?: string;
  maxRequestsPerMinute?: number;
  retryAfterTooManyRequests?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class FacebookBusinessAPI {
  private axiosInstance: AxiosInstance;
  private config: BusinessClientConfig;
  private baseUrl: string;
  private rateLimiter: RateLimiter;

  constructor(config: BusinessClientConfig) {
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

  async getBusinessInfo(businessId: string = this.config.businessId): Promise<BusinessInfo> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      const fields = 'id,name,created_time,primary_page,profile_picture_uri,verification_status,vertical,timezone_id';
      const response = await this.axiosInstance.get(`/${businessId}`, {
        params: { fields }
      });
      
      return {
        id: response.data.id,
        name: response.data.name,
        createdTime: response.data.created_time,
        primaryPage: response.data.primary_page,
        profilePictureUri: response.data.profile_picture_uri,
        verificationStatus: response.data.verification_status,
        vertical: response.data.vertical,
        timezoneId: response.data.timezone_id
      };
    });
  }

  async createBusiness(params: CreateBusinessParams): Promise<BusinessInfo> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const payload = {
        name: params.name,
        primary_page: params.primaryPageId,
        vertical: params.verticalId,
        timezone_id: params.timezone_id,
        survey_business_type: params.businessType,
      };
      
      const response = await this.axiosInstance.post('/me/businesses', payload);
      
      return {
        id: response.data.id,
        name: response.data.name
      };
    });
  }

  async getBusinessAssets(
    params: GetBusinessAssetsParams,
    businessId: string = this.config.businessId
  ): Promise<BusinessAssetsResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      const response = await this.axiosInstance.get(`/${businessId}/owned_businesses`, {
        params: {
          type: params.type,
          limit: params.limit || 25
        }
      });
      
      return response.data;
    });
  }

  async getWhatsAppBusinessAccounts(businessId: string = this.config.businessId): Promise<BusinessAssetsResponse> {
    return this.getBusinessAssets({ type: 'WHATSAPP_BUSINESS_ACCOUNT' }, businessId);
  }

  async getWhatsAppBusinessAccount(whatsappBusinessAccountId: string): Promise<WhatsAppBusinessAccountResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const response = await this.axiosInstance.get(`/${whatsappBusinessAccountId}`);
      return response.data;
    });
  }

  async updateWhatsAppBusinessAccount(
    whatsappBusinessAccountId: string,
    params: WhatsAppBusinessAccountParams
  ): Promise<WhatsAppBusinessAccountResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const response = await this.axiosInstance.post(`/${whatsappBusinessAccountId}`, params);
      return response.data;
    });
  }

  async assignUserToWhatsAppBusiness(params: AssignUserToWhatsAppBusinessParams): Promise<boolean> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { whatsappBusinessAccountId, userId, roles } = params;
      
      const response = await this.axiosInstance.post(`/${whatsappBusinessAccountId}/assigned_users`, {
        user: userId,
        tasks: roles
      });
      
      return response.data.success === true;
    });
  }

  async getPhoneNumbers(
    whatsappBusinessAccountId: string,
    limit: number = 25
  ): Promise<BusinessPhoneNumbersResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const response = await this.axiosInstance.get(`/${whatsappBusinessAccountId}/phone_numbers`, {
        params: { limit }
      });
      
      return response.data;
    });
  }

  async getSystemUsers(businessId: string = this.config.businessId): Promise<SystemUsersResponse> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      const response = await this.axiosInstance.get(`/${businessId}/system_users`);
      return response.data;
    });
  }

  async createSystemUser(params: CreateSystemUserParams, businessId: string = this.config.businessId): Promise<string> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      const response = await this.axiosInstance.post(`/${businessId}/system_users`, {
        name: params.name,
        role: params.role
      });
      
      return response.data.id;
    });
  }

  async deleteSystemUser(systemUserId: string, businessId: string = this.config.businessId): Promise<boolean> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      const response = await this.axiosInstance.delete(`/${businessId}/system_users`, {
        data: {
          user: systemUserId
        }
      });
      
      return response.data.success === true;
    });
  }

  async createWhatsAppBusinessAccount(
    name: string,
    businessId: string = this.config.businessId
  ): Promise<string> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      const response = await this.axiosInstance.post(`/${businessId}/whatsapp_business_accounts`, {
        name
      });
      
      return response.data.id;
    });
  }

  async deleteWhatsAppBusinessAccount(whatsappBusinessAccountId: string): Promise<boolean> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const response = await this.axiosInstance.delete(`/${whatsappBusinessAccountId}`);
      return response.data.success === true;
    });
  }

  async updateAccessToken(accessToken: string): Promise<void> {
    this.config.accessToken = accessToken;
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }
}
