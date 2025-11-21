import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, User, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const FileList = () => {
  const [fileList, setFileList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [assunto, setAssunto] = useState("");
  const [turma, setTurma] = useState("");
  const [materia, setMateria] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const xhrRef = useRef(null);

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
      setUploading(false);
      setUploadProgress(0);
      setArquivo(null);
      toast({ title: "Cancelado", description: "Upload cancelado pelo usuário." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!arquivo) {
      toast({
        title: "Arquivo PDF",
        description: "Por favor, adicione um arquivo PDF.",
      });
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado.",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", arquivo);
      formData.append("assunto", assunto);
      formData.append("turma", turma);
      formData.append("materia", materia);
      formData.append("detalhes", detalhes);
      formData.append("professor_uid", user.uid);

      setUploading(true);
      setUploadProgress(0);
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("POST", "http://localhost:3001/api/files/upload");

        xhr.onabort = function () {
          reject(new Error("Upload abortado"));
        };

        xhr.onerror = function () {
          reject(new Error("Erro de rede durante o upload"));
        };

        xhr.send(formData);
      });

      try {
        const data = await uploadPromise;
        toast({
          title: "Sucesso",
          description: "Arquivo enviado com sucesso!",
        });
        await carregarArquivos();
        setShowForm(false);
        setAssunto("");
        setTurma("");
        setMateria("");
        setDetalhes("");
        setArquivo(null);
      } catch (err) {
        console.error("Erro no upload (xhr):", err);
        toast({ title: "Erro", description: err.message || "Erro no upload" });
        setUploadProgress(0);
      } finally {
        setTimeout(() => {
          setUploadProgress(0);
          setUploading(false);
          xhrRef.current = null;
        }, 700);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o arquivo.",
      });
    }
  };

  const carregarArquivos = async (uid) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const professorUid = uid || (user && user.uid);
      if (!professorUid) return;

      const res = await fetch(
        `http://localhost:3001/api/files?professor_uid=${professorUid}`
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success && Array.isArray(json.data)) {
        const ownerKeys = [
          "professor_uid",
          "professorUid",
          "ownerId",
          "userId",
          "uid",
          "created_by",
        ];

        const filtered = json.data.filter((a) =>
          ownerKeys.some((k) => a[k] === professorUid)
        );

        const mapped = filtered.map((a) => ({
          id: a.id,
          contentName: a.assunto || "Sem título",
          classroom: a.turma || "",
          subject: a.materia || "",
          details: a.detalhes || "",
          markdown: a.markdown || null,
          created_at: a.created_at,
        }));
        setFileList(mapped);
      }
    } catch (err) {
      console.error("Erro ao carregar arquivos do servidor:", err);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        carregarArquivos(user.uid);
      } else {
        setFileList([]);
      }
    });

    return () => unsub();
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="glass-effect" style={{ backgroundColor: "#153c4b" }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold flex items-center gap-2 text-white">
            <FileText className="w-6 h-6 text-[#edbf21]" />
            Seus arquivos
          </CardTitle>
          <Button
            variant="outline"
            size="md"
            className="bg-[#edbf21] border-2 border-[#edbf21] text-[#153c4b] text-sm sm:text-base px-6 py-2 font-bold rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#f5d64f] transition-transform duration-300 w-auto mt-2"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo arquivo
          </Button>
        </CardHeader>

        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-white">
                Assunto
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
                <Input
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Nome do conteúdo"
                  className="pl-10 h-12 rounded-full bg-white/40 text-[#153c4b] placeholder:text-[#153c4b]/70 border-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-white">
                Turma
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
                <Input
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                  placeholder="Ex: 6 Ano B"
                  className="pl-10 h-12 rounded-full bg-white/40 text-[#153c4b] placeholder:text-[#153c4b]/70 border-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-white">
                Matéria
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
                <Input
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                  placeholder="Ex: Matemática"
                  className="pl-10 h-12 rounded-full bg-white/40 text-[#153c4b] placeholder:text-[#153c4b]/70 border-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-white">
                Detalhes
              </label>
              <Input
                value={detalhes}
                onChange={(e) => setDetalhes(e.target.value)}
                placeholder="Descrição do arquivo"
                className="h-12 rounded-full bg-white/40 text-[#153c4b] placeholder:text-[#153c4b]/70 border-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-white">
                Arquivo PDF
              </label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => setArquivo(e.target.files[0])}
                className="h-12 rounded-full bg-white/40 text-[#153c4b] placeholder:text-[#153c4b]/70 border-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {uploading && (
              <div className="flex items-center justify-center space-x-4 px-2">
                <div className="w-8 h-8 border-4 border-white/30 border-t-[#edbf21] rounded-full animate-spin" />
                <p className="text-white text-sm">Enviando...</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent text-white border-white/30"
                  onClick={cancelUpload}
                >
                  Cancelar upload
                </Button>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="bg-[#153c4b]  text-[#edbf21] text-2xl sm:text-2xl px-8 sm:px-16 py-4 sm:py-6 font-bold rounded-full flex items-center justify-center 
             hover:bg-[#edbf21] hover:text-[#153c4b] hover:scale-105 transition duration-300 mx-auto"
            >
              Enviar
            </Button>
          </form>
        )}

        <CardContent className="space-y-4">
          {fileList.map((file, index) => (
            <div key={index} className="p-4 bg-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-white">
                    {file.contentName}
                  </h3>
                  <p className="text-white/70 text-sm">{file.subject}</p>
                </div>
              </div>

              <div className="flex space-x-2 mt-3">
                <Button
                  variant="outline"
                  size="md"
                  className="bg-[#edbf21] border-2 border-[#edbf21] text-[#153c4b] px-6 py-2 font-bold rounded-full hover:scale-105 hover:bg-[#f5d64f] transition-transform duration-300"
                  onClick={() =>
                    toast({
                      title: "Detalhes do arquivo",
                      description: file.details,
                    })
                  }
                >
                  Ver Detalhes
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FileList;