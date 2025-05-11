import { Keyboard } from 'grammy'

export const mainKeyboard = new Keyboard()
    .text('➕ Создать заявку').row()
    .text('🔄 Курс обмена ').row()
    .text('🤝 О нас')
    .text('📅 График работы').row()
    .text('💬 Контакты')
    .text('👥 Телеграмм канал').row()
    .resized()
