import mongoose from "mongoose";

// Define the Follow schema
const WalletSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true },
  deposited: { type: Boolean, default: false },
  withdrawn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Wallet = mongoose.model('wallet', WalletSchema);
export default Wallet;