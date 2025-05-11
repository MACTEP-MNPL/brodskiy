import { db } from "../bot.js";
import { notifyAllAdmins, formatApplicationNotification } from "../utils/notifyAdmins.js";


export const createApplication = async (application, userId, isAdmin = false) => {
    try {
        let user = null

        if(typeof userId === 'string') {
            user = (await db.execute(
                'SELECT * FROM users WHERE username = ?',
                [userId]
            ))[0][0]
        } else {
            user = (await db.execute(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            ))[0][0]
        }

        if(user === undefined) {
            user = {}
            user.id = null
            user.username = userId
        }

        const [result] = await db.execute(
            'INSERT INTO applications (user_id, type, status, data, created_at, username, created_by_user) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user.id, application.type, 'new', JSON.stringify(application), new Date(), user.username, !isAdmin]
        );
        
        const applicationId = result.insertId;
        
        // Create notification for admins
        try {
            const newApplication = {
                id: applicationId,
                user_id: userId,
                type: application.type,
                data: application,
                status: 'new',
                created_at: new Date(),
                created_by_user: !isAdmin
            };
            
            // Format and send notification to all admins
            const notificationMessage = formatApplicationNotification(newApplication, user);
            await notifyAllAdmins(notificationMessage);
        } catch (notifyError) {
            console.error('Error sending admin notifications:', notifyError);
            // Don't throw this error as it shouldn't stop the application creation
        }
        
        return applicationId;
    } catch (error) {
        console.error('Error creating application:', error);
        throw error;
    }
};


/**
 * Save a Buy USDT application
 * @param {Object} application - Application data from conversation
 * @param {number} userId - Telegram user ID
 * @returns {Promise<number>} - Application ID
 */
export const saveBuyUsdtApplication = async (application, userId, isAdmin = false) => {
    application.type = "buy_usdt";
    return await createApplication(application, userId, isAdmin);
};

/**
 * Save a Sell USDT application
 * @param {Object} application - Application data from conversation
 * @param {number} userId - Telegram user ID
 * @returns {Promise<number>} - Application ID
 */
export const saveSellUsdtApplication = async (application, userId, isAdmin = false) => {
    // Ensure the application has the correct type
    application.type = "sell_usdt";
    return await createApplication(application, userId, isAdmin);
};

/**
 * Save an Alipay payment application
 * @param {Object} application - Application data from conversation
 * @param {number} userId - Telegram user ID
 * @returns {Promise<number>} - Application ID
 */
export const saveAlipayPaymentApplication = async (application, userId, isAdmin = false) => {
    // Ensure the application has the correct type
    application.type = "alipay_payment";
    return await createApplication(application, userId, isAdmin);
};

/**
 * Save a foreign company payment application
 * @param {Object} application - Application data from conversation
 * @param {number} userId - Telegram user ID
 * @returns {Promise<number>} - Application ID
 */
export const saveForeignCompanyPaymentApplication = async (application, userId, isAdmin = false) => {
    // Ensure the application has the correct type
    application.type = "foreign_company_payment";
    return await createApplication(application, userId, isAdmin);
};

/**
 * Save a cash abroad application
 * @param {Object} application - Application data from conversation
 * @param {number} userId - Telegram user ID
 * @returns {Promise<number>} - Application ID
 */
export const saveCashAbroadApplication = async (application, userId, isAdmin = false) => {
    // Ensure the application has the correct type
    application.type = "cash_abroad";
    return await createApplication(application, userId, isAdmin);
};

/**
 * Get all applications
 * @returns {Promise<Array>} - Array of applications
 */
export const getAllApplications = async () => {
    try {
        const [applications] = await db.execute(
            'SELECT a.*, u.username FROM applications a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC'
        );

        return applications
    } catch (error) {
        console.error('Error getting applications:', error);
        throw error;
    }
};

/**
 * Get applications by user ID
 * @param {number} userId - Telegram user ID
 * @returns {Promise<Array>} - Array of user's applications
 */
export const getUserApplications = async (userId) => {
    try {
        const [applications] = await db.execute(
            'SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        // Parse the JSON data field
        return applications
    } catch (error) {
        console.error('Error getting user applications:', error);
        throw error;
    }
};

/**
 * Update application status
 * @param {number} applicationId - Application ID
 * @param {string} status - New status ('new', 'processing', 'completed', 'rejected')
 * @returns {Promise<void>}
 */
export const updateApplicationStatus = async (applicationId, status) => {
    try {
        await db.execute(
            'UPDATE applications SET status = ? WHERE id = ?',
            [status, applicationId]
        );
    } catch (error) {
        console.error('Error updating application status:', error);
        throw error;
    }
};

/**
 * Get a single application by ID
 * @param {number} applicationId - Application ID
 * @returns {Promise<Object|null>} - Application data or null if not found
 */
export const getApplicationById = async (applicationId) => {
    try {
        const [[application]] = await db.execute(
            'SELECT * FROM applications WHERE id = ?',
            [applicationId]
        );
        
        if (!application) return null;
        
        // Parse the JSON data field
        return application
    } catch (error) {
        console.error('Error getting application by ID:', error);
        throw error;
    }
};

export const takeApplication = async (applicationId, managerId) => {
    try {
        await db.execute(
            'UPDATE applications SET status = ?, manager_id = ? WHERE id = ?',
            ['processing', managerId, applicationId]
        );
    } catch (error) {
        console.error('Error taking application:', error);
        throw error;
    }
}

export const completeApplication = async (applicationId) => {
    try {
        await db.execute(
            'UPDATE applications SET status = ? WHERE id = ?',
            ['completed', applicationId]
        );
    } catch (error) {
        console.error('Error completing application:', error);
        throw error;
    }
}

export const rejectApplication = async (applicationId) => {
    try {
        await db.execute(
            'UPDATE applications SET status = ? WHERE id = ?',
            ['rejected', applicationId] 
        );
    } catch (error) {
        console.error('Error rejecting application:', error);
        throw error;
    }
}

/**
 * Get applications by username
 * @param {string} username - Telegram username
 * @returns {Promise<Array>} - Array of user's applications
 */
export const getApplicationsByUsername = async (username) => {
    try {
        const [applications] = await db.execute(
            'SELECT * FROM applications WHERE username = ? ORDER BY created_at DESC',
            [username]
        );
        
        return applications;
    } catch (error) {
        console.error('Error getting applications by username:', error);
        throw error;
    }
};

export const getApplicationsByManagerId = async (managerId) => {
    try {
        const [applications] = await db.execute(
            'SELECT * FROM applications WHERE manager_id = ? ORDER BY created_at DESC LIMIT 10',
            [managerId]
        );  

        return applications
    } catch (error) {
        console.error('Error getting applications by manager ID:', error);
        throw error;
    }
}

export async function getApplicationStatistics() {
    try {
        
        // Get date 24 hours ago
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);
        const yesterdayStr = yesterday.toISOString().slice(0, 19).replace('T', ' ');
        
        // Get total applications created in last 24 hours
        const [totalResult] = await db.query(
            "SELECT COUNT(*) as total FROM applications WHERE created_at >= ?",
            [yesterdayStr]
        );
        const totalCount = totalResult[0].total;
        
        // Get applications by status in last 24 hours
        const [statusResult] = await db.query(
            "SELECT status, COUNT(*) as count FROM applications WHERE created_at >= ? GROUP BY status",
            [yesterdayStr]
        );
        
        // Get most productive manager (who processed the most applications)
        const [managerResult] = await db.query(
            `SELECT manager_id, COUNT(*) as processed_count 
             FROM applications 
             WHERE manager_id IS NOT NULL AND created_at >= ? 
             GROUP BY manager_id 
             ORDER BY processed_count DESC 
             LIMIT 1`,
            [yesterdayStr]
        );
        
        return {
            totalCount,
            statusCounts: statusResult,
            topManager: managerResult.length > 0 ? managerResult[0] : null
        };
    } catch (error) {
        console.error("Error getting application statistics:", error);
        throw error;
    }
}

export async function getUsernameById(userId) {
    try {
        if (!userId) return null;
        const [rows] = await db.query(
            "SELECT username FROM users WHERE id = ?",
            [userId]
        );
        
        return rows.length > 0 ? rows[0].username : null;
    } catch (error) {
        console.error("Error getting username by ID:", error);
        return null;
    }
}

export async function getFilteredApplications(options = {}) {
    try {
        const {
            limit = 10,
            offset = 0,
            status = null,
            type = null,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;
        
        let query = `
            SELECT a.*, u.username 
            FROM applications a 
            LEFT JOIN users u ON a.user_id = u.id 
            WHERE 1=1
        `;
        
        const params = [];
        
        // Add filters
        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }
        
        if (type) {
            query += ' AND a.type = ?';
            params.push(type);
        }
        
        // Add sorting
        const validSortColumns = ['id', 'created_at', 'updated_at', 'status', 'type'];
        const validSortOrders = ['ASC', 'DESC'];
        
        const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
        
        query += ` ORDER BY a.${finalSortBy} ${finalSortOrder}`;
        
        // Add pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        
        // Get total count for pagination
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM applications a WHERE 1=1 ${
                status ? ' AND a.status = ?' : ''
            } ${type ? ' AND a.type = ?' : ''}`,
            params.slice(0, -2) // Remove limit and offset
        );
        
        const [applications] = await db.query(query, params);
        
        return {
            applications,
            pagination: {
                total: countResult[0].total,
                limit,
                offset,
                hasMore: offset + limit < countResult[0].total
            }
        };
    } catch (error) {
        console.error('Error getting filtered applications:', error);
        throw error;
    }
}

export const getNewApplications = async () => {
    try {
        const [applications] = await db.execute(
            'SELECT * FROM applications WHERE status = ?',
            ['new']
        );

        return applications
    } catch (error) {
        console.error('Error getting new applications:', error);
        throw error;
    }
}
