import { useState } from 'react';
import DocumentEditor from '../DocumentEditor';
import { Document } from '@/lib/types';

// todo: remove mock functionality
const mockDoc: Document = {
  id: 'doc-1',
  title: 'Financial Plan 2024',
  path: '/financial/plan-2024',
  order: 1,
  summary: 'Comprehensive financial projections.',
  content: '<h1>Financial Plan 2024</h1><p>This document outlines our financial strategy and projections for fiscal year 2024, including detailed revenue forecasts, expense management, and capital allocation plans.</p><h2>Revenue Projections</h2><p>Our projected revenue for 2024 is <strong>$12.5M</strong>, representing a 45% year-over-year growth.</p>',
  sections: [],
};

export default function DocumentEditorExample() {
  const [doc, setDoc] = useState(mockDoc);
  
  return (
    <div className="h-[600px] w-full border rounded-lg overflow-hidden">
      <DocumentEditor 
        document={doc}
        onSave={(updatedDoc) => {
          setDoc(updatedDoc);
          console.log('Document saved:', updatedDoc);
        }}
        onDelete={(docId) => console.log('Delete document:', docId)}
      />
    </div>
  );
}
