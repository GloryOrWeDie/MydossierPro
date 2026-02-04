'use client';

import { DocumentType } from '@/lib/types';
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface DocumentCardProps {
  documentType?: DocumentType | null; // Legacy
  description?: string; // New flexible description
  fileName: string;
  fileSize: number | null;
  downloadUrl: string;
}

export default function DocumentCard({ documentType, description, fileName, fileSize, downloadUrl }: DocumentCardProps) {
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  const getIcon = () => {
    return (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <Card className="flex items-center justify-between p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {description || (documentType ? DOCUMENT_TYPE_LABELS[documentType] : 'Document')}
          </h3>
          <p className="text-sm text-gray-500 truncate">{fileName}</p>
          {fileSize !== null && (
            <p className="text-xs text-gray-400 mt-1">{formatFileSize(fileSize)}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">
        <Button onClick={handleDownload} variant="outline" size="sm">
          Download
        </Button>
      </div>
    </Card>
  );
}
