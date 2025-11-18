const mongoose = require("mongoose");

const UserRoles = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  CONSUMER: 2
};

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: ""
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[0-9]{10}$/
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: false
  },
  address: {
    type: String,
    required: false,
    trim: true
  },
  role: {
    type: Number,
    required: true,
    enum: [0, 1, 2],
    default: 2
  },
  passwordHash: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  milkFixedPrice: {
    type: Number,
    required: false,
    min: 0
  },
  dailyMilkQuantity: {
    type: Number,
    required: false,
    min: 0
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: {
    transform: function(doc, ret) {
      // Remove Mongoose internal properties
      delete ret.$__;
      delete ret.$isNew;
      delete ret.$op;
      delete ret.$versionError;
      delete ret.saveOptions;
      delete ret.validating;
      delete ret.cachedRequired;
      delete ret.backup;
      delete ret.inserting;
      delete ret.savedState;
      
      // Convert _id to string
      ret._id = ret._id.toString();
      
      // Remove passwordHash from JSON output (security)
      delete ret.passwordHash;
      
      return ret;
    }
  }
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ mobile: 1 });
UserSchema.index({ role: 1 });

const User = mongoose.model('User', UserSchema);

// Helper functions
async function findUserByEmail(email) {
  const needle = email.trim().toLowerCase();
  return await User.findOne({ email: needle });
}

async function findUserByMobile(mobile) {
  const needle = mobile.trim();
  if (!needle) return null;
  return await User.findOne({ mobile: needle });
}

async function assertUserUnique(email, mobile) {
  const existingByEmail = await findUserByEmail(email);
  if (existingByEmail) {
    throw new Error("Email already in use");
  }
  if (mobile && mobile.trim()) {
    const existingByMobile = await findUserByMobile(mobile);
    if (existingByMobile) {
      throw new Error("Mobile already in use");
    }
  }
}

async function addUser(userData) {
  await assertUserUnique(userData.email, userData.mobile);
  
  const user = new User(userData);
  return await user.save();
}

async function getUsersByRole(role) {
  console.log(`[users] Fetching users with role ${role}`);
  const users = await User.find({ role: role });
  console.log(`[users] Found ${users.length} users with role ${role}`);
  return users;
}

module.exports = {
  User,
  UserRoles,
  findUserByEmail,
  findUserByMobile,
  assertUserUnique,
  addUser,
  getUsersByRole,
};
