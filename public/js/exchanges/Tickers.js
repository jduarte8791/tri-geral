export class Tickers
{
    constructor()
    {
        this.cache = {}

        // this.listenTradesNonkyc()
    }

    async tickers_xt()
    {
        let precos = await fetch('http://localhost:3003/xt/tickers'),
            lf = await precos.json() // LISTA FINAL

         if (!precos.ok) 
         {
               throw new Error(`Erro ao buscar tickers xt: ${precos.statusText}`);
         }   
        //  console.log('[MEXC - SERVER LOCAL] preços XT obtidos com sucesso:', lf.data)

        return lf.data
    }

    async tickersNonkyc()
    {
        const url = 'https://api.nonkyc.io/api/v2/tickers'

        try
        {
            const response = await fetch(url, 
            {
                headers:
                {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json'
                }
            })

            const text = await response.text()
            if (response.ok)
            {
                const t = JSON.parse(text)
                let pares = []

                for (let i in t)
                    pares.push({ s: t[i].ticker_id })

                this.cache['nonkyc'] = pares

                // console.log('Pares da nonkyc obtidos com sucesso:', pares)
            }
            else
            {
                console.error('Nonkyc status:', response.status, 'Body:', text.substring(0, 200))
            }
        }
        catch (error)
        {
            console.error('Falha ao obter tickers da Nonkyc:', error)
        }
    }

    async tickersXt(intervalo = 5000)
    {
        const urlBook = 'https://sapi.xt.com/v4/public/ticker/book'
        const urlMoedas = 'https://sapi.xt.com/v4/public/wallet/support/currency'

        const fetchAndCache = async () =>
        {
            try
            {
                // Busca book e moedas em paralelo
                const [bookResp, moedasResp] = await Promise.all([
                    fetch(urlBook, {
                        headers: {
                            'User-Agent': 'Chrome/124.0.0.0 Safari/537.36',
                            'Accept': 'application/json'
                        }
                    }),
                    fetch(urlMoedas, {
                        headers: {
                            'User-Agent': 'Chrome/124.0.0.0 Safari/537.36',
                            'Accept': 'application/json'
                        }
                    })
                ])

                const bookJson = await bookResp.json()
                const moedasJson = await moedasResp.json()

                console.log('XT book:', bookJson)

                // 1. Filtra moedas com depósito/saque habilitados
                const moedasValidas = (moedasJson.result || []).filter(m =>
                    m.supportChains?.[0]?.depositEnabled &&
                    m.supportChains?.[0]?.withdrawEnabled
                ).map(m => m.currency.toLowerCase())

                // 2. Cria pares arbitrários (moeda_usdt e moeda_btc)
                const paresPossiveis = []
                for (const moeda of moedasValidas)
                {
                    paresPossiveis.push(`${moeda}_usdt`)
                    paresPossiveis.push(`${moeda}_btc`)
                    paresPossiveis.push(`${moeda}_eth`)
                    paresPossiveis.push(`${moeda}_usdc`)
                }

                // 3. Cria um Set para lookup rápido dos pares possíveis
                const paresSet = new Set(paresPossiveis)

                // 4. Filtra os tickers do book para manter só os que existem nos pares possíveis
                const resultado = []
                for (const t of (bookJson.result || []))
                {
                    if (paresSet.has(t.s))
                    {
                        resultado.push({
                            s: t.s.replace('_', '').toUpperCase(),
                            b: t.bp,
                            a: t.ap,
                            A: t.aq,
                            B: t.bq
                        })
                    }
                }

                this.cache['xt'] = resultado
            }
            catch (error)
            {
                console.error('Falha ao obter tickers da XT:', error)
            }
        }

        await fetchAndCache()
        setInterval(fetchAndCache, intervalo)
    }

   async tickers_nonkyc()
   {
        let precos = await fetch('http://localhost:3003/nonkyc/tickers'),
            lf = await precos.json() // LISTA FINAL

         if (!precos.ok) 
         {
               throw new Error(`Erro ao buscar tickers nonkyc: ${precos.statusText}`);
         }   
         // console.log('[MEXC - SERVER LOCAL] preços Nonkyc obtidos com sucesso:', lf.data)

        return lf.data
   }



//    async tickersProbit(intervalo = 1000)
//     {
//         const url = 'https://api.probit.com/api/exchange/v1/ticker'

//         const fetchAndCache = async () =>
//         {
//             try
//             {
//                 const response = await fetch(url, {
//                     headers: {
//                         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0',
//                         'Accept': 'application/json'
//                     }
//                 })
//                 const text = await response.text()
//                 if (response.ok)
//                 {
//                     const t = JSON.parse(text)
//                     let pares = []
//                     for (let i in t)
//                     {
//                         t[i].ticker_id = t[i].ticker_id.replace('-', '')
//                         pares.push({s: t.data[i].market_id })
//                     }
//                     this.cache['probit'] = pares
//                 }
//                 else
//                 {
//                     console.error('Probit status:', response.status, 'Body:', text.substring(0, 200))
//                 }
//             }
//             catch (error)
//             {
//                 console.error('Falha ao obter tickers da Probit:', error)
//             }
//         }

//         await fetchAndCache()
//         setInterval(fetchAndCache, intervalo)
//     }

//    async tickers_probit()
//    {
//         let precos = await fetch('http://localhost:3003/probit/tickers'),
//             lf = await precos.json() // LISTA FINAL

//          if (!precos.ok) 
//          {
//                throw new Error(`Erro ao buscar tickers probit: ${precos.statusText}`);
//          }   
//          // console.log('[MEXC - SERVER LOCAL] preços Nonkyc obtidos com sucesso:', lf.data)

//         return lf.data
//    }

    async tickers_changellyPro()
    {
        try
        {
            let url = 'https://api.pro.changelly.com/api/3/public/ticker',
                t = await this.fun.fazerRequisicaoComRetry(url),
                pares = []

            const keys = Object.keys(t)
            const values = Object.values(t)

            for(let i in keys)
            {
                if(values[i].bid > 0 && values[i].ask > 0)
                    pares.push({ s: keys[i], b: values[i].bid, a: values[i].ask })
            }
            

            this.emitEvent('tickers_changellyPro', { sucesso: true, dados: pares })

            // for(let i in pares)
            //     console.log('Changelly Pro: ', pares[i].symbol + ' buy: ' + pares[i].buy + ' sell: ' + pares[i].sell)

            // return pares
        }
        catch (error)
        {
            console.error('Falha ao obter tickers da Changelly Pro:', error)
        }
    }


   async tickers_poloniex()
   {
        const symbols = []
        const moedas = await this.depRet.poloniexMoedasHabilitadas()
        const nomesMoedas = moedas.map(m => m.nome)

        try
        {
            const tickers = await this.fun.fazerRequisicaoComRetry('https://api.poloniex.com/markets/ticker24h')

            tickers.forEach(ticker => 
            {
                const [moeda, cotacao] = ticker.symbol.split('_')

                if ((cotacao === 'BTC' || cotacao === 'USDT' || cotacao === 'ETH') && nomesMoedas.includes(moeda))
                {
                    symbols.push({
                        s: ticker.symbol,
                        b: ticker.bid,
                        a: ticker.ask,
                        B: ticker.bidQuantity,
                        A: ticker.askQuantity
                    })
                }
            })
        }
        catch (erro)
        {
            console.error('Erro ao buscar pares com cotações:', erro)
        }

        for(let i in symbols)
        {
            symbols[i].s = symbols[i].s.replace('_', '')
        }   

        // console.log('Pares habilitados para depósito e retirada na Poloniex:', symbols)

        return symbols
    }


    getNonkyc()
    {
        return this.cache['nonkyc'] || []
    }

    getXt()
    {
        return this.cache['xt'] || []
    }   
    
    getProbit()
    {
        return this.cache['probit'] || []
    }   

     // Método para adicionar listeners
    //  emitEvent(eventName, data)
    //  {
    //      const event = new CustomEvent(eventName, { detail: data })
    //      this.eventEmitter.dispatchEvent(event)
    //  }
 
    //  addEventListener(eventName, callback)
    //  {
    //      this.eventEmitter.addEventListener(eventName, (e) => callback(e.detail))
    //  }
}