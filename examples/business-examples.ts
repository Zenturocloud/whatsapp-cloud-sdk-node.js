import { createBusinessClient } from '../src';

// Initialize the business client
const businessClient = createBusinessClient({
  accessToken: 'YOUR_ACCESS_TOKEN',
  businessId: 'YOUR_BUSINESS_ID', // Optional, can be provided in method calls
});

async function getBusinessInfo() {
  try {
    // Get information about your business
    const businessInfo = await businessClient.getBusinessInfo();
    console.log('Business Info:', businessInfo);
  } catch (error) {
    console.error('Error getting business info:', error);
  }
}

async function getWhatsAppBusinessAccounts() {
  try {
    // Get all WhatsApp Business Accounts owned by your business
    const accounts = await businessClient.getWhatsAppBusinessAccounts();
    console.log('WhatsApp Business Accounts:', accounts);
    
    if (accounts.data.length > 0) {
      // Get details about the first WhatsApp Business Account
      const accountId = accounts.data[0].id;
      const accountDetails = await businessClient.getWhatsAppBusinessAccount(accountId);
      console.log('Account Details:', accountDetails);
      
      // Get phone numbers associated with this WhatsApp Business Account
      const phoneNumbers = await businessClient.getPhoneNumbers(accountId);
      console.log('Phone Numbers:', phoneNumbers);
    }
  } catch (error) {
    console.error('Error getting WhatsApp business accounts:', error);
  }
}

async function createNewBusiness() {
  try {
    // Create a new business
    const newBusiness = await businessClient.createBusiness({
      name: 'My New Business',
      businessType: 'ADVERTISER',
      timezone_id: 1
    });
    console.log('New Business Created:', newBusiness);
  } catch (error) {
    console.error('Error creating business:', error);
  }
}

async function createAndManageSystemUsers() {
  try {
    // Get all system users
    const systemUsers = await businessClient.getSystemUsers();
    console.log('System Users:', systemUsers);
    
    // Create a new system user
    const newUserId = await businessClient.createSystemUser({
      name: 'New Developer',
      role: 'DEVELOPER'
    });
    console.log('New System User Created with ID:', newUserId);
    
    // Delete a system user (be careful with this in production!)
    // const deleteResult = await businessClient.deleteSystemUser(newUserId);
    // console.log('System User Deleted:', deleteResult);
  } catch (error) {
    console.error('Error managing system users:', error);
  }
}

async function createWhatsAppBusinessAccount() {
  try {
    // Create a new WhatsApp Business Account
    const whatsappBusinessAccountId = await businessClient.createWhatsAppBusinessAccount('My WhatsApp Business');
    console.log('New WhatsApp Business Account ID:', whatsappBusinessAccountId);
    
    // Update this new WhatsApp Business Account
    const updateResult = await businessClient.updateWhatsAppBusinessAccount(
      whatsappBusinessAccountId,
      {
        name: 'Updated WhatsApp Business Name',
        timezone_id: '1'
      }
    );
    console.log('Updated WhatsApp Business Account:', updateResult);
  } catch (error) {
    console.error('Error creating WhatsApp business account:', error);
  }
}

async function assignUserToWhatsAppBusiness() {
  try {
    // Assign a user to a WhatsApp Business Account
    const assignResult = await businessClient.assignUserToWhatsAppBusiness({
      whatsappBusinessAccountId: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
      userId: 'USER_ID',
      roles: ['DEVELOPER', 'ANALYST']
    });
    console.log('User assigned to WhatsApp Business:', assignResult);
  } catch (error) {
    console.error('Error assigning user to WhatsApp business:', error);
  }
}

// Run examples
(async () => {
  // Uncomment functions to run them
  // await getBusinessInfo();
  // await getWhatsAppBusinessAccounts();
  // await createNewBusiness();
  // await createAndManageSystemUsers();
  // await createWhatsAppBusinessAccount();
  // await assignUserToWhatsAppBusiness();
})();
