import dotenv from 'dotenv'
import {Bot, session} from "grammy"
import {GrammyError, HttpError} from "grammy"
import {pool} from "./db/db.js"
import {conversations} from "@grammyjs/conversations"
import { hears } from './hears/hears.js'
import { commands } from './commands/commands.js'
import { convers } from './conversations/convers.js'
import { createApi } from './api/createApi.js'
import { getUserApplications, getApplicationsByUsername } from './db/applications.js'
import { getAppInfoMessage } from './messages/getAppInfoMessage.js'
import { sendApplicatoinComposer } from './utils/sendApplication.js'
dotenv.config()

export const {TG_BOT_TOKEN, API_URL} = process.env

export const {TG_MANAGER_USERNAME} = process.env

export const db = await pool.getConnection()

export const api = new createApi()

try {
  await api.update()
} catch (error) {
  console.error('Error updating api:', error)
}

export const bot = new Bot(TG_BOT_TOKEN)

bot.use(session({
    initial() {
      return {
        appFilter: null,
        appType: null,
        appOffset: 0,
        appSortBy: 'created_at',
        appSortOrder: 'DESC'
      };
    },
}));

bot.use(conversations());

const regularCommands = [
    { command: "start", description: "Запустить бота" }
];

bot.use(async (ctx, next) => {
   try {
      await ctx.api.setMyCommands(regularCommands, {
        scope: { type: "chat", chat_id: ctx.chat.id }
      })

       if (!ctx.from) return next()

       const [existingUsers] = await db.execute(
           'SELECT * FROM users WHERE id = ?',
           [ctx.from.id]
       )

       if (existingUsers && existingUsers.length > 0) {
         if(existingUsers[0].username !== ctx.from.username) {
            
           let username = ctx.from.username

           if(!username) {
             username = 'Нет юзернейма'
           }

           await db.execute(
               'UPDATE users SET username = ? WHERE id = ?',
               [username, ctx.from.id]
           )
          }

          if (existingUsers[0].is_banned) {
                return
          }

          ctx.user = existingUsers[0]
        } else {
            await db.execute(
                'INSERT INTO users (id, username, is_banned, lvl, is_client) VALUES (?, ?, FALSE, 0, FALSE)',
                [ctx.from.id, ctx.from.username || null]
            )

            ctx.user = {
              id: ctx.from.id,
              username: ctx.from.username || null,
              is_banned: false,
              lvl: 0,
              is_client: false,
          }
        }

        return next()
    } catch (error) {
        console.error('Error in middleware:', error)
        return next()
}
})

bot.use(convers)

bot.use(hears)
bot.use(commands)

bot.use(sendApplicatoinComposer)

bot.use(async (ctx, next) => {
  try {
      let targetUserId = null;
      let targetUsername = null;

      if (ctx.message.forward_origin?.type === 'user') {
          targetUserId = ctx.message.forward_origin.sender_user.id;
          targetUsername = ctx.message.forward_origin.sender_user.username;
      } else {
          // Check if message contains a username or ID
          const messageText = ctx.message.text.trim();
          
          // Check for username format (@username)
          if (messageText.startsWith('@')) {
              targetUsername = messageText.substring(1);
          } 
          // Check if message is a numeric ID
          else if (/^\d+$/.test(messageText)) {
              targetUserId = parseInt(messageText);
          }
      }

      if (!targetUserId && !targetUsername) {
          return; // No valid identifier found
      }

      let applications = [];
      
      // Get applications based on what we have (ID or username)
      if (targetUserId) {
          applications = await getUserApplications(targetUserId);
      } else if (targetUsername) {
          applications = await getApplicationsByUsername(targetUsername);
      }

      // Send information about each application
      for (const application of applications) {
          await ctx.reply(getAppInfoMessage(application), { parse_mode: "HTML" });
      }

      await next()
  } catch (error) {
    console.error("Error in finalHears:", error);
    await next()
  }
})

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
})

bot.start({
    allowed_updates: [
        "message",
        "chat_member",
        "edited_message",
        "channel_post",
        "edited_channel_post",
        "business_connection",
        "business_message",
        "edited_business_message",
        "deleted_business_messages",
        "inline_query",
        "chosen_inline_result",
        "callback_query",
        "shipping_query",
        "pre_checkout_query",
        "poll",
        "poll_answer",
        "my_chat_member",
        "chat_join_request",
        "chat_boost",
        "removed_chat_boost"
    ]
})

const handleDisconnect = async () => {
  try {
    await pool.getConnection();
    console.log('Reconnected to database');
  } catch (error) {
    console.error('Error reconnecting to database:', error);
    setTimeout(handleDisconnect, 2000); // Try to reconnect every 2 seconds
  }
};

pool.on('error', async (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    handleDisconnect();
  } else {
    throw err;
  }
});




