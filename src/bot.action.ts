import { Telegraf } from "telegraf";
import adminMiddleware from "./middlewares/admin";
import checkRunningMiddleware from "./middlewares/checkRunning";
import { createAction, startAction, stopAction, approveAction, withdrawAction } from "./controllers/actionController";

const attachActions = (bot: Telegraf) => {
    bot.action('approve', adminMiddleware, checkRunningMiddleware, approveAction);
    bot.action('start', adminMiddleware, checkRunningMiddleware, startAction);
    bot.action('stop', adminMiddleware, stopAction);
    bot.action('create', adminMiddleware, checkRunningMiddleware, createAction);
    bot.action('withdraw', adminMiddleware, checkRunningMiddleware, withdrawAction);
}

export default attachActions;