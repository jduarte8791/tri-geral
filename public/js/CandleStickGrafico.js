

export class CandlestickChart 
{
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.padding = 40
        this.candleWidth = 8
        this.data = []
        this.signals = []
    }

    generateMockData(count = 50)
    {
        let price = 100
        const data = []
        
        for (let i = 0; i < count; i++) {
            const volatility = price * 0.02
            const open = price
            const high = open + Math.random() * volatility
            const low = open - Math.random() * volatility
            const close = low + Math.random() * (high - low)
            
            data.push({
                time: new Date(2024, 0, i + 1),
                open,
                high,
                low,
                close
            })
            
            price = close
        }
        
        this.data = data
        this.calculateChandelierExit()
    }

    calculateChandelierExit(period = 22, multiplier = 3)
    {
        const signals = []
        let prevDir = 1
        
        for (let i = period; i < this.data.length; i++) {
            const slice = this.data.slice(i - period, i + 1)
            const highest = Math.max(...slice.map(d => d.high))
            const lowest = Math.min(...slice.map(d => d.low))
            
            const atr = slice.reduce((sum, curr, idx) => {
                if (idx === 0) return sum
                const prev = slice[idx - 1]
                const tr = Math.max(
                    curr.high - curr.low,
                    Math.abs(curr.high - prev.close),
                    Math.abs(curr.low - prev.close)
                )
                return sum + tr
            }, 0) / period
            
            const longStop = highest - (atr * multiplier)
            const shortStop = lowest + (atr * multiplier)
            
            const currentPrice = this.data[i].close
            const dir = currentPrice > shortStop ? 1 : currentPrice < longStop ? -1 : prevDir
            
            if (dir !== prevDir) {
                signals.push({
                    index: i,
                    type: dir === 1 ? 'buy' : 'sell'
                })
            }
            
            prevDir = dir
        }
        
        this.signals = signals
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        
        const maxPrice = Math.max(...this.data.map(d => d.high))
        const minPrice = Math.min(...this.data.map(d => d.low))
        const priceRange = maxPrice - minPrice
        
        const chartWidth = this.canvas.width - 2 * this.padding
        const chartHeight = this.canvas.height - 2 * this.padding
        
        // Draw price scale
        this.ctx.textAlign = 'right'
        this.ctx.fillStyle = '#666'
        for (let i = 0; i <= 5; i++) {
            const price = minPrice + (priceRange * i / 5)
            const y = this.padding + chartHeight - (chartHeight * i / 5)
            this.ctx.fillText(price.toFixed(2), this.padding - 5, y)
        }

        // Draw candles
        this.data.forEach((candle, i) => {
            const x = this.padding + (i * (this.candleWidth + 2))
            const isUp = candle.close > candle.open
            
            const openY = this.priceToY(candle.open, minPrice, maxPrice, chartHeight)
            const closeY = this.priceToY(candle.close, minPrice, maxPrice, chartHeight)
            const highY = this.priceToY(candle.high, minPrice, maxPrice, chartHeight)
            const lowY = this.priceToY(candle.low, minPrice, maxPrice, chartHeight)
            
            // Draw wick
            this.ctx.beginPath()
            this.ctx.strokeStyle = isUp ? '#26a69a' : '#ef5350'
            this.ctx.moveTo(x + this.candleWidth / 2, highY)
            this.ctx.lineTo(x + this.candleWidth / 2, lowY)
            this.ctx.stroke()
            
            // Draw body
            this.ctx.fillStyle = isUp ? '#26a69a' : '#ef5350'
            this.ctx.fillRect(x, Math.min(openY, closeY), 
                            this.candleWidth, 
                            Math.abs(closeY - openY))

            // Draw signals
            const signal = this.signals.find(s => s.index === i)
            if (signal) {
                this.drawSignal(x + this.candleWidth / 2, 
                              signal.type === 'buy' ? lowY : highY, 
                              signal.type)
            }
        })
    }

    drawSignal(x, y, type) {
        this.ctx.beginPath()
        this.ctx.fillStyle = type === 'buy' ? '#26a69a' : '#ef5350'
        
        if (type === 'buy') {
            this.ctx.moveTo(x, y + 15)
            this.ctx.lineTo(x - 5, y + 5)
            this.ctx.lineTo(x + 5, y + 5)
        } else {
            this.ctx.moveTo(x, y - 15)
            this.ctx.lineTo(x - 5, y - 5)
            this.ctx.lineTo(x + 5, y - 5)
        }
        
        this.ctx.fill()
    }

    priceToY(price, minPrice, maxPrice, chartHeight) {
        const priceRange = maxPrice - minPrice
        return this.padding + chartHeight - 
               ((price - minPrice) / priceRange * chartHeight)
    }
}

// Initialize and draw chart
const canvas = document.getElementById('chart')
const chart = new CandlestickChart(canvas)
chart.generateMockData()
chart.draw()