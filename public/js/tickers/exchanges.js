

export class Exchanges
{

    constructor()
    {
        this.eventEmitter = new EventTarget() // Inicializa o eventEmitter        
    }

    async api_mexc()
    {
        let api_url = await fetch('https://api.mexc.com/api/v3/exchangeInfo'),
            json = await api_url.json()

            return json
    }

    async ob_mexc(par_moeda)
    {
        let api_url = await fetch('https://api.mexc.com/api/v3/depth?symbol=' + par_moeda),
            json = await api_url.json()

        return json
    }

    async ob_fmfw(par_moeda)
    {
        let api_url = await fetch('https://api.fmfw.io/api/3/public/orderbook/' + par_moeda),
            json = await api_url.json()

        return json
    }

    async ob_binance(par_moeda)
    {
        let api_url = await fetch('https://api.binance.com/api/v3/depth?symbol=' + par_moeda + '&limit=5'),
            json = await api_url.json()

        return json
    }

    async ob_gate(par_moeda)
    {
        let api_url = await fetch('https://api.gateio.ws/api/v4/spot/order_book?currency_pair=' + par_moeda),
            json = await api_url.json()

        return json
    }

    // async tickers_poloniex()
    // {
    //     let api_url = await fetch('https://api.poloniex.com/markets/ticker24h'),
    //         t = await api_url.json(),
    //         lf = [],
    //         depret = await this.depret.poloniex()
 
    //      //    console.log('ativos na pol: ' + depret)
 
    //         for(let i in t)
    //         {
    //             for(let j in depret)
    //             {
    //                 if(t[i].symbol == depret[j])
    //                  lf.push({ s: t[i].symbol, a: t[i].ask, b: t[i].bid, A: t[i].askQuantity, B: t[i].bidQuantity })   
    //             }
    //         }
 
    //         for(let i in lf)
    //            lf[i].s =  lf[i].s.replace('_', '')
 
           
    //      //   k = Object.keys(json),
    //      //   v = Object.values(json)
 
    //      // for(let i in lf)
    //      //     console.log('LF - Poloniex: ' + lf[i].s)
         
    //     return lf
    // }
    async ob_kraken(par_moeda)
    {
        let api_url = await fetch('https://api.kraken.com/0/public/Depth?pair=' + par_moeda),
            json = await api_url.json()

        return json.result
    }

   async dados_gate()
   {
      let symbols = await fetch('https://api.gateio.ws/api/v4/spot/currency_pairs'),
          json = await symbols.json()

      return json
   }

//    async dados_kucoin()
//    {
//       let api_url = await fetch('https://api.kucoin.com/api/v1/currencies'),
//           json = await api_url.json(),
//           data = json.data,
//           symbols = []

//       for(let i in data)
//       {
//          if(data[i].isWithdrawEnabled && data[i].isDepositEnabled)
//             symbols.push(data[i].currency)
//       }    

//       return symbols
//    }

//    async ob_kucoin(par_moeda)
//    {
//       let api_url = await fetch('https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=' + par_moeda),
//           json = await api_url.json()

//       return json.data
//    }

//    async tickers_nonkyc()
//    {
//         let t_url = await fetch('https://api.nonkyc.io/api/v2/tickers'),
//             t = await t_url.json(),
//             lf = [] // LISTA FINAL
            
//             const k = 1000
//          // t = this.funcS.eliminarRepetidos(t, 'ticker_id')
         
//          for(let i in t)
//          {
//              lf.push(
//                  {
//                      s: t[i].ticker_id, a: t[i].ask, b: t[i].bid
//                  })
//          }
 
//          for(let i in lf)
//              lf[i].s = lf[i].s.replace('_', '')
 
//         this.emitEvent('tickers_nonkyc', lf) 

//         setTimeout(() => this.tickers_nonkyc(), 5 * k) // chamada recursiva a cada 10 segundos

//         return lf
//     }

    // async tickers_biconomy()
    // {
    //     let t_url = await fetch('https://www.biconomy.com/api/v1/tickers'),
    //         json = await t_url.json(),
    //         t = json.ticker,
    //         lf = [] // LISTA FINAL
            
    //      // t = this.funcS.eliminarRepetidos(t, 'ticker_id')

    //      for(let i in t)
    //      {
    //          lf.push(
    //              {
    //                  s: t[i].symbol, a: t[i].sell, b: t[i].buy
    //              })
    //      }
 
    //      for(let i in lf)
    //          lf[i].s = lf[i].s.replace('_', '')


    //     //   for(let i in lf)
    //     //     console.log(lf[i].s + ' a: ' + lf[i].a + + ' b: ' + lf[i].b + ' Biconomy')
    //     //  console.log('Total pares da Biconomy: ' + lf.length)
 
    //     return lf
    // }
   
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