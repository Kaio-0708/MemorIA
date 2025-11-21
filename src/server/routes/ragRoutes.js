import express from "express";
import { ragPipeline } from "../service/ragPipeline.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { assunto, pergunta } = req.body;
  if (!assunto || !pergunta)
    return res.status(400).json({ error: "Envie o assunto e a pergunta" });

  try {
    const resposta = await ragPipeline(assunto, pergunta);
    res.json({ ok: true, resposta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
