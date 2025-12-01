import { 
  type User, type InsertUser,
  type Document, type InsertDocument,
  type DocumentSection, type InsertDocumentSection,
  type ChatMessage, type InsertChatMessage,
  type Category, type InsertCategory,
  users, documents, documentSections, chatMessages, categories
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, isNull } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentWithSections(id: string): Promise<(Document & { sections: DocumentSection[] }) | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, doc: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  
  getDocumentSections(documentId: string): Promise<DocumentSection[]>;
  createDocumentSection(section: InsertDocumentSection): Promise<DocumentSection>;
  updateDocumentSection(id: string, section: Partial<InsertDocumentSection & { embedding?: unknown }>): Promise<DocumentSection | undefined>;
  deleteDocumentSection(id: string): Promise<boolean>;
  getAllSectionsWithEmbeddings(): Promise<(DocumentSection & { document: Document })[]>;
  
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.order));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await db.update(documents).set({ categoryId: null }).where(eq(documents.categoryId, id));
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  async getAllDocuments(): Promise<Document[]> {
    return db.select().from(documents).orderBy(asc(documents.order));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc || undefined;
  }

  async getDocumentWithSections(id: string): Promise<(Document & { sections: DocumentSection[] }) | undefined> {
    const doc = await this.getDocument(id);
    if (!doc) return undefined;
    
    const sections = await this.getDocumentSections(id);
    return { ...doc, sections };
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [created] = await db.insert(documents).values(doc).returning();
    return created;
  }

  async updateDocument(id: string, doc: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updated] = await db
      .update(documents)
      .set({ ...doc, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  }

  async getDocumentSections(documentId: string): Promise<DocumentSection[]> {
    return db.select()
      .from(documentSections)
      .where(eq(documentSections.documentId, documentId))
      .orderBy(asc(documentSections.order));
  }

  async createDocumentSection(section: InsertDocumentSection): Promise<DocumentSection> {
    const [created] = await db.insert(documentSections).values(section).returning();
    return created;
  }

  async updateDocumentSection(id: string, section: Partial<InsertDocumentSection & { embedding?: unknown }>): Promise<DocumentSection | undefined> {
    const [updated] = await db
      .update(documentSections)
      .set(section)
      .where(eq(documentSections.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDocumentSection(id: string): Promise<boolean> {
    const result = await db.delete(documentSections).where(eq(documentSections.id, id)).returning();
    return result.length > 0;
  }

  async getAllSectionsWithEmbeddings(): Promise<(DocumentSection & { document: Document })[]> {
    const sections = await db.select().from(documentSections);
    const docs = await db.select().from(documents);
    const docMap = new Map(docs.map(d => [d.id, d]));
    
    return sections
      .filter(s => s.embedding !== null)
      .map(s => ({
        ...s,
        document: docMap.get(s.documentId)!
      }))
      .filter(s => s.document !== undefined);
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).orderBy(asc(chatMessages.createdAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(message).returning();
    return created;
  }

  async clearChatMessages(): Promise<void> {
    await db.delete(chatMessages);
  }
}

export const storage = new DatabaseStorage();
