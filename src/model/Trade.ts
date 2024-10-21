import mongoose from "mongoose";
import { TradeType } from "../lib/constants";

// Define the Follow schema
const TradeSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true },
  type: { type: String, enum: [TradeType.Buy, TradeType.Sell], required: true },
  tokenAmount: { type: String },
  bnbAmount: { type: String },
  transactionHashes: [{ type: String }],
  fee: { type: String },
  success: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Trade = mongoose.model('trade', TradeSchema);
export default Trade;