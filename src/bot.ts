import "dotenv/config";
import { Telegraf, session } from "telegraf";

import connectDB from "./bot.db";
import attachCommandEvent from "./bot.command";
import attachActions from "./bot.action";

const bot = new Telegraf(process.env.BOT_TOKEN!);
bot.use(session());

attachCommandEvent(bot);
attachActions(bot);

bot.on('sticker', ctx => {
    const sticker = ctx.message.sticker;
    console.log(sticker);
    ctx.replyWithSticker(sticker.file_id);
})

bot.catch((err) => {
    console.error('❗Ooops!', err);
});

connectDB().then(() => bot.launch());