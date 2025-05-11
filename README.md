# Brodskiy Exchange Bot - Application System

This is an application system for the Brodskiy Exchange Bot that allows users to create and manage different types of applications for cryptocurrency exchange and payments.

## Features

- Create applications for buying/selling USDT
- Create applications for ALIPAY payments
- Create applications for foreign company payments
- Admin panel to view and manage applications
- Store application data in MySQL database
- Automatic notifications to admins about new applications
- Admin interface to respond to applications and notify users

## Setup

1. Make sure your database is set up with the correct tables. Run the SQL schema:

```sql
-- Run this in your MySQL database
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    data JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

2. Make sure your `.env` file is configured with the correct database credentials:

```
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
TG_BOT_TOKEN=your_telegram_bot_token
TG_MANAGER_USERNAME=@your_manager_username
```

## Usage

### User Flows

- Users can create an application by clicking the "➕ Создать заявку" button
- The bot will guide users through the application creation process
- After submission, applications are stored in the database and admins are notified
- Users receive notifications when admins process their applications

### Admin Commands and Features

- `/applications` - View the 10 most recent applications
- "🔥 Активные заявки" button - View active applications 
- "✅ Ответить на заявку" button - Respond to specific application
- Admins receive instant notifications when users create new applications
- Admins can update application status (process, complete, or reject)
- Admins can send direct messages to users regarding their applications

### Application Status Types

- `new` - Newly created application
- `processing` - Application is being processed
- `completed` - Application has been completed
- `rejected` - Application has been rejected

## Development

### Files Structure

- `src/db/applications.js` - Database functions for applications
- `src/conversations/createAppByUserConvers.js` - Conversation handlers for application creation
- `src/conversations/respondToApplicationConvers.js` - Admin conversation to respond to applications
- `src/commands/commands.js` - Command handlers including admin commands
- `src/hears/adminHears.js` - Admin panel button handlers
- `src/utils/notifyAdmins.js` - Utilities for admin notifications

## Database Schema

The applications table stores all application data with the following structure:

- `id` - Unique identifier
- `user_id` - Telegram user ID (foreign key to users table)
- `type` - Application type (buy_usdt, sell_usdt, alipay_payment, foreign_company_payment)
- `status` - Current status (new, processing, completed, rejected)
- `data` - JSON data containing application-specific fields
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp 