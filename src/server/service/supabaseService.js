import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const salvarArquivo = async ({
  assunto,
  turma,
  materia,
  detalhes,
  markdown,
  professor_uid,
}) => {
  if (!assunto || !turma || !materia || !professor_uid) {
    throw new Error(
      "Campos obrigatórios faltando: assunto, materia ou professor_uid"
    );
  }

  const { data, error } = await supabase
    .from("arquivos")
    .insert([{ assunto, turma, materia, detalhes, markdown, professor_uid }])
    .select();

  if (error) {
    console.error("Erro ao salvar no Supabase:", error);
    throw error;
  }

  console.log("Inserção bem-sucedida:", data);
  return { data, error: null };
};

export const pegarArquivosPorProfessor = async (professor_uid) => {
  const { data, error } = await supabase
    .from("arquivos")
    .select("*")
    .eq("professor_uid", professor_uid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar arquivos por professor:", error);
    return { data: [], error };
  }

  return { data, error: null };
}

export const buscarArquivos = async () => {
  const { data, error } = await supabase
    .from("arquivos")
    .select("id, assunto, turma, materia, detalhes, markdown, professor_uid, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar arquivos no Supabase:", error);
    return { data: [], error };
  }

  return { data, error: null };
};

 export const getMarkdownByAssunto = async (assunto) => {
  if (!assunto) throw new Error("Assunto não informado.");
  
  const { data, error } = await supabase
    .from("arquivos")
    .select("markdown_limpo")
    .eq("assunto", assunto)
    .single();

  if (error) throw error;
  return data.markdown_limpo;
  
}