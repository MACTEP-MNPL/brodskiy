import { api } from '../bot.js'

export const getExhangeDataMessage = () => {

    const {RapiraBuyDollar, RapiraSellDollar, ALIPAYBuyDollar, ALIPAYSellDollar, LEBuyDollar, LESellDollar} = api

    return [`🔄 <b>Курс обмена 1USDT</b>\n` +
           `\n` +
           `<b>Usdt</b> | <b>${RapiraBuyDollar}</b> | <b>${RapiraSellDollar}</b>\n` +
           `<b>ALIPAY</b> | <b>${ALIPAYBuyDollar}</b> | <b>${ALIPAYSellDollar}</b>\n`, {parse_mode: "HTML"}]    
}
