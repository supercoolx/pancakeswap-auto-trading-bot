import { ethers } from "ethers";
import { Context } from "telegraf";
import Wallet from "../model/Wallet";

import { provider, startBuyTrade, startSellTrade, createWallet, withdraw, approveToken, approveTokenOfWallets } from "./trade";
import CONFIG from "../config/config";
import { log } from "../lib/helper";

var tradingIntervalId: NodeJS.Timeout | null = null;

const tradingFunction = async (ctx: Context, wallets: ethers.Wallet[]) => {
    const wallet = wallets[Math.floor(Math.random() * wallets.length)];
    if (Math.random() > 0.5) return startBuyTrade(ctx, wallet);
    else return startSellTrade(ctx, wallet);
}

export const approveAction = async (ctx: Context) => {
    await approveToken(ctx);
}

export const startAction = async (ctx: Context) => {
    const ws = await Wallet.find({ deposited: true, withdrawn: false });
    if (ws.length === 0) return log(ctx, 'No wallet created. Create wallet.');

    const wallets = ws.map(w => new ethers.Wallet(w.privateKey, provider));
    
    await approveTokenOfWallets(ctx, wallets);

    tradingFunction(ctx, wallets);
    tradingIntervalId = setInterval(() => {
        const randomDelay = Math.floor(Math.random() * CONFIG.TRADE_INTERVAL);
        setTimeout(() => tradingFunction(ctx, wallets), randomDelay);
    }, CONFIG.TRADE_INTERVAL);
}

export const stopAction = async (ctx: Context) => {
    if (tradingIntervalId) {
        clearInterval(tradingIntervalId); // Stop the interval
        ctx.reply("Trading bot stopped.");
        tradingIntervalId = null; // Reset the interval variable
    } else {
        ctx.reply("Trading bot is not running.");
    }
}

export const createAction = async (ctx: Context) => {
    await createWallet(ctx, CONFIG.WALLET_COUNT);
}

export const withdrawAction = async (ctx: Context) => {
    await withdraw(ctx);
}