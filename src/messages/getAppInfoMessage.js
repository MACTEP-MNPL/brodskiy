import { getStatusEmoji } from "../utils/getEmojiStatus.js";

export const getAppInfoMessage = (application) => {
    if (!application) {
        return "Информация о заявке не найдена";
    }

    const { type, created_at } = application;
    
    const date = created_at ? new Date(created_at).toLocaleString('ru-RU') : 'Не указано';
    let message = `📋 <b>Заявка #${application.id}</b>\n\n📅 Дата создания: ${date}\n`;

    switch (type) {
        case "buy_usdt":
            message += formatBuyUsdtApplication(application);
            break;
        case "sell_usdt":
            message += formatSellUsdtApplication(application);
            break;
        case "alipay_payment":
            message += formatAlipayPaymentApplication(application);
            break;
        case "foreign_company_payment":
            message += formatForeignCompanyPaymentApplication(application);
            break;
        case "cash_abroad":
            message += formatCashAbroadApplication(application);
            break;
        default:
            message += "Неизвестный тип заявки";
    }

    return message;
}

const formatBuyUsdtApplication = (application) => {
    const { currencyPair, amount, city} = application.data;
    
    let message = "🔄 Тип: Покупка USDT\n";
    message += `💰 Отдаёт: ${currencyPair || 'Не указано'}\n`;
    message += `💵 Сумма: ${amount || 'Не указано'}\n`;
    message += `🏙️ Город: ${city || 'Не указано'}\n`;
    
    if (application.username) {
        message += `👤 Клиент: @${application.username}\n`;
    }

    if(application.manager_id) {
        message += `👮‍♂️ Менеджер ID: <code>${application.manager_id}</code>\n`;
    }
    
    message += `\n<b>СТАТУС ЗАЯВКИ:</b> ${getStatusEmoji(application.status)}\n`;
    message += `${application.created_by_user ? `<i>Создана пользователем</i>` : `<i>Создана администратором</i>`}`;

    return message;
}

const formatSellUsdtApplication = (application) => {
    const { currencyPair, amount, city, username } = application.data;   

    
    let message = "🔄 Тип: Продажа USDT\n";
    message += `💰 Получает: ${currencyPair || 'Не указано'}\n`;
    message += `💵 Сумма USDT: ${amount || 'Не указано'}\n`;
    message += `🏙️ Город: ${city || 'Не указано'}\n`;
    
    if (application.username) {
        message += `👤 Клиент: @${application.username}\n`;
    }

    if(application.manager_id) {
        message += `👮‍♂️ Менеджер ID: <code>${application.manager_id}</code>\n`;
    }

    message += `\n<b>СТАТУС ЗАЯВКИ:</b> ${getStatusEmoji(application.status)}\n`;
    
    message += `${application.created_by_user ? `<i>Создана пользователем</i>` : `<i>Создана администратором</i>`}`;

    return message;
}

const formatAlipayPaymentApplication = (application) => {
    const { paymentMethod, amount, username } = application.data;
    
    let message = "🔄 Тип: Оплата на ALIPAY\n";
    message += `💳 Способ оплаты: ${paymentMethod || 'Не указано'}\n`;
    message += `💵 Сумма (юани): ${amount || 'Не указано'}\n`;
    
    if (application.username) {
        message += `👤 Клиент: @${application.username}\n`;
    }

    if(application.manager_id) {
        message += `👮‍♂️ Менеджер ID: <code>${application.manager_id}</code>\n`;
    }

    message += `\n<b>СТАТУС ЗАЯВКИ:</b> ${getStatusEmoji(application.status)}\n`;
    message += `${application.created_by_user ? `<i>Создана пользователем</i>` : `<i>Создана администратором</i>`}`;

    return message;
}

const formatForeignCompanyPaymentApplication = (application) => {
    const { sourceCurrency, amount, destinationCountry, username } = application.data;
    
    let message = "🔄 Тип: Оплата на зарубежное Юр. лицо\n";
    message += `💰 Отдаёт: ${sourceCurrency || 'Не указано'}\n`;
    message += `💵 Сумма: ${amount || 'Не указано'}\n`;
    message += `🌍 Страна получения: ${destinationCountry || 'Не указано'}\n`;
    
    if (application.username) {
        message += `👤 Клиент: @${application.username}\n`;
    }

    if(application.manager_id) {
        message += `👮‍♂️ Менеджер ID: <code>${application.manager_id}</code>\n`;
    }

    message += `\n<b>СТАТУС ЗАЯВКИ:</b> ${getStatusEmoji(application.status)}\n`;
    message += `${application.created_by_user ? `<i>Создана пользователем</i>` : `<i>Создана администратором</i>`}`;
    
    return message;
}

const formatCashAbroadApplication = (application) => {
    const { country, city, paymentMethod, userCity, amount, username } = application.data;
    
    let message = "🔄 Тип: Наличные зарубежом\n";
    message += `🌍 Страна: ${country || 'Не указано'}\n`;
    message += `🏙️ Город: ${city || 'Не указано'}\n`;
    message += `💳 Способ оплаты: ${paymentMethod || 'Не указано'}\n`;
    message += `💵 Сумма: ${amount || 'Не указано'}\n`;
    
    if (userCity) {
        message += `🏙️ Город клиента: ${userCity}\n`;
    }
    
    if (application.username) {
        message += `👤 Клиент: @${application.username}\n`;
    }

    if(application.manager_id) {
        message += `👮‍♂️ Менеджер ID: <code>${application.manager_id}</code>\n`;
    }

    message += `\n<b>СТАТУС ЗАЯВКИ:</b> ${getStatusEmoji(application.status)}\n`;
    message += `${application.created_by_user ? `<i>Создана пользователем</i>` : `<i>Создана администратором</i>`}`;
    
    return message;
}
