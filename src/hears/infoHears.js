import { Composer } from "grammy"
import { TG_MANAGER_USERNAME } from "../bot.js"
import { getAllAdmins } from "../db/users.js"
import { mainKeyboard } from "../keyboards/mainKeyboard.js"
export const infoHears = new Composer()

infoHears.hears('🤝 О нас', async (ctx) => {

    const admins = await getAllAdmins()
    
    await ctx.reply(`Мы многопрофильный обменник и финансовый агрегат для бизнеса и физических лиц

Уже более 5 лет проводим сделки любой сложности

Проводим сделки в офисе в Москве Сити, также работаем с помощью курьеров в Москве и других городах России

• Москва
• Новосибирск
• Санкт - Петербург
• Владивосток
• Краснодар
• Томск

И многие другие, полный список на сайте - <a href="https://brodskiyexchange.com">brodskiyexchange.com</a>

Гарантируем лучший курс, самую высокую скорость проведения операций, а также 100% надежность и конфиденциальность для наших клиентов

Для совершения обмена - составьте заявку в нашем боте @brodskiy_exchange_bot

Доверяйте профессионалам и будьте уверенны в безопасности ваших сделок 🤝\n\n` + `<b>Наши менеджеры:</b>\n${admins.map(admin => `@${admin.username}`).join('\n')}`, {parse_mode: 'HTML'})
})

infoHears.hears('💬 Контакты', async (ctx) => {
    await ctx.reply(`Аккаунт менеджера - ${TG_MANAGER_USERNAME}`)
})

infoHears.hears('📅 График работы', async (ctx) => {
    await ctx.reply(`9:00 - 23:00 по Московскому времени`)
})

infoHears.hears('👥 Телеграмм канал', async (ctx) => {
    await ctx.reply(`Наш канал - @brodskiy_exchange_bot`)
})

infoHears.hears('Назад', async (ctx) => {
    await ctx.reply('📈', mainKeyboard)
})

