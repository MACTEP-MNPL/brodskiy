import { Composer } from "grammy"
import { Menu, MenuRange } from "@grammyjs/menu"
import { getAllDirections, updateBuyMargin, updateSellMargin } from "../db/directions.js"
import {createConversation } from "@grammyjs/conversations"

export const changeDataMargin = new Composer()

// Create menu for selecting a direction
const directionsMenu = new Menu("select-direction")

directionsMenu
  .dynamic(async (ctx) => {
    const range = new MenuRange();
    
    // Get all directions from the database
    const directions = await getAllDirections()
    
    // Add each direction as a button
    for (const direction of directions) {
      range
        .text(
          `${direction.name} | ${direction.buy_margin} | ${direction.sell_margin}`,
          async (ctx) => {
            // Store the selected direction ID in the session
            ctx.session.selectedDirectionId = direction.id
            ctx.session.selectedDirection = direction.name
            
            // Show the margin type menu
            await ctx.reply(
              `Выбрано направление: ${direction.name}\nТекущие значения:\n- Курс покупки: ${direction.buy_margin}\n- Курс продажи: ${direction.sell_margin}\n\nВыберите тип курса для изменения:`,
              { reply_markup: marginTypeMenu }
            )
          }
        )
        .row()
    }
    
    // Add a cancel button
    range.text("Отмена", (ctx) => {
      ctx.deleteMessage()
      return ctx.reply("Действие отменено")
    })
    
    return range
  })

// Create menu for selecting margin type (buy or sell)
const marginTypeMenu = new Menu("select-margin-type")
  .text("Курс покупки", async (ctx) => {
    ctx.session.marginType = "buy"
    await ctx.conversation.enter("changeMarginConversation")
  })
  .text("Курс продажи", async (ctx) => {
    ctx.session.marginType = "sell"
    await ctx.conversation.enter("changeMarginConversation")
  })
  .row()
  .text("Назад", async (ctx) => {
    await ctx.deleteMessage()
    await ctx.reply("Выберите направление курс которого хотите изменить", {
      reply_markup: directionsMenu
    })
  })
  .text("Отмена", (ctx) => {
    ctx.deleteMessage()
    return ctx.reply("Действие отменено")
  })

changeDataMargin.use(createConversation(async (conversation, ctx) => {
  // Ask for the new margin value
  const session = await conversation.external((ctx) => ctx.session)

  await ctx.reply(`Введите новое значение для ${session.marginType === "buy" ? "курса покупки" : "курса продажи"} направления ${session.selectedDirection}:`)
  
  // Wait for user's response
  const { message } = await conversation.wait()
  
  // Parse the new margin value
  const newMargin = parseFloat(message.text)
  
  // Validate the input
  if (isNaN(newMargin)) {
    await ctx.reply("Ошибка: введите корректное числовое значение.")
    return
  }
  
  try {
    // Update the margin in the database based on type
    if (session.marginType === "buy") {
      await updateBuyMargin(session.selectedDirectionId, newMargin)
    } else {
      await updateSellMargin(session.selectedDirectionId, newMargin)
    }
    
    // Confirm the update
    await ctx.reply(`Значение ${session.marginType === "buy" ? "курса покупки" : "курса продажи"} для направления ${session.selectedDirection} успешно обновлено на ${newMargin}`)
  } catch (error) {
    console.error("Error updating margin:", error)
    await ctx.reply("Произошла ошибка при обновлении значения.")
  }
}, "changeMarginConversation"))

// Handler for the menu trigger

changeDataMargin.use(marginTypeMenu)
changeDataMargin.use(directionsMenu)


changeDataMargin.hears('🔄 Изменить курс обмена', async (ctx) => {
  if (ctx.user.lvl < 2) {
    return ctx.reply("У вас нет доступа к этой функции.")
  }
  
  await ctx.reply("Выберите направление курс которого хотите изменить", {
    reply_markup: directionsMenu
  })
})
