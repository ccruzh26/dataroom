import { useState, useRef, useEffect } from 'react';
import { Document } from '@/lib/types';
import { ChevronRight, ChevronDown, Folder, FileText, FileSpreadsheet, File, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

function getFileIcon(document: Document) {
  if (document.isFile) {
    if (document.fileType === 'pdf') {
      return <File className="w-4 h-4 text-red-500 shrink-0" />;
    } else if (document.fileType === 'csv' || document.fileType === 'excel') {
      return <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />;
    }
    return <File className="w-4 h-4 text-muted-foreground shrink-0" />;
  }
  return <FileText className="w-4 h-4 text-muted-foreground shrink-0" />;
}

interface OutlineTreeProps {
  documents: Document[];
  selectedDocId: string | null;
  selectedDocIds: string[];
  onSelectDocument: (doc: Document) => void;
  onToggleSelectDocument: (docId: string, isMultiSelect: boolean) => void;
  onUpdateDocument?: (doc: Document) => void;
  onReorderDocuments?: (documents: Document[]) => void;
  onMoveDocumentsToFolder?: (docIds: string[], folderId: string) => void;
  searchQuery?: string;
}

interface TreeNodeProps {
  document: Document;
  level: number;
  selectedDocId: string | null;
  selectedDocIds: string[];
  onSelectDocument: (doc: Document) => void;
  onToggleSelectDocument: (docId: string, isMultiSelect: boolean) => void;
  onUpdateDocument?: (doc: Document) => void;
  onReorderDocuments?: (documents: Document[]) => void;
  onMoveDocumentsToFolder?: (docIds: string[], folderId: string) => void;
  parentDocuments?: Document[];
  allDocuments: Document[];
  isFiltered?: boolean;
}

function findDocumentById(docs: Document[], id: string): Document | undefined {
  for (const doc of docs) {
    if (doc.id === id) return doc;
    if (doc.children) {
      const found = findDocumentById(doc.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function isDescendantOf(docs: Document[], parentId: string, childId: string): boolean {
  const parent = findDocumentById(docs, parentId);
  if (!parent || !parent.children) return false;
  for (const child of parent.children) {
    if (child.id === childId) return true;
    if (isDescendantOf(docs, child.id, childId)) return true;
  }
  return false;
}

function TreeNode({ 
  document, 
  level, 
  selectedDocId, 
  selectedDocIds,
  onSelectDocument, 
  onToggleSelectDocument,
  onUpdateDocument, 
  onReorderDocuments, 
  onMoveDocumentsToFolder,
  parentDocuments = [], 
  allDocuments, 
  isFiltered 
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(document.title);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFolder = document.isFolder;
  const isSelected = document.id === selectedDocId;
  const isMultiSelected = selectedDocIds.includes(document.id);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleNameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  const handleSaveName = () => {
    if (editTitle.trim() && editTitle !== document.title) {
      onUpdateDocument?.({ ...document, title: editTitle.trim() });
    } else {
      setEditTitle(document.title);
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditTitle(document.title);
      setIsEditing(false);
    }
  };
  
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    
    if (isMultiSelected && selectedDocIds.length > 1) {
      e.dataTransfer.setData('text/plain', JSON.stringify(selectedDocIds));
      e.dataTransfer.setData('application/x-multi-select', 'true');
    } else {
      e.dataTransfer.setData('text/plain', document.id);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (isFolder) {
      setIsDragOver(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    try {
      const isMultiDrag = e.dataTransfer.getData('application/x-multi-select') === 'true';
      const dragData = e.dataTransfer.getData('text/plain');
      
      if (isMultiDrag) {
        const draggedIds: string[] = JSON.parse(dragData);
        
        if (draggedIds.includes(document.id)) return;
        
        for (const draggedId of draggedIds) {
          if (isDescendantOf(allDocuments, draggedId, document.id)) return;
        }
        
        if (isFolder && onMoveDocumentsToFolder) {
          onMoveDocumentsToFolder(draggedIds, document.id);
          setIsExpanded(true);
        }
      } else {
        const draggedId = dragData;
        
        if (draggedId === document.id) return;
        
        const draggedDoc = findDocumentById(allDocuments, draggedId);
        if (!draggedDoc) return;
        
        if (isFolder) {
          if (isDescendantOf(allDocuments, draggedId, document.id)) return;
          
          const { children, ...docWithoutChildren } = draggedDoc;
          const updatedDoc = { 
            ...docWithoutChildren, 
            parentId: document.id,
            order: (document.children?.length || 0)
          };
          onUpdateDocument?.(updatedDoc as Document);
          setIsExpanded(true);
        } else if (parentDocuments.length > 0) {
          const draggedIndex = parentDocuments.findIndex(d => d.id === draggedId);
          const targetIndex = parentDocuments.findIndex(d => d.id === document.id);
          
          if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
            const updated = parentDocuments.filter(d => d.id !== draggedId);
            const reorderedDoc = { ...draggedDoc };
            
            const newOrder = [...updated];
            newOrder.splice(targetIndex, 0, reorderedDoc);
            
            newOrder.forEach((doc, idx) => {
              doc.order = idx;
            });
            
            onReorderDocuments?.(newOrder);
          }
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    
    if (isCtrlOrCmd && !isFolder) {
      e.preventDefault();
      onToggleSelectDocument(document.id, true);
    } else if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      onSelectDocument(document);
    }
  };
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelectDocument(document.id, true);
  };
  
  return (
    <div>
      <div
        data-testid={`tree-item-${document.id}`}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onDoubleClick={handleNameDoubleClick}
        className={`group flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover-elevate transition-colors ${
          isSelected ? 'bg-primary/10 border-l-[3px] border-l-primary -ml-[3px] pl-[11px]' : ''
        } ${isMultiSelected && !isSelected ? 'bg-primary/5 ring-1 ring-primary/30' : ''
        } ${isDragOver && isFolder ? 'bg-primary/20 ring-2 ring-primary ring-inset' : ''}`}
        style={{ paddingLeft: isSelected ? undefined : `${level * 16 + 8}px` }}
      >
        {!isFolder && (
          <div 
            onClick={handleCheckboxClick}
            className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center cursor-pointer transition-colors ${
              isMultiSelected 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground/30 opacity-0 group-hover:opacity-100'
            }`}
          >
            {isMultiSelected && <Check className="w-3 h-3" />}
          </div>
        )}
        
        {isFolder ? (
          <>
            <span className="text-muted-foreground shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
            <Folder className="w-4 h-4 text-muted-foreground shrink-0" />
          </>
        ) : (
          <>
            {getFileIcon(document)}
          </>
        )}
        
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="h-6 px-1 text-sm"
            data-testid="input-folder-name"
          />
        ) : (
          <span className={`text-sm truncate ${isSelected ? 'font-medium' : ''}`}>
            {document.title}
          </span>
        )}
        
        {isMultiSelected && selectedDocIds.length > 1 && (
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            +{selectedDocIds.length - 1}
          </span>
        )}
      </div>
      
      {isFolder && isExpanded && document.children && (
        <div>
          {document.children.map((child) => (
            <TreeNode
              key={child.id}
              document={child}
              level={level + 1}
              selectedDocId={selectedDocId}
              selectedDocIds={selectedDocIds}
              onSelectDocument={onSelectDocument}
              onToggleSelectDocument={onToggleSelectDocument}
              onUpdateDocument={onUpdateDocument}
              onReorderDocuments={onReorderDocuments}
              onMoveDocumentsToFolder={onMoveDocumentsToFolder}
              parentDocuments={document.children || []}
              allDocuments={allDocuments}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OutlineTree({ 
  documents, 
  selectedDocId, 
  selectedDocIds,
  onSelectDocument, 
  onToggleSelectDocument,
  onUpdateDocument, 
  onReorderDocuments, 
  onMoveDocumentsToFolder,
  searchQuery 
}: OutlineTreeProps) {
  const filteredDocs = documents;

  if (filteredDocs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-xs">No documents found</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5" data-testid="outline-tree">
      {selectedDocIds.length > 0 && (
        <div className="text-xs text-muted-foreground px-2 py-1 mb-1 bg-muted/50 rounded">
          {selectedDocIds.length} item{selectedDocIds.length > 1 ? 's' : ''} selected - drag to move to folder
        </div>
      )}
      {filteredDocs.map((doc) => (
        <TreeNode
          key={doc.id}
          document={doc}
          level={0}
          selectedDocId={selectedDocId}
          selectedDocIds={selectedDocIds}
          onSelectDocument={onSelectDocument}
          onToggleSelectDocument={onToggleSelectDocument}
          onUpdateDocument={onUpdateDocument}
          onReorderDocuments={onReorderDocuments}
          onMoveDocumentsToFolder={onMoveDocumentsToFolder}
          parentDocuments={filteredDocs}
          allDocuments={documents}
        />
      ))}
    </div>
  );
}
