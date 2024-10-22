import { Telegraf, Markup } from "telegraf";
import adminMiddleware from "./middlewares/admin";
import checkRunningMiddleware from "./middlewares/checkRunning";
import { stopAction, createAction, startAction } from "./controllers/actionController";

const attachCommandEvent = (bot: Telegraf) => {
    bot.command('start', adminMiddleware, checkRunningMiddleware, async (ctx) => {
        ctx.reply('Choose an option:', Markup.inlineKeyboard([
            [Markup.button.callback('Approve token to batch contract', 'approve')],
            [Markup.button.callback('Start Auto Trading', 'start'), Markup.button.callback('Stop Auto Trading', 'stop')],
            [Markup.button.callback('Create Wallet', 'create'), Markup.button.callback('Withdraw all', 'withdraw')],
        ]));
    });

    bot.command('trade', adminMiddleware, checkRunningMiddleware, startAction);
    bot.command('stop', adminMiddleware, stopAction);
    bot.command('create', adminMiddleware, checkRunningMiddleware, createAction);
}

export default attachCommandEvent;