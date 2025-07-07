const express = require('express')
const app = express()
const path = require('path')
// const server = require('http').createServer(app)
// const io = require('socket.io')(server)
const cors = require('cors')
const port = process.env.PORT || 3001
require('dotenv').config()

const nodemailer = require('nodemailer')

//CLASSES
const { Tickers } = require('./public/js/exchanges/Tickers')
const { NonKyc } = require('./public/js/exchanges/Nonkyc.js')
const tickers = new Tickers()
const nonkyc = new NonKyc()

tickers.tickersNonkyc()
// nonKyc.precoSymbol()

app.listen(port, '0.0.0.0', () => { console.log('Servidor de testes ativo na porta %d', port) })

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Preço do symbol: buscar preço de um symbol específico
app.get('/xt/preco/:symbol', async (req, res) =>
{
    const symbol = req.params.symbol // Exemplo esperado: btc_usdt, eth_usdt, etc

    const url = `https://sapi.xt.com/v4/public/ticker/book?symbol=${symbol}`

    try
    {
        const response = await fetch(url)
        if (!response.ok)
        {
            res.status(502).json({ error: `Erro ao buscar preço do symbol ${symbol}` })
            return
        }

        const resultado = await response.json()
        const d = resultado.result?.[0]

        if (!d)
        {
            res.status(404).json({ error: `Orderbook vazio para symbol ${symbol}` })
            return
        }

        const preco =
        {
            a: parseFloat(d.ap),
            aQ: parseFloat(d.aq),
            b: parseFloat(d.bp),
            bQ: parseFloat(d.bq)
        }

        res.json({ symbol, preco })
    }
    catch (e)
    {
        res.status(500).json({ error: `Erro interno ao buscar preço para ${symbol}`, detalhe: e.message })
    }
})
// ENDPOINT da Nonkyc
app.get('/nonkyc/tickers', (req, res) =>
{
    const data = tickers.getNonkyc()

    if (data?.length)
        res.json({ source: 'cache', data })
    else
        res.status(503).json({ error: 'Dados da Nonkyc ainda não disponíveis' })
})

// ENDPOINT da XT
app.get('/xt/tickers', (req, res) =>
{
    const data = tickers.getXt()
    if (data?.length)
        res.json({ source: 'cache', data })
    else
        res.status(503).json({ error: 'Dados da XT ainda não disponíveis' })
})

// ENDPOINT da Nonkyc para preço de um symbol
app.get('/nonkyc/preco', async (req, res) => {
    const symbol = req.query.symbol // <-- Correto!
    if (!symbol) {
        return res.status(400).json({ error: 'Símbolo não informado.' })
    }

    try
    {
        const precos = await nonkyc.precoSymbol(symbol)
        res.json({ symbol, precos })
    }
    catch (error)
    {
        res.status(500).json({ error: 'Erro ao buscar preço', details: error.toString() })
    }
})

app.get('/probit/tickers', (req, res) =>
{
    const data = probit.get()

    // console.log('Dados Probit:', data)

    if (data?.length)
        res.json({ source: 'cache', data })
    else
        res.status(503).json({ error: 'Dados da Probit ainda não disponíveis' })
})

// Routing
app.use(express.static(path.join(__dirname, 'public')) )

// Rota para o index.html
app.get('/index', async (req, res) => 
{
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

// Rota para o trades.html
app.get('/trades', async (req, res) => 
{
    res.sendFile(path.join(__dirname, 'public/views/trades.html'))
})

process.on('SIGINT', async () =>
{
    await db.fecharConexao()
    process.exit(0)
});


// app.post('/inserir', async (req, res) =>
// {
//     const dados = req.body

//     console.log('dados do form: ' + dados.nome + ' -> telefone: ' + dados.telefone)

//     const result = await crud.inserir(dados)
//     res.send('Registro adicionado com sucesso!')
//     console.log(result)
// })

// ATUALIZAR OS DADOS
// app.post('/atualizar', async (req, res) => 
// {
//     try 
//     {
//         const { id, novosDados } = req.body
//         const result = await crud.atualizar('clientes', { _id: new ObjectId(id) }, novosDados)
//         if (result.matchedCount === 0)
//         {
//             return res.status(404).send({ error: 'Cliente não encontrado' })
//         }
//         res.send({ message: 'Cliente atualizado com sucesso!' });
//     } catch (error) {
//         console.error('Erro ao atualizar cliente:', error);
//         res.status(500).send({ error: 'Erro ao atualizar cliente' });
//     }
// })


// app.get('/pesquisar_todos', async (req, res) =>
    // {
    //     const result = await db.pesquisarTodos('clientes')
    //     const id = req.body.id
    //     const nome = req.body.nome
    
    //     res.send({ id: result[0]._id, 'nome':  result[0].nome} )
    //     for(let i in result)
    //         console.log('nome: ' + result[i].nome + ' telefone: ' + result[i].telefone)
        
    //     console.log(result)
    // })
    
    // app.post('/apagar', async (req, res) =>
    // {
    //     const id = req.body.id
    //     const nome = req.body.nome
    //     const result = await db.apagar('clientes', id, nome)
    // })


// app.post('/pesq_por', async (req, res) => 
    // {
    //     try 
    //     {
    //         const nome_form = req.body.nome
    
    //         const dados = await crud.pesquisarPorNome('clientes', nome_form)
    
    //         if (!dados || dados.length === 0) 
    //         {
    //             return res.status(404).send({ error: 'Cliente não encontrado' })
    //         }
    
    //         const { matricula, telefone, nome, email } = dados[0]
    //         res.send({ matricula, telefone, nome, email })
    //     }
    //     catch (error) 
    //     {
    //         console.error('Erro ao pesquisar cliente:', error)
    //         res.status(500).send({ error: 'Erro interno do servidor' })
    //     }
    // })


// Rota para processar o envio do formulário de pesquisa
// app.post('/pesquisar', async (req, res) => 
// {
//     const nome = req.body.nome // Obtém o nome enviado pelo formulário
  
//     try 
//     {
//         // Executa a consulta para encontrar documentos com o nome especificado
//       const resultados = await db.pesquisarPorNome('clientes', nome)
  
//       // Atualiza os campos do formulário com os resultados da pesquisa
//       const resultadoNomeInput = document.querySelector('#resultado-nome')
//       const resultadoEmailInput = document.querySelector('#resultado-email')
//       const resultadoTelefoneInput = document.querySelector('#resultado-telefone')
  
//       if (resultados.length > 0) 
//       {
//             const resultado = resultados[0]; // Assume que a pesquisa retornou apenas um resultado
    
//             resultadoNomeInput.value = resultado.nome
//             resultadoEmailInput.value = resultado.email
//             resultadoTelefoneInput.value = resultado.telefone
//       }
//       else 
//       {
//         resultadoNomeInput.value = ''
//         resultadoEmailInput.value = ''
//         resultadoTelefoneInput.value = ''
//       }
  
//       // Renderiza uma página com os resultados da pesquisa
//       res.render('resultados', { resultados: resultados });
//     } 
//     catch (err) 
//     {
//       console.error(err)
//       res.status(500).send('Erro ao processar a pesquisa.')
//     }
//      finally 
//     {
//       // Fecha a conexão com o banco de dados
//       await client.close();
//     }
//   });
  

// 

// 



// var btcUsdtPrice = 0;


// function candlesVerdes() 
// {
//     const symbol = 'BTCUSDT'

//     // const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@aggTrade`; // URL do WebSocket da Binance
//     const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m') // Cria uma nova instância de WebSocket
    
//     ws.onopen = () =>
//     {
//         console.log(`Conectado ao WebSocket da Binance para o par ${symbol}`);
//     }

//     ws.onmessage = (event) => 
//     {
//         const data = JSON.parse(event.data)
//         const klineData = data.k
      
//         const isCandleComplete = klineData.x

//         const price = parseFloat(data.p);
//         btcUsdtPrice = price
      
//         if (isCandleComplete) 
//         {
//             const openPrice = parseFloat(klineData.o)
//             const closePrice = parseFloat(klineData.c)
        
//             const isGreenCandle = closePrice > openPrice
        
//             if (isGreenCandle) 
//             {
//                 console.log('Este candle fechou como comprador (verde)')
//             }
//             else 
//             {
//                 console.log('Este candle fechou como vendedor (vermelho)')
//             }
//         }
//         // else 
//         // {
//         //    console.log('Este candle ainda não está completo')
//         // }
//         start()
//     }

//     ws.onclose = (event) => 
//     {
//         console.log(`Conexão fechada: ${event.code} - ${event.reason}`)
//     }

// }

// candlesVerdes()

// function wait(ms) 
// {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function start() 
// {
//     await wait(500); // Aguarda 500ms para garantir que a conexão com o WebSocket esteja estabelecida
//     console.log(`Preço atual do BTCUSDT: ${ btcUsdtPrice }`);
// }


// app.get('/wsbinance', async (req, res) =>
//     {
//         const ws = new WebSocket("wss://stream.binance.com:9443/ws/!bookTicker") // URL do WebSocket da Binance
    
//         const { symbol, interval } = req.query
//         if (!symbol || !interval) return res.status(422).send('Symbol and interval are required parameters.')
    
//         try {
//             const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=10`);
//             res.json(response.data);
//         } catch (err) {
//             res.status(500).json(err.response ? err.response.data : err.message);
//         }
    
//         // ws.on('message', (data) => 
//         // {
//         //     res.send(data)
//         //     console.log(data)
//         // });
         
//     })