import { Funcoes } from '../Funcoes.js'

export class NonKyc 
{
    constructor()
    {
        this.fun = new Funcoes()
    }

    async verTriUsdtBTC()
    {
        let precoBTC = await this.obterPrecoBtc(),
            j = []
        try
        {
            const pares = await this.symbolsUSDT_BTC()

            // console.log('pares: ', pares)

            if (!pares.length)
            {
                console.warn('Nenhuma moeda disponível para arbitragem')
                return
            }

            for (let i in pares)
            {
                let apuradoEmUSDT = 0,
                    precoCustoEmUSDT = 0


                await new Promise(resolve => setTimeout(resolve, 300))

                const pdCpVdUSDT = await this.obterPrecoSymbol(`${pares[i].usdt.s}`) //pedra de comra
                const pdCpVdBTC = await this.obterPrecoSymbol(`${pares[i].btc.s}`) // pedra de compra

                // console.log(moeda + ' pdCpBTC -> ' + pdCpBTC.pdCp[0].pdCp + ' pdVdBTC: ' + pdVdBTC.pdVd[0].pdVd)
                // console.log(pares[i].usdt.s + ' pdVdUSDT: ' + pdCpVdUSDT[0].a + ' pdCpBTC: ', pdCpVdBTC[0].b)

                if (!pdCpVdUSDT.length || !pdCpVdBTC.length)
                {
                    console.warn(`Pulando ${pares[i].usdt.s} ou ${pares[i].btc.s} por falta de book válido`)
                    continue
                }

                if(pdCpVdBTC[0].a > 0)
                    precoCustoEmUSDT = precoBTC[0].a * pdCpVdBTC[0].a // comprando em BTC

                if(pdCpVdBTC[0].b > 0)
                    apuradoEmUSDT = pdCpVdBTC[0].b * precoBTC[0].b // vendendo em USDT

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
                           symbol: pares[i].btc.s, exc: 'NonKyc', pdVd: pdCpVdBTC[0].a, volPdVd: pdCpVdBTC[0].aQ,
                           pdCp: pdCpVdUSDT[0].b, volPdCp: pdCpVdUSDT[0].bQ, cpEm: 'BTC', vdEm: 'USDT',lucro: diferencaCpBTC
                        })

                    console.log(`Comprar ${pares[i].btc.s} com BTC por ${pdCpVdBTC[0].a} vol comprar ${pdCpVdBTC[0].aQ}
                         e vender por ${pdCpVdUSDT[0].b} USDT vol Vender ${pdCpVdUSDT[0].bQ} na NonKyc lucro de: ${diferencaCpBTC}`)
                }    
                
                //COMPRAR EM USDT
                let diferencaCpUSDT =  ((apuradoEmUSDT - pdCpVdUSDT[0].a) / pdCpVdUSDT[0].a) * 100

                if(diferencaCpUSDT > 1)
                {
                    j.push(
                        {
                           symbol: pares[i].usdt.s, exc: 'NonKyc', pdVd: pdCpVdUSDT[0].a, volPdVd: pdCpVdUSDT[0].aQ,
                           pdCp: pdCpVdBTC[0].b, volPdCp: pdCpVdBTC[0].bQ, cpEm: 'USDT', vdEm: 'BTC', lucro: diferencaCpUSDT
                        })

                    console.log(`Comprar ${pares[i].usdt.s} com USDT por ${pdCpVdUSDT[0].a} vol compra: ${pdCpVdUSDT[0].aQ}
                         e vender por ${pdCpVdBTC[0].b} BTC vol vender: ${pdCpVdBTC[0].bQ} ${diferencaCpUSDT} 
                         na NonKyc lucro de: ${diferencaCpUSDT}`)
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

    async symbolsUSDT_BTC()
    {
        try
        {
            const dados = await this.tickers()

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
                            s: par.s
                        
                        }
                    }
                })

                const moedasFiltradas = []
                MoedasMap.forEach((cotacoes, moeda) =>
                {
                    if (cotacoes.USDT && cotacoes.BTC)
                    {
                        moedasFiltradas.push({
                            usdt: cotacoes.USDT,
                            btc: cotacoes.BTC
                        })
                    }
                })

                // console.log('Moedas negociadas em BTC / USDT na Nonkyc:', moedasFiltradas)

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

    async obterPrecoSymbol(symbol = '')
    {
        const precos = []
        // const url = `https://api.nonkyc.io/api/v2/market/getorderbookbysymbol/${symbol}`
        let url = await fetch(`http://localhost:3001/nonkyc/preco?symbol=${symbol}`),
            d = await url.json()

        return d.precos
        
        
        // await new Promise(resolve => setTimeout(resolve, 1000))

        // return new Promise(resolve => 
        // {
        //     this.fun.addEventListener(url, resultado => 
        //     {
        //         if (resultado.sucesso) 
        //         {
        //             const d = resultado.dados

        //             precos.push(
        //             {
        //                 a: d.asks[0].price,
        //                 aQ: d.asks[0].quantity,
        //                 b: d.bids[0].price,
        //                 bQ: d.bids[0].quantity
        //             })

        //             // console.log(`Preços do ${symbol} na NonKyc:`, precos)
        //         } 
        //         else 
        //         {
        //             console.error(`Erro ao buscar preço para ${symbol}:`, resultado.erro)
        //         }

        //         resolve(precos)
        //     })

        //     this.fun.fazerRequisicaoComRetry(url)
        // })
    }

    async precoSymbol(symbol = '')
    {
        const precos = []
        let url = await fetch(`https://api.nonkyc.io/api/v2/market/getorderbookbysymbol/${symbol}`),
            d = await url.json()

        if(d.asks && d.asks.length > 0 && d.bids && d.bids.length > 0)
        {
            precos.push({a: d.asks[0].price, aQ: d.asks[0].quantity, b: d.bids[0].price, bQ: d.bids[0].quantity })
        }
        else
        {
            console.warn(`Sem book válido para ${symbol}`, d)
        }

        return precos
    }

    async obterPrecoBtc()
    {
        const precos = []
        const url = 'https://api.nonkyc.io/api/v2/market/getorderbookbysymbol/BTC_USDT'

        return new Promise(resolve => 
        {
            this.fun.addEventListener(url, resultado => 
            {
                // console.log('evento recebido: ', resultado)
                if (resultado.sucesso) 
                {
                    const d = resultado.dados

                    precos.push(
                    {
                        a: d.asks[0].price,
                        aQ: d.asks[0].quantity,
                        b: d.bids[0].price,
                        bQ: d.bids[0].quantity
                    })

                    // console.log('Preços do BTC na NonKyc:', precos)
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

    async tickers()
    {
        let url = await fetch('http://localhost:3001/nonkyc/tickers'),
            dados = await url.json()



        return dados.data
        // return new Promise(resolve => 
        // {
        //     this.fun.addEventListener(url, resultado => 
        //     {
        //         if (resultado.sucesso) 
        //         {
        //             const res = resultado.dados
        //             const pares = []

        //             for (let i in res)
        //                 pares.push({ s: res[i].ticker_id })

        //             resolve(pares)
        //         } 
        //         else 
        //         {
        //             console.error('Erro ao buscar os dados:', resultado.erro)
        //             resolve([])
        //         }
        //     })

        //     this.fun.fazerRequisicaoComRetry(url)
        // })
    }
}
