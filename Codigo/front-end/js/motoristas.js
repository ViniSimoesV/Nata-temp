// Configurações do Supabase
const SUPABASE_URL = 'https://raykwpryvxfittrlkbey.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C5oimXD8Ez6Ngh_MpSg01g_9J6F4Eam';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let todosMotoristas = []; // Variável global essencial para o filtro funcionar

document.addEventListener('DOMContentLoaded', () => {
    buscarMotoristas();

    // Eventos para filtragem em tempo real
    document.getElementById('pesquisa-nome').addEventListener('input', filtrarMotoristas);
    document.getElementById('filtro-dia').addEventListener('change', filtrarMotoristas);
    document.querySelectorAll('.filtro-cnh, .filtro-turno').forEach(el => {
        el.addEventListener('change', filtrarMotoristas);
    });
});

async function buscarMotoristas() {
    const container = document.getElementById('container-motoristas');
    
    try {
        const { data, error } = await supabaseClient
            .from('motorista')
            .select(`
                *,
                disponibilidade_motorista (
                    dia_da_semana,
                    turno
                )
            `);

        if (error) throw error;

        // IMPORTANTE: Salva os dados brutos aqui para que o filtro tenha de onde ler
        todosMotoristas = data; 
        renderizarCards(todosMotoristas);

    } catch (error) {
        console.error('Erro ao buscar motoristas:', error);
        if (container) container.innerHTML = "<p>Erro ao carregar dados.</p>";
    }
}

function filtrarMotoristas() {
    const nomeBusca = document.getElementById('pesquisa-nome').value.toLowerCase();
    const diaBusca = document.getElementById('filtro-dia').value;
    
    // Captura o estado atual dos filtros
    const cnhsSelecionadas = Array.from(document.querySelectorAll('.filtro-cnh:checked')).map(cb => cb.value);
    const turnosSelecionados = Array.from(document.querySelectorAll('.filtro-turno:checked')).map(cb => cb.value);

    const filtrados = todosMotoristas.filter(mot => {
        // 1. Filtro por Nome
        const matchNome = mot.nome_motorista.toLowerCase().includes(nomeBusca);

        // 2. Filtro por CNH (Lógica "Possui todas as selecionadas")
        // Se quiser "Possui pelo menos uma", mude .every para .some
        const matchCNH = cnhsSelecionadas.length === 0 || cnhsSelecionadas.every(cnh => mot[cnh] === true);

        // 3. Filtro por Disponibilidade (Dia e Turno)
        const filtrosDispAtivos = diaBusca !== "" || turnosSelecionados.length > 0;
        let matchDisp = true;

        if (filtrosDispAtivos) {
            matchDisp = mot.disponibilidade_motorista.some(d => {
                const matchDia = diaBusca === "" || d.dia_da_semana === diaBusca;
                const matchTurno = turnosSelecionados.length === 0 || turnosSelecionados.includes(d.turno);
                return matchDia && matchTurno;
            });
        }

        return matchNome && matchCNH && matchDisp;
    });

    renderizarCards(filtrados);
}

function renderizarCards(lista) {
    const container = document.getElementById('container-motoristas');
    if (!container) return;
    
    container.innerHTML = ""; 

    if (lista.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; margin-top: 20px;">Nenhum motorista encontrado com esses filtros.</p>';
        document.getElementById('info-paginacao').innerText = "Exibindo 0 motorista(s)";
        return;
    }

    lista.forEach(mot => {
        const mapaDisp = {};
        mot.disponibilidade_motorista.forEach(d => {
            if (!mapaDisp[d.dia_da_semana]) mapaDisp[d.dia_da_semana] = [];
            mapaDisp[d.dia_da_semana].push(d.turno);
        });
        
        container.innerHTML += criarCardMotorista(mot, mapaDisp);
    });

    document.getElementById('info-paginacao').innerText = `Exibindo ${lista.length} motorista(s)`;
}

// Mantive sua estrutura de exibição original conforme solicitado
function criarCardMotorista(mot, mapaDisp) {
    const dias = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
    const labels = { seg: 'S', ter: 'T', qua: 'Q', qui: 'Q', sex: 'S', sab: 'S', dom: 'D' };

    const htmlDias = dias.map(dia => {
        const turnos = mapaDisp[dia] || [];
        const isAtivo = turnos.length > 0 ? 'ativo' : '';
        
        const turnosVisiveis = `
            <div class="turnos-indicador">
                <span class="${turnos.includes('manha') ? 'show' : ''}">m</span>
                <span class="${turnos.includes('tarde') ? 'show' : ''}">t</span>
                <span class="${turnos.includes('noite') ? 'show' : ''}">n</span>
            </div>
        `;

        return `
            <div class="dia-coluna">
                <span class="circulo-dia ${isAtivo}">${labels[dia]}</span>
                ${turnosVisiveis}
            </div>
        `;
    }).join('');

    return `
        <div class="card-ponto">
            <div class="card-capa">
                <h3>${mot.nome_motorista}</h3>
                <div class="tipo-capa">
                    <i class="ph ph-identification-card"></i> CNH: 
                    ${mot.cnh_a ? '|A|' : ''}${mot.cnh_b ? '|B|' : ''}${mot.cnh_c ? '|C|' : ''}
                </div>
            </div>
            <div class="card-conteudo-detalhado">
                <div class="card-header">
                    <h4 style="margin:0; color:#db5c33;">${mot.nome_motorista}</h4>
                    <div style="font-size: 0.8rem; color: #666;">
                        <i class="ph ph-identification-card"></i> CNH: 
                        ${mot.cnh_a ? '|A|' : ''}${mot.cnh_b ? '|B|' : ''}${mot.cnh_c ? '|C|' : ''}
                    </div>
                </div>
                <div class="card-body-scroll">
                    <p><i class="ph ph-phone"></i> <strong>Telefone:</strong> ${mot.telefone_motorista}</p>
                    <p><i class="ph ph-envelope"></i> <strong>Email:</strong> ${mot.email_motorista}</p>
                    <hr>
                    <p><i class="ph ph-map-pin"></i> <strong>Endereço:</strong> ${mot.rua_motorista}, ${mot.bairro_motorista}, ${mot.numeroResidencia_motorista}</p>
                    <p><i class="ph ph-buildings"></i> <strong>Cidade:</strong> ${mot.cidade_motorista}</p>
                    <hr>
                    <div class="disponibilidade-info">
                        <strong>Disponibilidade e Turnos:</strong>
                        <div class="dias-grid-turnos">
                            ${htmlDias}
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn-card-editar" onclick="abrirModalEdicao('${mot.id_motorista}')">
                        <i class="ph ph-pencil-simple"></i> Editar
                    </button>
                </div>
            </div>
        </div>`;
}


// EDIÇÃO 

window.abrirModalEdicao = async function(id) {
    const motorista = todosMotoristas.find(m => String(m.id_motorista) === String(id));

    if (motorista) {
        // Preenche campos básicos
        document.getElementById('editar-id').value = id;
        document.getElementById('editar-nome').value = motorista.nome_motorista;
        document.getElementById('editar-cpf').value = motorista.cpf_motorista || '';
        document.getElementById('editar-email').value = motorista.email_motorista || '';
        document.getElementById('editar-telefone').value = motorista.telefone_motorista || '';
        document.getElementById('editar-cep').value = motorista.cep_motorista || '';
        document.getElementById('editar-rua').value = motorista.rua_motorista || '';
        document.getElementById('editar-numero').value = motorista.numeroResidencia_motorista || '';
        document.getElementById('editar-bairro').value = motorista.bairro_motorista || '';
        document.getElementById('editar-cidade').value = motorista.cidade_motorista || '';
        document.getElementById('editar-cnh-a').checked = motorista.cnh_a;
        document.getElementById('editar-cnh-b').checked = motorista.cnh_b;
        document.getElementById('editar-cnh-c').checked = motorista.cnh_c;

        // Abrir Modal
        document.getElementById('modal-editar-motorista').classList.add('mostrar-modal');
        document.getElementById('modal-overlay').classList.add('mostrar-modal');
    }
};

window.fecharModais = function() {
    document.getElementById('modal-overlay').classList.remove('mostrar-modal');
    document.getElementById('modal-editar-motorista').classList.remove('mostrar-modal');
    document.getElementById('modal-confirmar-exclusao').classList.remove('mostrar-modal');
};

// EDITAR
const formEditar = document.getElementById('form-editar-motorista');
if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();

        const idMotorista = document.getElementById('editar-id').value;

        const dadosAtualizados = {
            nome_motorista: document.getElementById('editar-nome').value,
            cpf_motorista: document.getElementById('editar-cpf').value,
            email_motorista: document.getElementById('editar-email').value,
            telefone_motorista: document.getElementById('editar-telefone').value,
            cep_motorista: document.getElementById('editar-cep').value,
            rua_motorista: document.getElementById('editar-rua').value,
            numeroResidencia_motorista: document.getElementById('editar-numero').value,
            bairro_motorista: document.getElementById('editar-bairro').value,
            cidade_motorista: document.getElementById('editar-cidade').value,
            cnh_a: document.getElementById('editar-cnh-a').checked,
            cnh_b: document.getElementById('editar-cnh-b').checked,
            cnh_c: document.getElementById('editar-cnh-c').checked
        };

        try {
            // Atualizar dados do motorista
            const { error: erroUpdate } = await supabaseClient
                .from('motorista')
                .update(dadosAtualizados)
                .eq('id_motorista', idMotorista);

            if (erroUpdate) throw erroUpdate;

            alert('Motorista atualizado com sucesso!');
            fecharModais();
            buscarMotoristas(); // Recarrega a lista

        } catch (err) {
            console.error('Erro ao atualizar:', err.message);
            alert('Erro ao salvar alterações.');
        }
    });
}

// EXCLUIR
window.abrirConfirmacaoExclusao = function() {
    const nome = document.getElementById('editar-nome').value;
    document.getElementById('nome-exclusao-titulo').innerText = nome.toUpperCase();
    document.getElementById('nome-exclusao-corpo').innerText = nome.toUpperCase();
    document.getElementById('modal-editar-motorista').classList.remove('mostrar-modal');
    document.getElementById('modal-confirmar-exclusao').classList.add('mostrar-modal');
};

window.fecharConfirmacao = function() {
    document.getElementById('modal-confirmar-exclusao').classList.remove('mostrar-modal');
    document.getElementById('modal-editar-motorista').classList.add('mostrar-modal');
};

document.getElementById('btn-confirmar-delete').addEventListener('click', async () => {
    const id = document.getElementById('editar-id').value;

    try {
        // Primeiro remove as disponibilidades vinculadas
        const { error: erroDisp } = await supabaseClient
            .from('disponibilidade_motorista')
            .delete()
            .eq('id_motorista', id);

        if (erroDisp) throw erroDisp;

        // 2. Remove o motorista
        const { error: erroMot } = await supabaseClient
            .from('motorista')
            .delete()
            .eq('id_motorista', id);

        if (erroMot) throw erroMot;

        alert('Motorista removido com sucesso!');
        fecharModais();
        buscarMotoristas(); // Recarrega a lista de cards
    } catch (err) {
        console.error('Erro detalhado:', err);
        alert('Não foi possível excluir o motorista. Verifique se ele possui vínculos ativos.');
    }
});