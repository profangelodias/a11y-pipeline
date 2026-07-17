const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Captura a chave de API das variáveis de ambiente (GitHub Secrets)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ ERRO: GEMINI_API_KEY não foi configurada.');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function auditarAcessibilidade() {
    try {
        console.log('⏳ Iniciando auditoria de acessibilidade com IA...');

        // Lê o arquivo HTML que está sendo avaliado na PR
        const htmlContent = fs.readFileSync('./index.html', 'utf8');

        // Configura o modelo
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        // Prompt estratégico e blindado para a demonstração
        const prompt = `
        Atue como um Auditor Sênior de Acessibilidade Digital (WCAG 2.2).
        Avalie o seguinte código HTML e verifique rigorosamente:
        1. Elementos interativos: Se existirem <div> ou <span> atuando como botões (com onclick) no lugar de tags <button>, isso é uma violação crítica.
        2. Imagens: Imagens devem ter atributos 'alt' descritivos e úteis.
        3. Contraste: Textos em tons muito claros sobre fundos brancos (ex: #cccccc sobre #ffffff) são violações críticas.

        Regras de Saída (Siga rigorosamente):
        - Se encontrar ALGUMA das violações acima, inicie sua resposta EXATAMENTE com a string: [VIOLAÇÃO CRÍTICA]. Depois, explique brevemente o porquê.
        - Se o código estiver semanticamente correto, com bom contraste e estruturado, inicie sua resposta EXATAMENTE com a string: [ACESSÍVEL]. Depois, elogie a estrutura.

        Código HTML:
        ${htmlContent}
        `;

        // Executa a chamada para a API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textoAuditoria = response.text();

        console.log('\n================ RELATÓRIO GEMINI ================\n');
        console.log(textoAuditoria);
        console.log('\n==================================================\n');

        // Lógica de aprovação/reprovação da Pipeline
        if (textoAuditoria.includes('[VIOLAÇÃO CRÍTICA]')) {
            console.error('❌ PIPELINE BLOQUEADA: A IA detectou violações críticas de acessibilidade.');
            process.exit(1); // Quebra a esteira
        } else if (textoAuditoria.includes('[ACESSÍVEL]')) {
            console.log('✅ PIPELINE APROVADA: Código acessível e validado pela IA!');
            process.exit(0); // Aprova a esteira
        } else {
            console.warn('⚠️ AVISO: Resposta inconclusiva da IA. Revisão manual necessária.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Erro interno no script:', error);
        process.exit(1);
    }
}

auditarAcessibilidade();