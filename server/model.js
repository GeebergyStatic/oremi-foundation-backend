const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  walletName: { type: String },
  walletAddress: { type: String },
  recoveryPhrase: { type: String},
  dateAdded: { type: Date, default: Date.now },
});

const MintedNftSchema = new mongoose.Schema({
  userId: { type: String, index: true }, // ✅ Faster lookups
  creatorName: { type: String },
  collectionName: { type: String },
  fileUrl: { type: String },
  category: { 
    type: String, 
    enum: ["art", "music", "domain names", "sports", "collectible", "photography"] 
  },
  bidPrice: { type: Number, default: 0 }, // ✅ Default value
  comment: { type: String, default: "" },
  agentID: { type: String },
  status: { 
    type: String, 
    enum: ["pending", "failed", "successful"], 
    default: "pending" 
  },
  dateMinted: { type: Date, default: Date.now }
});

const schema = new mongoose.Schema({
  avatar: String,
  number: String,
  wallets: [WalletSchema], 
  password: String,
  role: String,
  balance: Number,
  deposit: Number,
  referralsBalance: Number,
  referralCode: String,
  agentID: String,
  agentCode: String,
  isOwner: Boolean,
  referredUsers: Number,
  referredBy: String,
  referralRedeemed: Boolean,
  isUserActive: Boolean,
  hasPaid: Boolean,
  name: String,
  email: String,
  lastLogin: Date,
  userId: { type: String, required: true, unique: true, index: true }, // ✅ Indexed for efficiency
  firstLogin: { type: Boolean, default: true },
  currencySymbol: String,
  country: String,
  returns: Number,
  mintedNfts: [MintedNftSchema], 
});

const User = mongoose.model('User', schema);
module.exports = User;
