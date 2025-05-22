import axios from 'axios'
import { API_URL } from '../bot.js'

export const getGrinexSellDollar = async () => {
    try {
        const response = await axios.get(`${API_URL}/rates/grinex`)
        return response.data.data.sell
    } catch (error) {
        console.error('Error getting sell dollar price:', error);
        throw error;
    }
}

export const getGrinexBuyDollar = async () => {
    try {
        const response = await axios.get(`${API_URL}/rates/grinex`)
        return response.data.data.buy
    } catch (error) {
        console.error('Error getting buy dollar price:', error);
        throw error;
    }
}

