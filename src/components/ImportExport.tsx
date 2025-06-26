import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, FileText } from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';
import * as attendanceAPI from '../services/api';

const ImportExport: React.FC = () => {
  const { currentMonth, currentYear, refreshData } = useAttendance();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        try {
          const result = await attendanceAPI.importPupils(base64);
          alert(`Import réussi: ${result.imported} élèves importés${result.errors.length > 0 ? `, ${result.errors.length} erreurs` : ''}`);
          if (result.errors.length > 0) {
            console.error('Erreurs d\'import:', result.errors);
          }
          await refreshData();
        } catch (error) {
          alert('Erreur lors de l\'import du fichier');
          console.error('Import error:', error);
        }
        
        setImporting(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setImporting(false);
      alert('Erreur lors de la lecture du fichier');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportCSV = () => {
    attendanceAPI.exportCSV(currentYear, currentMonth);
  };

  const handleExportPDF = () => {
    attendanceAPI.exportPDF(currentYear, currentMonth);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Import Button */}
      <div className="relative">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <Upload className="h-4 w-4" />
          <span>{importing ? 'Import...' : 'Importer Excel'}</span>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={importing}
        />
      </div>

      {/* Export Dropdown */}
      <div className="relative group">
        <button className="flex items-center space-x-2 px-3 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors text-sm group">
          <Download className="h-4 w-4" />
          <span>Exporter</span>
        </button>
        
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
          <div className="py-1">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Exporter CSV</span>
            </button>
            
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Exporter PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;