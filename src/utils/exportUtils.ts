import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Transaction } from '../hooks/useSupabaseFinanceData';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const exportToPDF = (
  transactions: Transaction[],
  period: string,
  summary?: { totalIncome: number; totalExpense: number; balance: number },
  filename?: string
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Laporan Keuangan', 14, 22);

  // Period
  doc.setFontSize(12);
  doc.text(`Periode: ${period}`, 14, 30);

  // Summary if provided
  if (summary) {
    doc.setFontSize(10);
    doc.text(`Total Pemasukan: ${formatCurrency(summary.totalIncome)}`, 14, 40);
    doc.text(`Total Pengeluaran: ${formatCurrency(summary.totalExpense)}`, 14, 46);
    doc.text(`Saldo: ${formatCurrency(summary.balance)}`, 14, 52);
  }

  const tableData = transactions.map((t) => [
    format(parseISO(t.date), 'dd MMM yyyy', { locale: id }),
    t.category,
    t.subcategory || '-',
    t.description || '-',
    formatCurrency(t.amount),
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
  ]);

  autoTable(doc, {
    startY: summary ? 60 : 40,
    head: [['Tanggal', 'Kategori', 'Subkategori', 'Deskripsi', 'Jumlah', 'Tipe']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // primary color
  });

  const finalFilename = filename || `Laporan_Keuangan_${period.replace(' ', '_')}.pdf`;
  doc.save(finalFilename.endsWith('.pdf') ? finalFilename : `${finalFilename}.pdf`);
};

export const exportToPDFBase64 = (
  transactions: Transaction[],
  period: string,
  summary?: { totalIncome: number; totalExpense: number; balance: number },
  filename?: string
): string => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Laporan Keuangan', 14, 22);

  // Period
  doc.setFontSize(12);
  doc.text(`Periode: ${period}`, 14, 30);

  // Summary if provided
  if (summary) {
    doc.setFontSize(10);
    doc.text(`Total Pemasukan: ${formatCurrency(summary.totalIncome)}`, 14, 40);
    doc.text(`Total Pengeluaran: ${formatCurrency(summary.totalExpense)}`, 14, 46);
    doc.text(`Saldo: ${formatCurrency(summary.balance)}`, 14, 52);
  }

  const tableData = transactions.map((t) => [
    format(parseISO(t.date), 'dd MMM yyyy', { locale: id }),
    t.category,
    t.subcategory || '-',
    t.description || '-',
    formatCurrency(t.amount),
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
  ]);

  autoTable(doc, {
    startY: summary ? 60 : 40,
    head: [['Tanggal', 'Kategori', 'Subkategori', 'Deskripsi', 'Jumlah', 'Tipe']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // primary color
  });

  return doc.output('datauristring'); // Returns Base64 data URI
};

export const exportToExcel = (
  transactions: Transaction[],
  period: string,
  summary?: { totalIncome: number; totalExpense: number; balance: number },
  filename?: string
) => {
  const incomeTrans = transactions.filter(t => t.type === 'income');
  const expenseTrans = transactions.filter(t => t.type === 'expense');

  const mapData = (data: Transaction[]) => data.map(t => ({
    Tanggal: format(parseISO(t.date), 'yyyy-MM-dd'),
    Kategori: t.category,
    Subkategori: t.subcategory || '-',
    Deskripsi: t.description || '-',
    Jumlah: t.amount,
  }));

  const wb = XLSX.utils.book_new();

  // Summary Sheet
  if (summary) {
    const summaryData = [
      { Keterangan: 'Periode', Nilai: period },
      { Keterangan: 'Total Pemasukan', Nilai: summary.totalIncome },
      { Keterangan: 'Total Pengeluaran', Nilai: summary.totalExpense },
      { Keterangan: 'Saldo', Nilai: summary.balance },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');
  }

  // Income Sheet
  if (incomeTrans.length > 0) {
    const wsIncome = XLSX.utils.json_to_sheet(mapData(incomeTrans));
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Pemasukan');
  }

  // Expense Sheet
  if (expenseTrans.length > 0) {
    const wsExpense = XLSX.utils.json_to_sheet(mapData(expenseTrans));
    XLSX.utils.book_append_sheet(wb, wsExpense, 'Pengeluaran');
  }

  const finalFilename = filename || `Laporan_Keuangan_${period.replace(' ', '_')}.xlsx`;
  XLSX.writeFile(wb, finalFilename.endsWith('.xlsx') ? finalFilename : `${finalFilename}.xlsx`);
};

export const exportToExcelBase64 = (
  transactions: Transaction[],
  period: string,
  summary?: { totalIncome: number; totalExpense: number; balance: number }
): string => {
  const incomeTrans = transactions.filter(t => t.type === 'income');
  const expenseTrans = transactions.filter(t => t.type === 'expense');

  const mapData = (data: Transaction[]) => data.map(t => ({
    Tanggal: format(parseISO(t.date), 'yyyy-MM-dd'),
    Kategori: t.category,
    Subkategori: t.subcategory || '-',
    Deskripsi: t.description || '-',
    Jumlah: t.amount,
  }));

  const wb = XLSX.utils.book_new();

  // Summary Sheet
  if (summary) {
    const summaryData = [
      { Keterangan: 'Periode', Nilai: period },
      { Keterangan: 'Total Pemasukan', Nilai: summary.totalIncome },
      { Keterangan: 'Total Pengeluaran', Nilai: summary.totalExpense },
      { Keterangan: 'Saldo', Nilai: summary.balance },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');
  }

  // Income Sheet
  if (incomeTrans.length > 0) {
    const wsIncome = XLSX.utils.json_to_sheet(mapData(incomeTrans));
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Pemasukan');
  }

  // Expense Sheet
  if (expenseTrans.length > 0) {
    const wsExpense = XLSX.utils.json_to_sheet(mapData(expenseTrans));
    XLSX.utils.book_append_sheet(wb, wsExpense, 'Pengeluaran');
  }

  return XLSX.write(wb, { bookType: 'xlsx', type: 'base64' }); // Returns Base64 string
};
