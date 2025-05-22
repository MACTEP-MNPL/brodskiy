import { api } from '../bot.js'

export const getExhangeDataMessage = () => {

    const {GrinexBuyDollar, GrinexSellDollar, ALIPAYBuyDollar, ALIPAYSellDollar} = api

    return [`🔄 <b>Курс обмена 1USDT</b>\n` +
           `\n` +
           `<b>Grinex</b> | <b>${GrinexBuyDollar}</b> | <b>${GrinexSellDollar}</b>\n` +
           `<b>ALIPAY</b> | <b>${ALIPAYBuyDollar}</b> | <b>${ALIPAYSellDollar}</b>\n`, {parse_mode: "HTML"}]    
}
