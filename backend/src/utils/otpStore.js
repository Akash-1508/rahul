/**
 * OTP Store - In-memory storage for password reset OTPs
 * In production, use Redis or database for distributed systems
 */

// Store: { emailOrMobile: { otp: string, expiresAt: number, userId: string } }
const otpStore = new Map();

// OTP expiry time: 10 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Generate a 4-digit OTP
 */
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Store OTP for email/mobile
 */
function storeOTP(emailOrMobile, userId) {
  const otp = generateOTP();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
  
  otpStore.set(emailOrMobile, {
    otp,
    expiresAt,
    userId,
  });
  
  // Clean up expired OTPs
  cleanupExpiredOTPs();
  
  return otp;
}

/**
 * Verify OTP for email/mobile
 */
function verifyOTP(emailOrMobile, otp) {
  const stored = otpStore.get(emailOrMobile);
  
  if (!stored) {
    return { valid: false, error: "OTP not found or expired" };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(emailOrMobile);
    return { valid: false, error: "OTP expired" };
  }
  
  if (stored.otp !== otp.trim()) {
    return { valid: false, error: "Invalid OTP" };
  }
  
  // OTP is valid, return userId and delete OTP
  const userId = stored.userId;
  otpStore.delete(emailOrMobile);
  
  return { valid: true, userId };
}

/**
 * Clean up expired OTPs
 */
function cleanupExpiredOTPs() {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
    }
  }
}

/**
 * Get stored OTP (for development/testing - remove in production)
 */
function getStoredOTP(emailOrMobile) {
  const stored = otpStore.get(emailOrMobile);
  if (!stored) {
    return null;
  }
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(emailOrMobile);
    return null;
  }
  return stored.otp;
}

/**
 * Get all stored OTPs (for debugging - development only)
 */
function getAllStoredOTPs() {
  const otps = [];
  const now = Date.now();
  for (const [mobile, data] of otpStore.entries()) {
    if (now <= data.expiresAt) {
      otps.push({
        mobile,
        otp: data.otp,
        expiresAt: new Date(data.expiresAt).toLocaleString(),
        userId: data.userId,
      });
    }
  }
  return otps;
}

module.exports = {
  storeOTP,
  verifyOTP,
  getStoredOTP, // For development only
  getAllStoredOTPs, // For debugging - development only
};

