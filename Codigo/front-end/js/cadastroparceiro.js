// Configurações do Supabase (Garanta que as constantes estão com os valores corretos)
const SUPABASE_URL = 'https://raykwpryvxfittrlkbey.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C5oimXD8Ez6Ngh_MpSg01g_9J6F4Eam';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const formCadastro = document.getElementById('form-novo-parceiro');

if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Captura os valores usando o atributo 'name' do HTML
        const novoParceiro = {
            nome_empresa: document.querySelector('[name="nome_empresa"]').value,
            cnpj: document.querySelector('[name="cnpj"]').value,
            cep: document.querySelector('[name="cep"]').value,
            rua: document.querySelector('[name="rua"]').value,
            numero: document.querySelector('[name="numero"]').value,
            bairro: document.querySelector('[name="bairro"]').value,
            cidade: document.querySelector('[name="cidade"]').value,
            complemento: document.querySelector('[name="complemento"]').value,
            nome_representante: document.querySelector('[name="nome_rep"]').value,
            telefone_representante: document.querySelector('[name="tel_rep"]').value,
            email_representante: document.querySelector('[name="email_rep"]').value,
            // Converte o valor do radio para booleano (true/false) para o banco
            isPontoColeta: document.querySelector('input[name="ponto_coleta"]:checked').value === 'sim',
            isPontoEntrega: document.querySelector('input[name="ponto_entrega"]:checked').value === 'sim'
        };

        try {
            // PUSH para a tabela: empresa_parceira
            const { data, error } = await _supabase
                .from('empresa_parceira')
                .insert([novoParceiro]);

            if (error) throw error;

            alert('Parceiro cadastrado com sucesso!');
            window.location.href = 'parceiros.html'; 
            
        } catch (error) {
            console.error('Erro detalhado:', error);
            alert('Erro ao salvar no banco: ' + error.message);
        }
    });
}