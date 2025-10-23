
export const buscarCep = async (cep) => {
    const raw = cep.replace(/\D/g, '');
    if (raw.length !== 8) throw new Error("CEP inválido");
    
    try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        if (!res.ok) throw new Error("Erro na API do ViaCEP");
        
        const js = await res.json();
        if (js.erro) throw new Error("CEP não encontrado");
        
        return {
            logradouro: js.logradouro || '',
            bairro: js.bairro || '',
            localidade: js.localidade || '',
            uf: js.uf || ''
        };
    } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        throw new Error("Falha na consulta de CEP");
    }
};