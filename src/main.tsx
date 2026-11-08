import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportElementsToPdf } from './services/pdfExport';

if (typeof window !== 'undefined') {
  (window as any).html2canvas = html2canvas;
  (window as any).jspdf = { jsPDF };
  (window as any).exportElementsToPdf = exportElementsToPdf;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


