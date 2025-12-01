import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.");
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  return openaiClient;
}

interface DocumentContext {
  docId: string;
  docTitle: string;
  sectionId?: string;
  sectionTitle?: string;
  content: string;
}

interface Citation {
  index: number;
  docId: string;
  sectionId?: string;
  docTitle: string;
  sectionTitle?: string;
}

interface ChatResponse {
  id: string;
  content: string;
  citations: Citation[];
}

export async function generateChatResponse(
  userMessage: string,
  documentContexts: DocumentContext[]
): Promise<ChatResponse> {
  const openai = getOpenAIClient();

  const contextText = documentContexts.map((ctx, i) => {
    const header = ctx.sectionTitle 
      ? `[${i + 1}] Document: "${ctx.docTitle}" - Section: "${ctx.sectionTitle}"`
      : `[${i + 1}] Document: "${ctx.docTitle}"`;
    return `${header}\n${ctx.content}\n`;
  }).join('\n---\n');

  const systemPrompt = `You are an AI assistant for a dataroom application. Your role is to answer questions about the documents in the dataroom.

When answering questions:
1. Base your answers ONLY on the provided document contexts
2. Be specific and cite the sources by referencing their index numbers in square brackets [1], [2], etc.
3. If the information is not available in the documents, say so clearly
4. Provide concise but complete answers
5. Format your response in a readable way using markdown if needed

IMPORTANT: At the end of your response, provide a JSON array of citations in this exact format on a new line starting with "CITATIONS:":
CITATIONS: [{"index": 1, "docId": "...", "sectionId": "...", "docTitle": "...", "sectionTitle": "..."}]

Only include citations for sources you actually referenced in your answer.`;

  const userPrompt = `Here are the relevant documents from the dataroom:

${contextText}

User question: ${userMessage}

Please answer the question based on the documents above. Remember to include the CITATIONS array at the end.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_completion_tokens: 2048,
  });

  const fullContent = response.choices[0].message.content || "";
  
  let content = fullContent;
  let citations: Citation[] = [];
  
  const citationMatch = fullContent.match(/CITATIONS:\s*(\[[\s\S]*?\])\s*$/);
  if (citationMatch) {
    content = fullContent.replace(/CITATIONS:\s*\[[\s\S]*?\]\s*$/, '').trim();
    try {
      const parsedCitations = JSON.parse(citationMatch[1]);
      citations = parsedCitations.map((c: any, i: number) => ({
        index: c.index || i + 1,
        docId: c.docId,
        sectionId: c.sectionId,
        docTitle: c.docTitle,
        sectionTitle: c.sectionTitle,
      }));
    } catch (e) {
      console.error("Failed to parse citations:", e);
    }
  }
  
  return {
    id: `msg-${Date.now()}`,
    content,
    citations,
  };
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function findRelevantContexts(
  queryEmbedding: number[],
  documents: { 
    docId: string; 
    docTitle: string; 
    sectionId?: string; 
    sectionTitle?: string; 
    content: string; 
    embedding: number[] 
  }[],
  topK: number = 5
): DocumentContext[] {
  const scored = documents.map(doc => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(({ docId, docTitle, sectionId, sectionTitle, content }) => ({
    docId,
    docTitle,
    sectionId,
    sectionTitle,
    content,
  }));
}
