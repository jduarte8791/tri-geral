import { Funcoes } from '../Funcoes.js'

export class Xeggex 
{
    constructor()
    {
        this.fun = new Funcoes()
        this.tentativasMaximas = 3
        this.tempoBaseRequisicao = 3000 // 1 segund
    }

    async fazerRequisicaoComRetry(url, tentativa = 1) 
    {
        try 
        {
            const resposta = await fetch(url)
            
            if (!resposta.ok) 
            {
                if (resposta.status === 429 && tentativa <= this.tentativasMaximas) 
                {
                    const tempoEspera = this.tempoBaseRequisicao * Math.pow(2, tentativa - 1)
                    console.log(`Tentativa ${tentativa} - Aguardando ${tempoEspera}ms...`)
                    await new Promise(resolve => setTimeout(resolve, tempoEspera))
                    return this.fazerRequisicaoComRetry(url, tentativa + 1)
                }
                throw new Error(`Erro HTTP: ${resposta.status}`)
            }
            
            return resposta.json()
        } 
        catch (error) 
        {
            console.error(`Falha na tentativa ${tentativa}:`, error)
            if (tentativa < this.tentativasMaximas) 
            {
                const tempoEspera = this.tempoBaseRequisicao * Math.pow(2, tentativa - 1)
                await new Promise(resolve => setTimeout(resolve, tempoEspera))
                return this.fazerRequisicaoComRetry(url, tentativa + 1)
            }
            throw error
        }
    }

    async tickers_xeggex() 
    {
        try 
        {
            const t = await this.fazerRequisicaoComRetry('https://api.xeggex.com/api/v2/tickers')
            const lf = []

            // Processamento dos dados (mantendo sua lógica original)
            const dadosUnicos = this.fun.eliminarRepetidos(t, 'ticker_id')

            for (let i in dadosUnicos) 
            {
                lf.push({
                    s: dadosUnicos[i].ticker_id.replace('_', ''),
                    a: dadosUnicos[i].ask,
                    b: dadosUnicos[i].bid,
                    exchange: 'Xeggex' // Adicionando identificador da exchange
                })
            }

            return lf
        } 
        catch (error) 
        {
            console.error('Falha ao obter tickers da Xeggex:', error)
            return [] // Retorna array vazio em caso de falha
        }
    }
    
    async xeggexUsdtBtc()
    {
        let jEmBtc = [], // JANELAS COM USO DA FUNÇÃO
            jEmUsdt = [], // JANELAS COM USO DA FUNÇÃO
            j  = [], // JANELAS

            t = await this.tickers_xeggex() // TICKERS

            //BUSCA AS janelasMexc CASO EXISTA
            for(let i = 0; i < t.length; i++)
            {
               let  btcUsdtPdCp =  t[i].btcUsdtPdCp,
                    btcUsdtPdVd = t[i].btcUsdtPdVd,
                    
                    pdCpMoBtc = t[i].b_btc,
                    pdVdMoBtc = t[i].a_btc,
                    pdCpMoUsdt = t[i].b_usdt,
                    pdVdMoUsdt = t[i].a_usdt,

                    volPdCpMoBtc = '',
                    volPdVdMoBtc = '',
        
                    volPdCpMoUsdt = '',
                    volPdVdMoUsdt = ''

               //LUCRO COMPRANDO EM USDT 
               jEmUsdt = this.funcS.arbitCpEmUsdt(t[i].par_usdt, pdVdMoUsdt, volPdVdMoUsdt, pdCpMoBtc, volPdCpMoBtc, btcUsdtPdCp)

               if(jEmUsdt.length > 0)
               {
                   if(j.length == 0)
                   {
                        j.push(
                        {
                           symbol: jEmUsdt[0].symbol, exc: 'Xeggex', pdVd: jEmUsdt[0].pdVd, volPdVd: jEmUsdt[0].volPdVd,
                           pdCp: jEmUsdt[0].pdCp, volPdCp: jEmUsdt[0].volPdCp, cpEm: 'USDT', vdEm: 'BTC', lucro: jEmUsdt[0].lucro
                        }) 
                   }

                   if(j.length >= 1)
                   {
                       let existe = false;

                       for(let i in j)
                       {
                           if(j[i].symbol == jEmUsdt[0].symbol)
                           existe = true;
                       }
                       
                       if(!existe)
                       {
                           j.push(
                           {
                               symbol: jEmUsdt[0].symbol, exc: 'Xeggex', pdVd: jEmUsdt[0].pdVd, volPdVd: jEmUsdt[0].volPdVd,
                               pdCp: jEmUsdt[0].pdCp, volPdCp: jEmUsdt[0].volPdCp, cpEm: 'USDT', vdEm: 'BTC', lucro: jEmUsdt[0].lucro
                           })   
                       }
                   }
               }
                 
               //LUCRO COMPRANDO EM BTC
                jEmBtc = this.funcS.arbitCpEmBtc(t[i].par_btc, pdVdMoBtc, volPdVdMoBtc, pdCpMoUsdt, volPdCpMoUsdt, btcUsdtPdVd)
                
                if(jEmBtc.length > 0)
                {
                    // console.log('jEmBtc: ' + jEmBtc.length)
                    if(j.length == 0)
                    {
                        j.push(
                        {
                            symbol: jEmBtc[0].symbol, exc: 'Xeggex', pdVd: jEmBtc[0].pdVd, volPdVd: jEmBtc[0].volPdVd,
                            pdCp: jEmBtc[0].pdCp, volPdCp: jEmBtc[0].volPdCp,  cpEm: 'BTC', vdEm: 'USDT', lucro: jEmBtc[0].lucro
                        }) 
                    }

                    if(j.length >= 1) // CÓDIGO PARA EVITAR O BUG DE DUPLICAR O ATIVO NA LISTA
                    {
                        let existe = false;
                        for(let i in j)
                        {
                            if(j[i].symbol == jEmBtc[0].symbol)
                            existe = true;
                        }

                        if(!existe)
                        {
                            j.push(
                            {
                                symbol: jEmBtc[0].symbol, exc: 'Xeggex', pdVd: jEmBtc[0].pdVd, volPdVd: jEmBtc[0].volPdVd,
                                pdCp: jEmBtc[0].pdCp, volPdCp: jEmBtc[0].volPdCp,  cpEm: 'BTC', vdEm: 'USDT', lucro: jEmBtc[0].lucro
                            }) 
                        }

                    }                    
                }

            //    this.funcS.testeEmBTC(t[i].par_btc, pdVdMoBtc, pdCpMoUsdt, btcUsdtPdVd)
            //    this.funcS.testeEmUsdt(t[i].par_usdt, pdVdMoUsdt, pdCpMoBtc, btcUsdtPdCp)

            }

            // if(j.length > 0)
            // {
            //     for(let i in j)
            //         console.log('Compre ' + j[i].symbol + ' pdVd: ' + j[i].pdVd + 
            //         ' pdCp: ' + j[i].pdCp + ' lucro: ' + j[i].lucro + ' na XEGGEX')
            // }
            
         return j
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
