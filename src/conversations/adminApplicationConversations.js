import { getApplicationById, takeApplication, completeApplication, rejectApplication } from "../db/applications.js"
import { getAppInfoMessage } from "../messages/getAppInfoMessage.js"
import { sendApplication } from "../utils/sendApplication.js"

export const takeApplicationConversation = async (conversation, ctx) => {
    await ctx.reply("Введите ID заявки, которую хотите взять в работу:");
    const { message: idMessage } = await conversation.waitFor("message:text");
    const applicationId = idMessage.text.trim();
    
    const application = await conversation.external(async () => {
        return await getApplicationById(applicationId)
    });
    
    if (!application) {
        await ctx.reply(`Заявка с ID ${applicationId} не найдена.`);
        return;
    }

    if(application.status !== "new") {
        await ctx.reply(`Заявка #${applicationId} уже прошла процесс обработки.`);
        return;
    }
    
    await conversation.external(async () => {
        return await takeApplication(applicationId, ctx.from.id)
    });

    const updatedApplication = await conversation.external(async () => {
        return await getApplicationById(applicationId)
    });

    await sendApplication(ctx, updatedApplication)
    
    await ctx.reply(`✅ Вы взяли заявку #${applicationId} в работу.`);
};


export const findApplicationConversation = async (conversation, ctx) => {

    await ctx.reply("Введите ID заявки, которую хотите найти:");
    const { message: idMessage } = await conversation.waitFor("message:text");
    const applicationId = idMessage.text.trim();
    
    const application = await conversation.external(async () => {
        return await getApplicationById(applicationId)
    });
    
    if (!application) {
        return await ctx.reply(`Заявка с ID ${applicationId} не найдена.`);
        
    }
    
    await sendApplication(ctx, application)
};

export const completeApplicationConversation = async (conversation, ctx) => {
    await ctx.reply("Введите ID заявки, которую хотите выполнить:");
    const { message: idMessage } = await conversation.waitFor("message:text");
    const applicationId = idMessage.text.trim();
    
    const application = await conversation.external(async () => {
        return await getApplicationById(applicationId)
    });
    
    if (!application) {
        await ctx.reply(`Заявка с ID ${applicationId} не найдена.`);
        return;
    }

    if(application.status !== "processing") {
        await ctx.reply(`Заявка #${applicationId} еще не прошла процесс обработки или уже завершена.`);
        return;
    }
    
    await conversation.external(async () => {
        return await completeApplication(applicationId)
    });

    const updatedApplication = await conversation.external(async () => {
        return await getApplicationById(applicationId)
    });

    await sendApplication(ctx, updatedApplication)
    
    await ctx.reply(`✅ Заявка #${applicationId} выполнена.`);
};

export const rejectApplicationConversation = async (conversation, ctx) => {
    await ctx.reply("Введите ID заявки, которую хотите отклонить:");
    const { message: idMessage } = await conversation.waitFor("message:text");
    const applicationId = idMessage.text.trim();
    
    const application = await conversation.external(async () => {
        return await getApplicationById(applicationId)
    });
    
    if (!application) {
        await ctx.reply(`Заявка с ID ${applicationId} не найдена.`);
        return;
    }

    if(application.status !== "processing") {
        return await ctx.reply(`Заявка #${applicationId} еще не прошла процесс обработки или уже завершена.`);
    }
    
    await conversation.external(async () => {
        return await rejectApplication(applicationId)
    });
    
    const updatedApplication = await conversation.external(async () => {
        return await getApplicationById(applicationId)
    });

    await sendApplication(ctx, updatedApplication)
    
    await ctx.reply(`✅ Заявка #${applicationId} отклонена.`);
};