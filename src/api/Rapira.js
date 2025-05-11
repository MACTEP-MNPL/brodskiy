export const getRapiraBuyDollar = async () => {
    try {
      const response = await fetch('https://api.rapira.net/open/market/rates');
      const data = await response.json();
      
      // Find the USDT/RUB pair in the data
      const usdtRub = data.data.find(pair => pair.symbol === 'USDT/RUB');
      
      if (!usdtRub) {
        throw new Error('USDT/RUB pair not found in API response');
      }
      
      // For buying dollars (USDT), we use the askPrice
      // This is the price at which the exchange sells USDT to the user
      return usdtRub.askPrice;
    } catch (error) {
      console.error('Error fetching Rapira buy dollar rate:', error);
      throw error;
    }
  };
  
  export const getRapiraSellDollar = async () => {
    try {
      const response = await fetch('https://api.rapira.net/open/market/rates');
      const data = await response.json();
      
      // Find the USDT/RUB pair in the data
      const usdtRub = data.data.find(pair => pair.symbol === 'USDT/RUB');
      
      if (!usdtRub) {
        throw new Error('USDT/RUB pair not found in API response');
      }
      
      // For selling dollars (USDT), we use the bidPrice
      // This is the price at which the exchange buys USDT from the user
      return usdtRub.bidPrice;
    } catch (error) {
      console.error('Error fetching Rapira sell dollar rate:', error);
      throw error;
    }
  };
  
  