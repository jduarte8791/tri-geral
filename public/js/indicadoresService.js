export class IndicadoresService
{
    constructor()
    {
        this.baseUrl = 'https://api.binance.com/api'
    }

    // Calcula o EMA (Exponential Moving Average)
    calculateEMA(data, period) 
    {
        const k = 2 / (period + 1);
        let ema = [data[0]]; // Começa com o primeiro valor
        for (let i = 1; i < data.length; i++) {
            ema.push(data[i] * k + ema[i - 1] * (1 - k));
        }
        return ema;
    }
  
    // Calcula o MACD e a linha de sinal
    calculateMACD(data) 
    {
        const ema12 = this.calculateEMA(data, 12);
        const ema26 = this.calculateEMA(data, 26);
        const macd = ema12.map((val, i) => val - ema26[i]);
        const signal = this.calculateEMA(macd, 9);
    
        return { macd, signal };
    }
  
    // Calcula o RSI (Relative Strength Index)
    calcRsi(closes, periodo) 
    {
        let ganhos = 0, perdas = 0
    
        // CLOSES DEVE SER IGUAL A 14 que é o período do RSI
        for (let i = closes.length - periodo; i < closes.length; i++) 
        {
            const diff = closes[i] - closes[i - 1]; // Compara o candle atual com o anterior
        
            if (diff >= 0) ganhos += diff
            else 
            perdas -= diff
        }
    
        const forca = ganhos / perdas;
    
        // Fórmula do RSI
        // RSI acima de 70 = mercado SOBRECOMPRADO e abaixo de 30 SOBREVENDIDO
        let rsi = 100 - (100 / (1 + forca))
        return rsi
    }

    async closingPricesRsi(symbol)
    {
        const interval = '1h'
        const url = `${this.baseUrl}/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`

        const response = await fetch(url)
        const data = await response.json()
        const closingPrices = data.map((candle) => parseFloat(candle[4]))

        // console.log('Closing prices: ' + closingPrices)

        return closingPrices
    }
}