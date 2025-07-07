const localUrl = 'http://localhost:3002/api' // URL base do servidor

// Seleciona os elementos do DOM
const formCadastro = document.querySelector('#form_cadastro')
const btnSalvar = document.querySelector('#btn_salvar')
const btnPesquisar = document.querySelector('#btn_pesquisar')
const btnApagar = document.querySelector('#btn_apagar')
// const btnPesquisarTodos = document.querySelector('#btn_pesquisar_todos')
const btnFecharPopup = document.querySelector('#btn_fechar_popup')
const btnFazerPesquisa = document.querySelector('#btn_fazer_pesquisa')
const popupPesquisa = document.querySelector('#popup_pesquisa')
const resultadosPesquisa = document.querySelector('#resultados_pesquisa')
const btnTeste = document.querySelector('#btn_teste')

btnPesquisar.addEventListener('click', async (event) =>
{
    event.preventDefault()

    openModal()
    // console.log('Botão pesqusiar clicado!')
})

// Método "inserir"
btnSalvar.addEventListener('click', async (event) => {
    event.preventDefault()

    const colecao = 'clientes'
    const cliente = 
    {
        nome: document.querySelector('#nome').value,
        telefone: document.querySelector('#telefone').value,
        matricula: document.querySelector('#matricula').value,
        email: document.querySelector('#email').value,
    }

    if (!cliente.nome || !cliente.telefone || !cliente.email) {
        alert('Por favor, preencha todos os campos obrigatórios.')
        return
    }

    const resultado = await fazerRequisicao(`/inserir/${colecao}`, 'POST', cliente)
    if (resultado) 
    {
        alert('Cliente inserido com sucesso!')
        formCadastro.reset()
    }
})

// Abrir o popup de pesquisa
btnPesquisar.addEventListener('click', (event) => 
{
    event.preventDefault()
    openModal()

    popupPesquisa.style.display = 'flex'

    console.log('btnPesquisar clicado')
})

// Método "apagar"
btnApagar.addEventListener('click', async (event) => 
{
    event.preventDefault()

    const colecao = 'clientes'
    const id = document.querySelector('#id_cliente').value

    if (!id) {
        alert('Por favor, insira o ID do cliente a ser apagado.')
        return
    }

    const resultado = await fazerRequisicao(`/apagar/${colecao}`, 'DELETE', { id })
    if (resultado) {
        alert('Cliente apagado com sucesso!')
    }
})


// Método de Pesquisa
async function pesquisarUsuario()
{
    const nome = document.querySelector('#filtro_nome').value
    const email = document.querySelector('#filtro_email').value

    console.log('Nome digitado:', nome)
    console.log('Botão pesquisar do Popup')

    if (!nome && !email) 
    {
        alert('Por favor, insira ao menos um campo para pesquisa (nome ou e-mail).')
        return
    }

    const filtro = {}
    if (nome) filtro.nome = nome
    if (email) filtro.email = email
    // if (nome) filtro.nome = { $regex: nome, $options: 'i' } // Insensível a maiúsculas/minúsculas
    // if (email) filtro.email = { $regex: email, $options: 'i' } // Insensível a maiúsculas/minúsculas

    const colecao = 'clientes'
    try 
    {
        const resultado = await fazerRequisicao(`/pesquisar/${colecao}`, 'POST', filtro)

        if (resultado && resultado.length > 0)
        {
            for(let i in resultado)
            {
                if(resultado[i].nome == nome)
                {
                    const cliente = resultado[i]
                     // Preencher o formulário de cadastro com os dados do cliente encontrado
                    document.querySelector('#nome').value = cliente.nome || ''
                    document.querySelector('#telefone').value = cliente.telefone || ''
                    document.querySelector('#matricula').value = cliente.matricula || ''
                    document.querySelector('#email').value = cliente.email || ''

                    // console.log('Resultado: ' + resultado[i].nome + ' -> email:' + resultado[i].email)
                }    
            }    

            // Fechar o modal após preencher
            closeModal()
        }
        else 
        {
            alert('Nenhum cliente encontrado com os filtros fornecidos.')
        }
    }
    catch (error)
    {
        console.error('Erro ao pesquisar usuário:', error)
        alert('Ocorreu um erro ao pesquisar. Por favor, tente novamente mais tarde.')
    }
}

// Função genérica para realizar requisições HTTP
async function fazerRequisicao(rota, metodo, dados = null) 
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

// Função para abrir o modal
function openModal(event) 
{
    // event.preventDefault() // Previne o comportamento padrão
    var modalContent = document.getElementById("modal-content")
    
    // Define o conteúdo do modal
    var itemContent = `
        <form>
            <label for="filtro_nome">Nome:</label>
            <input type="text" id="filtro_nome" class="form-control" placeholder="Digite o nome"> <br> OU <br>
            
            <label for="filtro_email">E-mail:</label>
            <input type="email" id="filtro_email"  class="form-control" placeholder="Digite o e-mail"><br><br>

            <button id="btn_fazer_pesquisa" type="button" class="btn btn-success" onclick="pesquisarUsuario()">Pesquisar</button>
        </form>
    `;
    modalContent.innerHTML = itemContent;

    // Mostra o modal
    document.getElementById("overlay").style.display = "flex"
    document.getElementById("modal").style.display = "block"
}

// Função para fechar o modal
function closeModal() 
{
    document.getElementById("overlay").style.display = "none";
    document.getElementById("modal").style.display = "none";
}


// function openModal(event) 
// {
//     event.preventDefault();
//     var modalContent = document.getElementById("modal-content");
//     var itemContent = 'Testando o conteúdo aqui..'
//     modalContent.innerHTML = itemContent;
//     document.getElementById("overlay").style.display = "flex";
//     document.getElementById("modal").style.display = "block";
// }

// function closeModal() {
//     document.getElementById("overlay").style.display = "none";
//     document.getElementById("modal").style.display = "none";
// }

// Método "pesquisar_por"
// btnPesquisar.addEventListener('click', async (event) => {
//     event.preventDefault()

//     const colecao = 'clientes'
//     const filtro = document.querySelector('#nome').value

//     if (!filtro) {
//         alert('Por favor, insira um nome para pesquisar.')
//         return
//     }

//     const resultado = await fun.fazerRequisicao(`/pesquisar/${colecao}`, 'POST', { filtro })
//     if (resultado && resultado.length > 0) {
//         alert(`Cliente encontrado: ${JSON.stringify(resultado[0])}`)
//     } else {
//         alert('Cliente não encontrado.')
//     }
// })

// Método "pesquisar_todos"
// btnPesquisarTodos.addEventListener('click', async (event) => {
//     event.preventDefault()

//     const colecao = 'clientes'
//     const resultado = await fun.fazerRequisicao(`/pesquisar/${colecao}`, 'POST')

//     if (resultado && resultado.length > 0) {
//         console.log('Clientes encontrados:', resultado)
//         alert(`Clientes encontrados: ${JSON.stringify(resultado)}`)
//     } else {
//         alert('Nenhum cliente encontrado.')
//     }
// })
