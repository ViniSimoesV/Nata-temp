const SUPABASE_URL = 'https://raykwpryvxfittrlkbey.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C5oimXD8Ez6Ngh_MpSg01g_9J6F4Eam';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let todasRotas = [];

document.addEventListener('DOMContentLoaded', async () => {
    await carregarFiltrosIniciais(); 
    buscarRotasDoBanco();

    // Eventos para filtragem
    document.getElementById('pesquisa-geral').addEventListener('input', filtrarRotas);
    document.getElementById('filtro-tipo').addEventListener('change', filtrarRotas);
    document.getElementById('filtro-veiculo').addEventListener('change', filtrarRotas);
    document.getElementById('filtro-motorista').addEventListener('change', filtrarRotas);
    document.getElementById('filtro-status').addEventListener('change', filtrarRotas);
});


async function carregarFiltrosIniciais() {
    try {
        // Carrega veículos para o select de filtro
        const { data: veiculos } = await supabaseClient.from('veiculo').select('id_veiculo, placa');
        const selectV = document.getElementById('filtro-veiculo');
        veiculos.forEach(v => selectV.innerHTML += `<option value="${v.id_veiculo}">${v.placa}</option>`);

        // Carrega motoristas para o select de filtro
        const { data: motoristas } = await supabaseClient.from('motorista').select('id_motorista, nome_motorista');
        const selectM = document.getElementById('filtro-motorista');
        motoristas.forEach(m => selectM.innerHTML += `<option value="${m.id_motorista}">${m.nome_motorista}</option>`);
    } catch (err) {
        console.error("Erro ao carregar opções de filtro:", err);
    }
}

async function buscarRotasDoBanco() {
    try {
        // Busca a rota com join no veículo, motorista e nas paradas (que trazem os pontos)
        const { data, error } = await supabaseClient
            .from('rota')
            .select(`
                *,
                veiculo (placa, modelo),
                motorista:id_motorista (nome_motorista),
                ponto_parada (
                    tipo_parada,
                    status_parada,
                    ponto (nome_ponto, rua, bairro)
                )
            `);

        if (error) throw error;

        todasRotas = data;
        renderizarCardsRotas(data);
    } catch (error) {
        console.error('Erro ao buscar rotas:', error.message);
    }
}

function renderizarCardsRotas(lista) {
    const container = document.getElementById('container-rotas');
    if (!container) return;
    container.innerHTML = "";

    lista.forEach(rota => {
        // Separa as paradas (mantenha como está)
        const coletas = rota.ponto_parada.filter(p => p.tipo_parada === 'Coleta');
        const entregas = rota.ponto_parada.filter(p => p.tipo_parada === 'Entrega');

        const cardHTML = `
            <div class="card-rota">
                <div class="card-rota-capa">
                    <h2 class="titulo">${rota.noma_rota}</h2>
                    <div class="tag-tipo-rota">${rota.tipo_rota || 'Misto'}</div>
                    <div class="footer-capa">
                        <i class="ph ph-truck"></i>
                        <span>${rota.veiculo?.placa || 'Veículo N/D'}</span>
                    </div>
                </div>

                <div class="card-rota-detalhes">
                    <div class="detalhes-header">
                        <h3>${rota.noma_rota}</h3>
                        <span class="status-badge-tag">${rota.status_rota == 1 ? 'Registrada' : 'Em Rota'}</span>
                    </div>
                    
                    <div class="info-recursos">
                        <p><strong>Motorista:</strong> ${rota.motorista?.nome_motorista || 'N/D'}</p>
                        <p><strong>Veículo:</strong> ${rota.veiculo?.modelo || 'N/D'} (${rota.veiculo?.placa || ''})</p>
                    </div>

                    <div class="listas-pontos">
                        <div class="coluna-pontos">
                            <h4><i class="ph ph-download-simple"></i> Coletas</h4>
                            <ul>
                                ${coletas.map(c => `<li>• ${c.ponto.nome_ponto}</li>`).join('')}
                                ${coletas.length === 0 ? '<li>Nenhuma parada</li>' : ''}
                            </ul>
                        </div>
                        <div class="coluna-pontos">
                            <h4><i class="ph ph-upload-simple"></i> Entregas</h4>
                            <ul>
                                ${entregas.map(e => `<li>• ${e.ponto.nome_ponto}</li>`).join('')}
                                ${entregas.length === 0 ? '<li>Nenhuma parada</li>' : ''}
                            </ul>
                        </div>
                    </div>

                    <div class="acoes-card-rota">
                        <button onclick="window.location.href='editarrota.html?id=${rota.id_rota}'" class="btn-editar">
                            <i class="ph ph-pencil"></i> Editar
                        </button>
                        <button class="btn-salvar-form" style="background: #2e7d32; padding: 8px 12px; font-size: 0.85rem; border: none; cursor: pointer; color: white; border-radius: 6px; display: flex; align-items: center; gap: 5px;">
                            <i class="ph ph-play"></i> Iniciar Rota
                        </button>
                    </div>
                </div>
            </div>`;
        container.innerHTML += cardHTML;
    });

    document.getElementById('info-paginacao').innerText = `Exibindo ${lista.length} rota(s)`;
}

function filtrarRotas() {
    const termo = document.getElementById('pesquisa-geral').value.toLowerCase();
    const tipo = document.getElementById('filtro-tipo').value;
    const veiculoId = document.getElementById('filtro-veiculo').value;
    const motoristaId = document.getElementById('filtro-motorista').value;
    const status = document.getElementById('filtro-status').value;

    const filtradas = todasRotas.filter(r => {
        // 1. Busca por nome da rota OU pontos de parada (itinerário)
        const matchNomeRota = r.noma_rota.toLowerCase().includes(termo);
        const matchPonto = r.ponto_parada.some(p => 
            p.ponto?.nome_ponto.toLowerCase().includes(termo)
        );
        const matchBuscaGeral = matchNomeRota || matchPonto;

        // 2. Filtros de Seleção
        const matchTipo = tipo === "" || r.tipo_rota === tipo;
        const matchVeiculo = veiculoId === "" || String(r.id_veiculo) === veiculoId;
        const matchMotorista = motoristaId === "" || String(r.id_motorista) === motoristaId;
        const matchStatus = status === "" || String(r.status_rota) === status;

        return matchBuscaGeral && matchTipo && matchVeiculo && matchMotorista && matchStatus;
    });

    renderizarCardsRotas(filtradas);
}