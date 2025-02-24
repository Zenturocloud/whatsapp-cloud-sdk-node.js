export class WhatsAppApiError extends Error {
  type: string;
  code: number;
  subcode?: number;
  fbtraceId: string;

  constructor(
    message: string,
    type: string,
    code: number,
    subcode?: number,
    fbtraceId?: string
  ) {
    super(message);
    this.name = 'WhatsAppApiError';
    this.type = type;
    this.code = code;
    this.subcode = subcode;
    this.fbtraceId = fbtraceId || '';
  }
}

export interface ClientConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId?: string;
  version?: string;
}


export type MediaType = 'audio' | 'document' | 'image' | 'sticker' | 'video';

export interface Component {
  type: 'header' | 'body' | 'button' | 'footer';
  parameters: Parameter[];
}

export type Parameter = 
  | TextParameter
  | CurrencyParameter
  | DateTimeParameter
  | ImageParameter
  | DocumentParameter
  | VideoParameter;

export interface TextParameter {
  type: 'text';
  text: string;
}

export interface CurrencyParameter {
  type: 'currency';
  currency: {
    code: string;
    amount: number;
    fallback_value: string;
  };
}

export interface DateTimeParameter {
  type: 'date_time';
  date_time: {
    fallback_value: string;
  };
}

export interface ImageParameter {
  type: 'image';
  image: {
    link: string;
  };
}

export interface DocumentParameter {
  type: 'document';
  document: {
    link: string;
    filename?: string;
  };
}

export interface VideoParameter {
  type: 'video';
  video: {
    link: string;
  };
}

export interface InteractiveMessageAction {
  button?: string;
  buttons?: Array<{
    type: 'reply';
    reply: {
      id: string;
      title: string;
    };
  }>;
  sections?: Array<{
    title?: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
  product_retailers?: Array<{
    product_retailer_id: string;
  }>;
  catalog_id?: string;
}

export interface InteractiveMessage {
  type: 'button' | 'list' | 'product' | 'product_list' | 'flow';
  header?: {
    type: 'text' | 'video' | 'image' | 'document';
    text?: string;
    video?: {
      link: string;
    };
    image?: {
      link: string;
    };
    document?: {
      link: string;
      filename?: string;
    };
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: InteractiveMessageAction;
  flow?: {
    id: string;
    data?: {
      screen?: string;
      data?: Record<string, any>;
    };
  };
}

export interface Contact {
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: 'HOME' | 'WORK';
  }>;
  birthday?: string;
  emails?: Array<{
    email: string;
    type: 'HOME' | 'WORK';
  }>;
  name: {
    formatted_name: string;
    first_name: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    prefix?: string;
  };
  org?: {
    company?: string;
    department?: string;
    title?: string;
  };
  phones?: Array<{
    phone: string;
    type: 'CELL' | 'MAIN' | 'IPHONE' | 'HOME' | 'WORK';
    wa_id?: string;
  }>;
  urls?: Array<{
    url: string;
    type: 'HOME' | 'WORK';
  }>;
}


export interface SendTextMessageParams {
  to: string;
  text: string;
  previewUrl?: boolean;
}

export interface SendMediaMessageParams {
  to: string;
  mediaType: MediaType;
  mediaId?: string;
  mediaUrl?: string;
  mediaCaption?: string;
  filename?: string;
}

export interface SendLocationMessageParams {
  to: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface SendTemplateMessageParams {
  to: string;
  templateName: string;
  languageCode: string;
  components?: Component[];
}

export interface SendInteractiveMessageParams {
  to: string;
  interactive: InteractiveMessage;
}

export interface SendContactMessageParams {
  to: string;
  contacts: Contact[];
}

export interface SendReactionParams {
  to: string;
  messageId: string;
  emoji: string;
}

export interface MarkMessageAsReadParams {
  messageId: string;
}


export interface UploadMediaParams {
  file: string;
  type: string;
}

export interface RetrieveMediaUrlParams {
  mediaId: string;
}

export interface DeleteMediaParams {
  mediaId: string;
}


export interface BusinessProfileParams {
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  websites?: string[];
  vertical?: 'UNDEFINED' | 'OTHER' | 'AUTO' | 'BEAUTY' | 'APPAREL' | 'EDU' | 'ENTERTAIN' | 'EVENT_PLAN' | 'FINANCE' | 'GROCERY' | 'GOVT' | 'HOTEL' | 'HEALTH' | 'NONPROFIT' | 'PROF_SERVICES' | 'RETAIL' | 'TRAVEL' | 'RESTAURANT' | 'NOT_A_BIZ';
  profilePictureUrl?: string;
}


export interface RegisterPhoneNumberParams {
  cc: string;
  phone_number: string;
  pin: string;
}

export interface DeregisterPhoneNumberParams {
  phoneNumberId: string;
}

export interface UpdatePhoneNumberSettings {
  phoneNumberId: string;
  settings: {
    quality_rating?: boolean;
  };
}


export interface GetTemplatesParams {
  limit?: number;
  offset?: number;
}

export interface CreateTemplateParams {
  name: string;
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';
  components: {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
    text?: string;
    buttons?: Array<{
      type: 'PHONE_NUMBER' | 'URL' | 'QUICK_REPLY';
      text: string;
      phone_number?: string;
      url?: string;
    }>;
  }[];
  language: string;
}

export interface DeleteTemplateParams {
  name: string;
}


export interface SendMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface UploadMediaResponse {
  messaging_product: string;
  id: string;
}

export interface RetrieveMediaUrlResponse {
  messaging_product: string;
  url: string;
  mime_type: string;
  sha256: string;
  file_size: number;
}

export interface BusinessProfileResponse {
  messaging_product: string;
  address: string;
  description: string;
  email: string;
  websites: string[];
  vertical: string;
  profile_picture_url: string;
}

export interface RetrievePhoneNumbersResponse {
  data: Array<{
    verified_name: string;
    display_phone_number: string;
    id: string;
    quality_rating: string;
  }>;
}

export interface PhoneNumberResponse {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: string;
}

export interface GetTemplatesResponse {
  data: Array<{
    name: string;
    category: string;
    components: Array<{
      type: string;
      format?: string;
      text?: string;
      example?: {
        header_text?: string[];
        body_text?: string[][];
      };
    }>;
    language: string;
    status: string;
    id: string;
  }>;
  paging: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface CreateTemplateResponse {
  id: string;
  status: string;
  category: string;
}


export interface WebhookEvent {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<WebhookMessage>;
        statuses?: Array<WebhookStatus>;
      };
      field: string;
    }>;
  }>;
}

export type WebhookMessage =
  | TextMessage
  | ImageMessage
  | StickerMessage
  | UnknownMessage
  | AudioMessage
  | DocumentMessage
  | VideoMessage
  | ButtonMessage
  | ContactMessage
  | LocationMessage
  | SystemMessage
  | InteractiveMessage;

export interface MessageBase {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  context?: {
    from: string;
    id: string;
  };
}

export interface TextMessage extends MessageBase {
  type: 'text';
  text: {
    body: string;
  };
}

export interface ImageMessage extends MessageBase {
  type: 'image';
  image: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
}

export interface StickerMessage extends MessageBase {
  type: 'sticker';
  sticker: {
    mime_type: string;
    sha256: string;
    id: string;
  };
}

export interface UnknownMessage extends MessageBase {
  type: 'unknown';
}

export interface AudioMessage extends MessageBase {
  type: 'audio';
  audio: {
    mime_type: string;
    sha256: string;
    id: string;
    voice: boolean;
  };
}

export interface DocumentMessage extends MessageBase {
  type: 'document';
  document: {
    caption?: string;
    filename: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
}

export interface VideoMessage extends MessageBase {
  type: 'video';
  video: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
}

export interface ButtonMessage extends MessageBase {
  type: 'button';
  button: {
    text: string;
    payload: string;
  };
}

export interface ContactMessage extends MessageBase {
  type: 'contacts';
  contacts: Contact[];
}

export interface LocationMessage extends MessageBase {
  type: 'location';
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

export interface SystemMessage extends MessageBase {
  type: 'system';
  system: {
    body: string;
    identity?: string;
    new_wa_id?: string;
    wa_id?: string;
    type?: string;
    customer?: string;
  };
}

export interface ButtonReply {
  id: string;
  title: string;
}

export interface WebhookInteractiveMessage extends MessageBase {
  type: 'interactive';
  interactive: {
    type: 'button_reply' | 'list_reply' | 'flow_response';
    button_reply?: ButtonReply;
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
    flow_response?: {
      name: string;
      response_json: string;
    };
  };
}

export interface WebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin?: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: Array<{
    code: number;
    title: string;
  }>;
}

export interface WebhookHandlerConfig {
  appSecret?: string;
  verifyToken?: string;
}

export interface WebhookHandlerCallbacks {
  onMessage?: (message: WebhookMessage) => Promise<void> | void;
  onStatus?: (status: WebhookStatus) => Promise<void> | void;
}

// Address message types
export interface SendAddressMessageParams {
  to: string;
  requestType?: 'HOME' | 'WORK';
  buttonText?: string;
}

// Interactive CTA URL Button message types
export interface InteractiveCtaUrlButton {
  type: 'url';
  title: string;
  url: string;
}

export interface SendInteractiveCtaUrlButtonMessageParams {
  to: string;
  body: string;
  buttons: InteractiveCtaUrlButton[];
  headerText?: string;
  footerText?: string;
}


export interface InteractiveFlowParams {
  to: string;
  flowId: string;
  flowToken?: string;
  flowCta?: string;
  flowTitle?: string;
  flowDescription?: string;
  screen?: string;
  data?: Record<string, any>;
}


export interface SendInteractiveLocationRequestParams {
  to: string;
  body: string;
  buttonText?: string;
  footerText?: string;
}


export interface MessageContext {
  messageId: string;
}


export interface TemplateTtlParams {
  ttl?: string; // Format: P0DT0H30M0S
}


export interface ExtendedSendTemplateMessageParams extends SendTemplateMessageParams {
  ttl?: string; // TTL in ISO 8601 duration format (e.g., "PT10M" for 10 minutes)
}
