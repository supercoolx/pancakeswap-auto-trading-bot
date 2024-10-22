import "dotenv/config";
import { Telegraf, session } from "telegraf";

import connectDB from "./bot.db";
import attachCommandEvent from "./bot.command";
import attachActions from "./bot.action";

const bot = new Telegraf(process.env.BOT_TOKEN!);
bot.use(session());

attachCommandEvent(bot);
attachActions(bot);

bot.catch((err) => {
    console.error('❗Ooops!', err);
});

connectDB().then(() => bot.launch());