import { Citation } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface CitationChipProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
}

export default function CitationChip({ citation, onClick }: CitationChipProps) {
  const label = citation.sectionTitle
    ? `${citation.index} ${citation.docTitle} – ${citation.sectionTitle}`
    : `${citation.index} ${citation.docTitle}`;

  return (
    <Badge
      data-testid={`citation-${citation.index}`}
      variant="secondary"
      className="cursor-pointer font-normal text-xs"
      onClick={() => onClick(citation)}
    >
      [{label}]
    </Badge>
  );
}
