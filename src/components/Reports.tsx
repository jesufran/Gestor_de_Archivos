import React, { useState } from 'react';
import { Task, Document, OutgoingDocument } from '../types';
import { IconDownload } from './icons/IconDownload';
import { IconSparkles } from './icons/IconSparkles';
import { IconLoader } from './icons/IconLoader';

interface ReportsProps {
  tasks: Task[];
  documents: Document[];
  outgoingDocuments: OutgoingDocument[];
}

interface ReportModules {
  tasksCompleted: boolean;
  tasksPending: boolean;
  docsIn: boolean;
  docsOut: boolean;
}

const Reports: React.FC<ReportsProps> = ({ tasks, documents, outgoingDocuments }) => {
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  
  const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today);
  const [modules, setModules] = useState<ReportModules>({
    tasksCompleted: true,
    tasksPending: false,
    docsIn: true,
    docsOut: false,
  });
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleModuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setModules(prev => ({ ...prev, [name]: checked }));
  };
  
  const getFilteredData = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); 

    const isWithinPeriod = (dateStr?: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date >= start && date <= end;
    };

    const data: { tasksCompleted?: Task[]; tasksPending?: Task[]; incomingDocuments?: Document[]; outgoingDocuments?: OutgoingDocument[]; } = {};

    if (modules.tasksCompleted) data.tasksCompleted = tasks.filter(t => t.status === 'completada' && isWithinPeriod(t.completedAt));
    if (modules.tasksPending) data.tasksPending = tasks.filter(t => t.status === 'pendiente' && isWithinPeriod(t.createdAt));
    if (modules.docsIn) data.incomingDocuments = documents.filter(d => isWithinPeriod(d.createdAt));
    if (modules.docsOut) data.outgoingDocuments = outgoingDocuments.filter(d => isWithinPeriod(d.createdAt));
    return data;
  };

  const handleGenerateAiSummary = async () => {
    setIsAnalyzing(true);
    setAiSummary('');
    setAiError(null);

    try {
      const reportData = getFilteredData();
      const aiReadyData = {
          tasksCompleted: reportData.tasksCompleted?.map(t => ({ description: t.description, completedAt: t.completedAt, priority: t.priority })),
          tasksPending: reportData.tasksPending?.map(t => ({ description: t.description, dueDate: t.dueDate, priority: t.priority, createdAt: t.createdAt })),
          incomingDocuments: reportData.incomingDocuments?.map(d => ({ from: d.from, subject: d.subject, receivedAt: d.createdAt, procedure: d.procedure })),
          outgoingDocuments: reportData.outgoingDocuments?.map(d => ({ to: d.to, subject: d.subject, sentAt: d.sentAt })),
      }
      
      const prompt = `Como asistente de análisis de datos, genera un resumen ejecutivo conciso sobre la actividad registrada entre el ${startDate} y el ${endDate}. Analiza las tendencias, volúmenes y cualquier punto notable en los datos proporcionados. Tu respuesta debe ser clara, profesional y en formato de texto plano. No uses markdown.

Datos para el análisis:
${JSON.stringify(aiReadyData, null, 2)}`;

      const response = await fetch('/.netlify/functions/gemini-proxy', {
        method: 'POST',
        body: JSON.stringify({ contents: prompt }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }

      const resultData = await response.json();
      setAiSummary(resultData.text);

    } catch (error: any) {
      console.error("Error generating AI summary:", error);
      setAiError(error.message || "Ocurrió un error al generar el resumen. Por favor, intente de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    const data = getFilteredData();
    if (format === 'csv') generateCSV(data);
    else generatePDF(data);
    setTimeout(() => setIsGeneratingReport(false), 1000);
  };

  const escapeCsvCell = (cellData: any): string => {
    const stringData = String(cellData ?? '');
    if (/[",\n]/.test(stringData)) return `"${stringData.replace(/"/g, '""')}"`;
    return stringData;
  };
  
  const findRelatedDocSubject = (docId?: string) => {
    if (!docId) return '';
    return documents.find(d => d.id === docId)?.subject || '';
  };

  const generateCSV = (data: any) => {
    let csvContent = '';
    const addSection = (title: string, headers: string[], rows: any[][]) => {
      csvContent += title + '\n';
      csvContent += headers.map(escapeCsvCell).join(',') + '\n';
      rows.forEach(row => { csvContent += row.map(escapeCsvCell).join(',') + '\n'; });
      csvContent += '\n';
    };

    if (modules.tasksCompleted && data.tasksCompleted?.length > 0) addSection('TAREAS COMPLETADAS', ['Descripción', 'Prioridad', 'Fecha de Creación', 'Fecha de Completado', 'Notas', 'Documento Origen'], data.tasksCompleted.map((t: Task) => [t.description, t.priority, new Date(t.createdAt).toLocaleDateString('es-ES'), new Date(t.completedAt!).toLocaleDateString('es-ES'), t.notes, findRelatedDocSubject(t.relatedDocumentId)]));
    if (modules.tasksPending && data.tasksPending?.length > 0) addSection('TAREAS PENDIENTES', ['Descripción', 'Prioridad', 'Fecha de Creación', 'Fecha de Vencimiento', 'Notas', 'Documento Origen'], data.tasksPending.map((t: Task) => [t.description, t.priority, new Date(t.createdAt).toLocaleDateString('es-ES'), t.dueDate ? new Date(t.dueDate + 'T00:00:00').toLocaleDateString('es-ES') : 'N/A', t.notes, findRelatedDocSubject(t.relatedDocumentId)]));
    if (modules.docsIn && data.incomingDocuments?.length > 0) addSection('DOCUMENTOS ENTRANTES', ['Nº Orden', 'F. Recibido', 'F. Envío', 'Remitente', 'Asunto', 'Nº Doc', 'Folios', 'Soporte', 'Ubic. Digital'], data.incomingDocuments.map((d: Document) => [d.orderNumber, new Date(d.createdAt).toLocaleDateString('es-ES'), d.sentAt ? new Date(d.sentAt + 'T00:00:00').toLocaleDateString('es-ES') : 'N/A', d.from, d.subject, d.documentNumber, d.folios, d.supportType, d.destinationFolder?.path]));
    if (modules.docsOut && data.outgoingDocuments?.length > 0) addSection('DOCUMENTOS SALIENTES', ['F. Envío', 'Destinatario', 'Asunto', 'Nº Doc', 'Folios', 'Soporte', 'Recibido Por', 'Ubic. Digital'], data.outgoingDocuments.map((d: OutgoingDocument) => [d.sentAt ? new Date(d.sentAt + 'T00:00:00').toLocaleDateString('es-ES') : new Date(d.createdAt).toLocaleDateString('es-ES'), d.to, d.subject, d.documentNumber, d.folios, d.supportType, d.receivedBy, d.destinationFolder?.path]));

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_${startDate}_a_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = (data: any) => {
    const styles = `body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.4; color: #333; font-size: 10px; } @page { size: A4 landscape; margin: 0.5in; } h1 { color: #1e293b; font-size: 22px; text-align: center; margin-bottom: 15px; } h2 { color: #475569; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-top: 25px; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #cbd5e1; padding: 5px; text-align: left; word-break: break-word; } th { background-color: #f1f5f9; font-weight: 600; } tr:nth-child(even) { background-color: #f8fafc; } .no-data { text-align: center; color: #64748b; padding: 20px; } .header-info { font-size: 12px; margin-bottom: 20px; }`;
    let htmlContent = `<html><head><title>Reporte de Actividad</title><style>${styles}</style></head><body><h1>Reporte de Actividad</h1><p class="header-info"><strong>Período del Reporte:</strong> ${new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES')} al ${new Date(endDate + 'T00:00:00').toLocaleDateString('es-ES')}</p>`;
    const addSectionToHtml = (title: string, headers: string[], rows: any[][]) => {
        htmlContent += `<h2>${title} (${rows.length})</h2>`;
        if (rows.length === 0) {
            htmlContent += `<p class="no-data">No hay datos para este módulo en el período seleccionado.</p>`;
            return;
        }
        htmlContent += '<table><thead><tr>';
        headers.forEach(h => htmlContent += `<th>${h}</th>`);
        htmlContent += '</tr></thead><tbody>';
        rows.forEach(row => {
            htmlContent += '<tr>';
            row.forEach(cell => htmlContent += `<td>${cell ?? ''}</td>`);
            htmlContent += '</tr>';
        });
        htmlContent += '</tbody></table>';
    };

    if (modules.tasksCompleted) addSectionToHtml('Tareas Completadas', ['Descripción', 'Prioridad', 'F. Creación', 'F. Completado', 'Notas', 'Doc. Origen'], data.tasksCompleted?.map((t: Task) => [t.description, t.priority, new Date(t.createdAt).toLocaleDateString('es-ES'), new Date(t.completedAt!).toLocaleDateString('es-ES'), t.notes, findRelatedDocSubject(t.relatedDocumentId)]) || []);
    if (modules.tasksPending) addSectionToHtml('Tareas Pendientes', ['Descripción', 'Prioridad', 'F. Creación', 'F. Vencimiento', 'Notas', 'Doc. Origen'], data.tasksPending?.map((t: Task) => [t.description, t.priority, new Date(t.createdAt).toLocaleDateString('es-ES'), t.dueDate ? new Date(t.dueDate + 'T00:00:00').toLocaleDateString('es-ES') : 'N/A', t.notes, findRelatedDocSubject(t.relatedDocumentId)]) || []);
    if (modules.docsIn) addSectionToHtml('Documentos Entrantes', ['Nº Orden', 'F. Recibido', 'F. Envío', 'Remitente', 'Asunto', 'Nº Doc', 'Folios', 'Soporte', 'Ubic. Digital'], data.incomingDocuments?.map((d: Document) => [d.orderNumber, new Date(d.createdAt).toLocaleDateString('es-ES'), d.sentAt ? new Date(d.sentAt + 'T00:00:00').toLocaleDateString('es-ES') : 'N/A', d.from, d.subject, d.documentNumber, d.folios, d.supportType, d.destinationFolder?.path]) || []);
    if (modules.docsOut) addSectionToHtml('Documentos Salientes', ['F. Envío', 'Destinatario', 'Asunto', 'Nº Doc', 'Folios', 'Soporte', 'Recibido Por', 'Ubic. Digital'], data.outgoingDocuments?.map((d: OutgoingDocument) => [d.sentAt ? new Date(d.sentAt + 'T00:00:00').toLocaleDateString('es-ES') : new Date(d.createdAt).toLocaleDateString('es-ES'), d.to, d.subject, d.documentNumber, d.folios, d.supportType, d.receivedBy, d.destinationFolder?.path]) || []);

    htmlContent += '</body></html>';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 500);
    }
  };

  const ModuleCheckbox: React.FC<{ name: keyof ReportModules; label: string }> = ({ name, label }) => (
    <div className="flex items-center">
        <input id={name} name={name} type="checkbox" checked={modules[name]} onChange={handleModuleChange} className="h-4 w-4 rounded border-gray-300 dark:border-hover-dark text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark bg-gray-100 dark:bg-border-dark" />
        <label htmlFor={name} className="ml-2 block text-sm text-text-primary-light dark:text-text-primary-dark">{label}</label>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Generador de Informes</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-secondary-dark/50 p-5 rounded-lg border border-border-light dark:border-border-dark">
            <div>
              <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">1. Rango de Fechas</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <label htmlFor="startDate">Desde:</label>
                  <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark" />
                </div>
                <div>
                  <label htmlFor="endDate">Hasta:</label>
                  <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">2. Módulos a Incluir</h4>
              <div className="space-y-2">
                <ModuleCheckbox name="tasksCompleted" label="Tareas Completadas" />
                <ModuleCheckbox name="tasksPending" label="Tareas Pendientes" />
                <ModuleCheckbox name="docsIn" label="Documentos Entrantes" />
                <ModuleCheckbox name="docsOut" label="Documentos Salientes" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">3. Formato de Salida</h4>
              <div className="flex gap-4 text-sm">
                 <div className="flex items-center">
                    <input id="pdf" name="format" type="radio" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} className="h-4 w-4 text-primary-light dark:text-primary-dark bg-gray-100 dark:bg-border-dark border-gray-300 dark:border-hover-dark focus:ring-primary-light" />
                    <label htmlFor="pdf" className="ml-2 block">PDF</label>
                 </div>
                 <div className="flex items-center">
                    <input id="csv" name="format" type="radio" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} className="h-4 w-4 text-primary-light dark:text-primary-dark bg-gray-100 dark:bg-border-dark border-gray-300 dark:border-hover-dark focus:ring-primary-light" />
                    <label htmlFor="csv" className="ml-2 block">CSV</label>
                 </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border-light dark:border-border-dark space-y-3">
              <button onClick={handleGenerateReport} disabled={isGeneratingReport} className="w-full flex items-center justify-center px-4 py-2 bg-primary-light dark:bg-primary-dark text-white font-semibold text-sm rounded-md shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                  {isGeneratingReport ? <IconLoader className="w-4 h-4 mr-2" /> : <IconDownload className="w-4 h-4 mr-2" />}
                  {isGeneratingReport ? 'Generando...' : 'Generar Informe'}
              </button>
            </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-secondary-dark/50 p-5 rounded-lg border border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Análisis con IA</h4>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                          Obtenga un resumen ejecutivo de los datos seleccionados.
                        </p>
                    </div>
                    <button onClick={handleGenerateAiSummary} disabled={isAnalyzing} className="flex items-center px-4 py-2 bg-primary-light dark:bg-primary-dark text-white text-sm font-semibold rounded-md shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isAnalyzing ? <IconLoader className="w-5 h-5 mr-2" /> : <IconSparkles className="w-5 h-5 mr-2" />}
                        {isAnalyzing ? 'Analizando...' : 'Generar Resumen'}
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-secondary-dark/50 p-5 rounded-lg border border-border-light dark:border-border-dark min-h-[300px]">
                {isAnalyzing && (<div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark animate-pulse"><IconLoader className="w-6 h-6 mr-3" /><span>La IA está analizando los datos...</span></div>)}
                {aiError && (<div className="text-red-600 dark:text-red-400 text-sm p-4 text-center"><p className="font-semibold">Error</p><p>{aiError}</p></div>)}
                {aiSummary && !isAnalyzing && (<div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"><p>{aiSummary}</p></div>)}
                {!isAnalyzing && !aiError && !aiSummary && (<div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark text-center"><p>El resumen ejecutivo generado por la IA aparecerá aquí.</p></div>)}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
