import { Telegraf, Markup } from "telegraf";
import adminMiddleware from "./middlewares/admin";
import { stopAction } from "./actions/action";

const attachCommandEvent = (bot: Telegraf) => {
    bot.command('start', adminMiddleware, async (ctx) => {
        ctx.reply('Choose an option:', Markup.inlineKeyboard([
            [Markup.button.callback('Start Auto Trading', 'start')],
            [Markup.button.callback('Stop Auto Trading', 'stop')]
        ]));
    });

    bot.command('stop', adminMiddleware, stopAction);
}

export default attachCommandEvent;