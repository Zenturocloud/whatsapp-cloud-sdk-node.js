# Business Management API Integration

WhatsApp Cloud SDK now includes full support for Facebook Business API integration, allowing you to manage WhatsApp Business accounts programmatically through the Meta Business platform.

## Key Features

- **Business Account Management**: Create, retrieve, and update Meta Business accounts
- **WhatsApp Business Account Management**: Create and manage WhatsApp Business accounts
- **User Management**: Add system users and assign roles
- **Phone Number Management**: Retrieve phone numbers associated with your WhatsApp Business
- **Asset Management**: Retrieve various business assets like accounts, pages, and pixels

## Getting Started

First, create a business client:

```typescript
import { createBusinessClient } from 'whatsapp-cloud-sdk';

const businessClient = createBusinessClient({
  accessToken: 'YOUR_ACCESS_TOKEN',
  businessId: 'YOUR_BUSINESS_ID', // Optional, can be provided in method calls
});
```

## Business Management

### Get Business Information

```typescript
const businessInfo = await businessClient.getBusinessInfo();
console.log('Business Info:', businessInfo);
```

### Create a New Business

```typescript
const newBusiness = await businessClient.createBusiness({
  name: 'My New Business',
  businessType: 'ADVERTISER',
  timezone_id: 1
});
```

## WhatsApp Business Account Management

### Get WhatsApp Business Accounts

```typescript
const accounts = await businessClient.getWhatsAppBusinessAccounts();

// Get details about a specific WhatsApp Business Account
const accountId = accounts.data[0].id;
const accountDetails = await businessClient.getWhatsAppBusinessAccount(accountId);
```

### Create a WhatsApp Business Account

```typescript
const whatsappBusinessAccountId = await businessClient.createWhatsAppBusinessAccount(
  'My WhatsApp Business'
);
```

### Update a WhatsApp Business Account

```typescript
const updateResult = await businessClient.updateWhatsAppBusinessAccount(
  whatsappBusinessAccountId,
  {
    name: 'Updated WhatsApp Business Name',
    timezone_id: '1'
  }
);
```

## Phone Number Management

```typescript
// Get phone numbers for a WhatsApp Business Account
const phoneNumbers = await businessClient.getPhoneNumbers(whatsappBusinessAccountId);
```

## User Management

### Get System Users

```typescript
const systemUsers = await businessClient.getSystemUsers();
```

### Create a System User

```typescript
const newUserId = await businessClient.createSystemUser({
  name: 'New Developer',
  role: 'DEVELOPER'
});
```

### Assign User to WhatsApp Business Account

```typescript
const assignResult = await businessClient.assignUserToWhatsAppBusiness({
  whatsappBusinessAccountId: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
  userId: 'USER_ID',
  roles: ['DEVELOPER', 'ANALYST']
});
```

### Delete a System User

```typescript
const deleteResult = await businessClient.deleteSystemUser(systemUserId);
```

## Error Handling

The Business API client uses the same error handling mechanisms as the WhatsApp Cloud SDK, including rate limiting and detailed error messages.

## Rate Limiting

The Business API client automatically implements rate limiting to prevent hitting Meta API limits. You can configure rate limits when creating the client:

```typescript
const businessClient = createBusinessClient({
  accessToken: 'YOUR_ACCESS_TOKEN',
  businessId: 'YOUR_BUSINESS_ID',
  maxRequestsPerMinute: 250,
  retryAfterTooManyRequests: true,
  maxRetries: 3,
  retryDelayMs: 1000
});
```

## Complete Example

Check the `examples/business-examples.ts` file for a complete working example of Business API integration.
