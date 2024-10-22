import mongoose from "mongoose";
import { TradeType } from "../lib/constants";

// Define the Follow schema
const TradeSchema = new mongoose.Schema({
  address: { type: String, required: true },
  type: { type: String, enum: Object.values(TradeType), required: true },
  tokenAmount: { type: String },
  bnbAmount: { type: String },
  transactionHash: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Trade = mongoose.model('trade', TradeSchema);
export default Trade;