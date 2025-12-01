import CitationChip from '../CitationChip';
import { Citation } from '@/lib/types';

// todo: remove mock functionality
const mockCitation: Citation = {
  index: 1,
  docId: 'doc-1',
  sectionId: 'sec-1-2',
  docTitle: 'Financial Plan 2024',
  sectionTitle: 'Revenue Projections',
};

export default function CitationChipExample() {
  return (
    <CitationChip 
      citation={mockCitation} 
      onClick={(c) => console.log('Citation clicked:', c)}
    />
  );
}
