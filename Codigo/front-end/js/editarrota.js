const SUPABASE_URL = 'https://raykwpryvxfittrlkbey.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C5oimXD8Ez6Ngh_MpSg01g_9J6F4Eam';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let paradasDaRota = [];
let idRotaAtual = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    idRotaAtual = urlParams.get('id');

    if (!idRotaAtual) {
        alert("ID da rota não encontrado!");
        window.location.href = 'rotas.html';
        return;
    }

    await carregarDadosIniciais();
    await buscarDadosDaRota();
    configurarFormulario();
});

async function carregarDadosIniciais() {
    // Carrega Veículos, Motoristas e Pontos (reutilizando a lógica de cadastro)
    const { data: veiculos } = await _supabase.from('veiculo').select('id_veiculo, placa, modelo');
    const selectV = document.getElementById('select-veiculo');
    selectV.innerHTML = '<option value="">Selecione o Veículo</option>';
    veiculos.forEach(v => selectV.innerHTML += `<option value="${v.id_veiculo}">${v.placa} - ${v.modelo}</option>`);

    const { data: motoristas } = await _supabase.from('motorista').select('id_motorista, nome_motorista');
    const selectM = document.getElementById('select-motorista');
    selectM.innerHTML = '<option value="">Selecione o Motorista</option>';
    motoristas.forEach(m => selectM.innerHTML += `<option value="${m.id_motorista}">${m.nome_motorista}</option>`);

    const { data: pontos } = await _supabase.from('ponto').select('id_ponto, nome_ponto, isPontoColeta, isPontoEntrega');
    const selectP = document.getElementById('select-ponto-base');
    pontos.forEach(p => {
        const tipo = p.isPontoColeta && p.isPontoEntrega ? 'Misto' : (p.isPontoColeta ? 'Coleta' : 'Entrega');
        selectP.innerHTML += `<option value="${p.id_ponto}" data-nome="${p.nome_ponto}" data-tipo="${tipo}">${p.nome_ponto} (${tipo})</option>`;
    });
}

async function buscarDadosDaRota() {
    // Busca dados da rota e suas paradas relacionadas
    const { data: rota, error } = await _supabase
        .from('rota')
        .select('*, ponto_parada(*, ponto(nome_ponto))')
        .eq('id_rota', idRotaAtual)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    // Preenche o formulário
    document.getElementById('edit-nome-rota').value = rota.noma_rota;
    document.getElementById('edit-tipo-rota').value = rota.tipo_rota;
    document.getElementById('select-veiculo').value = rota.id_veiculo || "";
    document.getElementById('select-motorista').value = rota.id_motorista || "";

    // Mapeia as paradas existentes para o array local
    paradasDaRota = rota.ponto_parada.sort((a, b) => a.ordem_parada - b.ordem_parada).map(p => ({
        id_ponto: p.id_ponto,
        nome: p.ponto.nome_ponto,
        tipo: p.tipo_parada,
        ordem: p.ordem_parada
    }));

    renderizarTabelaParadas();
}

// Funções de manipulação da tabela (adicionar/remover) permanecem iguais ao cadastrorota.js
function adicionarPontoNaLista() {
    const select = document.getElementById('select-ponto-base');
    const pontoId = select.value;
    if (!pontoId) return;

    const option = select.options[select.selectedIndex];
    paradasDaRota.push({
        id_ponto: pontoId,
        nome: option.getAttribute('data-nome'),
        tipo: option.getAttribute('data-tipo'),
        ordem: paradasDaRota.length + 1
    });
    renderizarTabelaParadas();
}

function renderizarTabelaParadas() {
    const corpo = document.getElementById('lista-paradas-corpo');
    corpo.innerHTML = paradasDaRota.map((p, index) => `
        <tr>
            <td>${index + 1}º</td>
            <td>${p.nome}</td>
            <td><span class="status-tag ${p.tipo.toLowerCase()}">${p.tipo}</span></td>
            <td>
                <button type="button" onclick="removerParada(${index})" class="btn-tabela-editar" style="color: red;">
                    <i class="ph ph-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

window.removerParada = (index) => {
    paradasDaRota.splice(index, 1);
    renderizarTabelaParadas();
};

function configurarFormulario() {
    document.getElementById('form-editar-rota').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const dadosAtualizados = {
            noma_rota: formData.get('nome_rota'),
            id_veiculo: formData.get('id_veiculo') ? parseInt(formData.get('id_veiculo')) : null,
            id_motorista: formData.get('id_motorista') ? parseInt(formData.get('id_motorista')) : null,
            tipo_rota: formData.get('tipo_rota')
        };

        try {
            // 1. Atualiza o cabeçalho da rota
            await _supabase.from('rota').update(dadosAtualizados).eq('id_rota', idRotaAtual);

            // 2. Sincroniza as paradas: mais simples deletar as antigas e inserir a nova lista ordenada
            await _supabase.from('ponto_parada').delete().eq('id_rota', idRotaAtual);

            const paradasParaBanco = paradasDaRota.map((p, i) => ({
                id_rota: idRotaAtual,
                id_ponto: p.id_ponto,
                ordem_parada: i + 1,
                status_parada: 'Pendente',
                tipo_parada: p.tipo
            }));

            await _supabase.from('ponto_parada').insert(paradasParaBanco);

            alert("Rota atualizada com sucesso!");
            window.location.href = "rotas.html";
        } catch (error) {
            alert("Erro ao atualizar: " + error.message);
        }
    });
}

window.confirmarRemoverRota = async () => {
    if (confirm("Tem certeza que deseja excluir este plano de rota permanentemente?")) {
        try {
            // Deleta paradas e depois a rota (devido às constraints)
            await _supabase.from('ponto_parada').delete().eq('id_rota', idRotaAtual);
            const { error } = await _supabase.from('rota').delete().eq('id_rota', idRotaAtual);
            
            if (error) throw error;
            alert("Rota removida!");
            window.location.href = 'rotas.html';
        } catch (error) {
            alert("Erro ao remover: " + error.message);
        }
    }
}