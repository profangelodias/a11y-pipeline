const fs = require('fs');
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function auditarAcessibilidade() {
    try {
        console.log('⏳ Iniciando auditoria com OpenAI...');
        const htmlContent = fs.readFileSync('./index.html', 'utf8');

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{
                role: "system",
                content: "Atue como auditor WCAG 2.2. Analise o HTML. Se encontrar violações críticas (div como botão, falta de contraste, falta de alt), comece a resposta com [VIOLAÇÃO CRÍTICA]. Se estiver ok, comece com [ACESSÍVEL]."
            }, {
                role: "user",
                content: htmlContent
            }]
        });

        const resposta = completion.choices[0].message.content;
        console.log(resposta);

        if (resposta.includes('[VIOLAÇÃO CRÍTICA]')) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Erro na API:', error);
        process.exit(1);
    }
}

auditarAcessibilidade();