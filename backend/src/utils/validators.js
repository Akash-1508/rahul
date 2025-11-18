const { z } = require("zod");

// Signup validation schema
const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
      "Invalid email format"
    )
    .transform((val) => val && val.trim() ? val.toLowerCase().trim() : ""),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .refine(
      (val) => /^[0-9]{10}$/.test(val.trim()),
      "Mobile must be exactly 10 digits"
    ),
  gender: z
    .union([z.literal("male"), z.literal("female"), z.literal("other")])
    .optional(),
  address: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim().length >= 5,
      "Address must be at least 5 characters if provided"
    ),
  otp: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{4}$/.test(val.trim()),
      "OTP must be exactly 4 digits"
    ),
  role: z
    .union([z.literal(0), z.literal(1), z.literal(2)])
    .optional()
    .default(2),
  milkFixedPrice: z
    .number()
    .nonnegative()
    .optional(),
  dailyMilkQuantity: z
    .number()
    .nonnegative()
    .optional(),
});

// Login validation schema - accepts email OR mobile
const loginSchema = z.object({
  emailOrMobile: z
    .string()
    .min(1, "Email or mobile number is required")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Validate signup data
function validateSignup(data) {
  const result = signupSchema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  return {
    success: false,
    errors: result.error,
  };
}

// Validate login data
function validateLogin(data) {
  const result = loginSchema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  return {
    success: false,
    errors: result.error,
  };
}

// Format validation errors for API response
function formatValidationErrors(error) {
  return {
    error: error.flatten(),
    message: "Validation failed",
  };
}

module.exports = {
  signupSchema,
  loginSchema,
  validateSignup,
  validateLogin,
  formatValidationErrors,
};

