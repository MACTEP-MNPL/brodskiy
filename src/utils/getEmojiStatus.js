export const getStatusEmoji = (status) => {
    console.log(status)
    switch (status) {
        case 'new':
            return '🔥 (Новая)';
        case 'processing':
            return '🔄 (В работе)';
        case 'completed':
            return '✅ (Выполнена)';
        case 'rejected':
            return '❌ (Отклонена)';
        default:
            return status;
    }
}