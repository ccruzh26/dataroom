import { useState, useRef } from 'react';
import { Document, Category } from '@/lib/types';
import OutlineTree from './OutlineTree';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, Plus, FolderPlus, Upload, X, Tags, ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash2, Folder } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface DocumentPanelProps {
  documents: Document[];
  categories: Category[];
  selectedDocId: string | null;
  selectedDocIds: string[];
  onSelectDocument: (doc: Document) => void;
  onToggleSelectDocument: (docId: string, isMultiSelect: boolean) => void;
  onClearSelection: () => void;
  onCreateDocument?: () => void;
  onCreateFolder?: (categoryId?: string) => void;
  onCreateCategory?: () => void;
  onUpdateCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onMoveFolderToCategory?: (folderId: string, categoryId: string | null) => void;
  onUpdateDocument?: (doc: Document) => void;
  onReorderDocuments?: (documents: Document[]) => void;
  onMoveDocumentsToFolder?: (docIds: string[], folderId: string) => void;
  onUploadFiles?: (files: File[]) => void;
}

const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
];

export default function DocumentPanel({ 
  documents, 
  categories,
  selectedDocId, 
  selectedDocIds,
  onSelectDocument,
  onToggleSelectDocument,
  onClearSelection,
  onCreateDocument,
  onCreateFolder,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onMoveFolderToCategory,
  onUpdateDocument,
  onReorderDocuments,
  onMoveDocumentsToFolder,
  onUploadFiles,
}: DocumentPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['uncategorized']));
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onUploadFiles) {
      onUploadFiles(Array.from(files));
    }
    if (e.target) {
      e.target.value = '';
    }
  };
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };
  
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditColor(category.color || '#6366f1');
  };
  
  const handleSaveCategory = () => {
    if (editingCategory && onUpdateCategory) {
      onUpdateCategory({
        ...editingCategory,
        name: editName,
        color: editColor,
      });
    }
    setEditingCategory(null);
  };
  
  const handleDragOver = (e: React.DragEvent, categoryId: string | null) => {
    e.preventDefault();
    setDragOverCategory(categoryId);
  };
  
  const handleDragLeave = () => {
    setDragOverCategory(null);
  };
  
  const handleDrop = (e: React.DragEvent, categoryId: string | null) => {
    e.preventDefault();
    setDragOverCategory(null);
    
    const folderId = e.dataTransfer.getData('folderId');
    if (folderId && onMoveFolderToCategory) {
      onMoveFolderToCategory(folderId, categoryId);
    }
  };

  const getAllDocumentsFlat = (docs: Document[]): Document[] => {
    const result: Document[] = [];
    const traverse = (items: Document[]) => {
      for (const item of items) {
        result.push(item);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      }
    };
    traverse(docs);
    return result;
  };

  const allDocsFlat = getAllDocumentsFlat(documents);
  
  const getRootFoldersByCategory = (categoryId: string | null) => {
    return documents.filter(doc => {
      if (!doc.isFolder) return false;
      if (categoryId === null) {
        return !doc.categoryId;
      }
      return doc.categoryId === categoryId;
    });
  };
  
  const getUncategorizedDocuments = () => {
    return documents.filter(doc => !doc.isFolder && !doc.parentId);
  };

  const uncategorizedFolders = getRootFoldersByCategory(null);
  const uncategorizedDocs = getUncategorizedDocuments();
  
  return (
    <div className="flex flex-col h-full bg-sidebar" data-testid="document-panel">
      <div className="shrink-0 p-4 border-b border-sidebar-border space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-base font-semibold">Documents</h2>
          </div>
          <div className="flex items-center gap-1">
            {selectedDocIds.length > 0 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onClearSelection}
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              data-testid="button-create-category"
              size="icon"
              variant="ghost"
              onClick={onCreateCategory}
              title="New category"
            >
              <Tags className="w-4 h-4" />
            </Button>
            <Button
              data-testid="button-create-folder"
              size="icon"
              variant="ghost"
              onClick={() => onCreateFolder?.()}
              title="New folder"
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
            <Button
              data-testid="button-create-document"
              size="icon"
              variant="ghost"
              onClick={onCreateDocument}
              title="New document"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              data-testid="button-upload-file"
              size="icon"
              variant="ghost"
              onClick={handleUploadClick}
              title="Upload file (PDF, CSV, Excel)"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search-documents"
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background h-8 text-sm"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {categories.map(category => {
            const categoryFolders = getRootFoldersByCategory(category.id);
            const isExpanded = expandedCategories.has(category.id);
            const isDragOver = dragOverCategory === category.id;
            
            return (
              <div
                key={category.id}
                className="rounded-md overflow-hidden"
                onDragOver={(e) => handleDragOver(e, category.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, category.id)}
              >
                <div 
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 group transition-colors ${isDragOver ? 'bg-accent ring-2 ring-primary' : ''}`}
                >
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-0.5 hover:bg-accent rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <div 
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: category.color || '#6366f1' }}
                  />
                  <span 
                    className="flex-1 text-sm font-medium truncate"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground mr-1">
                    {categoryFolders.length}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onCreateFolder?.(category.id)}>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Add folder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit category
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteCategory?.(category.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {isExpanded && (
                  <div className="ml-4 mt-1">
                    {categoryFolders.length > 0 ? (
                      <OutlineTree
                        documents={categoryFolders}
                        selectedDocId={selectedDocId}
                        selectedDocIds={selectedDocIds}
                        onSelectDocument={onSelectDocument}
                        onToggleSelectDocument={onToggleSelectDocument}
                        onUpdateDocument={onUpdateDocument}
                        onReorderDocuments={onReorderDocuments}
                        onMoveDocumentsToFolder={onMoveDocumentsToFolder}
                        searchQuery={searchQuery}
                        categoryId={category.id}
                        onMoveFolderToCategory={onMoveFolderToCategory}
                      />
                    ) : (
                      <div className="py-3 px-2 text-xs text-muted-foreground text-center">
                        Drag folders here or add a new folder
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          <div
            className="rounded-md overflow-hidden"
            onDragOver={(e) => handleDragOver(e, null)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
          >
            <div 
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 group transition-colors ${dragOverCategory === null && dragOverCategory !== undefined ? '' : ''}`}
            >
              <button
                onClick={() => toggleCategory('uncategorized')}
                className="p-0.5 hover:bg-accent rounded"
              >
                {expandedCategories.has('uncategorized') ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <Folder className="w-4 h-4 text-muted-foreground shrink-0" />
              <span 
                className="flex-1 text-sm font-medium truncate text-muted-foreground"
                onClick={() => toggleCategory('uncategorized')}
              >
                Uncategorized
              </span>
              <span className="text-xs text-muted-foreground mr-1">
                {uncategorizedFolders.length + uncategorizedDocs.length}
              </span>
            </div>
            
            {expandedCategories.has('uncategorized') && (
              <div className="ml-4 mt-1">
                {uncategorizedFolders.length > 0 || uncategorizedDocs.length > 0 ? (
                  <OutlineTree
                    documents={[...uncategorizedFolders, ...uncategorizedDocs]}
                    selectedDocId={selectedDocId}
                    selectedDocIds={selectedDocIds}
                    onSelectDocument={onSelectDocument}
                    onToggleSelectDocument={onToggleSelectDocument}
                    onUpdateDocument={onUpdateDocument}
                    onReorderDocuments={onReorderDocuments}
                    onMoveDocumentsToFolder={onMoveDocumentsToFolder}
                    searchQuery={searchQuery}
                    onMoveFolderToCategory={onMoveFolderToCategory}
                  />
                ) : (
                  <div className="py-3 px-2 text-xs text-muted-foreground text-center">
                    No uncategorized items
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="grid grid-cols-8 gap-2">
                {CATEGORY_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${editColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
