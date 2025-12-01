import { useState, useRef, useEffect, useCallback } from 'react';
import { Document } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline,
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Quote,
  Code,
  Link,
  Save,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FileViewer from './FileViewer';

interface DocumentEditorProps {
  document: Document;
  onSave: (doc: Document) => void;
  onDelete?: (docId: string) => void;
}

export default function DocumentEditor({ document, onSave, onDelete }: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const [hasChanges, setHasChanges] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const isFile = document.isFile;
  
  useEffect(() => {
    setTitle(document.title);
    setContent(document.content);
    setHasChanges(false);
    if (editorRef.current && !isFile) {
      editorRef.current.innerHTML = document.content || '';
    }
  }, [document.id, isFile]);
  
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      setHasChanges(true);
    }
  }, []);
  
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasChanges(true);
  };
  
  const handleSave = () => {
    onSave({
      ...document,
      title,
      content,
    });
    setHasChanges(false);
  };
  
  const execCommand = (command: string, value?: string) => {
    window.document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };
  
  const formatBlock = (tag: string) => {
    window.document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    handleContentChange();
  };
  
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  if (isFile) {
    return (
      <div className="flex flex-col h-full bg-background" data-testid="document-editor">
        <div className="shrink-0 border-b">
          <div className="flex items-center justify-between px-6 py-3 gap-4">
            <Input
              data-testid="input-document-title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
              placeholder="Untitled Document"
            />
            <div className="flex items-center gap-2">
              {hasChanges && (
                <span className="text-xs text-muted-foreground">Unsaved changes</span>
              )}
              <Button
                data-testid="button-save-document"
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" data-testid="button-document-menu">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(document.id)}
                    className="text-destructive"
                    data-testid="menu-item-delete"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete file
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <FileViewer document={document} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background" data-testid="document-editor">
      <div className="shrink-0 border-b">
        <div className="flex items-center justify-between px-6 py-3 gap-4">
          <Input
            data-testid="input-document-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
            placeholder="Untitled Document"
          />
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-xs text-muted-foreground">Unsaved changes</span>
            )}
            <Button
              data-testid="button-save-document"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" data-testid="button-document-menu">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onDelete?.(document.id)}
                  className="text-destructive"
                  data-testid="menu-item-delete"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center gap-1 px-4 py-2 border-t bg-muted/30 flex-wrap">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => formatBlock('h1')}
            title="Heading 1"
            data-testid="button-format-h1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => formatBlock('h2')}
            title="Heading 2"
            data-testid="button-format-h2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => formatBlock('h3')}
            title="Heading 3"
            data-testid="button-format-h3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => execCommand('bold')}
            title="Bold"
            data-testid="button-format-bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => execCommand('italic')}
            title="Italic"
            data-testid="button-format-italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => execCommand('underline')}
            title="Underline"
            data-testid="button-format-underline"
          >
            <Underline className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet list"
            data-testid="button-format-ul"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered list"
            data-testid="button-format-ol"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => formatBlock('blockquote')}
            title="Quote"
            data-testid="button-format-quote"
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => formatBlock('pre')}
            title="Code block"
            data-testid="button-format-code"
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={insertLink}
            title="Insert link"
            data-testid="button-format-link"
          >
            <Link className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div
          ref={editorRef}
          data-testid="editor-content"
          contentEditable
          onInput={handleContentChange}
          className="min-h-full p-8 max-w-4xl mx-auto prose prose-sm dark:prose-invert focus:outline-none"
          style={{ 
            lineHeight: '1.7',
          }}
          data-placeholder="Start writing..."
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}
