import { db } from "../bot.js"

export const get2LvlUser = async () => {
    const [[user]] = await db.execute("SELECT * FROM users WHERE lvl = 2")
    return user
}

export const getAllAdmins = async () => {
    const [users] = await db.execute("SELECT * FROM users WHERE lvl >= 1")
    return users
}

export const getUserByUsername = async (username) => {
    const [[user]] = await db.execute("SELECT * FROM users WHERE username = ?", [username])
    return user
}

export const makeUserManager = async (userId) => {
    await db.execute("UPDATE users SET lvl = 1 WHERE id = ?", [userId])
}

export const blockUser = async (userIdentifier) => {
    // Check if the userIdentifier is a number (Telegram ID) or string (username)
    if (typeof userIdentifier === 'number' || !isNaN(userIdentifier)) {
        // Block by user ID
        await db.execute("UPDATE users SET is_banned = 1 WHERE id = ?", [userIdentifier])
    } else {
        // Block by username
        await db.execute("UPDATE users SET is_banned = 1 WHERE username = ?", [userIdentifier])
    }
}

export const isUserBanned = async (userIdentifier) => {
    let user;
    
    if (typeof userIdentifier === 'number' || !isNaN(userIdentifier)) {
        // Check by user ID
        const [[result]] = await db.execute("SELECT is_banned FROM users WHERE id = ?", [userIdentifier]);
        user = result;
    } else {
        // Check by username
        const [[result]] = await db.execute("SELECT is_banned FROM users WHERE username = ?", [userIdentifier]);
        user = result;
    }
    
    return user ? user.is_banned === 1 : false;
}

export const unblockUser = async (userIdentifier) => {
    // Check if the userIdentifier is a number (Telegram ID) or string (username)
    if (typeof userIdentifier === 'number' || !isNaN(userIdentifier)) {
        // Unblock by user ID
        await db.execute("UPDATE users SET is_banned = 0 WHERE id = ?", [userIdentifier])
    } else {
        // Unblock by username
        await db.execute("UPDATE users SET is_banned = 0 WHERE username = ?", [userIdentifier])
    }
}





