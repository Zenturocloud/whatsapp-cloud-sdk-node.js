export interface BusinessInfo {
  id: string;
  name: string;
  createdTime?: string;
  primaryPage?: {
    id: string;
    name?: string;
  };
  profilePictureUri?: string;
  verificationStatus?: 'expired' | 'failed' | 'ineligible' | 'not_verified' | 'pending' | 
    'pending_need_more_info' | 'pending_submission' | 'rejected' | 'revoked' | 'verified';
  vertical?: string;
  timezoneId?: number;
}

export interface WhatsAppBusinessAccountResponse {
  id: string;
  name?: string;
  currency?: string;
  timezone_id?: string;
  message_template_namespace?: string;
  business_verification_status?: string;
  status?: string;
  account_review_status?: string;
  analytics_account_association_existence?: boolean;
}

export interface CreateBusinessParams {
  name: string;
  primaryPageId?: string;
  verticalId?: string;
  timezone_id?: number;
  businessType?: 'AGENCY' | 'ADVERTISER' | 'APP_DEVELOPER' | 'PUBLISHER';
}

export interface GetBusinessAssetsParams {
  type: 'WHATSAPP_BUSINESS_ACCOUNT' | 'AD_ACCOUNT' | 'PAGE' | 'PIXEL';
  limit?: number;
}

export interface BusinessAsset {
  id: string;
  type: string;
  name?: string;
  permissions?: string[];
  status?: string;
}

export interface BusinessAssetsResponse {
  data: BusinessAsset[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface WhatsAppBusinessAccountParams {
  name?: string;
  timezone_id?: string;
  message_template_namespace?: string;
}

export interface AssignUserToWhatsAppBusinessParams {
  whatsappBusinessAccountId: string;
  userId: string;
  roles: ('ADMIN' | 'EMPLOYEE' | 'DEVELOPER' | 'ANALYST')[];
}

export interface BusinessPhoneNumberResponse {
  verified_name: string;
  display_phone_number: string;
  id: string;
  quality_rating?: string;
  code_verification_status?: string;
  current_advertising_performance?: string;
  is_enabled_for_insights?: boolean;
  account_id?: string;
}

export interface BusinessPhoneNumbersResponse {
  data: BusinessPhoneNumberResponse[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface SystemUserResponse {
  id: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'DEVELOPER' | 'ANALYST';
}

export interface SystemUsersResponse {
  data: SystemUserResponse[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface CreateSystemUserParams {
  name: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'DEVELOPER' | 'ANALYST';
}
