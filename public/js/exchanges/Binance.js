import { Funcoes } from '../Funcoes.js'
import { Fmfw } from './Fmfw.js'
import { Xeggex } from './Xeggex.js'

export class Binance 
{
    constructor()
    {
        this.fun = new Funcoes()
        this.fmfwS = new Fmfw()
        this.xeg = new Xeggex()

        // this.baseUrl = 'https://api.binance.com/api'
    }

    async symbolsUSDT_BTC()
    {
        try
        {
            const dados = await this.bookTicker()

            if(dados)
            {
                const MoedasMap = new Map()

                dados.forEach((par) =>
                {
                    const [moeda, cotacao] = par.s.endsWith('USDT') ? [par.s.slice(0, -4), 'USDT'] : par.s.endsWith('BTC') ? [par.s.slice(0, -3), 'BTC'] : [null, null]

                    if (cotacao === 'USDT' || cotacao === 'BTC')
                    {
                        if (!MoedasMap.has(moeda))
                        {
                            MoedasMap.set(moeda, {})
                        }
                        MoedasMap.get(moeda)[cotacao] = {
                            symbol: par.s,
                            bid: par.b,
                            ask: par.a,
                            bidQty: par.bQ,
                            askQty: par.aQ
                        }
                    }
                })

                const moedasFiltradas = []
                MoedasMap.forEach((cotacoes, moeda) =>
                {
                    if (cotacoes.USDT && cotacoes.BTC)
                    {
                        moedasFiltradas.push({
                            moeda,
                            usdt: cotacoes.USDT,
                            btc: cotacoes.BTC
                        })
                    }
                })

                return moedasFiltradas
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

    async obterPrecoBTC()
    {
        let pdCp = [],
            pdVd = []
            
        try
        {
            const response = await fetch('https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=1')

            if (!response.ok)
            {
                throw new Error(`Erro HTTP: ${response.status}`)
            }

            const dados = await response.json()
            
            pdVd.push({ pdVd: dados.asks[0][0], qtde: dados.asks[0][1] })
            pdCp.push({ pdCp: dados.bids[0][0], qtde: dados.bids[0][1] })
        }
        catch (erro)
        {
            console.error(`Erro ao buscar preço para BTC`, erro)
        }

        return { pdVd, pdCp }
    }

    async obterPreco(symbol)
    {
        let pdCp = [],
            pdVd = []
           
        try
        {
            const response = await fetch('https://api.binance.com/api/v3/depth?symbol=' + symbol + '&limit=1')

            if (!response.ok)
            {
                throw new Error(`Erro HTTP: ${response.status}`)
            }

            const dados = await response.json()
            
            pdVd.push({ pdVd: dados.asks[0][0], qtde: dados.asks[0][1] })
            pdCp.push({ pdCp: dados.bids[0][0], qtde: dados.bids[0][1] })
        }
        catch (erro)
        {
            console.error(`Erro ao buscar preço para ${symbol}:`, erro)
        }

        return { pdVd, pdCp }
    }

    async bookTicker()
    {
        const url = await fetch('https://api.binance.com/api/v3/ticker/bookTicker')
        let p = await url.json(),
            symbols = []
        
        for(let i in p)
            symbols.push({ s: p[i].symbol, b: p[i].bidPrice, a: p[i].askPrice, bQ: p[i].bidQty, aQ: p[i].askQty })

        return symbols
    }

    async calcularArbitragemTriangular(moeda)
    {
        try
        {
            const [usdtData, btcData, btcUsdtData] = await Promise.all([
                this.obterPreco(moeda.usdt.symbol),
                this.obterPreco(moeda.btc.symbol),
                this.obterPrecoBTC()
            ])

            if (usdtData.pdCp.length > 0 && btcData.pdCp.length > 0 && btcUsdtData.pdCp.length > 0)
            {
                const usdtBid = usdtData.pdCp[0].pdCp
                const btcAsk = btcUsdtData.pdVd[0].pdVd
                const moedaBtcAsk = btcData.pdVd[0].pdVd

                const Yt = (1 / btcAsk) * (1 / moedaBtcAsk) * usdtBid
                const lucroPercentual = (Yt - 1) * 100

                if (Yt > 1)
                {
                    console.log(`Oportunidade de arbitragem detectada para ${moeda.usdt.symbol} às ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}: Y(t) = ${Yt.toFixed(6)}, Lucro = ${lucroPercentual.toFixed(2)}%`)
                    return { oportunidade: true, Yt, lucroPercentual }
                }
                else
                {
                    // console.log(`Nenhuma oportunidade para ${moeda.usdt.symbol} às ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}: Y(t) = ${Yt.toFixed(6)}`)
                    return { oportunidade: false, Yt, lucroPercentual }
                }
            }
            else
            {
                console.warn('Dados insuficientes para cálculo:', { usdtData, btcData, btcUsdtData })
                return { oportunidade: false, Yt: 0, lucroPercentual: 0 }
            }
        }
        catch (erro)
        {
            console.error('Erro ao calcular arbitragem:', erro)
            return { oportunidade: false, Yt: 0, lucroPercentual: 0 }
        }
    }

    async monitorarArbitragem()
    {
        try
        {
            const moedas = await this.symbolsUSDT_BTC()

            if (moedas.length > 0)
            {
                for (const moeda of moedas)
                {
                    await this.calcularArbitragemTriangular(moeda)
                }
            }
            else
            {
                console.warn('Nenhuma moeda encontrada para monitoramento às ' + new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))
            }
        }
        catch (erro)
        {
            console.error('Erro no monitoramento:', erro)
        }
    }

    async ob_binance(par_moeda)
    {
        let api_url = await fetch('https://api.binance.com/api/v3/depth?symbol=' + par_moeda + '&limit=5'),
            json = await api_url.json()

        return json
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



     // async verTriangulacao()
    // {
    //     let precoBTC = await this.obterPrecoBTC(),
    //         j = []
    //     // console.log('preços BTC: ', precoBTC)

    //     try
    //     {
    //         // console.log('Preço BTC -> ' + ' pdVd: ' +  precoBTC.pdVd[0].pdVd + ' pdCp: ' + precoBTC.pdCp[0].pdCp)
    //         const pares = await this.symbolsUSDT_BTC()
    //         if (!pares.length)
    //         {
    //             console.warn('Nenhuma moeda disponível para arbitragem')
    //             return
    //         }

    //         // console.log('pares', pares)

    //         for (let i of pares)
    //         {

    //             let precoCustoEmUSDT = 0, // comprando em BTC
    //                 apuradoEmUSDT = 0, // vendendo em USDT
    //                 diferenca = 0

    //             if(parseFloat(i.btc.ask > 0))
    //                 precoBTC.pdVd[0].pdVd *  parseFloat(i.btc.ask)

    //             if(parseFloat(i.btc.bid > 0))
    //                 precoCustoEmUSDT = parseFloat(i.btc.bid) * parseFloat(precoBTC.pdCp[0].pdCp)

    //             // console.log(i.btc.symbol +  ' pdCp - BTC: ' + i.btc.bid + ' pdVd: ' + i.btc.ask)
    //             // console.log(i.btc.symbol + ' precoCustoEmUSDT: ' + precoCustoEmUSDT + ' apurado Em USDT: ' + apuradoEmUSDT)
    //             // console.log(moeda + ' apuradoEmUSDT: ' + apuradoEmUSDT)
                
    //             //COMPRAR EM BTC
    //             if(precoCustoEmUSDT > 0)
    //                 diferenca = (i.usdt.bid - precoCustoEmUSDT) / precoCustoEmUSDT * 100

                
    //             if(diferenca > 0)
    //                 console.log(i.btc.symbol + ' diferença comprandom em BTC e vendendo em USDT com lucro de: ' + diferenca)

    //             if(diferenca > 0.5)
    //             {
    //                 j.push(
    //                     {
    //                        symbol: i.btc.symbol, exc: 'Binance', pdVd: i.btc.ask, pdCp: i.usdt.bid, cpEm: 'BTC', vdEm: 'USDT',
    //                        lucro: diferenca
    //                     })

    //                 // console.log(`Comprar ${i.btc.symbol} com BTC por ${i.btc.ask} e vender por ${i.usdt.bid} USDT com lucro de ${diferenca}`)
    //             }    
                
    //             //COMPRAR EM USDT
    //             if(apuradoEmUSDT > 0)
    //                 diferenca =  ((apuradoEmUSDT - i.usdt.ask) / i.usdt.ask) * 100

    //             if(diferenca > 0.5)
    //             {
    //                 j.push(
    //                     {
    //                        symbol: i.usdt.symbol, exc: 'Binance', pdVd: i.usdt.ask, pdCp: i.btc.bid, cpEm: 'USDT', vdEm: 'BTC',
    //                        lucro: diferenca
    //                     })

    //                 // console.log(`Comprar ${i.usdt.symbol} com USDT por ${i.usdt.ask} e vender por ${i.btc.bid} BTC com lucro de ${diferenca}`)
    //             }

    //             if(diferenca > 0)
    //                 console.log(i.usdt.symbol + ' diferença comprandom em USDT e vendendo em BTC: ' + diferenca)

    //         }
    //     }
    //     catch (erro)
    //     {
    //         console.error('Erro ao verificar arbitragem:', erro)
    //     }

    //     return j
    // }

    // async obterPrecoBTC()
    // {
    //     let pdCp = [],
    //         pdVd = []
            
    //     try
    //     {
    //         const response = await fetch('https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=1')

    //         if (!response.ok)
    //         {
    //             throw new Error(`Erro HTTP: ${response.status}`)
    //         }

    //         const dados = await response.json()
            
    //         pdVd.push({ pdVd: dados.asks[0][0], qtde: dados.asks[0][1] })

    //         pdCp.push({ pdCp: dados.bids[0][0], qtde: dados.bids[0][1] })


    //         // console.log('ETH em USDT: ' +  ' pdCp: ' + pdCp[0].pdCp , ' -> ' + ' qtde: ' + pdCp[0].qtde + ' PdVd: ' +  pdVd[0].pdVd, ' qtde ->', pdVd[0].qtde)
    //         // console.log(pdVd[0].side , ' -> ',  pdVd[0].pdVd, ' qtde ->', pdVd[0].qtde)
            

    //     }
    //     catch (erro)
    //     {
    //         console.error(`Erro ao buscar preço para BTC`, erro)
    //     }

    //     return { pdVd, pdCp }
    // }

    // async symbolsUSDT_BTC()
    // {
    //     try
    //     {
    //         const dados = await this.bookTicker()

    //         if(dados)
    //         {
    //             const MoedasMap = new Map()

    //             dados.forEach((par) =>
    //             {
    //                 const [moeda, cotacao] = par.s.endsWith('USDT') ? [par.s.slice(0, -4), 'USDT'] : par.s.endsWith('BTC') ? [par.s.slice(0, -3), 'BTC'] : [null, null]

    //                 if (cotacao === 'USDT' || cotacao === 'BTC')
    //                 {
    //                     if (!MoedasMap.has(moeda))
    //                     {
    //                         MoedasMap.set(moeda, {})
    //                     }
    //                     MoedasMap.get(moeda)[cotacao] = {
    //                         symbol: par.s,
    //                         bid: par.b,
    //                         ask: par.a,
    //                         bidQty: par.bQ,
    //                         askQty: par.aQ
    //                     }
    //                 }
    //             })

    //             const moedasFiltradas = []
    //             MoedasMap.forEach((cotacoes, moeda) =>
    //             {
    //                 if (cotacoes.USDT && cotacoes.BTC)
    //                 {
    //                     moedasFiltradas.push({
    //                         moeda,
    //                         usdt: cotacoes.USDT,
    //                         btc: cotacoes.BTC
    //                     })
    //                 }
    //             })

    //             // console.log('Moedas negociadas em BTC / USDT na Binance:', moedasFiltradas)

    //             return moedasFiltradas
    //         }
    //         else
    //         {
    //             console.warn('Resposta inesperada da API:', dados)
    //             return []
    //         }
    //     }
    //     catch (erro)
    //     {
    //         console.error('Erro ao buscar os dados:', erro)
    //         return []
    //     }
    // }


    // async obterPreco(symbol)
    // {
    //     let pdCp = [],
    //         pdVd = []
           
    //     try
    //     {
    //         // Aguarda um pequeno delay para evitar erro 429 (Too Many Requests)
    //         const response = await fetch('https://api.binance.com/api/v3/depth?symbol=' + symbol + '&limit=1')

    //         if (!response.ok)
    //         {
    //             throw new Error(`Erro HTTP: ${response.status}`)
    //         }

    //         const dados = await response.json()
            
    //         // console.log('bid[0] BTC_USDT: ' + dados.bids[0].price)
                
    //         pdVd.push({ pdVd: dados.asks[0][0], qtde: dados.asks[0][1] })

    //         pdCp.push({ pdCp: dados.bids[0][0], qtde: dados.bids[0][1] })

    //         console.log(symbol + ' pdCp: ', pdCp[0].pdCp, ' qtde ->', pdCp[0].qtde + ' pdVd: ', pdVd[0].pdVd +
    //              ' qtde ->', pdVd[0].qtde
    //         )

    //     }
    //     catch (erro)
    //     {
    //         console.error(`Erro ao buscar preço para ${symbol}:`, erro)
    //     }

    //     return { pdVd, pdCp }
    // }

    // async bookTicker()
    // {
    //     const url = await fetch('https://api.binance.com/api/v3/ticker/bookTicker')
    //     let p = await url.json(),
    //         symbols = []
        
    //     for(let i in p)
    //         symbols.push({ s: p[i].symbol, b: p[i].bidPrice, a: p[i].askPrice, bQ: p[i].bidQty, aQ: p[i].askQty })

    //     // console.log('symbols', symbols)

    //     return symbols
    // }

}
