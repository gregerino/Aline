import { Download } from 'lucide-react';
import { getExportUrl } from '../../services/searchApi';

interface Props {
  searchId: string | null;
}

export default function ExportButton({ searchId }: Props) {
  if (!searchId) return null;

  return (
    <a
      href={getExportUrl(searchId)}
      download
      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Download className="h-4 w-4" />
      Exportera CSV
    </a>
  );
}
