import { getRapiraBuyDollar, getRapiraSellDollar } from './Rapira.js'
import { getGrinexBuyDollar, getGrinexSellDollar } from './Grinex.js'
import cron from 'node-cron'
import { getAllDirections } from '../db/directions.js'
import { nFormat } from '../utils/format.js'


export class createApi {
    constructor() {
        this.RapiraBuyDollar = 0
        this.RapiraSellDollar = 0
        this.ALIPAYBuyDollar = 0
        this.ALIPAYSellDollar = 0
        this.LEBuyDollar = 0
        this.LESellDollar = 0
        this.GrinexBuyDollar = 0
        this.GrinexSellDollar = 0
        
        cron.schedule('* * * * *', async () => {
            console.log("api update " + new Date().toLocaleString())
            await this.update()
        })
    }
        
    async update() {
        try {
            const [alipay, LE, grinex] = await getAllDirections()

            //const rapiraBuyDollar = await getRapiraBuyDollar()
            //const rapiraSellDollar = await getRapiraSellDollar()
            const grinexBuyDollar = await getGrinexBuyDollar()
            const grinexSellDollar = await getGrinexSellDollar()
            console.log(grinexBuyDollar, grinexSellDollar)

            //this.RapiraBuyDollar = nFormat(Number(rapiraBuyDollar) + Number(Rapira.buy_margin) / 100)
            //this.RapiraSellDollar = nFormat(Number(rapiraSellDollar) + Number(Rapira.sell_margin) / 100)
            this.ALIPAYBuyDollar = nFormat(Number(alipay.buy_margin))
            this.ALIPAYSellDollar = nFormat(Number(alipay.sell_margin))
            this.GrinexBuyDollar = (grinexBuyDollar * (1 + grinex.buy_margin/100)).toFixed(2);
            this.GrinexSellDollar = (grinexSellDollar * (1 - grinex.sell_margin/100)).toFixed(2);
            //this.LEBuyDollar = nFormat(Number(grinexBuyDollar) + Number(LE.buy_margin) / 100)
            //this.LESellDollar = nFormat(Number(grinexSellDollar) + Number(LE.sell_margin) / 100)
        } catch (error) {
            console.error('Error updating fast:', error)
        }
    }
}