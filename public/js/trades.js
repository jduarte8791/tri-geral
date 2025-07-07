import { Binance } from './/exchanges/Binance.js'
import { NonKyc } from './exchanges/Nonkyc.js'
import { Fmfw } from './exchanges/Fmfw.js'
import { Probit } from './exchanges/Probit.js'
import { Tickers } from './exchanges/Tickers.js'
import { Xt } from './exchanges/XT.js'

let pares = [],
    atualizando = false



// Variável para armazenar o intervalo de atualização
let intervaloAtualizacao = null,
    binS = new Binance(),
    nonkycS = new NonKyc(),
    fmfwS = new Fmfw(),
    probitS = new Probit(),
    xtS = new Xt(),
    tickers = new Tickers()


// Executa a função ao carregar a página
window.addEventListener('DOMContentLoaded', async () => 
{
    iniciarAtualizacaoAutomatica()
    console.log('Populando tabela com dados da exchange...')

    // binS.monitorarArbitragem()

    // xtS.verTriUsdtBTCEth()
    // probitS.verTriUsdtBTC()
    // nonkycS.verTriUsdtBTC()
})

// Função principal que será executada periodicamente
async function atualizarTabela() 
{
    atualizando = true
    try 
    {
        const novosDados = await obterDadosAtualizados()
        
        // Atualiza o array pares sem duplicações
        atualizarPares(novosDados.filter(Boolean))
        
        // console.log('Dados atualizados:', pares)
        popularTabela(pares)
    } 
    catch (error) 
    {
        console.error('Erro ao atualizar tabela:', error)
    }
    atualizando = false
}

async function obterDadosAtualizados() 
{
    try 
    {
        let nonkyc = await nonkycS.verTriUsdtBTC(),
            fmfw = await fmfwS.verTriUsdtBTC(),
            probit = await probitS.verTriUsdtBTC(),
            xt = await xtS.verTriUsdtBTCEth()


        // const [nonkycTrig] = await Promise.all([
        //   nonkyc.verTriUsdtBTCNonkyc()
        // ])
        
        return [...nonkyc, ...fmfw, ...probit, ...xt]
    } 
    catch (error) 
    {
        console.error('Erro ao obter dados:', error)
        return []
    }
}

function atualizarPares(novosDados) 
{
    // Remove pares que não estão mais presentes
    const novosSymbols = novosDados.map(p => p.symbol)
    pares = pares.filter(par => novosSymbols.includes(par.symbol))

    // Atualiza ou adiciona os pares restantes
    novosDados.forEach(novoPar => 
    {
        const indiceExistente = pares.findIndex(p => p.symbol === novoPar.symbol)

        if (indiceExistente === -1) 
        {
            pares.push(novoPar)
        } 
        else 
        {
            pares[indiceExistente] = { ...pares[indiceExistente], ...novoPar }
        }
    })

    pares.sort((a, b) => b.lucro - a.lucro)
}


function iniciarAtualizacaoAutomatica(intervalo = 2000)
{
    // Para qualquer intervalo existente antes de iniciar um novo
    if (intervaloAtualizacao)
        clearInterval(intervaloAtualizacao)
    
    // Executa imediatamente a primeira vez
    atualizarTabela()
    
    // Configura o intervalo para atualizações subsequentes
     // Atualiza a cada X milissegundos, mas só se a anterior terminou
    intervaloAtualizacao = setInterval(async () => {
        if (!atualizando) {
            await atualizarTabela()
        }
    }, intervalo);
    
    console.log(`Atualização automática iniciada (intervalo: ${intervalo}ms)`)
}

// Modificação na função popularTabela para destacar diferenças
function popularTabela(data) 
{
    const tableBody = document.querySelector('#tradesTable tbody')
    tableBody.innerHTML = ''

    data.forEach(trade => 
    {
        const row = document.createElement('tr')
        row.classList.add('nova-linha') // Para animação
        
        // Cria células na ordem correta para sua tabela
        const cells = [
            trade.symbol,                           // SYMBOL
            trade.exc, // EXCHANGE
            trade.cpEm, // COMPRAR EM
            trade.vdEm, // VENDER EM
            trade.volPdVd || '-', // VOLUME COMPRAR
            trade.volPdCp || '-',  // VOLUME VENDER
            trade.pdVd, // COMPRAR POR
            trade.pdCp,   // VENDER POR            
            `${trade.lucro?.toFixed(2)}%`          // LUCRO
        ]

        cells.forEach((value, index) => 
        {
            const cell = document.createElement('td')
            cell.textContent = value
            
            // Destaca a coluna de LUCRO (última coluna)
            if (index === 8) 
            {
                const lucro = parseFloat(trade.lucro)
                if (lucro > 0) 
                {
                    cell.style.color = 'green'
                    cell.style.fontWeight = 'bold'
                } 
            }

            if(index === 7)
                cell.style.fontWeight = 'bold'

            if(index === 6)
                cell.style.fontWeight = 'bold'
            
            row.appendChild(cell)
        })

        tableBody.appendChild(row)
        
        // Remove a classe de animação após 1 segundo
        setTimeout(() => row.classList.remove('nova-linha'), 1000)
    })
}

// Função para parar a atualização automática
function pararAtualizacaoAutomatica()
{
    if (intervaloAtualizacao)
    {
        clearInterval(intervaloAtualizacao)
        intervaloAtualizacao = null
        console.log('Atualização automática parada')
    }
}

// Adicione este CSS para animação
const style = document.createElement('style')
style.textContent = `
    .nova-linha {
        background-color: rgba(0, 255, 0, 0.1)
        transition: background-color 1s ease-out
    }
`
document.head.appendChild(style)