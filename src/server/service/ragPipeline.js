import { generateWithContext } from "./geminiService.js";
import { getMarkdownByAssunto } from "./supabaseService.js";

export async function ragPipeline(assunto, pergunta){
    const markdown = await getMarkdownByAssunto(assunto);
     if (!markdown) throw new Error("Markdown não encontrado para este assunto");
    const resposta = await generateWithContext(pergunta, markdown);
    return resposta;
}