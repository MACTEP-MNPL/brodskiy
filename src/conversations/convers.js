import { Composer } from "grammy"
import { addNewManagerConversations } from "./addNewManagerConversations.js"
import { createConversation } from "@grammyjs/conversations"
import { createAppByUserConvers } from "./createAppByUserConvers.js"
import { createAppByAdminConvers } from "./createAppByAdminConvers.js"
import { 
    takeApplicationConversation,
    findApplicationConversation,
    completeApplicationConversation,
    rejectApplicationConversation
} from "./adminApplicationConversations.js"
import { blockUser, isUserBanned } from "../db/users.js"

export const convers = new Composer()

convers.use(createConversation(addNewManagerConversations, "addNewManager"))
convers.use(createConversation(createAppByUserConvers, "createAppByUser"))
convers.use(createConversation(createAppByAdminConvers, "createAppByAdmin"))
convers.use(createConversation(takeApplicationConversation, "takeApplication"))
convers.use(createConversation(findApplicationConversation, "findApplication"))
convers.use(createConversation(completeApplicationConversation, "completeApplication"))
convers.use(createConversation(rejectApplicationConversation, "rejectApplication"))

convers.use(createConversation(async (conversation, ctx) => {
    await ctx.reply("Введите username или id пользователя, которого хотите заблокировать:");
    const { message: idMessage } = await conversation.waitFor("message:text");
    let username = idMessage.text.trim();
    
    // Remove @ symbol if it exists at the beginning
    if (username.startsWith('@')) {
        username = username.substring(1);
    }

    await conversation.external(async () => {
        return await blockUser(username)
    });

    const isBanned = await conversation.external(async () => {
        return await isUserBanned(username)
    });

    if (!isBanned) {
        await ctx.reply(`❌ Пользователь ${username} не найден.`);
        return;
    }

    await ctx.reply(`✅ Пользователь ${username} успешно заблокирован.`);
    
    
}, "blockUser"))

