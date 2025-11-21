/**
 * SMS Service
 * Send OTP via SMS to mobile numbers
 * 
 * Supported Providers:
 * 1. MSG91 (Recommended for India) - Free Trial: 100 SMS
 *    Sign up: https://msg91.com/
 * 
 * 2. Fast2SMS - Free tier available
 *    Sign up: https://www.fast2sms.com/
 * 
 * 3. TextLocal - Free Trial: 100 SMS
 *    Sign up: https://www.textlocal.in/
 * 
 * Configure in .env file:
 * SMS_PROVIDER=msg91 (or fast2sms, textlocal)
 * MSG91_AUTH_KEY=your_auth_key
 * FAST2SMS_API_KEY=your_api_key
 * TEXTLOCAL_API_KEY=your_api_key
 */

const axios = require('axios');

/**
 * Send OTP via MSG91 (Recommended for India - Free Trial: 100 SMS)
 */
async function sendViaMSG91Flow({ mobile, otp, authKey, senderId, flowId, templateVariable }) {
  const url = 'https://api.msg91.com/api/v5/flow/';
  const headers = {
    authkey: authKey,
    'Content-Type': 'application/json',
  };

  const recipient = {
    mobiles: `91${mobile}`,
  };

  // Attach template variable (VAR1 / OTP / etc.)
  recipient[templateVariable] = otp;

  const body = {
    flow_id: flowId,
    sender: senderId,
    recipients: [recipient],
  };

  const response = await axios.post(url, body, { headers });
  const responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

  console.log('[SMS] 📋 MSG91 Flow Response:', JSON.stringify(responseData, null, 2));

  if (
    responseData.type === 'success' ||
    (responseData.message && responseData.message.toLowerCase().includes('success'))
  ) {
    console.log(`[SMS] ✅ MSG91 Flow: OTP sent to +91${mobile}`);
    console.log(`[SMS] 📨 MSG91 request id: ${responseData.request_id || responseData.requestId || 'N/A'}`);
    return true;
  }

  throw new Error(responseData.message || 'MSG91 Flow API error');
}

async function sendViaMSG91(mobile, otp) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const senderId = process.env.MSG91_SENDER_ID || 'RDFOTP';
  
  if (!authKey || authKey === 'your_auth_key_here') {
    throw new Error('MSG91_AUTH_KEY not configured');
  }

  try {
    const flowId = process.env.MSG91_FLOW_ID;
    const templateVariable = process.env.MSG91_TEMPLATE_VARIABLE || 'VAR1';

    if (flowId && flowId !== 'your_flow_id_here') {
      console.log(`[SMS] ⚡️ MSG91 Flow enabled (flow_id=${flowId}, variable=${templateVariable})`);
      return await sendViaMSG91Flow({ mobile, otp, authKey, senderId, flowId, templateVariable });
    }

    console.log(`[SMS] Sending OTP via MSG91 SMS API to mobile: ${mobile} and otp is :${otp}`);
    
    const message = `Your OTP for password reset is ${otp}. Valid for 10 minutes. - RDF Dairy Farm`;
    
    // Check if DLT Template ID is configured
    const dltTemplateId = process.env.MSG91_DLT_TEMPLATE_ID;
    
    // Prepare SMS payload
    const smsPayload = {
      sender: senderId,
      route: '4', // Transactional route
      country: '91',
      sms: [
        {
          message: message,
          to: [`91${mobile}`] // Country code + mobile
        }
      ]
    };
    
    if (dltTemplateId && dltTemplateId !== 'your_template_id_here') {
      smsPayload.DLT_TE_ID = dltTemplateId;
      console.log(`[SMS] Using DLT Template ID: ${dltTemplateId}`);
    } else {
      console.log(`[SMS] ⚠️  DLT Template ID not configured - SMS may fail for India`);
      console.log(`[SMS] 💡 Register template on MSG91 Dashboard → Templates → Get Template ID`);
    }
    
    const smsResponse = await axios.post(
      'https://api.msg91.com/api/v2/sendsms',
      smsPayload,
      {
        headers: {
          'authkey': authKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Check response
    if (smsResponse.data) {
      const responseData = typeof smsResponse.data === 'string' 
        ? JSON.parse(smsResponse.data) 
        : smsResponse.data;
      
      // Log full response for debugging
      console.log('[SMS] 📋 MSG91 Full Response:', JSON.stringify(responseData, null, 2));
      
      // Check for success indicators
      if (responseData.type === 'success' || 
          responseData.message === 'SMS sent successfully' ||
          responseData.type === 'success' ||
          (responseData.message && responseData.message.includes('success'))) {
        console.log(`[SMS] ✅ MSG91 SMS: OTP sent to +91${mobile}`);
        console.log(`[SMS] 📨 Request ID: ${responseData.request_id || responseData.requestId || 'N/A'}`);
        console.log(`[SMS] 🔢 OTP: ${otp}`);
        console.log(`[SMS] ⚠️  Note: Check MSG91 dashboard → Reports for actual delivery status`);
        return true;
      }
      
      // Check for error messages
      if (responseData.message && responseData.message.includes('error')) {
        console.error('[SMS] ❌ MSG91 Error Message:', responseData.message);
        throw new Error(responseData.message);
      }
      
      // Log error if response is not success
      console.error('[SMS] ❌ MSG91 SMS Response:', responseData);
      throw new Error(responseData.message || 'MSG91 SMS API error');
    }
    
    throw new Error('Invalid response from MSG91');
    
  } catch (error) {
    // Log detailed error
    if (error.response) {
      console.error('[SMS] ❌ MSG91 v5 API Error:', error.response.data);
      console.error('[SMS] Status:', error.response.status);
      console.error('[SMS] Headers:', error.response.headers);
    } else {
      console.error('[SMS] ❌ MSG91 v5 Error:', error.message);
    }
    
    // Fallback: Try old sendotp.php method
    try {
      console.log('[SMS] 🔄 Trying fallback: sendotp.php...');
      
      const message = `Your OTP for password reset is ${otp}. Valid for 10 minutes. - RDF Dairy Farm`;
      
      const fallbackResponse = await axios.get('https://control.msg91.com/api/sendotp.php', {
        params: {
          authkey: authKey,
          mobile: `91${mobile}`,
          message: message,
          sender: senderId,
          otp: otp,
          otp_expiry: 10,
        }
      });
      
      const responseData = typeof fallbackResponse.data === 'string' 
        ? JSON.parse(fallbackResponse.data) 
        : fallbackResponse.data;
      
      if (responseData.type === 'success') {
        console.log(`[SMS] ✅ MSG91 (Fallback): OTP sent to +91${mobile}`);
        return true;
      }
      
      throw new Error(responseData.message || 'Fallback method failed');
    } catch (fallbackError) {
      console.error('[SMS] ❌ Fallback method also failed:', fallbackError.message);
      throw error; // Throw original error
    }
  }
}

/**
 * Send OTP via Fast2SMS
 */
async function sendViaFast2SMS(mobile, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('FAST2SMS_API_KEY not configured');
  }
  
  const message = `Your OTP for password reset is ${otp}. Valid for 10 minutes. - RDF Dairy Farm`;
  
  const response = await axios.post(
    'https://www.fast2sms.com/dev/bulkV2',
    {
      route: 'q', // Transactional route
      message: message,
      numbers: mobile,
    },
    {
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      }
    }
  );
  
  if (response.data && response.data.return === true) {
    console.log(`[SMS] ✅ Fast2SMS: OTP sent to +91${mobile}`);
    return true;
  }
  
  throw new Error(response.data.message || 'Fast2SMS API error');
}

/**
 * Send OTP via TextLocal (Free Trial: 100 SMS)
 */
async function sendViaTextLocal(mobile, otp) {
  const apiKey = process.env.TEXTLOCAL_API_KEY;
  const sender = process.env.TEXTLOCAL_SENDER || 'TXTLCL';
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('TEXTLOCAL_API_KEY not configured');
  }
  
  const message = `Your OTP for password reset is ${otp}. Valid for 10 minutes. - RDF Dairy Farm`;
  
  const response = await axios.post(
    'https://api.textlocal.in/send/',
    {
      apikey: apiKey,
      numbers: `91${mobile}`, // Country code + mobile
      message: message,
      sender: sender,
    }
  );
  
  if (response.data && response.data.status === 'success') {
    console.log(`[SMS] ✅ TextLocal: OTP sent to +91${mobile}`);
    return true;
  }
  
  throw new Error(response.data.errors?.[0]?.message || 'TextLocal API error');
}

/**
 * Send OTP via SMS
 * @param {string} mobile - Mobile number (10 digits)
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<boolean>} - Returns true if SMS sent successfully
 */
async function sendOTP(mobile, otp) {
  try {
    const provider = process.env.SMS_PROVIDER || 'msg91'; // Default to MSG91
    
    // Try to send via configured provider
    try {
      switch (provider.toLowerCase()) {
        case 'msg91':
          await sendViaMSG91(mobile, otp);
          return true;
          
        case 'fast2sms':
          await sendViaFast2SMS(mobile, otp);
          return true;
          
        case 'textlocal':
          await sendViaTextLocal(mobile, otp);
          return true;
          
        default:
          throw new Error(`Unknown SMS provider: ${provider}`);
      }
    } catch (providerError) {
      console.error(`[SMS] ❌ ${provider} failed:`, providerError.message);
      
      // If primary provider fails, try fallback providers
      console.log(`[SMS] 🔄 Trying fallback providers...`);
      
      const fallbackProviders = ['msg91', 'fast2sms', 'textlocal'].filter(p => p !== provider);
      
      for (const fallback of fallbackProviders) {
        try {
          switch (fallback) {
            case 'msg91':
              if (process.env.MSG91_AUTH_KEY && process.env.MSG91_AUTH_KEY !== 'your_auth_key_here') {
                await sendViaMSG91(mobile, otp);
                return true;
              }
              break;
            case 'fast2sms':
              if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY !== 'your_api_key_here') {
                await sendViaFast2SMS(mobile, otp);
                return true;
              }
              break;
            case 'textlocal':
              if (process.env.TEXTLOCAL_API_KEY && process.env.TEXTLOCAL_API_KEY !== 'your_api_key_here') {
                await sendViaTextLocal(mobile, otp);
                return true;
              }
              break;
          }
        } catch (e) {
          // Continue to next fallback
          continue;
        }
      }
      
      throw providerError; // Re-throw if all providers fail
    }
  } catch (error) {
    console.error('[SMS] ❌ All SMS providers failed:', error.message);
    
    // Log OTP for development/testing (only in console, not in response)
    console.log(`[SMS] ⚠️  SMS sending failed. OTP for testing: ${otp}`);
    console.log(`[SMS] 📱 Should be sent to: +91${mobile}`);
    console.log(`[SMS] 💡 Configure SMS provider in .env file`);
    
    // Don't throw error - allow flow to continue
    // User will still see success message (security best practice)
    return false;
  }
}

module.exports = {
  sendOTP,
};

