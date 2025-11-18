const crypto = require("crypto");
const { addUser, UserRoles, findUserByEmail, findUserByMobile, addBuyer } = require("../models");
const { validateSignup, validateLogin, formatValidationErrors } = require("../utils/validators");
const { generateToken } = require("../utils/jwt");

const login = async (req, res) => {
  const validation = validateLogin(req.body);
  if (!validation.success) {
    return res.status(400).json(formatValidationErrors(validation.errors));
  }
  
  const { emailOrMobile, password } = validation.data;
  
  // Check if it's email or mobile number
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrMobile);
  const isMobile = /^[0-9]{10}$/.test(emailOrMobile);
  
  if (!isEmail && !isMobile) {
    return res.status(400).json({ error: "Invalid email or mobile number format" });
  }
  
  try {
    // Find user by email or mobile
    let user = null;
    if (isEmail) {
      user = await findUserByEmail(emailOrMobile.toLowerCase());
    } else {
      user = await findUserByMobile(emailOrMobile);
    }
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Verify password hash
    const [salt, hash] = user.passwordHash.split(':');
    if (!salt || !hash) {
      return res.status(500).json({ error: "Invalid password format" });
    }
    
    const inputHash = crypto.scryptSync(password, salt, 64).toString("hex");
    if (inputHash !== hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Generate JWT token with user data
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      mobile: user.mobile,
      name: user.name,
      role: user.role,
    });
    
    return res.json({ 
      token, 
      user: { 
        id: user._id.toString(), 
        name: user.name, 
        email: user.email,
        mobile: user.mobile,
        role: user.role
      } 
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
};

const signup = async (req, res) => {
  // Validate request data using helper
  const validation = validateSignup(req.body);
  if (!validation.success) {
    return res.status(400).json(formatValidationErrors(validation.errors));
  }
  
  const validatedData = validation.data;

  // Hash password (salt + scrypt)
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(validatedData.password, salt, 64).toString("hex");
  const passwordHash = `${salt}:${hash}`;

  try {
    // Use provided role or default to CONSUMER (2)
    const userRole = validatedData.role !== undefined ? validatedData.role : UserRoles.CONSUMER;
    
    // Log received data for debugging
    console.log('[auth] Signup data received:', {
      name: validatedData.name,
      mobile: validatedData.mobile,
      milkFixedPrice: validatedData.milkFixedPrice,
      dailyMilkQuantity: validatedData.dailyMilkQuantity,
    });
    
    const created = await addUser({
      name: validatedData.name,
      email: validatedData.email || "",
      mobile: validatedData.mobile.trim(),
      gender: validatedData.gender,
      address: validatedData.address?.trim(),
      role: userRole,
      passwordHash,
      isActive: true,
      milkFixedPrice: validatedData.milkFixedPrice,
      dailyMilkQuantity: validatedData.dailyMilkQuantity
    });

    console.log(`[auth] New user created:`, {
      _id: created._id,
      name: created.name,
      mobile: created.mobile,
      milkFixedPrice: created.milkFixedPrice,
      dailyMilkQuantity: created.dailyMilkQuantity,
    });

    // If user is a buyer (CONSUMER role), create a buyer record
    if (userRole === UserRoles.CONSUMER && created._id) {
      try {
        // Convert _id to string if it's ObjectId, to ensure proper handling
        const userId = created._id?.toString ? created._id.toString() : String(created._id);
        
        console.log('[auth] Attempting to create buyer record for user:', {
          userId: userId,
          userIdType: typeof created._id,
          userIdString: userId,
          name: created.name,
          quantity: validatedData.dailyMilkQuantity,
          rate: validatedData.milkFixedPrice,
        });
        
        const buyer = await addBuyer({
          userId: userId, // Pass as string, addBuyer will convert to ObjectId
          name: created.name,
          quantity: validatedData.dailyMilkQuantity,
          rate: validatedData.milkFixedPrice,
        });
        
        console.log(`[auth] Buyer record created successfully:`, {
          _id: buyer._id,
          userId: buyer.userId,
          name: buyer.name,
          quantity: buyer.quantity,
          rate: buyer.rate,
        });
      } catch (buyerError) {
        // Log error but don't fail the signup if buyer creation fails
        console.error('[auth] Failed to create buyer record:', {
          error: buyerError?.message || buyerError,
          stack: buyerError?.stack,
          userId: created._id?.toString ? created._id.toString() : String(created._id),
          userIdType: typeof created._id,
          fullError: JSON.stringify(buyerError, Object.getOwnPropertyNames(buyerError)),
        });
      }
    } else {
      console.log('[auth] Skipping buyer creation:', {
        userRole,
        isConsumer: userRole === UserRoles.CONSUMER,
        hasId: !!created._id,
        _id: created._id?.toString ? created._id.toString() : String(created._id),
      });
    }

    // Convert Mongoose document to JSON (will use toJSON transform)
    const userJson = created.toJSON ? created.toJSON() : JSON.parse(JSON.stringify(created));
    // Remove passwordHash if still present
    const { passwordHash: _ph, ...safe } = userJson;
    return res.status(201).json(safe);
  } catch (e) {
    const msg = typeof e?.message === "string" ? e.message : "Unable to create user";
    const status = /already in use/i.test(msg) ? 409 : 400;
    return res.status(status).json({ error: msg });
  }
};

module.exports = { login, signup };

