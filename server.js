const express = require("express");
const path = require("path");
const app = express();
app.use(express.json({ limit: "30mb" }));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const DEFAULT_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

async function askAI(messages, userKey) {
  const key = userKey || process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Добавь API-ключ в настройках или настрой OPENAI_API_KEY на сервере.");
  const response = await fetch(process.env.AI_BASE_URL || "https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model: DEFAULT_MODEL, messages, temperature: 0.85 })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Ошибка AI API");
  return data.choices?.[0]?.message?.content || "";
}

app.post("/api/reply", async (req, res) => {
  try {
    const { comment, tone = "уверенно и спокойно", apiKey } = req.body;
    if (!comment?.trim()) return res.status(400).json({ error: "Вставь комментарий." });
    const result = await askAI([
      { role: "system", content: "Ты помогаешь писать естественные короткие ответы на комментарии в соцсетях. Пиши как живой человек: обычно строчными буквами, без длинных тире, без канцелярита и шаблонных вступлений. Не унижай, не угрожай и не разжигай конфликт. Ответ должен звучать уверенно, уместно и не слишком идеально. Верни только готовый ответ." },
      { role: "user", content: `Стиль: ${tone}\nКомментарий: ${comment}\nНапиши один естественный ответ.` }
    ], apiKey);
    res.json({ result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/slides", async (req, res) => {
  try {
    const { topic, count = 6, category = "образование", apiKey } = req.body;
    if (!topic?.trim()) return res.status(400).json({ error: "Укажи тему." });
    const result = await askAI([
      { role: "system", content: "Ты сценарист коротких вертикальных образовательных каруселей для TikTok/Instagram. Создавай цепляющие, точные и легко читаемые слайды. Верни JSON-массив объектов с полями title, text, image_prompt. Без markdown и пояснений." },
      { role: "user", content: `Тема: ${topic}. Категория: ${category}. Количество слайдов: ${Math.max(2, Math.min(12, Number(count) || 6))}. Первый слайд должен цеплять, последний давать вывод или призыв. Текст короткий.` }
    ], apiKey);
    let slides;
    try { slides = JSON.parse(result.replace(/^```(?:json)?|```$/g, "").trim()); }
    catch { return res.json({ result }); }
    res.json({ slides });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/health", (_, res) => res.json({ ok: true, app: "NEXORA AI" }));
app.get("*", (_, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`NEXORA AI running on port ${PORT}`));
