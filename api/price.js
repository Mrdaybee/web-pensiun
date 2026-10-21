module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    try {
        // Ambil harga BTC (USD) dan USDT (IDR) dari CoinGecko
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd,idr');
        const data = await response.json();

        res.status(200).json({
            // BTC/USDT dianggap sama dengan BTC/USD
            btcUsdt: (data.bitcoin && data.bitcoin.usd) ? data.bitcoin.usd : 0,
            usdtIdr: (data.tether && data.tether.idr) ? data.tether.idr : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
