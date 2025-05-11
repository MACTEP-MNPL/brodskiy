import { Composer } from "grammy";
import { isManager } from "../utils/users.js";
import { isOwner } from "../utils/users.js";
import { isAdmin } from "../utils/users.js";
import { ownerKeyboard } from "../keyboards/adminKeyboard.js";
import { getAllApplications, getFilteredApplications } from "../db/applications.js";
import { InlineKeyboard } from "grammy";
import { getStatusEmoji } from "../utils/getEmojiStatus.js";

export const ownerHears = new Composer()

ownerHears.hears("👤 Назначить менеджера", async (ctx) => {
    if (isManager(ctx)) {
        await ctx.reply("Только администраторы могут назначать менеджеров")
        return  
    }

    if(isOwner(ctx)) {
        await ctx.conversation.enter("addNewManager")
    }
})

ownerHears.hears("⭐️ Все заявки", async (ctx) => {
    if (!isAdmin(ctx)) {
        return
    }

    // Reset all filter and pagination states
    ctx.session.appFilter = null;
    ctx.session.appType = null;
    ctx.session.appOffset = 0;
    ctx.session.appSortBy = 'created_at';
    ctx.session.appSortOrder = 'DESC';

    await showApplications(ctx);
});

// New handler for general statistics button
ownerHears.hears("📊 Статистика", async (ctx) => {
    if (!isOwner(ctx)) {
        return
    }

    await showGeneralStatistics(ctx);
});

// Handler for today's statistics
ownerHears.hears("📅 Сегодня", async (ctx) => {
    if (!isOwner(ctx)) {
        return
    }

    await showPeriodStatistics(ctx, 'today');
});

// Handler for weekly statistics
ownerHears.hears("📆 Неделя", async (ctx) => {
    if (!isOwner(ctx)) {
        return
    }

    await showPeriodStatistics(ctx, 'week');
});

// Handler for monthly statistics
ownerHears.hears("📋 Месяц", async (ctx) => {
    if (!isOwner(ctx)) {
        return
    }

    await showPeriodStatistics(ctx, 'month');
});

// Handler for manager statistics
ownerHears.hears("👥 Статистика менеджеров", async (ctx) => {
    if (!isOwner(ctx)) {
        return
    }

    await showManagerStatistics(ctx);
});

// Handle application filter callbacks
ownerHears.callbackQuery(/^app_filter:(.+)$/, async (ctx) => {
    if (!isOwner(ctx)) {
        await ctx.answerCallbackQuery("Доступ запрещен");
        return;
    }
    
    const filter = ctx.match[1];
    await ctx.answerCallbackQuery();
    
    // Save filter in session
    ctx.session.appFilter = filter === "all" ? null : filter;
    ctx.session.appOffset = 0; // Reset pagination when filter changes
    
    await showApplications(ctx);
});

// Handle application type filter callbacks
ownerHears.callbackQuery(/^app_type:(.+)$/, async (ctx) => {
    if (!isOwner(ctx)) {
        await ctx.answerCallbackQuery("Доступ запрещен");
        return;
    }
    
    const type = ctx.match[1];
    await ctx.answerCallbackQuery();
    
    // Save type filter in session
    ctx.session.appType = type === "all" ? null : type;
    ctx.session.appOffset = 0; // Reset pagination when filter changes
    
    await showApplications(ctx);
});

// Handle pagination callbacks
ownerHears.callbackQuery(/^app_page:(prev|next)$/, async (ctx) => {
    if (!isOwner(ctx)) {
        await ctx.answerCallbackQuery("Доступ запрещен");
        return;
    }
    
    const direction = ctx.match[1];
    await ctx.answerCallbackQuery();
    
    // Initialize offset if not exists
    if (!ctx.session.appOffset) ctx.session.appOffset = 0;
    
    // Update offset based on direction
    if (direction === "next") {
        ctx.session.appOffset += 10;
    } else if (direction === "prev" && ctx.session.appOffset >= 10) {
        ctx.session.appOffset -= 10;
    }
    
    await showApplications(ctx);
});

// Handle sort callbacks
ownerHears.callbackQuery(/^app_sort:(.+)$/, async (ctx) => {
    if (!isOwner(ctx)) {
        await ctx.answerCallbackQuery("Доступ запрещен");
        return;
    }
    
    const sortOption = ctx.match[1];
    await ctx.answerCallbackQuery();
    
    // Parse sort option (column:order)
    const [column, order] = sortOption.split(":");
    
    // Save sort options in session
    ctx.session.appSortBy = column;
    ctx.session.appSortOrder = order;
    
    await showApplications(ctx);
});

// Function to show applications with filters and pagination
async function showApplications(ctx) {
    try {
        // Get filter options from session or use defaults
        const options = {
            limit: 10,
            offset: ctx.session.appOffset || 0,
            status: ctx.session.appFilter || null,
            type: ctx.session.appType || null,
            sortBy: ctx.session.appSortBy || 'created_at',
            sortOrder: ctx.session.appSortOrder || 'DESC'
        };
        
        // Get applications with pagination
        const result = await getFilteredApplications(options);
        const { applications, pagination } = result;
        
        if (applications.length === 0 && pagination.total === 0) {
            await ctx.reply("Нет активных заявок.", { 
                parse_mode: "HTML",
                reply_markup: ownerKeyboard
            });
            return;
        }
        
        // Get total counts for statistics
        const allApps = await getAllApplications();
        const newApps = allApps.filter(app => app.status === 'new').length;
        const processingApps = allApps.filter(app => app.status === 'processing').length;
        const completedApps = allApps.filter(app => app.status === 'completed').length;
        const rejectedApps = allApps.filter(app => app.status === 'rejected').length;
        
        // Build message with statistics
        let message = "<b>📋 Статистика всех заявок:</b>\n\n";
        message += `<b>📊 Всего заявок:</b> ${pagination.total}\n`;
        message += `<b>🆕 Новых:</b> ${newApps}\n`;
        message += `<b>⏳ В обработке:</b> ${processingApps}\n`;
        message += `<b>✅ Завершенных:</b> ${completedApps}\n`;
        message += `<b>❌ Отклоненных:</b> ${rejectedApps}\n\n`;
        
        // Add current filter info
        message += "<b>🔍 Фильтр:</b> ";
        message += options.status ? getStatusName(options.status) : "Все статусы";
        message += options.type ? `, ${getApplicationTypeName(options.type)}` : ", Все типы";
        message += `\n<b>🔃 Сортировка:</b> ${getSortColumnName(options.sortBy)} (${options.sortOrder === 'DESC' ? '⬇️' : '⬆️'})\n\n`;
        
        // Add list of applications
        if (applications.length > 0) {
            message += "<b>📝 Заявки:</b>\n\n";
            
            for (const app of applications) {
                const date = new Date(app.created_at).toLocaleString('ru-RU');
                const username = app.username ? `@${app.username}` : 'Нет юзернейма';
                const appData = typeof app.data === 'string' ? JSON.parse(app.data) : app.data;
                
                message += `<b>📋 Заявка #${app.id}</b> ${getStatusEmoji(app.status)}\n\n`;
                message += `<b>📅 Дата:</b> ${date}\n`;
                message += `<b>🔄 Тип:</b> ${getApplicationTypeName(app.type)}\n`;
                
                // Add type-specific information
                switch (app.type) {
                    case 'buy_usdt':
                        if (appData && appData.currencyPair) message += `<b>💰 Отдаёт:</b> ${appData.currencyPair}\n`;
                        if (appData && appData.amount) message += `<b>💵 Сумма:</b> ${appData.amount}\n`;
                        if (appData && appData.city) message += `<b>🏙️ Город:</b> ${appData.city}\n`;
                        break;
                    case 'sell_usdt':
                        if (appData && appData.currencyPair) message += `<b>💰 Получает:</b> ${appData.currencyPair}\n`;
                        if (appData && appData.amount) message += `<b>💵 Сумма USDT:</b> ${appData.amount}\n`;
                        if (appData && appData.city) message += `<b>🏙️ Город:</b> ${appData.city}\n`;
                        break;
                    case 'alipay_payment':
                        if (appData && appData.paymentMethod) message += `<b>💳 Способ оплаты:</b> ${appData.paymentMethod}\n`;
                        if (appData && appData.amount) message += `<b>💵 Сумма:</b> ${appData.amount}\n`;
                        break;
                    case 'foreign_company_payment':
                        if (appData && appData.amount) message += `<b>💵 Сумма:</b> ${appData.amount}\n`;
                        if (appData && appData.sourceCurrency) message += `<b>💱 Валюта:</b> ${appData.sourceCurrency}\n`;
                        if (appData && appData.destinationCountry) message += `<b>🌍 Страна:</b> ${appData.destinationCountry}\n`;
                        break;
                    case 'cash_abroad':
                        if (appData && appData.country) message += `<b>🌍 Страна:</b> ${appData.country}\n`;
                        if (appData && appData.city) message += `<b>🏙️ Город:</b> ${appData.city}\n`;
                        if (appData && appData.paymentMethod) message += `<b>💳 Способ оплаты:</b> ${appData.paymentMethod}\n`;
                        if (appData && appData.amount) message += `<b>💵 Сумма:</b> ${appData.amount}\n`;
                        if (appData && appData.userCity) message += `<b>🏙️ Город клиента:</b> ${appData.userCity}\n`;
                        break;
                }
                
                message += `<b>👤 Клиент:</b> ${username}\n`;
                
                if (app.manager_id) {
                    message += `<b>👮‍♂️ Менеджер ID:</b> ${app.manager_id}\n`;
                }
                
                if (app.created_by_user === 0) {
                    message += `<i>Создана администратором</i>\n`;
                }
                
                message += "\n";
            }
            
            // Add pagination info
            message += `<i>📄 Показано ${applications.length} из ${pagination.total} заявок (страница ${Math.floor(pagination.offset / pagination.limit) + 1})</i>`;
        } else {
            message += "<i>Нет заявок, соответствующих фильтру</i>";
        }
        
        // Create inline keyboard for filtering and pagination
        const keyboard = new InlineKeyboard()
            // Status filters
            .text("Все", "app_filter:all")
            .text("🆕 Новые", "app_filter:new")
            .text("⏳ В обработке", "app_filter:processing")
            .row()
            .text("✅ Завершенные", "app_filter:completed")
            .text("❌ Отклоненные", "app_filter:rejected")
            .row()
            // Type filters
            .text("Все типы", "app_type:all")
            .text("💱 Покупка", "app_type:buy_usdt")
            .row()
            .text("💰 Продажа", "app_type:sell_usdt")
            .text("💳 Alipay", "app_type:alipay_payment")
            .row()
            .text("🌍 Зарубеж", "app_type:foreign_company_payment")
            .text("💵 Наличные", "app_type:cash_abroad")
            .row();
        
        // Sorting options
        keyboard.text("По дате ⬇️", "app_sort:created_at:DESC")
            .text("По дате ⬆️", "app_sort:created_at:ASC")
            .row();
        
        // Pagination
        if (pagination.offset > 0) {
            keyboard.text("⬅️ Назад", "app_page:prev");
        }
        
        if (pagination.hasMore) {
            keyboard.text("Вперед ➡️", "app_page:next");
        }
        
        await ctx.reply(message, { 
            parse_mode: "HTML",
            reply_markup: keyboard
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        await ctx.reply("Произошла ошибка при получении заявок.", { 
            reply_markup: ownerKeyboard
        });
    }
}

// Handle back to owner menu
ownerHears.callbackQuery("back_to_owner", async (ctx) => {
    await ctx.answerCallbackQuery();
    
    // Reset all filter and pagination states
    ctx.session.appFilter = null;
    ctx.session.appType = null;
    ctx.session.appOffset = 0;
    ctx.session.appSortBy = 'created_at';
    ctx.session.appSortOrder = 'DESC';
    
    await ctx.reply("Выберите действие:", { reply_markup: ownerKeyboard });
});

// Function to show general statistics
async function showGeneralStatistics(ctx) {
    try {
        // Get all applications
        const allApps = await getAllApplications();
        
        // Basic statistics
        const totalApps = allApps.length;
        const newApps = allApps.filter(app => app.status === 'new').length;
        const processingApps = allApps.filter(app => app.status === 'processing').length;
        const completedApps = allApps.filter(app => app.status === 'completed').length;
        const rejectedApps = allApps.filter(app => app.status === 'rejected').length;
        
        // Type statistics
        const buyUsdtApps = allApps.filter(app => app.type === 'buy_usdt').length;
        const sellUsdtApps = allApps.filter(app => app.type === 'sell_usdt').length;
        const alipayApps = allApps.filter(app => app.type === 'alipay_payment').length;
        const foreignApps = allApps.filter(app => app.type === 'foreign_company_payment').length;
        const cashAbroadApps = allApps.filter(app => app.type === 'cash_abroad').length;
        
        // Admin vs Client created
        const adminCreated = allApps.filter(app => app.created_by_user === 1).length;
        const clientCreated = allApps.filter(app => app.created_by_user === 0).length;
        
        // Create stats message
        let message = "<b>📊 ОБЩАЯ СТАТИСТИКА ПО ЗАЯВКАМ</b>\n\n";
        
        // Status statistics
        message += "<b>🔄 СТАТУСЫ ЗАЯВОК:</b>\n";
        message += `<b>📋 Всего заявок:</b> ${totalApps}\n`;
        message += `<b>🆕 Новых:</b> ${newApps} (${(newApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>⏳ В обработке:</b> ${processingApps} (${(processingApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>✅ Завершенных:</b> ${completedApps} (${(completedApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>❌ Отклоненных:</b> ${rejectedApps} (${(rejectedApps/totalApps*100).toFixed(1)}%)\n\n`;
        
        // Type statistics
        message += "<b>📝 ТИПЫ ЗАЯВОК:</b>\n";
        message += `<b>💱 Покупка USDT:</b> ${buyUsdtApps} (${(buyUsdtApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>💰 Продажа USDT:</b> ${sellUsdtApps} (${(sellUsdtApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>💳 Оплата ALIPAY:</b> ${alipayApps} (${(alipayApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>🌍 Оплата зарубежному юрлицу:</b> ${foreignApps} (${(foreignApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>💵 Наличные зарубежом:</b> ${cashAbroadApps} (${(cashAbroadApps/totalApps*100).toFixed(1)}%)\n\n`;
        
        // Source statistics
        message += "<b>👤 ИСТОЧНИК ЗАЯВОК:</b>\n";
        message += `<b>👨‍💼 Создано администраторами:</b> ${adminCreated} (${(adminCreated/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>👥 Создано клиентами:</b> ${clientCreated} (${(clientCreated/totalApps*100).toFixed(1)}%)\n`;
        
        await ctx.reply(message, {
            parse_mode: "HTML",
            reply_markup: ownerKeyboard
        });
    } catch (error) {
        console.error("Error generating statistics:", error);
        await ctx.reply("Произошла ошибка при получении статистики.", { 
            reply_markup: ownerKeyboard
        });
    }
}

// Function to show period-specific statistics
async function showPeriodStatistics(ctx, period) {
    try {
        // Get all applications
        const allApps = await getAllApplications();
        
        // Determine the cutoff date based on the period
        let cutoffDate = new Date();
        let periodName = "";
        
        if (period === 'today') {
            cutoffDate.setHours(0, 0, 0, 0);
            periodName = "За сегодня";
        } else if (period === 'week') {
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            periodName = "За последние 7 дней";
        } else if (period === 'month') {
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            periodName = "За последний месяц";
        }
        
        // Filter applications by date
        const periodApps = allApps.filter(app => {
            const appDate = new Date(app.created_at);
            return appDate >= cutoffDate;
        });
        
        // If no applications, show empty message
        if (periodApps.length === 0) {
            await ctx.reply(`<b>📊 Статистика ${periodName}</b>\n\nНет заявок за выбранный период.`, {
                parse_mode: "HTML",
                reply_markup: ownerKeyboard
            });
            return;
        }
        
        // Basic statistics
        const totalApps = periodApps.length;
        const newApps = periodApps.filter(app => app.status === 'new').length;
        const processingApps = periodApps.filter(app => app.status === 'processing').length;
        const completedApps = periodApps.filter(app => app.status === 'completed').length;
        const rejectedApps = periodApps.filter(app => app.status === 'rejected').length;
        
        // Type statistics
        const buyUsdtApps = periodApps.filter(app => app.type === 'buy_usdt').length;
        const sellUsdtApps = periodApps.filter(app => app.type === 'sell_usdt').length;
        const alipayApps = periodApps.filter(app => app.type === 'alipay_payment').length;
        const foreignApps = periodApps.filter(app => app.type === 'foreign_company_payment').length;
        const cashAbroadApps = periodApps.filter(app => app.type === 'cash_abroad').length;
        
        // Create stats message
        let message = `<b>📊 СТАТИСТИКА ${periodName.toUpperCase()}</b>\n\n`;
        
        // Status statistics
        message += "<b>🔄 СТАТУСЫ ЗАЯВОК:</b>\n";
        message += `<b>📋 Всего заявок:</b> ${totalApps}\n`;
        message += `<b>🆕 Новых:</b> ${newApps} (${(newApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>⏳ В обработке:</b> ${processingApps} (${(processingApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>✅ Завершенных:</b> ${completedApps} (${(completedApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>❌ Отклоненных:</b> ${rejectedApps} (${(rejectedApps/totalApps*100).toFixed(1)}%)\n\n`;
        
        // Type statistics
        message += "<b>📝 ТИПЫ ЗАЯВОК:</b>\n";
        message += `<b>💱 Покупка USDT:</b> ${buyUsdtApps} (${(buyUsdtApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>💰 Продажа USDT:</b> ${sellUsdtApps} (${(sellUsdtApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>💳 Оплата ALIPAY:</b> ${alipayApps} (${(alipayApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>🌍 Оплата зарубежному юрлицу:</b> ${foreignApps} (${(foreignApps/totalApps*100).toFixed(1)}%)\n`;
        message += `<b>💵 Наличные зарубежом:</b> ${cashAbroadApps} (${(cashAbroadApps/totalApps*100).toFixed(1)}%)\n`;
        
        await ctx.reply(message, {
            parse_mode: "HTML",
            reply_markup: ownerKeyboard
        });
    } catch (error) {
        console.error("Error generating period statistics:", error);
        await ctx.reply("Произошла ошибка при получении статистики.", { 
            reply_markup: ownerKeyboard
        });
    }
}

// Function to show manager statistics
async function showManagerStatistics(ctx) {
    try {
        // Get all applications
        const allApps = await getAllApplications();
        
        // Group applications by manager_id
        const managerStats = {};
        let noManagerApps = 0;
        
        // Build a map of manager_id to username
        const managerUsernames = {};
        
        // First pass to collect usernames and initialize manager stats
        for (const app of allApps) {
            if (app.manager_id) {
                // Store username if available
                if (app.username && !managerUsernames[app.manager_id]) {
                    managerUsernames[app.manager_id] = app.username;
                }
                
                if (!managerStats[app.manager_id]) {
                    managerStats[app.manager_id] = {
                        total: 0,
                        completed: 0,
                        rejected: 0,
                        processing: 0,
                        new: 0,
                        buyUsdt: 0,
                        sellUsdt: 0,
                        alipay: 0,
                        foreign: 0,
                        cashAbroad: 0
                    };
                }
                
                const manager = managerStats[app.manager_id];
                manager.total++;
                
                // Count by status
                if (app.status === 'completed') manager.completed++;
                if (app.status === 'rejected') manager.rejected++;
                if (app.status === 'processing') manager.processing++;
                if (app.status === 'new') manager.new++;
                
                // Count by type
                if (app.type === 'buy_usdt') manager.buyUsdt++;
                if (app.type === 'sell_usdt') manager.sellUsdt++;
                if (app.type === 'alipay_payment') manager.alipay++;
                if (app.type === 'foreign_company_payment') manager.foreign++;
                if (app.type === 'cash_abroad') manager.cashAbroad++;
            } else {
                noManagerApps++;
            }
        }
        
        // Create stats message
        let message = "<b>👥 СТАТИСТИКА ПО МЕНЕДЖЕРАМ</b>\n\n";
        
        if (Object.keys(managerStats).length === 0) {
            message += "Нет заявок, назначенных менеджерам.";
        } else {
            // For each manager
            for (const [managerId, stats] of Object.entries(managerStats)) {
                const username = managerUsernames[managerId] ? `@${managerUsernames[managerId]}` : 'Неизвестно';
                message += `<b>👤 Менеджер:</b> ${username} (ID: ${managerId})\n`;
                message += `<b>📋 Всего заявок:</b> ${stats.total}\n`;
                message += `<b>✅ Завершено:</b> ${stats.completed} (${(stats.completed/stats.total*100).toFixed(1)}%)\n`;
                message += `<b>❌ Отклонено:</b> ${stats.rejected} (${(stats.rejected/stats.total*100).toFixed(1)}%)\n`;
                message += `<b>⏳ В обработке:</b> ${stats.processing} (${(stats.processing/stats.total*100).toFixed(1)}%)\n`;
                message += `<b>🆕 Новых:</b> ${stats.new} (${(stats.new/stats.total*100).toFixed(1)}%)\n\n`;
            }
            
            // Show info about applications without manager
            message += `<b>🔄 Заявки без менеджера:</b> ${noManagerApps}\n`;
        }
        
        await ctx.reply(message, {
            parse_mode: "HTML",
            reply_markup: ownerKeyboard
        });
    } catch (error) {
        console.error("Error generating manager statistics:", error);
        await ctx.reply("Произошла ошибка при получении статистики менеджеров.", { 
            reply_markup: ownerKeyboard
        });
    }
}

// Helper functions
function getApplicationTypeName(type) {
    const types = {
        'buy_usdt': 'Покупка USDT',
        'sell_usdt': 'Продажа USDT',
        'alipay_payment': 'Оплата ALIPAY',
        'foreign_company_payment': 'Оплата зарубежному юрлицу',
        'cash_abroad': 'Наличные зарубежом'
    };
    
    return types[type] || type;
}

function getStatusName(status) {
    const statuses = {
        'new': 'Новые',
        'processing': 'В обработке',
        'completed': 'Завершенные',
        'rejected': 'Отклоненные'
    };
    
    return statuses[status] || status;
}

function getSortColumnName(column) {
    const columns = {
        'created_at': 'По дате создания',
        'updated_at': 'По дате обновления',
        'status': 'По статусу',
        'type': 'По типу'
    };
    
    return columns[column] || column;
}
