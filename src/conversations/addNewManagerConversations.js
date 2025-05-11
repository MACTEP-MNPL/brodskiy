import { getUserByUsername, makeUserManager } from "../db/users.js"

export const addNewManagerConversations = async (conversation, ctx) => {
    await ctx.reply("Отправьте @username пользователя, которого хотите сделать менеджером")

    const username = (await conversation.waitFor("message")).message.text

    // Remove '@' symbol from the beginning of username if it exists
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username
    
    const user = await conversation.external(() =>getUserByUsername(cleanUsername))

    if (!user) {
        return await ctx.reply(`Пользователь с юзернеймом @${cleanUsername} не найден`)
    }

    if (user.lvl === 2) {
        return await ctx.reply(`Пользователь @${user.username} уже является администратором`)
    }

    if (user.lvl === 1) {
        return await ctx.reply(`Пользователь @${user.username} уже является менеджером`)
    }

    await conversation.external(() => makeUserManager(user.id))
    
    await ctx.reply(`Пользователь @${user.username} успешно повышен до менеджера`)
}