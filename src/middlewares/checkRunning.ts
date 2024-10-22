import { Context } from "telegraf";
import { log } from "../lib/helper";

const status = { running: false }

const checkRunningMiddleware = async (ctx: Context, next: () => Promise<void>) => {
    if (status.running) return log(ctx, 'Another process is running.');
    status.running = true;
    await next();
    status.running = false;
};

export default checkRunningMiddleware;