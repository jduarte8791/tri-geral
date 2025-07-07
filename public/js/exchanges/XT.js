import { Funcoes } from '../Funcoes.js'

export class Xt    
{
    constructor()
    {
        this.fun = new Funcoes()
        this.pares = [] // Lista de pares de moedas para arbitragem
    }

  async verTriUsdtBTCEth()
    {
        let precoBTC = await this.obterPrecoSymbol('btc_usdt'),
            precoETH = await this.obterPrecoSymbol('eth_usdt'),
            j = []

        try
        {
            if (this.pares.length == 0)
            {
                this.pares = await this.symbolsUsdtBtcEth()
            }

            if (!this.pares.length)
            {
                console.warn('Nenhuma moeda disponível para arbitragem')
                return
            }

            for (let i in this.pares)
            {
                // Esperado: this.pares[i] tem chaves s_usdt, s_btc, s_eth (ex: eth_usdt, eth_btc, eth_eth)
                const pdCpVdUSDT = await this.obterPrecoSymbol(this.pares[i].s_usdt)
                const pdCpVdBTC  = await this.obterPrecoSymbol(this.pares[i].s_btc)
                const pdCpVdETH  = this.pares[i].s_eth ? await this.obterPrecoSymbol(this.pares[i].s_eth) : null

                if (!precoBTC || !precoETH || !pdCpVdUSDT || !pdCpVdBTC) continue

                // console.log('pdCpVdETH:', JSON.stringify(pdCpVdETH))

                // 1. COMPRAR EM BTC E VENDER EM USDT (original)
                let precoCustoEmUSDT = precoBTC.a * pdCpVdBTC.a // comprando em BTC
                let apuradoEmUSDT = pdCpVdBTC.b * precoBTC.b // vendendo em USDT
                let diferencaCpBTC = (pdCpVdUSDT.b - precoCustoEmUSDT) / precoCustoEmUSDT * 100

                if (diferencaCpBTC > 1)
                {
                    j.push(
                        {
                            symbol: this.pares[i].s_btc,
                            exc: 'XT',
                            pdVd: pdCpVdBTC.a,
                            volPdVd: pdCpVdBTC.aQ,
                            pdCp: pdCpVdUSDT.b,
                            volPdCp: pdCpVdUSDT.bQ,
                            cpEm: 'BTC',
                            vdEm: 'USDT',
                            lucro: diferencaCpBTC
                        })

                      console.log(`Comprar ${this.pares[i].s_usdt} com USDT por ${pdCpVdUSDT.a} vol compra: ${pdCpVdUSDT.aQ}
                        e vender por ${pdCpVdBTC.b} BTC vol vender: ${pdCpVdBTC.bQ} ${diferencaCpUSDT} 
                        na XT lucro de: ${diferencaCpUSDT}`)   
                }

                // 2. COMPRAR EM USDT E VENDER EM BTC (original)
                let diferencaCpUSDT = ((apuradoEmUSDT - pdCpVdUSDT.a) / pdCpVdUSDT.a) * 100

                if (diferencaCpUSDT > 1)
                {
                    j.push(
                        {
                            symbol: this.pares[i].s_usdt,
                            exc: 'XT',
                            pdVd: pdCpVdUSDT.a,
                            volPdVd: pdCpVdUSDT.aQ,
                            pdCp: pdCpVdBTC.b,
                            volPdCp: pdCpVdBTC.bQ,
                            cpEm: 'USDT',
                            vdEm: 'BTC',
                            lucro: diferencaCpUSDT
                        })
                }

                if (pdCpVdETH) {
                    // 3. COMPRAR EM ETH E VENDER EM BTC
                    let precoCustoEmBTC_ETH = precoETH.a * pdCpVdETH.a // comprando em ETH (em USDT) e depois alt em ETH
                    let apuradoEmBTC_ETH = pdCpVdETH.b * precoBTC.b // vendendo alt em BTC e BTC em USDT
                    let diferencaCpETH_BTC = (pdCpVdBTC.b - precoCustoEmBTC_ETH) / precoCustoEmBTC_ETH * 100

                    if (diferencaCpETH_BTC > 1)
                    {
                        j.push(
                            {
                                symbol: this.pares[i].s_eth,
                                exc: 'XT',
                                pdVd: pdCpVdETH.a,
                                volPdVd: pdCpVdETH.aQ,
                                pdCp: pdCpVdBTC.b,
                                volPdCp: pdCpVdBTC.bQ,
                                cpEm: 'ETH',
                                vdEm: 'BTC',
                                lucro: diferencaCpETH_BTC
                            })
                    }

                    // 4. COMPRAR EM BTC E VENDER EM ETH
                    let precoCustoEmETH_BTC = precoBTC.a * pdCpVdBTC.a // compra BTC em USDT e depois alt em BTC
                    let apuradoEmETH_BTC = pdCpVdETH.b * precoETH.b // vende alt em ETH e ETH em USDT
                    let diferencaCpBTC_ETH = (pdCpVdETH.b - precoCustoEmETH_BTC) / precoCustoEmETH_BTC * 100

                    if (diferencaCpBTC_ETH > 1)
                    {
                        j.push(
                            {
                                symbol: this.pares[i].s_btc,
                                exc: 'XT',
                                pdVd: pdCpVdBTC.a,
                                volPdVd: pdCpVdBTC.aQ,
                                pdCp: pdCpVdETH.b,
                                volPdCp: pdCpVdETH.bQ,
                                cpEm: 'BTC',
                                vdEm: 'ETH',
                                lucro: diferencaCpBTC_ETH
                            })
                    }

                    // 5. COMPRAR EM USDT E VENDER EM ETH
                    let precoCustoEmETH_USDT = precoETH.a * pdCpVdETH.a // compra ETH em USDT depois alt em ETH
                    let apuradoEmETH_USDT = pdCpVdETH.b * precoETH.b // vende alt em ETH e ETH em USDT
                    let diferencaCpUSDT_ETH = (apuradoEmETH_USDT - pdCpVdUSDT.a) / pdCpVdUSDT.a * 100

                    if (diferencaCpUSDT_ETH > 1)
                    {
                        j.push(
                            {
                                symbol: this.pares[i].s_eth,
                                exc: 'XT',
                                pdVd: pdCpVdETH.a,
                                volPdVd: pdCpVdETH.aQ,
                                pdCp: pdCpVdUSDT.b,
                                volPdCp: pdCpVdUSDT.bQ,
                                cpEm: 'USDT',
                                vdEm: 'ETH',
                                lucro: diferencaCpUSDT_ETH
                            })
                    }

                    // 6. COMPRAR EM ETH E VENDER EM USDT
                    let precoCustoEmUSDT_ETH = precoETH.a * pdCpVdETH.a // compra ETH em USDT depois alt em ETH
                    let apuradoEmUSDT_ETH = pdCpVdETH.b * precoETH.b // vende alt em ETH e ETH em USDT
                    let diferencaCpETH_USDT = (apuradoEmUSDT_ETH - precoCustoEmUSDT_ETH) / precoCustoEmUSDT_ETH * 100

                    if (diferencaCpETH_USDT > 1)
                    {
                        j.push(
                            {
                                symbol: this.pares[i].s_eth,
                                exc: 'XT',
                                pdVd: pdCpVdETH.a,
                                volPdVd: pdCpVdETH.aQ,
                                pdCp: pdCpVdUSDT.b,
                                volPdCp: pdCpVdUSDT.bQ,
                                cpEm: 'ETH',
                                vdEm: 'USDT',
                                lucro: diferencaCpETH_USDT
                            })
                    }
                }
            }
        }
        catch (erro)
        {
            console.error('Erro ao verificar arbitragem:', erro)
        }

        return j
    }

    async symbolsUsdtBtcEth()
    {
        const url = 'https://sapi.xt.com/v4/public/ticker/book'
        const res = await fetch(url)
        const dados = await res.json()

        const usdtSet = new Set()
        const btcSet = new Set()
        const ethSet = new Set()

        // O array correto é dados.result, cada item tem s: 'btc_usdt', etc
        for (let par of dados.result)
        {
            if (typeof par.s === 'string')
            {
                const [base, quote] = par.s.split('_')
                if (quote === 'usdt')
                {
                    usdtSet.add(base)
                }
                else if (quote === 'btc')
                {
                    btcSet.add(base)
                }
                else if (quote === 'eth')
                {
                    ethSet.add(base)
                }
            }
        }

        // Moedas negociadas em BTC e USDT
        const btc_usdt = []
        for (const moeda of usdtSet)
        {
            if (btcSet.has(moeda))
            {
                btc_usdt.push(moeda)
            }
        }

        // console.log('Moedas negociadas em BTC e USDT:', btc_usdt)

        // Moedas negociadas em ETH e USDT
        const eth_usdt = []
        for (const moeda of usdtSet)
        {
            if (ethSet.has(moeda))
            {
                eth_usdt.push(moeda)
            }
        }

        // console.log('Moedas negociadas em ETH e USDT:', eth_usdt)

        // Moedas negociadas em ETH e BTC
        const eth_btc = []
        for (const moeda of btcSet)
        {
            if (ethSet.has(moeda))
            {
                eth_btc.push(moeda)
            }
        }

        // console.log('Moedas negociadas em ETH e BTC:', eth_btc)

        // Monta objeto resultado no mesmo padrão anterior
        const resultado = []
        for (const moeda of usdtSet)
        {
            if (btcSet.has(moeda))
            {
                resultado.push({ s_btc: `${moeda}_btc`, s_usdt: `${moeda}_usdt` })
            }
            else if (ethSet.has(moeda))
            {
                resultado.push({ s_eth: `${moeda}_eth`, s_usdt: `${moeda}_usdt` })
            }
        }

        // for(let i in resultado)
        //     console.log('Moedas negociadas em ETH / BTC / USDT: ' + resultado[i].s_btc + ' s_eth : ' + resultado[i].s_eth +
        // ' s_udt: ' + resultado[i].s_usdt)


        return resultado
    }

    async obterPrecoSymbol(symbol)
    {
        // Supondo que symbol já está no formato correto para a XT: ex: btc_usdt, eth_usdt, etc.
        const url = `http://localhost:3001/xt/preco/${symbol}`

        try
        {
            const res = await fetch(url)
            if (!res.ok)
            {
                throw new Error(`Erro ao buscar preço para ${symbol}: status ${res.status}`)
            }

            const resultado = await res.json()
            const d = resultado.preco

            if (!d || typeof d.a === 'undefined' || typeof d.b === 'undefined')
            {
                throw new Error(`Orderbook vazio para ${symbol}`)
            }

            return {
                a: d.a,
                aQ: d.aQ,
                b: d.b,
                bQ: d.bQ
            }
        }
        catch (erro)
        {
            console.error(`Erro ao buscar preço para ${symbol}:`, erro.message)
            return null
        }
    }

    async obterPrecoBtc()
    {
        const url = 'http://localhost:3001/xt/preco/btc_usdt'

        try
        {
            const res = await fetch(url)
            if (!res.ok)
            {
                throw new Error('Erro ao buscar preço do BTC na XT')
            }

            const resultado = await res.json()

            if (!resultado || resultado.length === 0)
            {
                throw new Error('Resultado vazio ao buscar preço do BTC na XT')
            }

            const d = resultado.preco

            const preco = 
            {
                a: parseFloat(d.a),   // ask price
                aQ: parseFloat(d.aQ),  // ask quantity
                b: parseFloat(d.b),   // bid price
                bQ: parseFloat(d.bQ)   // bid quantity
            }

            // Opcional: log para debug
            console.log('Preços do BTC na XT:', preco)

            return preco
        }
        catch (erro)
        {
            console.error('Erro ao buscar preço do BTC na XT:', erro.message)
            return null
        }
    }

    // async obterPrecoBtc()
    // {
    //     const precos = []
    //     const url = 'https://sapi.xt.com/v4/public/ticker/book?symbol=btc_usdt'

    //     return new Promise(resolve => 
    //     {
    //         this.fun.addEventListener(url, resultado => 
    //         {
    //             // console.log('evento recebido: ', resultado)
    //             if (resultado.sucesso) 
    //             {
    //                 const d = resultado.dados.result

    //                 // console.log('Dados obtidos da XT:', d)

    //                 precos.push(
    //                 {
    //                     a: d[0].ap,
    //                     aQ: d[0].aq,
    //                     b: d[0].bp,
    //                     bQ: d[0].bq
    //                 })

    //                 console.log('Preços do BTC na XT:', precos)
    //             } 
    //             else 
    //             {
    //                 console.error(`Erro ao buscar preço para BTC`, resultado.erro)
    //             }

    //             resolve(precos)
    //         })

    //         this.fun.fazerRequisicaoComRetry(url)
    //     })
    // }

    async tickers()
    {
        const url = 'https://api.latoken.com/v2/ticker'

        return new Promise(resolve => 
        {
            this.fun.addEventListener(url, resultado => 
            {
                if (resultado.sucesso) 
                {
                    const r = resultado.dados
                    const lf = []

                    for (let i in r)
                        lf.push({ s: r[i].symbol, a: r[i].bestAsk, b: r[i].bestBid, B: r[i].bestBidQuantity, A: r[i].bestAskQuantity })

                    // console.log('Dados obtidos da Latoken:', lf)

                    resolve(lf)
                } 
                else 
                {
                    console.error('Erro ao buscar os dados:', resultado.erro)
                    resolve([])
                }
            })

            this.fun.fazerRequisicaoComRetry(url)
        })
    }
}   