const SUPABASE_URL = 'https://raykwpryvxfittrlkbey.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C5oimXD8Ez6Ngh_MpSg01g_9J6F4Eam';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let parceirosCarregados = [];

document.addEventListener('DOMContentLoaded', () => {
    buscarParceirosDoBanco();

    // Eventos para filtragem em tempo real
    document.getElementById('pesquisa-nome').addEventListener('input', filtrarParceiros);
    document.getElementById('filtro-coleta').addEventListener('change', filtrarParceiros);
    document.getElementById('filtro-entrega').addEventListener('change', filtrarParceiros);
});

async function buscarParceirosDoBanco() {

    // Busca da tabela correta que vimos na sua imagem anterior
    const { data, error } = await supabaseClient
        .from('empresa_parceira')
        .select('*');

    if (error) {
        console.error('Erro ao buscar:', error.message);
        renderizarCards([]); 
        return;
    }

    parceirosCarregados = data;
    renderizarCards(data);
    
    const infoPaginacao = document.getElementById('info-paginacao');
    if (infoPaginacao) {
        
        infoPaginacao.innerText = `Exibindo ${data.length} parceiro(s)`;
    }
}

function renderizarCards(lista) {
    const containerCards = document.getElementById('container-parceiros');
    if (!containerCards) return;
    
    containerCards.innerHTML = ""; 

    if (lista.length === 0) {
        containerCards.innerHTML = `<p style="grid-column: 1/-1; text-align: center; margin-top: 30px;">Nenhum parceiro encontrado.</p>`;
        return;
    }

    lista.forEach(item => {
        const cardHTML = `
            <div class="card-parceiro">
                <div class="card-header">
                    <h3>${item.nome_empresa}</h3>
                    <div class="tags-tipo-card">
                        ${item.isPontoColeta ? `
                            <span class="tag-tipo coleta">
                                <i class="ph ph-truck"></i> Coleta
                            </span>
                        ` : ''}
                        ${item.isPontoEntrega ? `
                            <span class="tag-tipo entrega">
                                <i class="ph ph-package"></i> Entrega
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="card-body">
                    <p><strong>Representante:</strong> ${item.nome_representante}</p>
                    <p><i class="ph ph-phone"></i> ${item.telefone_representante}</p>
                    <p><i class="ph ph-envelope"></i> ${item.email_representante}</p>
                    <hr>
                    <p><strong>Cidade:</strong> ${item.cidade} - ${item.bairro}</p>
                    <p><strong>Endereço:</strong> ${item.rua}, ${item.numero}</p>
                </div>

                <div class="card-footer">
                    <button class="btn-card-editar" onclick="abrirModalEdicao(${item.id_empresa})">
                        <i class="ph ph-pencil-simple"></i> Editar
                    </button>
                    <button class="btn-card-recibo" onclick="gerarRecibo(${item.id_empresa})">
                        <i class="ph ph-file-text"></i> Recibo
                    </button>
                </div>
            </div>`;
        containerCards.innerHTML += cardHTML;
    });
}

// Funções de Modal (globais para funcionarem no onclick)
function abrirModalEdicao(id) {
    // Busca o parceiro específico dentro do nosso array local
    const parceiro = parceirosCarregados.find(p => p.id_empresa === id);

    if (parceiro) {
        // Preenche os campos do modal com os dados do banco
        document.getElementById('editar-id').value = parceiro.id_empresa;
        document.getElementById('editar-nome').value = parceiro.nome_empresa;
        document.getElementById('editar-id').value = parceiro.id_empresa;
        document.getElementById('editar-nome').value = parceiro.nome_empresa;
        document.getElementById('editar-contato').value = parceiro.nome_representante;
        document.getElementById('editar-email').value = parceiro.email_representante;
        document.getElementById('editar-telefone').value = parceiro.telefone_representante;
        document.getElementById('editar-cep').value = parceiro.cep;
        document.getElementById('editar-cnpj').value = parceiro.cnpj;
        document.getElementById('editar-rua').value = parceiro.rua;
        document.getElementById('editar-bairro').value = parceiro.bairro;
        document.getElementById('editar-cidade').value = parceiro.cidade;
        document.getElementById('editar-numero').value = parceiro.numero;

        // Marcar Rádios de Coleta
        if (parceiro.isPontoColeta) {
            document.getElementById('coleta-sim').checked = true;
        } else {
            document.getElementById('coleta-nao').checked = true;
        }

        // Marcar Rádios de Entrega
        if (parceiro.isPontoEntrega) {
            document.getElementById('entrega-sim').checked = true;
        } else {
            document.getElementById('entrega-nao').checked = true;
        }

        // Abre visualmente o modal
        document.getElementById('modal-editar-parceiro').classList.add('mostrar-modal');
        document.getElementById('modal-overlay').classList.add('mostrar-modal');
    }
}

function fecharModais() {
    document.getElementById('modal-overlay').classList.remove('mostrar-modal');
    document.getElementById('modal-editar-parceiro').classList.remove('mostrar-modal');
}

// EDITAR PARCEIRO
// Evento de envio do formulário de edição
const formEditar = document.getElementById('form-editar-parceiro');
if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('editar-id').value;

        // Monta o objeto com os novos valores
        const dadosAtualizados = {
            nome_empresa: document.getElementById('editar-nome').value,
            nome_representante: document.getElementById('editar-contato').value,
            email_representante: document.getElementById('editar-email').value,
            telefone_representante: document.getElementById('editar-telefone').value,
            cnpj: document.getElementById('editar-cnpj').value,
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
                .from('empresa_parceira')
                .update(dadosAtualizados)
                .eq('id_empresa', id);

            if (error) throw error;

            alert('Dados atualizados com sucesso!');
            fecharModais();
            buscarParceirosDoBanco(); // Recarrega a lista para mostrar as alterações
        } catch (err) {
            console.error('Erro ao atualizar:', err.message);
            alert('Não foi possível salvar as alterações.');
        }
    });
}


function filtrarParceiros() {
    const termoPesquisa = document.getElementById('pesquisa-nome').value.toLowerCase();
    const querColeta = document.getElementById('filtro-coleta').checked;
    const querEntrega = document.getElementById('filtro-entrega').checked;

    // Filtra os dados que já estão na memória (parceirosCarregados)
    const parceirosFiltrados = parceirosCarregados.filter(p => {
        // 1. Filtro por Nome (pode usar CNPJ também se quiser)
        const nomeMatch = p.nome_empresa.toLowerCase().includes(termoPesquisa);
        
        // 2. Filtro por Tipo (Lógica: se o checkbox está marcado, o parceiro PRECISA ter aquela coluna como true)
        // Se nada estiver marcado, mostra todos. Se marcado, filtra estritamente.
        let tipoMatch = true;
        if (querColeta && !p.isPontoColeta) tipoMatch = false;
        if (querEntrega && !p.isPontoEntrega) tipoMatch = false;

        return nomeMatch && tipoMatch;
    });

    // Re-renderiza os cards com a lista filtrada
    renderizarCards(parceirosFiltrados);

    // Atualiza o contador
    const infoPaginacao = document.getElementById('info-paginacao');
    if (infoPaginacao) {
        infoPaginacao.innerText = `Exibindo ${parceirosFiltrados.length} de ${parceirosCarregados.length} parceiro(s)`;
    }
}