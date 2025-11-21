/**
 * @param {string} prompt
 * @param {string} [model="gemini-2.0-flash"]
 * @returns {Promise<string|null>}
 */


export async function generateWithContext(pergunta, markdown) {
  const prompt = `Você é o MemorIA, um tutor virtual que cria cartas de memória educativas.

OBJETIVO:
A partir do conteúdo abaixo (Markdown), gere **8 pares de cartas** para um jogo da memória. 
Cada par deve conter:
1. question: uma pergunta clara sobre o conteúdo.
2. answer: a resposta correspondente.
3. justification: uma breve explicação ou curiosidade (1-2 frases) sobre a resposta.

REGRAS IMPORTANTES:
1. Use apenas o material fornecido no Markdown. Ignore qualquer conhecimento externo.
2. As perguntas devem abordar diferentes tópicos do conteúdo.
3. Seja didático, conciso e preciso.
4. Saída obrigatória em JSON, pronto para usar no Memory.jsx, no formato:

[
  {
    "id": 1,
    "question": "Pergunta 1?",
    "answer": "Resposta 1",
    "justification": "Explicação breve ou curiosidade."
  },
  ...
]

MATERIAL DE ESTUDO (Markdown):
--------------------------------
${markdown}
--------------------------------

---  
Agora, gere os 8 pares de perguntas e respostas seguindo estritamente estas instruções.`;

  try {
    
    const res = await fetch("http://localhost:3001/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`Erro na API: ${res.status}`);
    }

    const data = await res.json();
    return data.result || "";
  } catch (err) {
    console.error("Erro ao chamar backend:", err);
    return "";
  }
}
