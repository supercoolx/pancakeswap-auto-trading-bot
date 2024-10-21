import { Context } from "telegraf";

const adminMiddleware = async (ctx: Context, next: () => Promise<void>) => {
    if (ctx.from?.id.toString() === process.env.OWNER_ID) return next();
    else ctx.reply('You are not admin.');
};

export default adminMiddleware;