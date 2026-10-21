module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    try {
        // 1. Ambil harga BTC/USDT langsung dari Binance
        const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const binanceData = await binanceRes.json();
        
        // 2. Ambil harga USDT/IDR dari CoinGecko
        const geckoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr');
        const geckoData = await geckoRes.json();

        res.status(200).json({
            btcUsdt: parseFloat(binanceData.price) || 0,
            usdtIdr: (geckoData.tether && geckoData.tether.idr) ? geckoData.tether.idr : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
