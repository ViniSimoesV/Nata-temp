// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================
let participantesData = []; 
let participantesFiltrados = []; 
let paginaAtual = 1;
const itensPorPagina = 5; 
let idParticipanteEditando = null; 

document.addEventListener("DOMContentLoaded", () => {
    // 1. Carrega a tabela (se estiver na página de listagem)
    if (document.getElementById("tabela-participantes-body")) {
        carregarParticipantes();
        const inputPesquisa = document.getElementById("pesquisa-nome");
        if (inputPesquisa) inputPesquisa.addEventListener("input", aplicarFiltros);
    }

    // 2. Formulário de Cadastro (se estiver na página de cadastro)
    const formCadastro = document.querySelector(".form-cadastro");
    if (formCadastro) {
        formCadastro.addEventListener("submit", cadastrarParticipante);
    }

    // 3. Formulário de Edição (dentro do modal)
    const formEditar = document.getElementById("form-editar-participante");
    if (formEditar) {
        formEditar.addEventListener("submit", salvarEdicao);
    }
});




// ==========================================
// BUSCAR DADOS (GET)
// ==========================================
async function carregarParticipantes() {
    try {
        const resposta = await fetch('http://localhost:8080/api/participantes');
        if (resposta.ok) {
            participantesData = await resposta.json(); 
            participantesFiltrados = [...participantesData];
            renderizarTabela(); 
        }
    } catch (erro) {
        console.error("Erro ao conectar com a API:", erro);
    }
}

// ==========================================
// FILTROS
// ==========================================
function aplicarFiltros() {
    const termoPesquisa = document.getElementById("pesquisa-nome").value.toLowerCase();

    participantesFiltrados = participantesData.filter(part => {
        return part.nome.toLowerCase().includes(termoPesquisa);
    });

    paginaAtual = 1;
    renderizarTabela();
}

// ==========================================
// DESENHAR TABELA
// ==========================================
function renderizarTabela() {
    const tbody = document.getElementById("tabela-participantes-body");
    if(!tbody) return; 

    tbody.innerHTML = ""; 
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const paginados = participantesFiltrados.slice(inicio, fim);

    paginados.forEach(part => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${part.nome}</td>
            <td>${part.serie || "-"}</td>
            <td>${part.escola || "-"}</td>
            <td>${part.nomeResponsavel || "-"}</td> 
            <td>${part.telefoneResponsavel || "-"}</td> 
            <td class="acoes-icones">
                <i class="action-btn" onclick="abrirModalVisualizar(${part.id})" title="Visualizar">Ver</i>
                <i class="action-btn" onclick="abrirModalEditar(${part.id})" title="Editar">Editar</i>
                <i class="action-btn action-btn-danger" style="color: #dc3545;" onclick="deletarParticipante(${part.id})" title="Excluir">Excluir</i>
            </td>
        `;
        tbody.appendChild(tr);
    });
    renderizarPaginacao();
}

// ==========================================
// VISUALIZAR (MODAL DETALHADO)
// ==========================================
function abrirModalVisualizar(id) {
    const part = participantesData.find(p => p.id === id);
    if (!part) return;

    document.getElementById("view-nome").value = part.nome || "";
    document.getElementById("view-nascimento").value = part.dataNascimento || "";
    document.getElementById("view-serie").value = part.serie || "";
    document.getElementById("view-escola").value = part.escola || "";
    document.getElementById("view-responsavel").value = part.nomeResponsavel || "";
    document.getElementById("view-telefone").value = part.telefoneResponsavel || "";
    document.getElementById("view-necessidades").value = part.necessidadesEspeciais || "Nenhuma";

    // Exemplo de como mostrar horários selecionados
    const listaHorarios = document.getElementById("view-horarios-lista");
    listaHorarios.innerHTML = part.horariosSelecionados ? `<p>${part.horariosSelecionados}</p>` : "<p>Não informado</p>";

    abrirModal("modal-visualizar");
}

// ==========================================
// EDITAR (PREENCHER MODAL)
// ==========================================
function abrirModalEditar(id) {
    const part = participantesData.find(p => p.id === id);
    if (!part) return;
    
    idParticipanteEditando = part.id; 

    document.getElementById("edit-nome").value = part.nome || "";
    document.getElementById("edit-nascimento").value = part.dataNascimento || "";
    document.getElementById("edit-serie").value = part.serie || "";
    document.getElementById("edit-escola").value = part.escola || "";
    document.getElementById("edit-responsavel").value = part.nomeResponsavel || "";
    document.getElementById("edit-telefone").value = part.telefoneResponsavel || "";
    document.getElementById("edit-necessidades").value = part.necessidadesEspeciais || "";


    abrirModal("modal-editar");
}

// ==========================================
// CADASTRAR NOVO (POST)
// ==========================================
async function cadastrarParticipante(event) {
    event.preventDefault();

    // Lógica da Necessidade Especial
    const temNecessidade = document.querySelector('input[name="tem_necessidade"]:checked').value;
    const detalhe = document.getElementById("necessidades-detalhe").value;
    const necessidadeFinal = (temNecessidade === "Sim") ? detalhe : "Não possui";

    // Lógica para pegar os Horários (Checkboxes)
    const checkboxes = document.querySelectorAll('input[name="horario"]:checked');
    const horáriosSelecionados = Array.from(checkboxes).map(cb => cb.value).join(", ");

    const novoParticipante = {
        nome: document.getElementById("nome-aluno").value,
        dataNascimento: document.getElementById("data-nascimento").value,
        serie: document.getElementById("serie-escolar").value,
        escola: document.getElementById("nome-escola").value,
        necessidadesEspeciais: necessidadeFinal,
        nomeResponsavel: document.getElementById("nome-responsavel").value,
        parentesco: document.getElementById("parentesco-responsavel").value,
        telefoneResponsavel: document.getElementById("telefone-responsavel").value,
        horariosSelecionados: horáriosSelecionados
    };

    try {
        const resposta = await fetch('http://localhost:8080/api/participantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoParticipante)
        });

        if (resposta.ok) {
            alert("Participante cadastrado com sucesso!");
            window.location.href = "participante.html"; 
        } else {
            alert("Erro ao cadastrar. Verifique o console.");
        }
    } catch (erro) {
        console.error("Erro:", erro);
    }
}
// ==========================================
// DELETAR PARTICIPANTE (DELETE NO BANCO)
// ==========================================
async function deletarParticipante(id) {
    // A trava de segurança para não apagar sem querer!
    const confirmar = confirm("Tem certeza que deseja apagar este participante? Essa ação não pode ser desfeita.");
    if (!confirmar) return;

    try {
        const resposta = await fetch(`http://localhost:8080/api/participantes/${id}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            alert("Participante deletado com sucesso!");
            carregarParticipantes(); // Atualiza a tabela tirando o deletado
        } else {
            alert("Erro do Java ao tentar deletar o participante.");
        }
    } catch (erro) {
        console.error("Erro completo:", erro);
        alert("Erro de conexão. O Java está rodando?");
    }
}

// ==========================================
// SALVAR EDIÇÃO (PUT)
// ==========================================
async function salvarEdicao(event) {
    event.preventDefault(); 
    if (!idParticipanteEditando) return;


    const participanteAtualizado = {
        nome: document.getElementById("edit-nome").value,
        dataNascimento: document.getElementById("edit-nascimento").value,
        serie: document.getElementById("edit-serie").value,
        escola: document.getElementById("edit-escola").value,
        nomeResponsavel: document.getElementById("edit-responsavel").value,
        telefoneResponsavel: document.getElementById("edit-telefone").value,
        necessidadesEspeciais: document.getElementById("edit-necessidades").value,

    };

    try {
        const resposta = await fetch(`http://localhost:8080/api/participantes/${idParticipanteEditando}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(participanteAtualizado)
        });

        if (resposta.ok) {
            alert("Dados do aluno atualizados!");
            fecharModais();
            carregarParticipantes();
        }
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

// Funções de suporte (Paginacao e Modal)
function abrirModal(id) {
    document.getElementById("modal-overlay").classList.add("mostrar-modal");
    document.getElementById(id).classList.add("mostrar-modal");
}

function fecharModais() {
    document.getElementById("modal-overlay").classList.remove("mostrar-modal");
    document.querySelectorAll(".modal-caixa").forEach(m => m.classList.remove("mostrar-modal"));
}

function renderizarPaginacao() {
    // 👉 USA O TAMANHO DA LISTA FILTRADA PARA A MATEMÁTICA DA PÁGINA
    const totalItens = participantesFiltrados.length;
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    const infoSpan = document.getElementById('info-paginacao');
    const controlesDiv = document.getElementById('controles-paginacao');
    if(!infoSpan || !controlesDiv) return;

    const itemInicial = totalItens === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
    const itemFinal = Math.min(paginaAtual * itensPorPagina, totalItens);
    infoSpan.innerText = `Mostrando ${itemInicial} - ${itemFinal} de ${totalItens} participantes`;
    controlesDiv.innerHTML = '';

    if (totalItens === 0) return; 

    const btnAnterior = document.createElement('button');
    btnAnterior.className = `btn-pagina ${paginaAtual === 1 ? 'disable' : ''}`;
    btnAnterior.innerHTML = '<i class="ph ph-caret-left"></i> Anterior';
    btnAnterior.disabled = paginaAtual === 1;
    btnAnterior.onclick = () => mudarPagina(paginaAtual - 1);
    controlesDiv.appendChild(btnAnterior);

    for (let i = 1; i <= totalPaginas; i++) {
        const btnNumero = document.createElement('button');
        btnNumero.className = `btn-pagina ${i === paginaAtual ? 'ativa' : ''}`;
        btnNumero.innerText = i;
        btnNumero.onclick = () => mudarPagina(i);
        controlesDiv.appendChild(btnNumero);
    }

    const btnProximo = document.createElement('button');
    btnProximo.className = `btn-pagina ${paginaAtual === totalPaginas ? 'disable' : ''}`;
    btnProximo.innerHTML = 'Próximo <i class="ph ph-caret-right"></i>';
    btnProximo.disabled = paginaAtual === totalPaginas;
    btnProximo.onclick = () => mudarPagina(paginaAtual + 1);
    controlesDiv.appendChild(btnProximo);
}

function mudarPagina(novaPagina) {
    const totalPaginas = Math.ceil(participantesFiltrados.length / itensPorPagina);
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
        paginaAtual = novaPagina;
        renderizarTabela(); 
    }
}