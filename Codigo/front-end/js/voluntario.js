// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================
let voluntariosData = []; 
let voluntariosFiltrados = []; // NOVA VARIÁVEL: Guarda o resultado das pesquisas
let paginaAtual = 1;
const itensPorPagina = 5; 
let idVoluntarioEditando = null; 

document.addEventListener("DOMContentLoaded", () => {
    // 1. Carrega a tabela se ela existir na tela
    if (document.getElementById("tabela-voluntarios-body")) {
        carregarVoluntarios();
        
        // 👉 ESCUTADORES DA PESQUISA E FILTRO
        const inputPesquisa = document.getElementById("pesquisa-nome");
        if (inputPesquisa) inputPesquisa.addEventListener("input", aplicarFiltros);

        const selectFiltro = document.getElementById("filtro-status");
        if (selectFiltro) selectFiltro.addEventListener("change", aplicarFiltros);
    }
    // 2. Escuta o formulário de CADASTRO
    const formCadastro = document.querySelector(".form-cadastro");
    if (formCadastro) {
        formCadastro.addEventListener("submit", cadastrarVoluntario);
    }
    // 3. Escuta o formulário de EDIÇÃO 
    const formEditar = document.getElementById("form-editar-voluntario");
    if (formEditar) {
        formEditar.addEventListener("submit", salvarEdicao);
    }
});

// ==========================================
// BUSCAR DADOS
// ==========================================
async function carregarVoluntarios() {
    try {
        const resposta = await fetch('http://localhost:8080/api/voluntarios');
        if (resposta.ok) {
            voluntariosData = await resposta.json(); 
            voluntariosFiltrados = [...voluntariosData]; // Inicialmente, mostra todos
            renderizarTabela(); 
        } else {
            console.error("Erro do servidor:", resposta.status);
        }
    } catch (erro) {
        console.error("Erro de conexão (Java rodando?):", erro);
    }
}

// ==========================================
// FUNÇÃO NOVA: APLICAR FILTROS
// ==========================================
function aplicarFiltros() {
    const termoPesquisa = document.getElementById("pesquisa-nome").value.toLowerCase();
    const statusFiltro = document.getElementById("filtro-status").value.toLowerCase();

    // Filtra a lista principal com base no que foi digitado/selecionado
    voluntariosFiltrados = voluntariosData.filter(vol => {
        // Verifica se o nome tem a letra digitada
        const matchNome = vol.nome.toLowerCase().includes(termoPesquisa);
        
        // Verifica se o status bate (ou se está no "Filtrar por status" que é vazio)
        const matchStatus = statusFiltro === "" || (vol.status && vol.status.toLowerCase() === statusFiltro);
        
        return matchNome && matchStatus;
    });

    paginaAtual = 1; // Sempre volta para a página 1 ao pesquisar
    renderizarTabela();
}

// ==========================================
// DESENHAR TABELA
// ==========================================
function renderizarTabela() {
    const tbody = document.getElementById("tabela-voluntarios-body");
    if(!tbody) return; 

    tbody.innerHTML = ""; 
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    
    // Usa a lista filtrada (se a pesquisa estiver funcionando) ou a lista normal
    const listaRenderizar = typeof voluntariosFiltrados !== 'undefined' ? voluntariosFiltrados : voluntariosData;
    const voluntariospaginados = listaRenderizar.slice(inicio, fim);

    voluntariospaginados.forEach(vol => {
        const tr = document.createElement("tr");
        
        const habilidadesStr = vol.habilidades ? vol.habilidades : "-";
        const diasStr = vol.diasDisponiveis ? vol.diasDisponiveis : "-";
        const turnosStr = vol.turnosDisponiveis ? vol.turnosDisponiveis : "-";

        // 👇 A MÁGICA DOS PROJETOS AQUI 👇
        let projetosStr = "-";
        if (vol.projetos && vol.projetos.length > 0) {
            // Pega só o 'nome' de cada projeto e junta tudo com vírgula!
            projetosStr = vol.projetos.map(p => p.nome).join(', ');
        }

        tr.innerHTML = `
            <td>${vol.nome}</td>
            <td>${vol.telefone || "-"}</td>
            <td>${habilidadesStr.substring(0, 30)}</td>
            <td>${diasStr}</td> 
            <td>${turnosStr}</td> 
            <td>${projetosStr}</td> <td>${vol.status || "Pendente"}</td>
            <td class="acoes-icones">
                <i class="action-btn" onclick="abrirModalVisualizar(${vol.id})" title="Visualizar">Ver</i>
                <i class="action-btn" onclick="abrirModalEditar(${vol.id})" title="Editar">Editar</i>
                <i class="action-btn" onclick="abrirModalVincularProjeto(${vol.id})" title="Vincular Projetos">Vincular</i>
                <i class="action-btn action-btn-danger" style="color: #dc3545;" onclick="deletarVoluntario(${vol.id})" title="Excluir">Excluir</i>
            </td>
        `;
        tbody.appendChild(tr);
    });
    renderizarPaginacao();
}

// ==========================================
// PAGINAÇÃO E MODAIS BÁSICOS
// ==========================================
function renderizarPaginacao() {
    // 👉 USA O TAMANHO DA LISTA FILTRADA PARA A MATEMÁTICA DA PÁGINA
    const totalItens = voluntariosFiltrados.length;
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    const infoSpan = document.getElementById('info-paginacao');
    const controlesDiv = document.getElementById('controles-paginacao');
    if(!infoSpan || !controlesDiv) return;

    const itemInicial = totalItens === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
    const itemFinal = Math.min(paginaAtual * itensPorPagina, totalItens);
    infoSpan.innerText = `Mostrando ${itemInicial} - ${itemFinal} de ${totalItens} voluntários`;
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
    const totalPaginas = Math.ceil(voluntariosFiltrados.length / itensPorPagina);
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
        paginaAtual = novaPagina;
        renderizarTabela(); 
    }
}

function abrirModal(idModal) {
    document.getElementById("modal-overlay").classList.add("mostrar-modal");
    document.getElementById(idModal).classList.add("mostrar-modal");
}

function fecharModais() {
    document.getElementById("modal-overlay").classList.remove("mostrar-modal");
    document.querySelectorAll(".modal-caixa").forEach(modal => modal.classList.remove("mostrar-modal"));
}

// ==========================================
// ABRIR MODAL DE VISUALIZAÇÃO
// ==========================================
function abrirModalVisualizar(id) {
    const vol = voluntariosData.find(v => v.id === id);
    if (!vol) return;

    // 1. Preenche os dados pessoais
    document.getElementById("view-nome").value = vol.nome || "";
    document.getElementById("view-email").value = vol.email || "";
    document.getElementById("view-telefone").value = vol.telefone || "";
    document.getElementById("view-nascimento").value = vol.dataNascimento || "";
    document.getElementById("view-outras-habilidades").value = vol.outrasHabilidades || "";
    document.getElementById("view-obs-disponibilidade").value = vol.observacoesDisponibilidade || "";

    // 2. Preenche Habilidades
    const listaHabilidadesDiv = document.getElementById("view-habilidades-lista");
    listaHabilidadesDiv.innerHTML = ""; 
    
    if (vol.habilidades) {
        const habs = vol.habilidades.split(", ");
        habs.forEach(h => { listaHabilidadesDiv.innerHTML += `<p>• ${h}</p>`; });
    } else {
        listaHabilidadesDiv.innerHTML = `<p>Nenhuma informada</p>`;
    }

    // 3. Preenche Disponibilidade
    const listaDisponibilidadeDiv = document.getElementById("view-disponibilidade-lista");
    listaDisponibilidadeDiv.innerHTML = ""; 

    if (vol.diasDisponiveis || vol.turnosDisponiveis) {
        if (vol.diasDisponiveis) {
            listaDisponibilidadeDiv.innerHTML += `<p><strong>Dias:</strong> ${vol.diasDisponiveis}</p>`;
        }
        if (vol.turnosDisponiveis) {
            listaDisponibilidadeDiv.innerHTML += `<p><strong>Turnos:</strong> ${vol.turnosDisponiveis}</p>`;
        }
    } else {
        listaDisponibilidadeDiv.innerHTML = `<p>Nenhuma informada</p>`;
    }

    // 4. 👉 A NOVIDADE: Preenche os Projetos Vinculados
    const listaProjetosDiv = document.getElementById("view-projetos-lista");
    listaProjetosDiv.innerHTML = ""; 

    if (vol.projetos && vol.projetos.length > 0) {
        vol.projetos.forEach(projeto => {
            listaProjetosDiv.innerHTML += `<p>• ${projeto.nome}</p>`; // Assumindo que a variável no seu backend se chama 'nome'
        });
    } else {
        listaProjetosDiv.innerHTML = `<p>Nenhum projeto vinculado ainda.</p>`;
    }

    abrirModal("modal-visualizar");
}

// ==========================================
// CADASTRAR NO BANCO (POST)
// ==========================================
async function cadastrarVoluntario(event) {
    event.preventDefault();
    const nome = document.querySelector('input[name="nome"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const telefone = document.querySelector('input[name="telefone"]').value;
    const dataNascimento = document.querySelector('input[name="data_nascimento"]').value;

    const statusRadios = document.getElementsByName('status');
    let statusSelecionado = "Pendente";
    for(let radio of statusRadios) {
        if(radio.checked) {
            statusSelecionado = radio.value.charAt(0).toUpperCase() + radio.value.slice(1);
            break;
        }
    }

    const checkboxesHab = document.querySelectorAll('input[name="habilidades"]:checked');
    const habilidadesMarcadas = Array.from(checkboxesHab).map(cb => cb.value).join(', ');
    const outrasHabilidades = document.getElementById('outras_habilidades').value;
    const obsDisponibilidade = document.getElementById('obs_disponibilidade').value;

    const checkboxesDisp = document.querySelectorAll('input[name="disponibilidade"]:checked');
    let diasSet = new Set();
    let turnosSet = new Set();

    checkboxesDisp.forEach(cb => {
        if (cb.value && cb.value.includes("-")) {
            const partes = cb.value.split("-");
            diasSet.add(partes[0]);
            turnosSet.add(partes[1]);
        }
    });

    const diasMarcados = Array.from(diasSet).join(', ');
    const turnosMarcados = Array.from(turnosSet).join(', ');

    const novoVoluntario = {
        nome: nome, email: email, telefone: telefone, dataNascimento: dataNascimento,
        status: statusSelecionado, habilidades: habilidadesMarcadas,
        outrasHabilidades: outrasHabilidades, 
        diasDisponiveis: diasMarcados, turnosDisponiveis: turnosMarcados,
        observacoesDisponibilidade: obsDisponibilidade
    };

    try {
        const resposta = await fetch('http://localhost:8080/api/voluntarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoVoluntario)
        });

        if (resposta.ok) { 
            alert("Voluntário cadastrado com sucesso!");
            window.location.href = "voluntarios.html"; 
        } else {
            alert("Ops! Erro ao cadastrar o voluntário.");
        }
    } catch (erro) {
        console.error("Erro na requisição:", erro);
        alert("Erro de conexão. O servidor Java está rodando?");
    }
}

// ==========================================
// ABRIR MODAL DE EDIÇÃO E PREENCHER DADOS
// ==========================================
function abrirModalEditar(id) {
    const vol = voluntariosData.find(v => v.id === id);
    if (!vol) return;
    
    document.getElementById("form-editar-voluntario").reset();
    idVoluntarioEditando = vol.id; 

    document.getElementById("edit-nome").value = vol.nome || "";
    document.getElementById("edit-email").value = vol.email || "";
    document.getElementById("edit-telefone").value = vol.telefone || "";
    document.getElementById("edit-nascimento").value = vol.dataNascimento || "";
    document.getElementById("edit-outras-habilidades").value = vol.outrasHabilidades || "";
    
    if(document.getElementById("edit-obs-disponibilidade")) {
        document.getElementById("edit-obs-disponibilidade").value = vol.observacoesDisponibilidade || "";
    }

    const checkboxesHab = document.querySelectorAll('input[name="edit-habilidade"]');
    checkboxesHab.forEach(cb => cb.checked = false); 
    if (vol.habilidades) {
        const habs = vol.habilidades.split(", ");
        checkboxesHab.forEach(cb => {
            if (habs.includes(cb.value)) cb.checked = true;
        });
    }

    const checkboxesDisp = document.querySelectorAll('input[name="edit-disponibilidade"]');
    checkboxesDisp.forEach(cb => cb.checked = false); 
    
    if (vol.diasDisponiveis && vol.turnosDisponiveis) {
        const dias = vol.diasDisponiveis.split(", ");
        const turnos = vol.turnosDisponiveis.split(", ");

        checkboxesDisp.forEach(cb => {
            if (cb.value.includes("-")) {
                const partes = cb.value.split("-");
                if (dias.includes(partes[0]) && turnos.includes(partes[1])) {
                    cb.checked = true;
                }
            }
        });
    }

    abrirModal("modal-editar");
}

// ==========================================
// SALVAR A EDIÇÃO (PUT NO BANCO)
// ==========================================
async function salvarEdicao(event) {
    event.preventDefault(); 
    console.log("1. Tentando salvar edição...");

    try {
        if (!idVoluntarioEditando) {
            alert("Erro: O sistema perdeu o ID. Tente fechar e abrir o modal de novo.");
            return;
        }
        
        const id = idVoluntarioEditando;

        const nome = document.getElementById("edit-nome").value;
        const email = document.getElementById("edit-email").value;
        const telefone = document.getElementById("edit-telefone").value;
        const dataNascimento = document.getElementById("edit-nascimento").value;
        const outrasHabilidades = document.getElementById("edit-outras-habilidades").value;
        
        let obsDisponibilidade = "";
        const obsField = document.getElementById("edit-obs-disponibilidade");
        if(obsField) obsDisponibilidade = obsField.value;

        const checkboxesHab = document.querySelectorAll('input[name="edit-habilidade"]:checked');
        const habilidadesMarcadas = Array.from(checkboxesHab).map(cb => cb.value).join(', ');

        const checkboxesDisp = document.querySelectorAll('input[name="edit-disponibilidade"]:checked');
        let diasSet = new Set();
        let turnosSet = new Set();

        checkboxesDisp.forEach(cb => {
            if (cb.value && cb.value.includes("-")) {
                const partes = cb.value.split("-");
                diasSet.add(partes[0]);
                turnosSet.add(partes[1]);
            }
        });

        const diasMarcados = Array.from(diasSet).join(', ');
        const turnosMarcados = Array.from(turnosSet).join(', ');

        const voluntarioAtualizado = {
            nome: nome,
            email: email,
            telefone: telefone,
            dataNascimento: dataNascimento,
            habilidades: habilidadesMarcadas,
            diasDisponiveis: diasMarcados,
            turnosDisponiveis: turnosMarcados,
            outrasHabilidades: outrasHabilidades,
            observacoesDisponibilidade: obsDisponibilidade
        };
        
        const resposta = await fetch(`http://localhost:8080/api/voluntarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voluntarioAtualizado)
        });

        if (resposta.ok) {
            alert("Voluntário atualizado com sucesso!");
            fecharModais(); 
            carregarVoluntarios(); 
        } else {
            alert("Erro do Java ao atualizar voluntário.");
        }
    } catch (erro) {
        console.error("Erro completo:", erro);
        alert("Erro de conexão. O Java está rodando?");
    }
}
// ==========================================
// DELETAR VOLUNTÁRIO (DELETE NO BANCO)
// ==========================================
async function deletarVoluntario(id) {
    // A trava de segurança para não apagar sem querer!
    const confirmar = confirm("Tem certeza que deseja apagar este voluntário? Essa ação não pode ser desfeita.");
    if (!confirmar) return;

    try {
        const resposta = await fetch(`http://localhost:8080/api/voluntarios/${id}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            alert("Voluntário deletado com sucesso!");
            carregarVoluntarios(); // Atualiza a tabela tirando o deletado
        } else {
            alert("Erro do Java ao tentar deletar o voluntário.");
        }
    } catch (erro) {
        console.error("Erro completo:", erro);
        alert("Erro de conexão. O Java está rodando?");
    }
}

// ==========================================
// ABRIR MODAL DE PROJETOS (BUSCA NO BANCO)
// ==========================================
async function abrirModalVincularProjeto(idVoluntario) {
    const vol = voluntariosData.find(v => v.id === idVoluntario);
    if (!vol) return;

    document.getElementById("config-voluntario-id").value = vol.id;
    document.getElementById("config-nome").value = vol.nome;

    const containerProjetos = document.getElementById("container-projetos-dinamicos");
    containerProjetos.innerHTML = "<p>Carregando projetos...</p>";
    
    abrirModal("modal-config");

    try {
        // Busca a lista de Projetos Reais do seu Banco de Dados
        // (Verifique se a rota do seu Controller de projetos é essa mesma)
        const resposta = await fetch('http://localhost:8080/api/projetos');
        const projetos = await resposta.json();

        containerProjetos.innerHTML = ""; 

        projetos.forEach(projeto => {
            // OBS: Aqui você precisará adicionar depois a lógica para dar "checked"
            // nos projetos que o voluntário já participa, caso ele já tenha vínculos!
            containerProjetos.innerHTML += `
                <label>
                    <input type="checkbox" name="projeto-selecionado" value="${projeto.id}"> 
                    ${projeto.nome}
                </label>
            `;
        });
    } catch (erro) {
        console.error("Erro ao buscar projetos:", erro);
        containerProjetos.innerHTML = "<p>Erro ao carregar projetos do banco de dados.</p>";
    }
}

// ==========================================
// SALVAR VÍNCULO DE PROJETOS (POST NO JAVA)
// ==========================================
async function salvarVinculoProjetos() {
    const idVoluntario = document.getElementById("config-voluntario-id").value;
    
    // Pega os IDs de todos os projetos que você marcou na tela
    const checkboxesProjetos = document.querySelectorAll('input[name="projeto-selecionado"]:checked');
    
    // Transforma em uma lista de números (ex: [1, 4, 5])
    const idsProjetosMarcados = Array.from(checkboxesProjetos).map(cb => parseInt(cb.value));

    try {
        // Manda a lista de IDs para a rota nova que criamos no Java
        const resposta = await fetch(`http://localhost:8080/api/voluntarios/${idVoluntario}/projetos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(idsProjetosMarcados)
        });

        if (resposta.ok) {
            alert("Projetos vinculados com sucesso!");
            fecharModais();
            carregarVoluntarios(); // Recarrega a tabela por garantia
        } else {
            alert("Erro do Java ao tentar vincular os projetos.");
        }
    } catch (erro) {
        console.error("Erro completo:", erro);
        alert("Erro de conexão. O servidor Java está rodando?");
    }
}