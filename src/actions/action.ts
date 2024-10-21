import { Context } from "telegraf";
import { startBuyTrade, startSellTrade } from "../lib/trade";
import CONFIG from "../config/config";
import { generateRandomBNBAmount, generateRandomTokenAmount } from "../lib/helper";

var tradingIntervalId: NodeJS.Timeout | null = null;
var running = false;

const tradingFunction = (ctx: Context) => {
    if (!running) return;
    if (Math.random() > 0.5) { // Buy trade
        const bnb = generateRandomBNBAmount();
        startBuyTrade(ctx, bnb);
    } else { // Sell trade
        const token = generateRandomTokenAmount();
        startSellTrade(ctx, token);
    }
}

export const startAction = async (ctx: Context) => {
    running = true;
    tradingFunction(ctx);
    tradingIntervalId = setInterval(() => {
        const randomDelay = Math.floor(Math.random() * CONFIG.TRADE_INTERVAL);
        setTimeout(tradingFunction, randomDelay, ctx);
    }, CONFIG.TRADE_INTERVAL);
}

export const stopAction = async (ctx: Context) => {
    running = false;
    if (tradingIntervalId) {
        clearInterval(tradingIntervalId); // Stop the interval
        ctx.reply("Trading bot stopped.");
        tradingIntervalId = null; // Reset the interval variable
    } else {
        ctx.reply("Trading bot is not running.");
    }
}