const localUrl = 'http://localhost:3002/api' // URL base do servidor
const baseUrl = 'https://api.binance.com/api'
const percent = 5

export class Funcoes
{
    constructor()
    {
        this.requisicoesPendentes = {}
        this.tentativasMaximas = 5
        this.tempoBaseRequisicao = 500
        this.eventEmitter = new EventTarget()
    }

    async symbolsUSDT_BTC(url) 
    {
        const res = await fetch(url)
        const dados = await res.json()

        const usdtSet = new Set()
        const btcSet = new Set()
        const ethSet = new Set()

        for (const par in dados)
        {
            if (typeof par === 'string') 
            {
                if (par.endsWith('USDT')) 
                {
                    const base = par.slice(0, -4)
                    usdtSet.add(base)
                }
                else if (par.endsWith('BTC')) 
                {
                    const base = par.slice(0, -3)
                    btcSet.add(base)
                }
                else if (par.endsWith('ETH')) 
                {
                    const base = par.slice(0, -3)
                    ethSet.add(base)
                }
            }
        }

        const resultado = []

        for (const moeda of usdtSet)
        {
            if (btcSet.has(moeda)) 
            {
                resultado.push({ s_btc: moeda + 'BTC', s_usdt: moeda + 'USDT' })
            }
        }

        return resultado
    }

    async fazerRequisicaoComRetry(url, tentativa = 1) 
    {
        if (this.requisicoesPendentes[url]) 
        {
            return // já tem requisição ativa, deixa o listener cuidar
        }

        this.requisicoesPendentes[url] = true

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

            const data = await resposta.json()

            this.emitEvent(url, { sucesso: true, dados: data })
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

            this.emitEvent(url, { sucesso: false, erro: error })
        } 
        
        finally 
        {
            delete this.requisicoesPendentes[url]
        }
    }

    eliminarRepetidos(arr, propriedade)
    {
        const resultado = []
        const valoresUnicos = new Set()
      
        for (let i = 0; i < arr.length; i++) 
        {
          const objeto = arr[i]
          const valorPropriedade = objeto[propriedade]
          const chave = JSON.stringify(valorPropriedade) // Converte o valor da propriedade em uma string para comparação
      
          if(!valoresUnicos.has(chave)) 
          {
             resultado.push(objeto)
             valoresUnicos.add(chave)
          }
        }
      
        return resultado
    }

    async requisicaoComRetry(url, tentativa = 1) 
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

    // Função genérica para realizar requisições HTTP
    async fazerRequisicao(rota, metodo, dados = null)
    {
        try
        {
            const response = await fetch(`${localUrl}${rota}`, 
            {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: dados ? JSON.stringify(dados) : null,
            })

            const resultado = await response.json()
            if (!response.ok) 
            {
                throw new Error(resultado.error || 'Erro ao comunicar com o servidor')
            }

            return resultado
        }
        catch (error)
        {
            console.error('Erro na requisição:', error.message)
            alert('Erro ao processar a solicitação. Verifique os dados e tente novamente.')
            return null
        }
    }

    ondeComprar(symbol, pdVd, volPdVd, pdCp, volPdCp, excPdVd, excPdCp) //Identifica a pedra de Compra e Venda
    {
       let janelas = []
 
       if(pdVd < pdCp && pdVd > 0)
       {
          let lucro = (pdCp - pdVd) / pdVd * 100
          
          if(lucro >= percent)
          {
            janelas.push(
            { 
                symbol: symbol, pdVd: pdVd, volPdVd: volPdVd, pdCp: pdCp, volPdCp: volPdCp, 
                excPdVd: excPdVd, excPdCp: excPdCp, lucro: lucro
            })
         }
       }
 
        return janelas
     }
     
     pdCpVd(mCom = [], exCp = '', exVd = '', exCp2 = '', exVd2 = '') //Identifica a pedra de Compra e Venda
     {
         let pdCpEx1 = 0,
             pdVdEx1 = 0,
             pdCpEx2 = 0,
             pdVdEx2 = 0,
             lucro = 0,
             arrPrintar = [],
             maLucro = 0 //para garantir o maior lucro quando houver
 
         for(let i in mCom)
         {
             pdCpEx1 = mCom[i].pdCpEx1
             pdVdEx1 = mCom[i].pdVdEx1
             pdCpEx2 = mCom[i].pdCpEx2
             pdVdEx2 = mCom[i].pdVdEx2
 
 
             if(pdCpEx1 > pdVdEx2 && pdVdEx2 > 0)
             {
                 lucro = (pdCpEx1 - pdVdEx2) / pdVdEx2 * 100
                 maLucro = lucro
                 if(lucro >= percent)
                 {
                     arrPrintar
                     .push({ symbol: mCom[i].symbol, pdVd: pdVdEx2, pdCp: pdCpEx1, excCp: exCp, excVd: exVd, lucro: lucro })
                 }
             }
             
             if(pdCpEx2 > pdVdEx1 && pdVdEx1 > 0) 
             {
                 lucro = (pdCpEx2 - pdVdEx1) / pdVdEx1 * 100
 
                 if(lucro >= percent && lucro > maLucro)
                 {
                     arrPrintar
                     .push(
                     { 
                         symbol: mCom[i].symbol, pdVd: pdVdEx1, pdCp: pdCpEx2, excCp: exCp2, excVd: exVd2, lucro: lucro 
                     })
                 }                    
             }
         }
 
         return arrPrintar
     }
 
     exlcuirMoeda(comuns = [], moRetirar = [])
     {
        for(let i in moRetirar) //laço para excluir moedas falsa-positiva
        {
            for(let j = 0; j < comuns.length; j++)
            {
                if(moRetirar[i] == comuns[j].symbol)
                    comuns.splice(j, 1)
            }
        }
     }

    // Função para obter a data no formato brasileiro
    obterDataBrasileira()
    {
        const dataAtual = new Date()
        const dia = String(dataAtual.getDate()).padStart(2, '0')
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0')
        const ano = dataAtual.getFullYear()
        const horas = String(dataAtual.getHours()).padStart(2, '0')
        const minutos = String(dataAtual.getMinutes()).padStart(2, '0')
        const segundos = String(dataAtual.getSeconds()).padStart(2, '0')
    
        // console.log(`Data brasileira ${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`)

        return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`
    }

    calcularTempoDecorrido(dataInicio, dataFim)
    {
        // Converte as strings de datas no formato DD/MM/AAAA HH:mm:ss para objetos Date
        const parseData = (dataStr) =>
        {
            const [dia, mes, anoHora] = dataStr.split('/')
            const [ano, hora] = anoHora.split(' ')
            const [horas, minutos, segundos] = hora.split(':')
            return new Date(ano, mes - 1, dia, horas, minutos, segundos)
        }
    
        const inicio = parseData(dataInicio)
        const fim = parseData(dataFim)
    
        // Calcula a diferença em milissegundos
        const diferencaMs = fim - inicio
    
        // Converte a diferença para dias, horas e minutos
        const umMinuto = 1000 * 60
        const umaHora = umMinuto * 60
        const umDia = umaHora * 24
    
        const dias = Math.floor(diferencaMs / umDia)
        const horas = Math.floor((diferencaMs % umDia) / umaHora)
        const minutos = Math.floor((diferencaMs % umaHora) / umMinuto)
    
        return {
            dias,
            horas,
            minutos,
        };
    }

    async enviarEmailAlerta(symbol, subject, message)
    {
      const emailPayload = {
        to: 'jjrrdd@gmail.com',
        subject,
        text: 'Msg de teste do BOT que monitora os indicadores',
        html: `<p>${message}</p>`,
      }
  
      try
      {
           const response = await fetch('/enviarEmail', 
           {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(emailPayload),
           })

            if (!response.ok)
            {
                throw new Error(`Erro ao enviar e-mail: ${response.statusText}`)
            }

            console.log('E-mail enviado com sucesso:', await response.json())
        }
        catch (error)
        {
            console.error('Erro ao enviar e-mail:', error)
        }
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