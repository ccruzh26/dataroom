import { useState, useRef } from 'react';
import { Document, Category } from '@/lib/types';
import OutlineTree from './OutlineTree';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, Plus, FolderPlus, Upload, X, Tags, ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
              data-testid="button-create-folder"
              size="icon"
              variant="ghost"
              onClick={onCreateFolder}
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
        <div className="p-2">
          <OutlineTree
            documents={documents}
            selectedDocId={selectedDocId}
            selectedDocIds={selectedDocIds}
            onSelectDocument={onSelectDocument}
            onToggleSelectDocument={onToggleSelectDocument}
            onUpdateDocument={onUpdateDocument}
            onReorderDocuments={onReorderDocuments}
            onMoveDocumentsToFolder={onMoveDocumentsToFolder}
            searchQuery={searchQuery}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
