import { useState, useCallback } from 'react';
import { Document, ChatMessage, Citation, Category } from '@/lib/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import DocumentPanel from './DocumentPanel';
import DocumentEditor from './DocumentEditor';
import ChatPanel from './ChatPanel';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { PanelLeftClose, PanelLeft, Moon, Sun, Sparkles, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataroomLayoutProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

function buildDocumentTree(docs: Document[]): Document[] {
  const docMap = new Map<string, Document>();
  const roots: Document[] = [];
  
  docs.forEach(doc => {
    docMap.set(doc.id, { ...doc, children: [] });
  });
  
  docs.forEach(doc => {
    const current = docMap.get(doc.id)!;
    if (doc.parentId && docMap.has(doc.parentId)) {
      const parent = docMap.get(doc.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(current);
    } else {
      roots.push(current);
    }
  });
  
  return roots.sort((a, b) => a.order - b.order);
}

export default function DataroomLayout({ isDarkMode = false, onToggleDarkMode }: DataroomLayoutProps) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const { toast } = useToast();
  
  const { data: documentsFlat = [], isLoading: isLoadingDocs } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });
  
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const documents = buildDocumentTree(documentsFlat);
  
  const { data: selectedDocument, isLoading: isLoadingDoc } = useQuery<Document>({
    queryKey: ['/api/documents', selectedDocId],
    enabled: !!selectedDocId,
  });
  
  const createDocMutation = useMutation({
    mutationFn: async (doc: Partial<Document>) => {
      const res = await apiRequest('POST', '/api/documents', doc);
      return res.json() as Promise<Document>;
    },
    onSuccess: (newDoc: Document) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setSelectedDocId(newDoc.id);
      toast({ title: 'Document created', description: 'A new document has been created.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create document.', variant: 'destructive' });
    }
  });
  
  const updateDocMutation = useMutation({
    mutationFn: async ({ id, ...doc }: Document) => {
      const res = await apiRequest('PATCH', `/api/documents/${id}`, doc);
      return res.json() as Promise<Document>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      if (selectedDocId) {
        queryClient.invalidateQueries({ queryKey: ['/api/documents', selectedDocId] });
      }
      toast({ title: 'Document saved', description: 'Your changes have been saved.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save document.', variant: 'destructive' });
    }
  });
  
  const deleteDocMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      if (selectedDocId) {
        setSelectedDocId(null);
      }
      toast({ title: 'Document deleted', description: 'The document has been removed.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete document.', variant: 'destructive' });
    }
  });
  
  const createCategoryMutation = useMutation({
    mutationFn: async (category: Partial<Category>) => {
      const res = await apiRequest('POST', '/api/categories', category);
      return res.json() as Promise<Category>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: 'Category created', description: 'New category has been created.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create category.', variant: 'destructive' });
    }
  });
  
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: Category) => {
      const res = await apiRequest('PATCH', `/api/categories/${id}`, data);
      return res.json() as Promise<Category>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: 'Category updated', description: 'Category has been updated.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update category.', variant: 'destructive' });
    }
  });
  
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: 'Category deleted', description: 'Category has been removed.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete category.', variant: 'destructive' });
    }
  });
  
  const handleSelectDocument = useCallback((doc: Document) => {
    if (!doc.isFolder) {
      setSelectedDocId(doc.id);
      setSelectedDocIds([]);
    }
  }, []);
  
  const handleToggleSelectDocument = useCallback((docId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      setSelectedDocIds(prev => {
        if (prev.includes(docId)) {
          return prev.filter(id => id !== docId);
        } else {
          return [...prev, docId];
        }
      });
    }
  }, []);
  
  const handleClearSelection = useCallback(() => {
    setSelectedDocIds([]);
  }, []);
  
  const handleMoveDocumentsToFolder = useCallback(async (docIds: string[], folderId: string) => {
    try {
      const folder = documentsFlat.find(d => d.id === folderId);
      const folderChildrenCount = documentsFlat.filter(d => d.parentId === folderId).length;
      
      await Promise.all(docIds.map((docId, index) => {
        const doc = documentsFlat.find(d => d.id === docId);
        if (doc) {
          return updateDocMutation.mutateAsync({
            ...doc,
            parentId: folderId,
            order: folderChildrenCount + index,
          });
        }
        return Promise.resolve();
      }));
      
      setSelectedDocIds([]);
      toast({ 
        title: 'Items moved', 
        description: `${docIds.length} item${docIds.length > 1 ? 's' : ''} moved to ${folder?.title || 'folder'}.`
      });
    } catch (error) {
      toast({ 
        title: 'Move failed', 
        description: 'Could not move the items. Please try again.', 
        variant: 'destructive' 
      });
    }
  }, [documentsFlat, updateDocMutation, toast]);
  
  const handleSaveDocument = useCallback((updatedDoc: Document) => {
    updateDocMutation.mutate(updatedDoc);
  }, [updateDocMutation]);
  
  const handleDeleteDocument = useCallback((docId: string) => {
    deleteDocMutation.mutate(docId);
  }, [deleteDocMutation]);
  
  const handleCreateDocument = useCallback(() => {
    createDocMutation.mutate({
      title: 'Untitled Document',
      path: '/untitled',
      order: documentsFlat.length + 1,
      content: '',
    });
  }, [createDocMutation, documentsFlat.length]);
  
  const handleCreateFolder = useCallback((categoryId?: string) => {
    createDocMutation.mutate({
      title: 'New Folder',
      path: '/new-folder',
      order: documentsFlat.length + 1,
      content: '',
      isFolder: true,
      categoryId: categoryId || null,
    });
  }, [createDocMutation, documentsFlat.length]);
  
  const handleCreateCategory = useCallback(() => {
    createCategoryMutation.mutate({
      name: 'New Category',
      order: categories.length,
      color: '#6366f1',
    });
  }, [createCategoryMutation, categories.length]);
  
  const handleUpdateCategory = useCallback((category: Category) => {
    updateCategoryMutation.mutate(category);
  }, [updateCategoryMutation]);
  
  const handleDeleteCategory = useCallback((categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId);
  }, [deleteCategoryMutation]);
  
  const handleMoveFolderToCategory = useCallback(async (folderId: string, categoryId: string | null) => {
    const folder = documentsFlat.find(d => d.id === folderId);
    if (folder && folder.isFolder) {
      await updateDocMutation.mutateAsync({
        ...folder,
        categoryId,
      });
    }
  }, [documentsFlat, updateDocMutation]);
  
  const handleUploadFiles = useCallback(async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const newDocs = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      if (newDocs.length > 0) {
        setSelectedDocId(newDocs[0].id);
      }
      const fileCount = files.length;
      toast({ 
        title: fileCount === 1 ? 'File uploaded' : 'Files uploaded', 
        description: fileCount === 1 
          ? `${files[0].name} has been uploaded successfully.`
          : `${fileCount} files have been uploaded successfully.`
      });
    } catch (error) {
      toast({ 
        title: 'Upload failed', 
        description: 'Could not upload the files. Please try again.', 
        variant: 'destructive' 
      });
    }
  }, [toast]);
  
  const handleCitationClick = useCallback((citation: Citation) => {
    setSelectedDocId(citation.docId);
    setIsChatOpen(false);
  }, []);
  
  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsAiLoading(true);
    
    try {
      const res = await apiRequest('POST', '/api/chat', { message: content });
      const response = await res.json();
      
      const assistantMessage: ChatMessage = {
        id: response.id || `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        citations: response.citations,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({ 
        title: 'AI Error', 
        description: 'Failed to get a response from the AI assistant.', 
        variant: 'destructive' 
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [toast]);
  
  if (isLoadingDocs || isLoadingCategories) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="h-screen w-screen flex flex-col" data-testid="dataroom-layout">
      <header className="shrink-0 h-12 border-b flex items-center justify-between px-4 gap-4 bg-background z-50">
        <div className="flex items-center gap-3">
          <Button
            data-testid="button-toggle-panel"
            size="icon"
            variant="ghost"
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          >
            {isPanelCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Data Room" 
              className="h-7 object-contain w-auto" 
              style={{ 
                filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                maxWidth: '180px'
              }} 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            data-testid="button-open-chat"
            size="sm"
            variant="outline"
            onClick={() => setIsChatOpen(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button
            data-testid="button-toggle-dark-mode"
            size="icon"
            variant="ghost"
            onClick={onToggleDarkMode}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>
      
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal">
          {!isPanelCollapsed && (
            <>
              <ResizablePanel 
                defaultSize={20} 
                minSize={15} 
                maxSize={30}
                className="min-w-[200px]"
              >
                <DocumentPanel
                  documents={documents}
                  categories={categories}
                  selectedDocId={selectedDocId}
                  selectedDocIds={selectedDocIds}
                  onSelectDocument={handleSelectDocument}
                  onToggleSelectDocument={handleToggleSelectDocument}
                  onClearSelection={handleClearSelection}
                  onCreateDocument={handleCreateDocument}
                  onCreateFolder={handleCreateFolder}
                  onCreateCategory={handleCreateCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onMoveFolderToCategory={handleMoveFolderToCategory}
                  onUpdateDocument={handleSaveDocument}
                  onReorderDocuments={(reordered) => {
                    const updates = reordered.map((doc, idx) => ({ ...doc, order: idx }));
                    Promise.all(updates.map(doc => updateDocMutation.mutateAsync(doc)));
                  }}
                  onMoveDocumentsToFolder={handleMoveDocumentsToFolder}
                  onUploadFiles={handleUploadFiles}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          <ResizablePanel defaultSize={isPanelCollapsed ? 100 : 80}>
            {isLoadingDoc ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : selectedDocument ? (
              <DocumentEditor
                document={selectedDocument}
                onSave={handleSaveDocument}
                onDelete={handleDeleteDocument}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No document selected</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Select a document from the sidebar to view and edit its content.
                </p>
                <Button onClick={handleCreateDocument} data-testid="button-create-first-doc">
                  Create a document
                </Button>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      <ChatPanel
        messages={messages}
        onSendMessage={handleSendMessage}
        onCitationClick={handleCitationClick}
        isLoading={isAiLoading}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
