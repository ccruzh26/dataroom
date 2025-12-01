import { useState } from 'react';
import DocumentPanel from '../DocumentPanel';
import { mockDocuments } from '@/lib/mockData';

export default function DocumentPanelExample() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  return (
    <div className="h-[500px] w-96 border rounded-lg overflow-hidden">
      <DocumentPanel 
        documents={mockDocuments}
        selectedDocId={selectedId}
        onSelectDocument={(doc) => setSelectedId(doc.id)}
      />
    </div>
  );
}
