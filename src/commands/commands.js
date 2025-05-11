import { Composer } from "grammy";
import { mainKeyboard } from "../keyboards/mainKeyboard.js";
import { adminKeyboard } from "../keyboards/adminKeyboard.js";
import { getAllAdmins } from "../db/users.js";
import { isAdmin } from "../utils/users.js";
import { getAllApplications, getApplicationStatistics, getUsernameById } from "../db/applications.js";
import { getStatusEmoji } from "../utils/getEmojiStatus.js";
import { ownerKeyboard } from "../keyboards/adminKeyboard.js";
import { isOwner } from "../utils/users.js";


export const commands = new Composer()

commands.command("start", async (ctx) => {
    await ctx.reply('📈', {
        reply_markup: mainKeyboard
    })
})

commands.command("admin", async (ctx) => {
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

commands.command("owner", async (ctx) => {
    if (!isOwner(ctx)) {
        return
    }

    await ctx.reply("⭐️")

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

    await ctx.reply(message, { parse_mode: "HTML", reply_markup: ownerKeyboard })

    try {
        // Get application statistics for the last 24 hours
        const stats = await getApplicationStatistics();
        
        let message = "<b>📊 Статистика за последние 24 часа:</b>\n\n";
        
        // Total applications created
        message += `<b>Всего создано:</b> ${stats.totalCount}\n\n`;
        
        // Applications by status
        let newCount = 0;
        let completedCount = 0;
        let rejectedCount = 0;
        
        stats.statusCounts.forEach(status => {
            if (status.status === 'new') newCount = status.count;
            if (status.status === 'completed') completedCount = status.count;
            if (status.status === 'rejected') rejectedCount = status.count;
        });
        
        message += `<b>Новые:</b> ${newCount}\n`;
        message += `<b>Завершенные:</b> ${completedCount}\n`;
        message += `<b>Отклоненные:</b> ${rejectedCount}\n\n`;
        
        // Most productive manager
        if (stats.topManager) {
            const managerUsername = await getUsernameById(stats.topManager.manager_id);
            message += `<b>Самый продуктивный менеджер:</b>\n`;
            message += `@${managerUsername || 'Unknown'} (ID: ${stats.topManager.manager_id})\n`;
            message += `Обработано заявок: ${stats.topManager.processed_count}`;
        } else {
            message += "<i>Нет активных менеджеров за последние 24 часа.</i>";
        }
        
        await ctx.reply(message, { 
            parse_mode: "HTML",
            reply_markup: ownerKeyboard 
        });
    } catch (error) {
        console.error("Error getting statistics:", error);
        await ctx.reply("Произошла ошибка при получении статистики.", { 
            reply_markup: ownerKeyboard 
        });
    }
})   

commands.command("applications", async (ctx) => {
    if (!isAdmin(ctx)) {
        return;
    }

    try {
        const applications = await getAllApplications();

        console.log(applications)
        
        if (applications.length === 0) {
            await ctx.reply("Нет активных заявок.", { 
                parse_mode: "HTML",
                reply_markup: adminKeyboard
            });
            return;
        }
        
        // Take only the 10 most recent applications
        const recentApplications = applications.slice(0, 10);
        
        let message = "<b>Последние заявки:</b>\n\n";

        
        
        for (const app of recentApplications) {
            const appData = app.data;
            const date = new Date(app.created_at).toLocaleString('ru-RU');
            const username = app.username ? `@${app.username}` : 'Нет юзернейма';
            
            message += `<b>ID заявки:</b> <code>${app.id}</code> ${getStatusEmoji(app.status)}\n`;
            message += `<b>Тип:</b> ${getApplicationTypeName(app.type)}\n`;
            message += `<b>Пользователь:</b> ${username} (ID: ${app.user_id})\n`;
            message += `<b>Статус:</b> ${getStatusName(app.status)}\n`;
            message += `<b>Дата:</b> ${date}\n`;
            
            // Add application-specific details
            switch (app.type) {
                case 'buy_usdt':
                    message += `<b>Валюта:</b> ${appData.currencyPair}\n`;
                    message += `<b>Сумма:</b> ${appData.amount}\n`;
                    message += `<b>Город:</b> ${appData.city}\n`;
                    break;
                case 'sell_usdt':
                    message += `<b>Валюта:</b> ${appData.currencyPair}\n`;
                    message += `<b>Сумма USDT:</b> ${appData.amount}\n`;
                    message += `<b>Город:</b> ${appData.city}\n`;
                    break;
                case 'alipay_payment':
                    message += `<b>Способ оплаты:</b> ${appData.paymentMethod}\n`;
                    message += `<b>Сумма (юань):</b> ${appData.amount}\n`;
                    break;
                case 'foreign_company_payment':
                    message += `<b>Сумма:</b> ${appData.amount}\n`;
                    break;
            }
            
            message += "\n";
        }
        
        if (applications.length > 10) {
            message += `\n<i>Показано 10 из ${applications.length} заявок.</i>`;
        }
        
        await ctx.reply(message, { 
            parse_mode: "HTML",
            reply_markup: adminKeyboard
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        await ctx.reply("Произошла ошибка при получении заявок.", { 
            reply_markup: adminKeyboard
        });
    }
});

// Helper functions for application display
function getApplicationTypeName(type) {
    const types = {
        'buy_usdt': 'Покупка USDT',
        'sell_usdt': 'Продажа USDT',
        'alipay_payment': 'Оплата ALIPAY',
        'foreign_company_payment': 'Оплата зарубежному юрлицу'
    };
    
    return types[type] || type;
}

function getStatusName(status) {
    const statuses = {
        'new': 'Новая',
        'processing': 'В обработке',
        'completed': 'Завершена',
        'rejected': 'Отклонена'
    };
    
    return statuses[status] || status;
}
