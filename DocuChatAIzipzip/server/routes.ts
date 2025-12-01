import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertDocumentSectionSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { generateChatResponse, generateEmbedding, findRelevantContexts } from "./openai";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, CSV, and Excel files are allowed.'));
    }
  }
});

const chatRequestSchema = z.object({
  message: z.string().min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use('/uploads', express.static(uploadDir, {
    setHeaders: (res: any) => {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }));
  
  app.post("/api/upload", upload.array('files', 20), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      const uploadedDocs = [];
      
      for (const file of files) {
        const fileUrl = `/uploads/${file.filename}`;
        
        let fileType = 'unknown';
        if (file.mimetype === 'application/pdf') {
          fileType = 'pdf';
        } else if (file.mimetype === 'text/csv') {
          fileType = 'csv';
        } else if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel')) {
          fileType = 'excel';
        }
        
        const doc = await storage.createDocument({
          title: file.originalname.replace(/\.[^/.]+$/, ''),
          path: `/${file.filename}`,
          content: '',
          order: 0,
          isFolder: false,
          isFile: true,
          fileUrl,
          fileType,
          fileName: file.originalname,
          fileSize: file.size,
        });
        
        uploadedDocs.push(doc);
      }
      
      res.status(201).json(uploadedDocs);
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });
  
  app.get("/api/categories", async (req, res) => {
    try {
      const cats = await storage.getAllCategories();
      res.json(cats);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const parsed = insertCategorySchema.parse(req.body);
      const cat = await storage.createCategory(parsed);
      res.status(201).json(cat);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const parsed = insertCategorySchema.partial().parse(req.body);
      const cat = await storage.updateCategory(req.params.id, parsed);
      if (!cat) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(cat);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });
  
  app.get("/api/documents", async (req, res) => {
    try {
      const docs = await storage.getAllDocuments();
      res.json(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const doc = await storage.getDocumentWithSections(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(doc);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const parsed = insertDocumentSchema.parse(req.body);
      const doc = await storage.createDocument(parsed);
      res.status(201).json(doc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const parsed = insertDocumentSchema.partial().parse(req.body);
      const doc = await storage.updateDocument(req.params.id, parsed);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(doc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating document:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDocument(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  app.get("/api/documents/:id/sections", async (req, res) => {
    try {
      const sections = await storage.getDocumentSections(req.params.id);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ error: "Failed to fetch sections" });
    }
  });

  app.post("/api/documents/:id/sections", async (req, res) => {
    try {
      const parsed = insertDocumentSectionSchema.parse({
        ...req.body,
        documentId: req.params.id
      });
      const section = await storage.createDocumentSection(parsed);
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating section:", error);
      res.status(500).json({ error: "Failed to create section" });
    }
  });

  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.delete("/api/chat/messages", async (req, res) => {
    try {
      await storage.clearChatMessages();
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing chat messages:", error);
      res.status(500).json({ error: "Failed to clear chat messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = chatRequestSchema.parse(req.body);
      
      const allDocs = await storage.getAllDocuments();
      
      if (allDocs.length === 0) {
        return res.json({
          id: `msg-${Date.now()}`,
          content: "There are no documents in the dataroom yet. Please add some documents first, and then I can help you answer questions about them.",
          citations: [],
        });
      }
      
      let documentContexts: Array<{
        docId: string;
        docTitle: string;
        sectionId?: string;
        sectionTitle?: string;
        content: string;
        embedding?: number[];
      }> = [];
      
      const sectionsWithEmbeddings = await storage.getAllSectionsWithEmbeddings();
      
      if (sectionsWithEmbeddings.length > 0) {
        const queryEmbedding = await generateEmbedding(message);
        
        const docsWithEmbeddings = sectionsWithEmbeddings.map(s => ({
          docId: s.documentId,
          docTitle: s.document.title,
          sectionId: s.id,
          sectionTitle: s.title,
          content: s.content,
          embedding: s.embedding as number[],
        }));
        
        documentContexts = findRelevantContexts(queryEmbedding, docsWithEmbeddings, 5);
      } else {
        documentContexts = allDocs.slice(0, 5).map(doc => ({
          docId: doc.id,
          docTitle: doc.title,
          content: doc.content || '',
        }));
      }
      
      const response = await generateChatResponse(message, documentContexts);
      
      await storage.createChatMessage({
        role: 'user',
        content: message,
        citations: null,
      });
      
      await storage.createChatMessage({
        role: 'assistant',
        content: response.content,
        citations: response.citations,
      });
      
      res.json(response);
    } catch (error) {
      console.error("Error in chat:", error);
      
      if (error instanceof Error && error.message.includes("API key")) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable." 
        });
      }
      
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  app.post("/api/documents/:id/embed", async (req, res) => {
    try {
      const doc = await storage.getDocumentWithSections(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      if (doc.content) {
        const embedding = await generateEmbedding(doc.content);
        
        const existingSections = await storage.getDocumentSections(doc.id);
        if (existingSections.length === 0) {
          await storage.createDocumentSection({
            documentId: doc.id,
            title: doc.title,
            content: doc.content,
            order: 0,
          });
        }
        
        const sections = await storage.getDocumentSections(doc.id);
        if (sections.length > 0) {
          await storage.updateDocumentSection(sections[0].id, {
            embedding: embedding as any,
          });
        }
      }
      
      res.json({ success: true, message: "Document embedded successfully" });
    } catch (error) {
      console.error("Error embedding document:", error);
      res.status(500).json({ error: "Failed to embed document" });
    }
  });

  return httpServer;
}
