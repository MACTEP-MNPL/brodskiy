import { getAllAdmins } from "../db/users.js";
import { bot } from "../bot.js";
import { getAppInfoMessage } from "../messages/getAppInfoMessage.js";

/**
 * Send a notification message to all admins
 * @param {string} message - Message to send
 * @param {Object} options - Additional Telegram message options
 * @returns {Promise<void>}
 */
export const notifyAllAdmins = async (message, options = {}) => {
    try {
        const admins = await getAllAdmins();
        
        if (!admins || admins.length === 0) {
            console.log("No admins found to notify");
            return;
        }
        
        // Add parse_mode by default if not specified
        if (!options.parse_mode) {
            options.parse_mode = "HTML";
        }
        
        // Send message to each admin
        const sendPromises = admins.map(admin => {
            try {
                return bot.api.sendMessage(admin.id, message, options);
            } catch (error) {
                console.error(`Failed to send notification to admin ${admin.username} (${admin.id}):`, error);
                return null;
            }
        });
        
        await Promise.allSettled(sendPromises);
        
    } catch (error) {
        console.error("Error sending admin notifications:", error);
    }
};

/**
 * Format an application to a readable notification message
 * @param {Object} application - Application data
 * @param {Object} userData - User data
 * @returns {string} Formatted message
 */
export const formatApplicationNotification = (application, userData = {}) => {
    // Format the application using getAppInfoMessage
    const appInfo = getAppInfoMessage(application);
    
    let message = `🔔 <b>Новая заявка!</b>\n`;
    message += appInfo;
    
    return message;
};

/**
 * Get application type name
 * @param {string} type - Application type
 * @returns {string} Human-readable type name
 */
function getApplicationTypeName(type) {
    const types = {
        'buy_usdt': 'Покупка USDT',
        'sell_usdt': 'Продажа USDT',
        'alipay_payment': 'Оплата ALIPAY',
        'foreign_company_payment': 'Оплата зарубежному юрлицу'
    };
    
    return types[type] || type;
} 