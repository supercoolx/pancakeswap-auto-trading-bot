import { Context } from "telegraf";

export const generateRandomValue = (min: number, max: number, fixed = 0) => {
    const randomValue = Math.random() * (max - min) + min;
    return parseFloat(randomValue.toFixed(fixed));
}

export const log = async (ctx: Context, ...texts: string[]) => {
    console.log(...texts);
    const promises = texts.map(text => ctx.reply(text));
    return Promise.all(promises);
}