import { Composer } from "grammy";
import { getExhangeDataMessage } from "../messages/getExhangeDataMessage.js";
import { get2LvlUser } from "../db/users.js";
import { InlineKeyboard } from "grammy";


export const exchangeDataHears = new Composer()

exchangeDataHears.hears("🔄 Курс обмена", async (ctx) => {

    const [message, options] = getExhangeDataMessage()

    const owner = await get2LvlUser()
    const ownerContact = new InlineKeyboard().url("Уточнить курс", `https://t.me/${owner.username}`)
    await ctx.reply(message, {
        reply_markup: ownerContact,
        ...options
    })
})

