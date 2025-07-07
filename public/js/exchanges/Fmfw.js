import { Funcoes } from '../Funcoes.js'

export class Fmfw 
{
    constructor()
    {
        this.fun = new Funcoes()

        // this.baseUrl = 'https://api.binance.com/api'

    }

    async verTriUsdtBTC()
    {
        let precoBTC = await this.obterPrecoBtc(),
            j = []
        try
        {
            const pares = await this.symbolsUSDT_BTC()

            // console.log('FMFW pares: ', pares)

            if (!pares.length)
            {
                console.warn('Nenhuma moeda disponível para arbitragem')
                return
            }

            for (let i in pares)
            {
                // console.log('FMFW pares: ', pares)

                const pdCpVdUSDT = await this.obterPrecoSymbol(`${pares[i].s_usdt}`)
                const pdCpVdBTC = await this.obterPrecoSymbol(`${pares[i].s_btc}`)
                
                let precoCustoEmUSDT = precoBTC[0]?.a * pdCpVdBTC[0]?.a // comprando em BTC
                let apuradoEmUSDT = pdCpVdBTC[0]?.b * precoBTC[0]?.b // vendendo em USDT

                // console.log(moeda + ' pdCpBTC -> ' + pdCpBTC.pdCp[0].pdCp + ' pdVdBTC: ' + pdVdBTC.pdVd[0].pdVd)
                // console.log(pares[i].usdt.s + ' pdVdUSDT: ' + pdCpVdUSDT[0].a + ' pdCpBTC: ', pdCpVdBTC[0].b)

               

                // console.log(moeda +  ' pdCp - BTC: ' + pdCpBTC.pdCp[0].pdCp + ' pdVd: ' + pdVdBTC.pdVd[0].pdVd)
                // console.log(moeda + ' apuradoEmUSDT: ' + apuradoEmUSDT)
                // console.log(moeda + ' precoCustoEmUSDT: ' + precoCustoEmUSDT)
                // console.log('pdVd BTC: ' + precoBTC.pdVd[0].pdVd + ' pdCp BTC:'  + precoBTC.pdCp[0].pdCp)
                
                //COMPRAR EM BTC
                let diferencaCpBTC = (pdCpVdUSDT[0].b - precoCustoEmUSDT) / precoCustoEmUSDT * 100

                // console.log(pares[i].btc.s + ' diferença comprandom em BTC: ' + diferencaCpBTC)

                if(diferencaCpBTC > 1)
                {
                    j.push(
                        {
                           symbol: pares[i].s_btc, exc: 'FMFW', pdVd: pdCpVdBTC[0].a, volPdVd: pdCpVdBTC[0].aQ,
                           pdCp: pdCpVdUSDT[0].b, volPdCp: pdCpVdUSDT[0].bQ, cpEm: 'BTC', vdEm: 'USDT',lucro: diferencaCpBTC
                        })

                    console.log(`Comprar ${pares[i].s_usdt} com BTC por ${pdCpVdBTC[0].a} vol comprar ${pdCpVdBTC[0].aQ}
                         e vender por ${pdCpVdUSDT[0].b} USDT vol Vender ${pdCpVdUSDT[0].bQ} na FMFW lucro de: ${diferencaCpBTC}`)
                }    
                
                //COMPRAR EM USDT
                let diferencaCpUSDT =  ((apuradoEmUSDT - pdCpVdUSDT[0].a) / pdCpVdUSDT[0].a) * 100

                if(diferencaCpUSDT > 1)
                {
                    j.push(
                        {
                           symbol: pares[i].s_usdt, exc: 'FMFW', pdVd: pdCpVdUSDT[0].a, volPdVd: pdCpVdUSDT[0].aQ,
                           pdCp: pdCpVdBTC[0].b, volPdCp: pdCpVdBTC[0].bQ, cpEm: 'USDT', vdEm: 'BTC', lucro: diferencaCpUSDT
                        })

                    console.log(`Comprar ${pares[i].s_usdt} com USDT por ${pdCpVdUSDT[0].a} vol compra: ${pdCpVdUSDT[0].aQ}
                         e vender por ${pdCpVdBTC[0].pdCp} BTC vol vender: ${pdCpVdBTC[0].bQ} ${diferencaCpUSDT} 
                         na FMFW lucro de: ${diferencaCpUSDT}`)
                }

                // if(diferencaCpUSDT > 1)
                //     console.log(pares[i].usdt.s + ' diferença comprandom em USDT: ' + diferencaCpUSDT)

            }
        }
        catch (erro)
        {
            console.error('Erro ao verificar arbitragem:', erro)
        }

        return j
    }

    async obterPrecoSymbol(symbol)
    {
        const precos = []
        const url = `https://api.fmfw.io/api/3/public/orderbook/${symbol}`

        await new Promise(resolve => setTimeout(resolve, 500))

        return new Promise(resolve => 
        {
            this.fun.addEventListener(url, resultado => 
            {
                if (resultado.sucesso) 
                {
                    const d = resultado.dados

                    if(d.ask?.[0] && d.bid?.[0]) 
                    {
                        precos.push(
                        {
                            a: d.ask[0][0],
                            aQ: d.ask[0][1],
                            b: d.bid[0][0],
                            bQ: d.bid[0][1]
                        })
                    } 
                    else 
                    {
                        // console.warn(`Dados incompletos ou inválidos para ${symbol}:`, d)
                    }
                } 
                else 
                {
                    console.error(`Erro ao buscar preço para ${symbol}:`, resultado.erro)
                }

                resolve(precos)
            })

            this.fun.fazerRequisicaoComRetry(url)
        })
    }
    
    async symbolsUSDT_BTC() 
    {
        let url = 'https://api.fmfw.io/api/3/public/ticker',
            symbols = await this.fun.symbolsUSDT_BTC(url)

        // console.log('FMFW symbols:', symbols)
    
        return symbols
    }

    async obterPrecoBtc()
    {
        const precos = []
        const url = 'https://api.fmfw.io/api/3/public/orderbook/BTCUSDT'

        return new Promise(resolve => 
        {
            this.fun.addEventListener(url, resultado => 
            {
                // console.log('resultado FMFW: ', resultado)
                if (resultado.sucesso) 
                {
                    const d = resultado.dados

                    precos.push(
                    {
                        a: d.ask[0][0],
                        aQ: d.ask[0][1],
                        b: d.bid[0][0],
                        bQ: d.bid[0][1]
                    })

                    // console.log('Preços do BTC na FMFW:', precos)
                } 
                else 
                {
                    console.error(`Erro ao buscar preço para BTC`, resultado.erro)
                }

                resolve(precos)
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
