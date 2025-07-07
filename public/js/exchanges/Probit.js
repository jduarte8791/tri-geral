import { Funcoes } from '../Funcoes.js'

export class Probit 
{
    constructor()
    {
        this.fun = new Funcoes()
        this.pares = []

        // this.baseUrl = 'https://api.binance.com/api'

    }

    async verTriUsdtBTC()
    {
        let precoBTC = await this.obterPrecoBtc(),
            j = []

            // console.log('Probit - preços do BTC: ', ' a: '  + precoBTC.a, ' b: ' +  precoBTC.b)
        try
        {
            if(this.pares.length == 0)
            {
                this.pares = await this.symbolsUSDT_BTC()
                // console.warn('Pares USDT/BTC carregados:', this.pares)
            }    
                
    
            if (!this.pares.length)
            {
                console.warn('Nenhuma moeda disponível para arbitragem')
                return
            }
    
            for (let i in this.pares)
            {
                const pdCpVdUSDT = await this.obterPrecoSymbol(`${this.pares[i].s_usdt}`)
                const pdCpVdBTC = await this.obterPrecoSymbol(`${this.pares[i].s_btc}`)
    
                let precoCustoEmUSDT = precoBTC.a * pdCpVdBTC.a // comprando em BTC
                let apuradoEmUSDT = pdCpVdBTC.b * precoBTC.b // vendendo em USDT
    
                // console.log(pares[i].s_btc + ' precoCustoEmUSDT = ' + ' precoBTC.a * pdCpVdBTC.a  ' + precoBTC.a + ' ' + pdCpVdBTC.a + ' ' 
                //     + ' precoCustoEmUSDT: ' + precoCustoEmUSDT)

                // console.log(pares[i].s_usdt + ' apuradoEmUSDT = ' + ' pdCpVdBTC.b * precoBTC.b  ' + pdCpVdBTC.b + ' ' + precoBTC.b + 
                //     ' ' + ' apuradoEmUSDT: ' + apuradoEmUSDT)
    
                //COMPRAR EM BTC
                let diferencaCpBTC = (pdCpVdUSDT.b - precoCustoEmUSDT) / precoCustoEmUSDT * 100
    
                if(diferencaCpBTC > 1)
                {
                    j.push(
                        {
                           symbol: this.pares[i].s_btc, exc: 'Probit', pdVd: pdCpVdBTC.a, volPdVd: pdCpVdBTC.aQ,
                           pdCp: pdCpVdUSDT.b, volPdCp: pdCpVdUSDT.bQ, cpEm: 'BTC', vdEm: 'USDT', lucro: diferencaCpBTC
                        })
    
                    console.log(`Comprar ${this.pares[i].s_usdt} com BTC por ${pdCpVdBTC.a} vol comprar ${pdCpVdBTC.aQ}
                         e vender por ${pdCpVdUSDT.b} USDT vol Vender ${pdCpVdUSDT.bQ} na Probit lucro de: ${diferencaCpBTC}`)
                }
    
                //COMPRAR EM USDT
                let diferencaCpUSDT =  ((apuradoEmUSDT - pdCpVdUSDT.a) / pdCpVdUSDT.a) * 100
    
                if(diferencaCpUSDT > 1)
                {
                    j.push(
                        {
                           symbol: this.pares[i].s_usdt, exc: 'Probit', pdVd: pdCpVdUSDT.a, volPdVd: pdCpVdUSDT.aQ,
                           pdCp: pdCpVdBTC.b, volPdCp: pdCpVdBTC.bQ, cpEm: 'USDT', vdEm: 'BTC', lucro: diferencaCpUSDT
                        })
    
                    console.log(`Comprar ${this.pares[i].s_usdt} com USDT por ${pdCpVdUSDT.a} vol compra: ${pdCpVdUSDT.aQ}
                         e vender por ${pdCpVdBTC.b} BTC vol vender: ${pdCpVdBTC.bQ} ${diferencaCpUSDT} 
                         na Probit lucro de: ${diferencaCpUSDT}`)
                }
            }
        }
        catch (erro)
        {
            console.error('Erro ao verificar arbitragem:', erro)
        }
    
        return j
    }

    // obterPrecoSymbol = async (symbol) =>
    // {
    //     let preco = {}
    
    //     try
    //     {
    //         await new Promise(resolve => setTimeout(resolve, 1000))
    
    //         const response = await fetch(`https://api.probit.com/api/exchange/v1/order_book?market_id=${symbol}`)
    
    //         if (!response.ok)
    //         {
    //             throw new Error(`Erro HTTP: ${response.status}`)
    //         }
    
    //         const dados = await response.json()
    
    //         const buys = dados.data.filter(order => order.side === 'buy')
    //         const sells = dados.data.filter(order => order.side === 'sell')
    
    //         if (buys.length > 0)
    //         {
    //             const maxBuy = buys.reduce((max, order) =>
    //                 parseFloat(order.price) > parseFloat(max.price) ? order : max, buys[0])
    
    //             preco.b = parseFloat(maxBuy.price)
    //             preco.bQ = parseFloat(maxBuy.quantity)
    //         }
    
    //         if (sells.length > 0)
    //         {
    //             const minSell = sells.reduce((min, order) =>
    //                 parseFloat(order.price) < parseFloat(min.price) ? order : min, sells[0])
    
    //             preco.a = parseFloat(minSell.price)
    //             preco.aQ = parseFloat(minSell.quantity)
    //         }
    //     }
    //     catch (erro)
    //     {
    //         console.error(`Erro ao buscar preço para ${symbol}:`, erro)
    //     }
    
    //     return preco
    // }
    
    async obterPrecoSymbol(symbol)
    {
        const precos = []
        const url = `https://api.probit.com/api/exchange/v1/order_book?market_id=${symbol}`
        let preco = {}

        await new Promise(resolve => setTimeout(resolve, 500))

        return new Promise(resolve => 
        {
            this.fun.addEventListener(url, resultado => 
            {
                if (resultado.sucesso) 
                {
                    const d = resultado.dados

                    const buys = d.data.filter(order => order.side === 'buy')
                    const sells = d.data.filter(order => order.side === 'sell')

                    if (buys.length > 0)
                        {
                            const maxBuy = buys.reduce((max, order) =>
                                parseFloat(order.price) > parseFloat(max.price) ? order : max, buys[0])
                
                            preco.b = parseFloat(maxBuy.price)
                            preco.bQ = parseFloat(maxBuy.quantity)
                        }
                
                        if (sells.length > 0)
                        {
                            const minSell = sells.reduce((min, order) =>
                                parseFloat(order.price) < parseFloat(min.price) ? order : min, sells[0])
                
                            preco.a = parseFloat(minSell.price)
                            preco.aQ = parseFloat(minSell.quantity)
                        }

                    // console.log(`Preços do ${symbol} na NonKyc:`, precos)
                } 
                else 
                {
                    console.error(`Erro ao buscar preço para ${symbol}:`, resultado.erro)
                }

                resolve(preco)
            })

            this.fun.fazerRequisicaoComRetry(url)
        })
    }

    async symbolsUSDT_BTC() 
    {
        try
        {
            let url = 'https://api.probit.com/api/exchange/v1/ticker'

            // const response = await fetch('https://api.probit.com/api/exchange/v1/ticker')

            // if (!response.ok)
            // {
            //     throw new Error(`Erro HTTP: ${response.status}`)
            // }

            // const dados = await response.json()
            let dados = await this.fun.requisicaoComRetry(url)

            if(dados)
            {
                const MoedasMap = new Map()

                dados.data.forEach((par) =>
                {
                    // const simbolo = par.symbol.toLowerCase()
                    const [moeda, cotacao] = par.market_id.split('-')

                    if (cotacao === 'USDT' || cotacao === 'BTC')
                    {
                        if (!MoedasMap.has(moeda))
                        {
                            MoedasMap.set(moeda, [])
                        }
                        MoedasMap.get(moeda).push(cotacao)
                    }
                })

                const symbols = []
                MoedasMap.forEach((cotacoes, moeda) =>
                {
                    if (cotacoes.includes('USDT') && cotacoes.includes('BTC'))
                        symbols.push({ s_usdt: `${moeda}-USDT`, s_btc: `${moeda}-BTC` })
                })

                // console.log('Moedas negociadas em BTC / USDT na Probit:', symbols)

                return symbols
            }
            else
            {
                console.warn('Resposta inesperada da API:', dados)
                return []
            }
        }
        catch (erro)
        {
            console.error('Erro ao buscar os dados:', erro)
            return []
        }
    }

    obterPrecoBtc = async () =>
    {
        const preco = {}
        const url = 'https://api.probit.com/api/exchange/v1/order_book?market_id=BTC-USDT'
    
        return new Promise(resolve => 
        {
            this.fun.addEventListener(url, resultado => 
            {
                if (resultado.sucesso) 
                {
                    const dados = resultado.dados
                    const buys = dados.data.filter(order => order.side === 'buy')
                    const sells = dados.data.filter(order => order.side === 'sell')
    
                    if (buys.length > 0)
                    {
                        const maxBuy = buys.reduce((max, order) =>
                            parseFloat(order.price) > parseFloat(max.price) ? order : max, buys[0])
    
                        preco.b = parseFloat(maxBuy.price)
                        preco.bQ = parseFloat(maxBuy.quantity)
                    }
    
                    if (sells.length > 0)
                    {
                        const minSell = sells.reduce((min, order) =>
                            parseFloat(order.price) < parseFloat(min.price) ? order : min, sells[0])
    
                        preco.a = parseFloat(minSell.price)
                        preco.aQ = parseFloat(minSell.quantity)
                    }
                } 
                else 
                {
                    console.error(`Erro ao buscar preço para BTC:`, resultado.erro)
                }
    
                resolve(preco)
            })
    
            this.fun.fazerRequisicaoComRetry(url)
        })
    }
        

     // Método para adicionar listeners
     emitEvent(eventName, data)
     {
         const event = new CustomEvent(eventName, { detail: data })
         this.eventEmitter.dispatchEvent(event)
     }
 
     addEventListener(eventName, callback)
    {
        this.eventEmitter.addEventListener(eventName, (e) => callback(e.detail))
    }
}
