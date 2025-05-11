import { getAppInfoMessage } from "../messages/getAppInfoMessage.js";
import { takeApplication, completeApplication, rejectApplication } from "../db/applications.js";
import { Composer } from "grammy";

export const sendApplicatoinComposer = new Composer()

export const sendApplication = async (ctx, application) => {
    const message = getAppInfoMessage(application);

    let replyMarkup = undefined;
    if (application.status === 'new') {
        replyMarkup = {
            inline_keyboard: [
                [
                    { text: "Взять в работу", callback_data: `take_application:${application.id}` }
                ]
            ]
        };
    }

    if (application.status === 'processing') {
        replyMarkup = {
            inline_keyboard: [
                [
                    { text: "Завершить заявку", callback_data: `complete_application:${application.id}` }
                ],
                [
                    { text: "Отклонить заявку", callback_data: `reject_application:${application.id}` }
                ]
            ]
        };
    }

    await ctx.reply(message, { parse_mode: "HTML", reply_markup: replyMarkup });
}

sendApplicatoinComposer.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (data.startsWith('take_application:')) {
        const applicationId = data.split(':')[1];
        const managerId = ctx.from.id;
        await takeApplication(applicationId, managerId);
        await ctx.reply(`✅ Вы взяли заявку #${applicationId} в работу.`)
    }

    if (data.startsWith('complete_application:')) {
        const applicationId = data.split(':')[1];
        await completeApplication(applicationId);
        await ctx.reply(`✅ Заявка #${applicationId} выполнена.`)
    }

    if (data.startsWith('reject_application:')) {
        const applicationId = data.split(':')[1];
        await rejectApplication(applicationId);
        await ctx.reply(`❌ Заявка #${applicationId} отклонена.`)
    }
});
