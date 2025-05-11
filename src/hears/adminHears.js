import { Composer } from "grammy"
import { isManager } from "../utils/users.js"
import { isOwner } from "../utils/users.js"
import { isAdmin } from "../utils/users.js"
import { getNewApplications, getApplicationsByManagerId } from "../db/applications.js"
import { getAppInfoMessage } from "../messages/getAppInfoMessage.js"
import { applicationAdminKeyboard } from "../keyboards/adminKeyboard.js"
import { getAllAdmins } from "../db/users.js"
import { adminKeyboard } from "../keyboards/adminKeyboard.js"
import { sendApplication } from "../utils/sendApplication.js"

export const adminHears = new Composer()

adminHears.hears("📝 Работа с заявкой", async (ctx) => {
    if (!isAdmin(ctx)) {
        return
    }

    await ctx.reply("📝", { reply_markup: applicationAdminKeyboard })
})

adminHears.hears("🔙 Назад", async (ctx) => {
    if (!isAdmin(ctx)) {
        return
    }

    await ctx.reply('📊')
    const admins = await getAllAdmins();
    
    // Filter admins by level
    const administrators = admins.filter(admin => admin.lvl === 2);
    const managers = admins.filter(admin => admin.lvl === 1);
    
    let message = "<b>Администраторы:</b>\n\n";
    
    if (administrators.length > 0) {
        administrators.forEach((admin) => {
            message += `<b>@${admin.username}</b>\n`;
            message += `ID: <code>${admin.id}</code>\n\n`;
        });
    } else {
        message += "<i>Нет администраторов...</i>\n\n";
    }
    
    message += "<b>Менеджеры:</b>\n\n";
    
    if (managers.length > 0) {
        managers.forEach((manager) => {
            message += `<b>@${manager.username}</b>\n`;
            message += `ID: <code>${manager.id}</code>\n\n`;
        });
    } else {
        message += "<i>Нет менеджеров...</i>\n";
    }
    
    await ctx.reply(message, { parse_mode: "HTML", reply_markup: adminKeyboard});
})



adminHears.hears("⭐️ Мои заявки", async (ctx) => {
    if (!isAdmin(ctx)) {
        return
    }

    const applications = await getApplicationsByManagerId(ctx.from.id)

    for (const application of applications) {
        await sendApplication(ctx, application)
    }
})

adminHears.hears("🔥 Новые заявки", async (ctx) => {
    if (!isAdmin(ctx)) {
        return
    }

    const applications = await getNewApplications()

    for (const application of applications) {
        await ctx.reply(getAppInfoMessage(application), { parse_mode: "HTML" })
    }
})

adminHears.hears("✅ Завершить заявку", async (ctx) => {
    if (!isAdmin(ctx)) {
        return
    }
    
    await ctx.conversation.enter("completeApplication")
})

adminHears.hears("⛏️ Взять заявку в работу", async (ctx) => {
    if (!isAdmin(ctx)) {
        return
    }
    
    await ctx.conversation.enter("takeApplication")
})

adminHears.hears("🔍 Найти заявку по id", async (ctx) => {
    if (!isAdmin(ctx)) {
        return
    }
    
    await ctx.conversation.enter("findApplication")
})

adminHears.hears("❌ Отклонить заявку", async (ctx) => {
    if (!isAdmin(ctx)) {
        return
    }
    
    await ctx.conversation.enter("rejectApplication")
})

adminHears.hears("🚫 Заблокировать пользователя", async (ctx) => {
    if (!isAdmin(ctx)) {
        return
    }
    
    await ctx.conversation.enter("blockUser")
})
