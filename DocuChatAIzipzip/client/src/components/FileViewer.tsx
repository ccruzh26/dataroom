import { useState, useEffect } from 'react';
import { Document } from '@/lib/types';
import { Loader2, Download, FileSpreadsheet, FileText as FileTextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileViewerProps {
  document: Document;
}

interface CSVData {
  headers: string[];
  rows: string[][];
}

export default function FileViewer({ document }: FileViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [csvData, setCSVData] = useState<CSVData | null>(null);
  const [excelData, setExcelData] = useState<CSVData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setCSVData(null);
    setExcelData(null);

    if (document.fileType === 'csv' && document.fileUrl) {
      loadCSV(document.fileUrl);
    } else if (document.fileType === 'excel' && document.fileUrl) {
      loadExcel(document.fileUrl);
    } else if (document.fileType === 'pdf') {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [document.id, document.fileUrl, document.fileType]);

  const loadCSV = async (url: string) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const Papa = await import('papaparse');
      const result = Papa.default.parse(text, { header: false });
      const rows = result.data as string[][];
      if (rows.length > 0) {
        setCSVData({
          headers: rows[0],
          rows: rows.slice(1).filter(row => row.some(cell => cell.trim() !== '')),
        });
      }
    } catch (err) {
      setError('Failed to load CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExcel = async (url: string) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
      if (data.length > 0) {
        setExcelData({
          headers: data[0].map(String),
          rows: data.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== '')),
        });
      }
    } catch (err) {
      setError('Failed to load Excel file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (document.fileUrl) {
      const a = window.document.createElement('a');
      a.href = document.fileUrl;
      a.download = document.fileName || 'file';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="p-4 rounded-full bg-destructive/10 mb-4">
          <FileTextIcon className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="font-medium mb-1">Error loading file</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download instead
        </Button>
      </div>
    );
  }

  if (document.fileType === 'pdf') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileTextIcon className="w-4 h-4" />
            <span>{document.fileName}</span>
            <span className="text-xs">({formatFileSize(document.fileSize)})</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(window.location.origin + (document.fileUrl || ''))}&embedded=true`}
          className="flex-1 w-full border-0"
          title={document.title}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    );
  }

  if (document.fileType === 'csv' && csvData) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileSpreadsheet className="w-4 h-4" />
            <span>{document.fileName}</span>
            <span className="text-xs">({formatFileSize(document.fileSize)})</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {csvData.headers.map((header, idx) => (
                    <TableHead key={idx} className="font-semibold">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.rows.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <TableCell key={cellIdx}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (document.fileType === 'excel' && excelData) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileSpreadsheet className="w-4 h-4" />
            <span>{document.fileName}</span>
            <span className="text-xs">({formatFileSize(document.fileSize)})</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {excelData.headers.map((header, idx) => (
                    <TableHead key={idx} className="font-semibold">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {excelData.rows.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {excelData.headers.map((_, cellIdx) => (
                      <TableCell key={cellIdx}>{row[cellIdx] ?? ''}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="p-4 rounded-full bg-muted mb-4">
        <FileTextIcon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">{document.fileName}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {formatFileSize(document.fileSize)}
      </p>
      <Button onClick={handleDownload}>
        <Download className="w-4 h-4 mr-2" />
        Download file
      </Button>
    </div>
  );
}
