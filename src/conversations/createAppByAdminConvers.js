import { adminKeyboard } from "../keyboards/adminKeyboard.js";
import { TG_MANAGER_USERNAME } from "../bot.js";
import { 
    saveBuyUsdtApplication, 
    saveSellUsdtApplication, 
    saveAlipayPaymentApplication, 
    saveForeignCompanyPaymentApplication,
    saveCashAbroadApplication
} from "../db/applications.js";

export const createAppByAdminConvers = async (conversation, ctx) => {
    // First, ask for the username
    await ctx.reply("Введите username пользователя (без @):");
    const usernameMsg = await conversation.wait();
    const username = usernameMsg.message.text;

    await ctx.reply("Выберите направление:", {
        reply_markup: {
            keyboard: [
                [{ text: "Купить USDT" }],
                [{ text: "Продать USDT" }],
                [{ text: "Сделать оплату на ALIPAY" }],
                [{ text: "Оплата на зарубежное Юр. лицо"}],
                [{ text: "Наличные зарубежом" }],
                [{ text: "Назад" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });

    // Get direction
    const directionMsg = await conversation.wait();
    const direction = directionMsg.message.text;

    if (direction === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }

    // Handle each direction
    if (direction === "Купить USDT") {
        return await handleBuyUsdt(conversation, ctx, username);
    } else if (direction === "Продать USDT") {
        return await handleSellUsdt(conversation, ctx, username);
    } else if (direction === "Сделать оплату на ALIPAY") {
        return await handleAlipayPayment(conversation, ctx, username);
    } else if (direction === "Оплата на зарубежное Юр. лицо") {
        return await handleForeignCompanyPayment(conversation, ctx, username);
    } else if (direction === "Наличные зарубежом") {
        return await handleCashAbroad(conversation, ctx, username);
    } else {
        await ctx.reply("Выбрано неверное направление. Пожалуйста, попробуйте снова.", {reply_markup: mainKeyboard});
        return;
    }
};

// Handle Buy USDT
async function handleBuyUsdt(conversation, ctx, username) {
    // Step 1: Choose currency pair
    await ctx.reply("Вы отдаёте:", {
        reply_markup: {
            keyboard: [
                [{ text: "₽ (Рубль)" }],
                [{ text: "$ (Доллар)" }],
                [{ text: "€ (Евро)" }],
                [{ text: "Обратиться к менеджеру" }],
                [{ text: "Назад" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    const currencyPairMsg = await conversation.wait();
    const currencyPair = currencyPairMsg.message.text;
    
    if (currencyPair === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    if (currencyPair === "Обратиться к менеджеру") {
        await ctx.reply(`Пожалуйста, свяжитесь с нашим менеджером: ${TG_MANAGER_USERNAME}`, {reply_markup: mainKeyboard});
        return;
    }
    
    // Step 2: Enter fiat amount
    await ctx.reply("Введите сумму в Фиатной валюте:");
    const amountMsg = await conversation.wait();
    const amount = amountMsg.message.text;
    
    if (amount === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    // Step 3: Choose city
    await ctx.reply("Выберите город:", {
        reply_markup: {
            keyboard: [
                [{ text: "Москва" }],
                [{ text: "Санкт - Петербург" }],
                [{ text: "Новосибирск" }],
                [{ text: "Владивосток" }],
                [{ text: "Краснодар" }],
                [{ text: "Сочи" }],
                [{ text: "Барнаул" }],
                [{ text: "Другой город" }],
                [{ text: "Назад" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    const cityMsg = await conversation.wait();
    const city = cityMsg.message.text;
    
    if (city === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    let otherCity = null;
    if (city === "Другой город") {
        await ctx.reply("Введите ваш город:");
        const otherCityMsg = await conversation.wait();
        otherCity = otherCityMsg.message.text;
        if (otherCity === "Назад") {
            await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
            return;
        }
    }
    
    // Process application
    const selectedCity = otherCity || city;
    
    // Create application object
    const application = {
        type: "buy_usdt",
        currencyPair,
        amount,
        city: selectedCity,
        username,
        timestamp: new Date(),
    };
    
    // Save application to database
    try {
        const applicationId = await saveBuyUsdtApplication(application, username, true);
        
        await ctx.reply('📊', {reply_markup: adminKeyboard})
        
        return { ...application, id: applicationId };
    } catch (error) {
        console.error("Error saving buy USDT application:", error);
        await ctx.reply("Произошла ошибка при создании заявки. Пожалуйста, попробуйте позже или обратитесь к менеджеру.", {reply_markup: mainKeyboard});
        return application;
    }
}

// Handle Sell USDT
async function handleSellUsdt(conversation, ctx, username) {
    // Step 1: Choose currency pair
    await ctx.reply("Вы получаете:", {
        reply_markup: {
            keyboard: [
                [{ text: "₽ (Рубль)" }],
                [{ text: "$ (Доллар)" }],
                [{ text: "€ (Евро)" }],
                [{ text: "Обратиться к менеджеру" }],
                [{ text: "Назад" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    const currencyPairMsg = await conversation.wait();
    const currencyPair = currencyPairMsg.message.text;
    
    if (currencyPair === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    if (currencyPair === "Обратиться к менеджеру") {
        await ctx.reply(`Пожалуйста, свяжитесь с нашим менеджером: ${TG_MANAGER_USERNAME}`, {reply_markup: mainKeyboard});
        return;
    }
    
    // Step 2: Enter USDT amount
    await ctx.reply("Введите сумму в USDT:");
    const amountMsg = await conversation.wait();
    const amount = amountMsg.message.text;
    
    if (amount === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    // Step 3: Choose city
    await ctx.reply("Выберите город:", {
        reply_markup: {
            keyboard: [
                [{ text: "Москва" }],
                [{ text: "Санкт - Петербург" }],
                [{ text: "Новосибирск" }],
                [{ text: "Владивосток" }],
                [{ text: "Краснодар" }],
                [{ text: "Сочи" }],
                [{ text: "Барнаул" }],
                [{ text: "Другой город" }],
                [{ text: "Назад" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    const cityMsg = await conversation.wait();
    const city = cityMsg.message.text;
    
    if (city === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    let otherCity = null;
    if (city === "Другой город") {
        await ctx.reply("Введите ваш город:");
        const otherCityMsg = await conversation.wait();
        otherCity = otherCityMsg.message.text;
        if (otherCity === "Назад") {
            await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
            return;
        }
    }
    
    // Process application
    const selectedCity = otherCity || city;
    
    // Create application object
    const application = {
        type: "sell_usdt",
        currencyPair,
        amount,
        city: selectedCity,
        username,
        timestamp: new Date()
    };
    
    // Save application to database
    try {
        const applicationId = await saveSellUsdtApplication(application, username, true);

        await ctx.reply('📊', {reply_markup: adminKeyboard})
        
        return { ...application, id: applicationId };
    } catch (error) {
        console.error("Error saving sell USDT application:", error);
        await ctx.reply("Произошла ошибка при создании заявки. Пожалуйста, попробуйте позже или обратитесь к менеджеру.", {reply_markup: mainKeyboard});
        return application;
    }
}

// Handle Alipay Payment
async function handleAlipayPayment(conversation, ctx, username) {
    // Step 1: Choose payment method
    await ctx.reply("Выберите способ оплаты:", {
        reply_markup: {
            keyboard: [
                [{ text: "USDT" }],
                [{ text: "Другая криптовалюта" }],
                [{ text: "Наличные Москва" }],
                [{ text: "Наличные другой город" }],
                [{ text: "Банковский перевод" }],
                [{ text: "Назад" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    const paymentMethodMsg = await conversation.wait();
    const paymentMethod = paymentMethodMsg.message.text;
    
    if (paymentMethod === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    // Step 2: Enter amount in yuan
    await ctx.reply("Введите сумму в юанях:");
    const amountMsg = await conversation.wait();
    const amount = amountMsg.message.text;
    
    if (amount === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    // Create application object
    const application = {
        type: "alipay_payment",
        paymentMethod,
        amount,
        username,
        timestamp: new Date()
    };
    
    // Save application to database
    try {
        const applicationId = await saveAlipayPaymentApplication(application, username, true);

        await ctx.reply('📊', {reply_markup: adminKeyboard})
        
        return { ...application, id: applicationId };
    } catch (error) {
        console.error("Error saving Alipay payment application:", error);
        await ctx.reply("Произошла ошибка при создании заявки. Пожалуйста, попробуйте позже или обратитесь к менеджеру.", {reply_markup: mainKeyboard});
        return application;
    }
}

// Handle Foreign Company Payment
async function handleForeignCompanyPayment(conversation, ctx, username) {
    // Step 1: Choose currency to give
    await ctx.reply("Вы отдаёте:", {
        reply_markup: {
            keyboard: [
                [{ text: "₽ (Рубль)" }],
                [{ text: "$ (Доллар)" }],
                [{ text: "€ (Евро)" }],
                [{ text: "Обратиться к менеджеру" }],
                [{ text: "Назад" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    const sourceCurrencyMsg = await conversation.wait();
    const sourceCurrency = sourceCurrencyMsg.message.text;
    
    if (sourceCurrency === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    if (sourceCurrency === "Обратиться к менеджеру") {
        await ctx.reply(`Пожалуйста, свяжитесь с нашим менеджером: ${TG_MANAGER_USERNAME}`, {reply_markup: mainKeyboard});
        return;
    }
    
    // Step 2: Enter amount
    await ctx.reply("Введите сумму:");
    const amountMsg = await conversation.wait();
    const amount = amountMsg.message.text;
    
    if (amount === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    // Step 3: Choose destination country
    await ctx.reply("Выберите страну получения:", {
        reply_markup: {
            keyboard: [
                [{ text: "Китай" }],
                [{ text: "Дубай" }],
                [{ text: "Гонконг" }],
                [{ text: "Другое" }],
                [{ text: "Назад" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    const countryMsg = await conversation.wait();
    const country = countryMsg.message.text;
    
    if (country === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    let otherCountry = null;
    if (country === "Другое") {
        await ctx.reply("Введите страну получения:");
        const otherCountryMsg = await conversation.wait();
        otherCountry = otherCountryMsg.message.text;
        if (otherCountry === "Назад") {
            await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
            return;
        }
    }
    
    const destinationCountry = otherCountry || country;
    
    // Create application object
    const application = {
        type: "foreign_company_payment",
        sourceCurrency,
        amount,
        destinationCountry,
        username,
        timestamp: new Date()
    };
    
    // Save application to database
    try {
        const applicationId = await saveForeignCompanyPaymentApplication(application, username, true);

        await ctx.reply('📊', {reply_markup: adminKeyboard})
        
        return { ...application, id: applicationId };
    } catch (error) {
        console.error("Error saving foreign company payment application:", error);
        await ctx.reply("Произошла ошибка при создании заявки. Пожалуйста, попробуйте позже или обратитесь к менеджеру.", {reply_markup: mainKeyboard});
        return application;
    }
}

// Handle Cash Abroad
async function handleCashAbroad(conversation, ctx, username) {
    // Step 1: Choose country and city
    await ctx.reply("Выберите страну:", {
        reply_markup: {
            keyboard: [
                [{ text: "Турция" }],
                [{ text: "ОАЭ" }],
                [{ text: "Тайланд" }],
                [{ text: "Индонезия" }],
                [{ text: "Япония" }],
                [{ text: "Казахстан" }],
                [{ text: "Армения" }],
                [{ text: "Другая страна" }],
                [{ text: "Назад" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    const countryMsg = await conversation.wait();
    const country = countryMsg.message.text;
    
    if (country === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }

    // Define city options based on selected country
    let cityOptions = [];
    let selectedCountry = country;
    
    if (country === "Турция") {
        cityOptions = [
            [{ text: "Стамбул" }],
            [{ text: "Анталия" }],
            [{ text: "Алания" }],
            [{ text: "Другой город" }]
        ];
    } else if (country === "ОАЭ") {
        cityOptions = [
            [{ text: "Дубай" }],
            [{ text: "Абу-Даби" }],
            [{ text: "Другой город" }]
        ];
    } else if (country === "Тайланд") {
        cityOptions = [
            [{ text: "Бангкок" }],
            [{ text: "Пхукет" }],
            [{ text: "Паттайя" }],
            [{ text: "Другой город" }]
        ];
    } else if (country === "Индонезия") {
        cityOptions = [
            [{ text: "Бали" }],
            [{ text: "Другой город" }]
        ];
    } else if (country === "Япония") {
        cityOptions = [
            [{ text: "Токио" }],
            [{ text: "Другой город" }]
        ];
    } else if (country === "Казахстан") {
        cityOptions = [
            [{ text: "Астана" }],
            [{ text: "Алматы" }],
            [{ text: "Другой город" }]
        ];
    } else if (country === "Армения") {
        cityOptions = [
            [{ text: "Ереван" }],
            [{ text: "Другой город" }]
        ];
    } else if (country === "Другая страна") {
        await ctx.reply("Введите название страны (более 100 доступных направлений):");
        const otherCountryMsg = await conversation.wait();
        selectedCountry = otherCountryMsg.message.text;
        
        if (selectedCountry === "Назад") {
            await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
            return;
        }
        
        cityOptions = [
            [{ text: "Введите город" }]
        ];
    }
    
    // Add the "Back" button to city options
    cityOptions.push([{ text: "Назад" }]);
    
    // Let user select city
    await ctx.reply("Выберите город:", {
        reply_markup: {
            keyboard: cityOptions,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    const cityMsg = await conversation.wait();
    const city = cityMsg.message.text;
    
    if (city === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    // Handle "Other city" selection
    let selectedCity = city;
    if (city === "Другой город" || city === "Введите город") {
        await ctx.reply("Введите название города:");
        const otherCityMsg = await conversation.wait();
        selectedCity = otherCityMsg.message.text;
        
        if (selectedCity === "Назад") {
            await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
            return;
        }
    }
    
    // Step 2: Choose payment method
    await ctx.reply("Выберите способ оплаты:", {
        reply_markup: {
            keyboard: [
                [{ text: "Рубль" }],
                [{ text: "Наличные в вашем городе" }],
                [{ text: "USDT" }],
                [{ text: "Назад" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    const paymentMethodMsg = await conversation.wait();
    const paymentMethod = paymentMethodMsg.message.text;
    
    if (paymentMethod === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    // If user selected "Наличные в вашем городе", ask for city name
    let userCity = null;
    if (paymentMethod === "Наличные в вашем городе") {
        await ctx.reply("Введите название города клиента:");
        const userCityMsg = await conversation.wait();
        userCity = userCityMsg.message.text;
        
        if (userCity === "Назад") {
            await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
            return;
        }
    }
    
    // Step 3: Enter amount
    await ctx.reply("Введите сумму в выбранной валюте:");
    const amountMsg = await conversation.wait();
    const amount = amountMsg.message.text;
    
    if (amount === "Назад") {
        await ctx.reply("Создание заявки отменено.", {reply_markup: adminKeyboard});
        return;
    }
    
    // Create application object
    const application = {
        type: "cash_abroad",
        country: selectedCountry,
        city: selectedCity,
        paymentMethod,
        userCity,
        amount,
        username,
        timestamp: new Date()
    };
    
    // Save application to database
    try {
        const applicationId = await saveCashAbroadApplication(application, username, true);

        await ctx.reply('📊', {reply_markup: adminKeyboard})
        
        return { ...application, id: applicationId };
    } catch (error) {
        console.error("Error saving cash abroad application:", error);
        await ctx.reply("Произошла ошибка при создании заявки. Пожалуйста, попробуйте позже или обратитесь к менеджеру.", {reply_markup: mainKeyboard});
        return application;
    }
}


