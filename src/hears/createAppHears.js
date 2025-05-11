import { Composer } from "grammy"
import { isAdmin } from "../utils/users.js"

export const createAppHears = new Composer()

createAppHears.hears('➕ Создать заявку', async (ctx) => {
    if(isAdmin(ctx)) {
        console.log('admin')
        await ctx.conversation.enter('createAppByAdmin')
    } else {
        console.log('user')
        await ctx.conversation.enter('createAppByUser')
    }
})


