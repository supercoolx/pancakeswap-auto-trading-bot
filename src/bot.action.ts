import { Telegraf } from "telegraf";
import { startAction, stopAction } from "./actions/action";

const attachActions = (bot: Telegraf) => {
    bot.action('start', startAction);
    bot.action('stop', stopAction);
}

export default attachActions;