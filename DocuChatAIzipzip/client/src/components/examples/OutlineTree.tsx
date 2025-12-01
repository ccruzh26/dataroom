import { useState } from 'react';
import OutlineTree from '../OutlineTree';
import { mockDocuments } from '@/lib/mockData';

export default function OutlineTreeExample() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  return (
    <div className="w-72 bg-background p-2 rounded-md border">
      <OutlineTree 
        documents={mockDocuments} 
        selectedDocId={selectedId}
        onSelectDocument={(doc) => setSelectedId(doc.id)}
      />
    </div>
  );
}
