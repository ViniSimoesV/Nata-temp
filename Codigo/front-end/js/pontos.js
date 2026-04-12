const SUPABASE_URL = 'https://raykwpryvxfittrlkbey.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C5oimXD8Ez6Ngh_MpSg01g_9J6F4Eam';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let pontosCarregados = [];

document.addEventListener('DOMContentLoaded', () => {
    buscarPontosDoBanco();

    // Eventos para filtragem em tempo real
    document.getElementById('pesquisa-nome').addEventListener('input', filtrarPontos);
    document.getElementById('filtro-coleta').addEventListener('change', filtrarPontos);
    document.getElementById('filtro-entrega').addEventListener('change', filtrarPontos);
});

async function buscarPontosDoBanco() {
    try {
        // Busca simultânea nas duas tabelas
        const [resPontos, resParceiros] = await Promise.all([
            supabaseClient.from('ponto').select('*'),
            supabaseClient.from('empresa_parceira').select('*')
        ]);

        if (resPontos.error) throw resPontos.error;
        if (resParceiros.error) throw resParceiros.error;

        // Formata os parceiros para terem a mesma estrutura visual dos pontos
        // Filtrando apenas aqueles que são coleta OU entrega
        const parceirosComoPontos = resParceiros.data
            .filter(p => p.isPontoColeta || p.isPontoEntrega)
            .map(p => ({
                ...p,
                id_ponto: `parceiro-${p.id_empresa}`, // Prefixo para não conflitar IDs
                nome_ponto: p.nome_empresa,
                isParceiro: true // Flag para controle interno se necessário
            }));

        // Une as duas listas
        pontosCarregados = [...resPontos.data, ...parceirosComoPontos];

        renderizarCards(pontosCarregados);
        
        const infoPaginacao = document.getElementById('info-paginacao');
        if (infoPaginacao) {
            infoPaginacao.innerText = `Exibindo ${pontosCarregados.length} ponto(s)`;
        }
    } catch (error) {
        console.error('Erro ao buscar dados unificados:', error.message);
        renderizarCards([]); 
    }
}

function renderizarCards(lista) {
    const containerCards = document.getElementById('container-pontos');
    if (!containerCards) return;
    
    containerCards.innerHTML = ""; 

    if (lista.length === 0) {
        containerCards.innerHTML = `<p style="grid-column: 1/-1; text-align: center; margin-top: 30px;">Nenhum ponto encontrado.</p>`;
        return;
    }

    lista.forEach(item => {
        // Define o texto do tipo para a capa
        let tipoTexto = "";
        if (item.isPontoColeta && item.isPontoEntrega) tipoTexto = "Coleta / Entrega";
        else if (item.isPontoColeta) tipoTexto = "Coleta";
        else if (item.isPontoEntrega) tipoTexto = "Entrega";

        const cardHTML = `
            <div class="card-ponto">
                <div class="card-capa">
                    <h3>${item.nome_ponto}</h3>
                    <div class="tipo-capa">
                        <i class="ph ph-map-pin"></i> ${tipoTexto}
                    </div>
                </div>

                <div class="card-conteudo-detalhado">
                    <div class="card-header" style="margin-bottom: 5px;">
                        <h4 style="margin:0; color:#db5c33;">${item.nome_ponto}</h4>
                        <i class="ph ph-map-pin"></i> ${tipoTexto}
                    </div>
                    
                    <div class="card-body-scroll">
                        <p><strong>Contato:</strong> ${item.nome_representante}</p>
                        <p><i class="ph ph-phone"></i> <strong>Telefone:</strong> ${item.telefone_representante}</p>
                        <p><i class="ph ph-envelope"></i> <strong>Email:</strong> ${item.email_representante}</p>
                        <hr>
                        <p><strong>CEP:</strong> ${item.cep}</p>
                        <p><strong>Endereço:</strong> ${item.rua}, ${item.numero}, ${item.bairro}</p>
                        <p><strong>Complemento:</strong> ${item.complemento}</p>
                        <p><strong>Cidade:</strong> ${item.cidade}</p>
                    </div>

                    <div class="card-footer" style="padding-top: 10px; border-top: 1px solid #eee;">
                        <button class="btn-card-editar" onclick="abrirModalEdicao('${item.id_ponto}')">
                            <i class="ph ph-pencil-simple"></i> Editar
                        </button>
                    </div>
                </div>
            </div>`;
        containerCards.innerHTML += cardHTML;
    });
}

// Funções de Modal (globais para funcionarem no onclick)
window.abrirModalEdicao = function(id) {
    console.log("Tentando editar ID:", id);
    const ponto = pontosCarregados.find(p => String(p.id_ponto) === String(id));

    if (ponto) {
        // 1. IMPORTANTE: Preencher o ID oculto para o formulário saber quem editar
        const campoId = document.getElementById('editar-id');
        if (campoId) campoId.value = id;

        // 2. Preenchimento com verificação de existência do elemento
        const campos = {
            'editar-nome': ponto.nome_ponto,
            'editar-contato': ponto.nome_representante,
            'editar-email': ponto.email_representante,
            'editar-telefone': ponto.telefone_representante,
            'editar-cep': ponto.cep,
            'editar-rua': ponto.rua,
            'editar-numero': ponto.numero,
            'editar-bairro': ponto.bairro,
            'editar-cidade': ponto.cidade,
            'editar-complemento': ponto.complemento
        };

        for (const [idCampo, valor] of Object.entries(campos)) {
            const elemento = document.getElementById(idCampo);
            if (elemento) elemento.value = valor || '';
        }

        for (const [idCampo, valor] of Object.entries(campos)) {
            const elemento = document.getElementById(idCampo);
            if (elemento) { 
                elemento.value = valor || ''; 
            } else {
                console.warn(`Campo ${idCampo} não encontrado.`);
            }
        }

        // 3. Rádios de Coleta e Entrega
        const coletaSim = document.getElementById('coleta-sim');
        const coletaNao = document.getElementById('coleta-nao');
        if (ponto.isPontoColeta) coletaSim.checked = true; else coletaNao.checked = true;

        const entregaSim = document.getElementById('entrega-sim');
        const entregaNao = document.getElementById('entrega-nao');
        if (ponto.isPontoEntrega) entregaSim.checked = true; else entregaNao.checked = true;

        // 4. Abre as modais (Certifique-se de que as classes CSS 'mostrar-modal' existam)
        document.getElementById('modal-editar-ponto').classList.add('mostrar-modal');
        document.getElementById('modal-overlay').classList.add('mostrar-modal');
    }
}

function fecharModais() {
    document.getElementById('modal-overlay').classList.remove('mostrar-modal');
    document.getElementById('modal-editar-ponto').classList.remove('mostrar-modal');
    fecharConfirmacao();
}

// EDITAR PONTO
// Envio do formulário de edição
const formEditar = document.getElementById('form-editar-ponto');
if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();

        const idOriginal = document.getElementById('editar-id').value;
        const isParceiro = idOriginal.startsWith('parceiro-');
        const idLimpo = isParceiro ? idOriginal.replace('parceiro-', '') : idOriginal;
        
        // Define a tabela e a coluna de ID correta com base na origem
        const tabela = isParceiro ? 'empresa_parceira' : 'ponto';
        const colunaId = isParceiro ? 'id_empresa' : 'id_ponto';

        // Mapeamento de dados respeitando os nomes das colunas de cada tabela
        const dadosAtualizados = {
            [isParceiro ? 'nome_empresa' : 'nome_ponto']: document.getElementById('editar-nome').value,
            nome_representante: document.getElementById('editar-contato').value,
            email_representante: document.getElementById('editar-email').value,
            telefone_representante: document.getElementById('editar-telefone').value,
            cep: document.getElementById('editar-cep').value,
            rua: document.getElementById('editar-rua').value,
            bairro: document.getElementById('editar-bairro').value,
            cidade: document.getElementById('editar-cidade').value,
            numero: document.getElementById('editar-numero').value,
            isPontoColeta: document.querySelector('input[name="editar-ponto-coleta"]:checked').value === "true",
            isPontoEntrega: document.querySelector('input[name="editar-ponto-entrega"]:checked').value === "true"
        };

        try {
            const { error } = await supabaseClient
                .from(tabela)
                .update(dadosAtualizados)
                .eq(colunaId, idLimpo);

            if (error) throw error;

            alert('Dados atualizados com sucesso!');
            fecharModais();
            buscarPontosDoBanco(); 
        } catch (err) {
            console.error('Erro ao atualizar:', err.message);
            alert('Não foi possível salvar as alterações.');
        }
    });
}


function filtrarPontos() {
    const termoPesquisa = document.getElementById('pesquisa-nome').value.toLowerCase();
    const querColeta = document.getElementById('filtro-coleta').checked;
    const querEntrega = document.getElementById('filtro-entrega').checked;

    // Filtra os dados que já estão na memória (pontosCarregados)
    const pontosFiltrados = pontosCarregados.filter(p => {
        // 1. Filtro por Nome (pode usar CNPJ também se quiser)
        const nomeMatch = p.nome_ponto.toLowerCase().includes(termoPesquisa);
        
        // 2. Filtro por Tipo (Lógica: se o checkbox está marcado, o ponto PRECISA ter aquela coluna como true)
        // Se nada estiver marcado, mostra todos. Se marcado, filtra estritamente.
        let tipoMatch = true;
        if (querColeta && !p.isPontoColeta) tipoMatch = false;
        if (querEntrega && !p.isPontoEntrega) tipoMatch = false;

        return nomeMatch && tipoMatch;
    });

    // Re-renderiza os cards com a lista filtrada
    renderizarCards(pontosFiltrados);

    // Atualiza o contador
    const infoPaginacao = document.getElementById('info-paginacao');
    if (infoPaginacao) {
        infoPaginacao.innerText = `Exibindo ${pontosFiltrados.length} de ${pontosCarregados.length} ponto(s)`;
    }
}


// Exclusão
function abrirConfirmacaoExclusao() {
    const nome = document.getElementById('editar-nome').value;
    document.getElementById('nome-exclusao-titulo').innerText = nome.toUpperCase();
    document.getElementById('nome-exclusao-corpo').innerText = nome.toUpperCase();
    
    document.getElementById('modal-confirmar-exclusao').classList.add('mostrar-modal');
}

function fecharConfirmacao() {
    document.getElementById('modal-confirmar-exclusao').classList.remove('mostrar-modal');
}

// Remover ponto do banco ao confirmar exclusão
document.getElementById('btn-confirmar-delete').addEventListener('click', async () => {
    const idOriginal = document.getElementById('editar-id').value;
    const isParceiro = idOriginal.startsWith('parceiro-');
    const idLimpo = isParceiro ? idOriginal.replace('parceiro-', '') : idOriginal;
    
    const tabela = isParceiro ? 'empresa_parceira' : 'ponto';
    const colunaId = isParceiro ? 'id_empresa' : 'id_ponto';

    try {
        const { error } = await supabaseClient
            .from(tabela)
            .delete()
            .eq(colunaId, idLimpo);

        if (error) throw error;

        alert('Removido com sucesso!');
        fecharConfirmacao();
        fecharModais();
        buscarPontosDoBanco();
    } catch (err) {
        console.error('Erro ao excluir:', err.message);
        alert('Erro ao excluir o registro.');
    }
});