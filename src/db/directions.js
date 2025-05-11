import { db } from "../bot.js"

export const getAllDirections = async () => {
    const [directions] = await db.execute('SELECT * FROM directions')
    return directions
}

export const updateBuyMargin = async (id, margin) => {
    await db.execute('UPDATE directions SET buy_margin = ? WHERE id = ?', [margin, id])
}

export const updateSellMargin = async (id, margin) => {
    await db.execute('UPDATE directions SET sell_margin = ? WHERE id = ?', [margin, id])
}

export const getDirection = async (id) => {
    const [direction] = await db.execute('SELECT * FROM directions WHERE id = ?', [id])
    return direction[0]
}

