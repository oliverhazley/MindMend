// ExportData.js
// this file is responsible for exporting the HRV data to a PDF file
// it uses the jsPDF library to create the PDF and the jspdf-autotable plugin to create tables
// it also includes functions to bucket the data by day and month, and to calculate stress zones
// The format of the pdf is as follows:
// 1. Cover page with title and export date
// 2. Stress zone distribution table
// 3. Past 12 months summary table
// 4. Past 31 days summary table
// ----------------------------------------------------------------------

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {API_BASE_URL} from './config.js';

// Helpers
const isoDate = (d) => new Date(d).toISOString().split('T')[0]; // YYYY‑MM‑DD
const monthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY‑MM

const HEADER_CLR = [30, 144, 255]; // #1E90FF (MindMend accent blue)

// Bucketing helpers
// last 31 days (newest first)
function bucketByDay(readings, days = 31) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);

  const buckets = {};
  for (const {reading_time, hrv_value} of readings) {
    const d = new Date(reading_time);
    if (d < start || d > end) continue;
    const key = isoDate(d);
    (buckets[key] ??= []).push(hrv_value);
  }

  return Object.keys(buckets)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((day) => {
      const vals = buckets[day];
      return {
        day,
        avg: (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2),
        min: Math.min(...vals).toFixed(2),
        max: Math.max(...vals).toFixed(2),
        cnt: vals.length,
      };
    });
}

// last 12 months (newest first)
function bucketByMonth(readings, monthsBack = 12) {
  const end = new Date();
  const buckets = {};

  for (const {reading_time, hrv_value} of readings) {
    const d = new Date(reading_time);
    const diffM =
      (end.getFullYear() - d.getFullYear()) * 12 +
      (end.getMonth() - d.getMonth());
    if (diffM < 0 || diffM >= monthsBack) continue;
    (buckets[monthKey(d)] ??= []).push(hrv_value);
  }

  // ensure empty months are shown
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(end);
    d.setMonth(end.getMonth() - i);
    buckets[monthKey(d)] ||= [];
  }

  return Object.keys(buckets)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((m) => {
      const vals = buckets[m];
      return {
        month: m,
        avg: vals.length
          ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2)
          : '—',
        min: vals.length ? Math.min(...vals).toFixed(2) : '—',
        max: vals.length ? Math.max(...vals).toFixed(2) : '—',
        cnt: vals.length,
      };
    });
}

// Stress‑zone distribution
function stressZones(readings) {
  const z = {low: 0, moderate: 0, high: 0};
  for (const {hrv_value} of readings) {
    if (hrv_value < 25) z.low++;
    else if (hrv_value < 60) z.moderate++;
    else z.high++;
  }
  const total = readings.length || 1;
  return {
    low: z.low,
    lowPct: ((100 * z.low) / total).toFixed(1),
    moderate: z.moderate,
    moderatePct: ((100 * z.moderate) / total).toFixed(1),
    high: z.high,
    highPct: ((100 * z.high) / total).toFixed(1),
  };
}

// PDF export
export async function exportHRVPDF() {
  // auth guard
  if (!localStorage.getItem('token')) {
    alert('You must be logged in to export data.');
    return;
  }

  try {
    const uid = localStorage.getItem('user_id') || '';
    const resp = await fetch(`${API_BASE_URL}/hrv?user_id=${uid}`);
    const rows = await resp.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      alert('No HRV data available.');
      return;
    }

    // crunch numbers
    const last31 = bucketByDay(rows, 31);
    const last12 = bucketByMonth(rows, 12);
    const zones = stressZones(rows);

    // PDF setup
    const doc = new jsPDF({unit: 'mm', format: 'a4'});
    const today = isoDate(new Date());

    // Cover
    doc.setFontSize(22).text('MindMend – HRV Report', 14, 25);
    doc.setFontSize(12).text(`Exported: ${today}`, 14, 34);

    // Stress distribution (page 1)
    const yStressTitle = 48;
    doc.setFontSize(16).text('Stress‑zone distribution', 14, yStressTitle);
    autoTable(doc, {
      startY: yStressTitle + 6,
      head: [['Zone', 'Count', '%']],
      body: [
        ['Low', zones.low, `${zones.lowPct}%`],
        ['Moderate', zones.moderate, `${zones.moderatePct}%`],
        ['High', zones.high, `${zones.highPct}%`],
      ],
      headStyles: {fillColor: HEADER_CLR, textColor: 255, halign: 'center'},
      styles: {halign: 'center'},
    });

    // Past 12 months summary (still page 1, under #2)
    const yMonthlyTitle = doc.lastAutoTable.finalY + 8; // dynamic Y – fixes overlap
    doc.setFontSize(16).text('Past 12 months summary', 14, yMonthlyTitle);
    autoTable(doc, {
      startY: yMonthlyTitle + 6,
      head: [['Month', 'Avg', 'Min', 'Max', '# readings']],
      body: last12.map((m) => [m.month, m.avg, m.min, m.max, m.cnt]),
      headStyles: {fillColor: HEADER_CLR, textColor: 255, halign: 'center'},
      styles: {fontSize: 9, halign: 'center'},
    });

    // Past 31 days summary (page 2)
    doc.addPage();
    const yDailyTitle = 16;
    doc.setFontSize(16).text('Past 31 days summary', 14, yDailyTitle);
    autoTable(doc, {
      startY: yDailyTitle + 6,
      head: [['Date', 'Avg', 'Min', 'Max', '# readings']],
      body: last31.map((d) => [d.day, d.avg, d.min, d.max, d.cnt]),
      headStyles: {fillColor: HEADER_CLR, textColor: 255, halign: 'center'},
      styles: {fontSize: 9, halign: 'center'},
    });

    // save
    doc.save(`MindMend_HRV_Report_${today}.pdf`);
  } catch (err) {
    console.error('[MindMend] PDF export failed:', err);
    alert('Export failed – see console for details.');
  }
}
