import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { utils, write, WorkBook, WorkSheet } from 'xlsx';
import { Application, Event, Note } from '@/types';

type CellStyle = Record<string, unknown>;

// ── Brand colours ────────────────────────────────────────────────────────────
const C = {
  brown: '3A312B',
  brownLight: '5C4F46',
  cream: 'FDFBF7',
  accent: 'E8AA42',
  accentLight: 'FDF3DC',
  stone: 'F5F5F4',
  stoneMid: 'D6D3D1',
  white: 'FFFFFF',
  green: 'D1FAE5',
  greenText: '065F46',
  amber: 'FEF3C7',
  amberText: '92400E',
  rose: 'FFE4E6',
  roseText: '9F1239',
  red: 'FEE2E2',
  redText: '991B1B',
  blue: 'DBEAFE',
  blueText: '1E40AF',
};

type Fill = { fgColor: { rgb: string } };
type Font = { bold?: boolean; color?: { rgb: string }; sz?: number; name?: string };
type Border = { style: string; color: { rgb: string } };
type Borders = { top?: Border; bottom?: Border; left?: Border; right?: Border };

function fill(rgb: string): Fill {
  return { fgColor: { rgb } };
}
function font(opts: Font): Font {
  return opts;
}
function thinBorder(rgb = 'D6D3D1'): Borders {
  const b: Border = { style: 'thin', color: { rgb } };
  return { top: b, bottom: b, left: b, right: b };
}
function thickBorder(rgb = '3A312B'): Borders {
  const b: Border = { style: 'medium', color: { rgb } };
  return { top: b, bottom: b, left: b, right: b };
}

function applyStyle(ws: WorkSheet, addr: string, style: CellStyle) {
  if (!ws[addr]) ws[addr] = { t: 's', v: '' };
  ws[addr].s = style;
}

function styleRange(
  ws: WorkSheet,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
  style: CellStyle
) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const addr = utils.encode_cell({ r, c });
      if (ws[addr]) ws[addr].s = style;
    }
  }
}

function setColWidths(ws: WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map((w) => ({ wch: w }));
}

function headerStyle(bgRgb: string, textRgb: string = C.white): CellStyle {
  return {
    fill: fill(bgRgb),
    font: font({ bold: true, color: { rgb: textRgb }, sz: 11 }),
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: thinBorder(bgRgb),
  } as unknown as CellStyle;
}

function cellStyle(bgRgb: string = C.white, textRgb: string = C.brown, bold = false): CellStyle {
  return {
    fill: fill(bgRgb),
    font: font({ bold, color: { rgb: textRgb }, sz: 10 }),
    alignment: { vertical: 'center', wrapText: false },
    border: thinBorder(),
  } as unknown as CellStyle;
}

// ── Status badge colours ──────────────────────────────────────────────────────
function statusStyle(status: string | null): CellStyle {
  const map: Record<string, [string, string]> = {
    Wishlist: [C.rose, C.roseText],
    Applied: [C.stone, C.brownLight],
    Interviewing: [C.amber, C.amberText],
    Offered: [C.green, C.greenText],
    Offer_Accepted: [C.green, C.greenText],
    Offer_Declined: [C.red, C.redText],
    Rejected: [C.red, C.redText],
    Ghosted: [C.stone, C.brownLight],
  };
  const [bg, fg] = map[status ?? ''] ?? [C.stone, C.brownLight];
  return {
    fill: fill(bg),
    font: font({ bold: true, color: { rgb: fg }, sz: 10 }),
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder(),
  } as unknown as CellStyle;
}

function eventStatusStyle(status: string | null): CellStyle {
  const map: Record<string, [string, string]> = {
    Upcoming: [C.blue, C.blueText],
    Done: [C.green, C.greenText],
    Overdue: [C.red, C.redText],
  };
  const [bg, fg] = map[status ?? ''] ?? [C.stone, C.brownLight];
  return {
    fill: fill(bg),
    font: font({ bold: true, color: { rgb: fg }, sz: 10 }),
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder(),
  } as unknown as CellStyle;
}

// ── Sheet builders ────────────────────────────────────────────────────────────

function buildSummarySheet(applications: Application[], events: Event[]): WorkSheet {
  const total = applications.length;
  const byStatus = (s: string) => applications.filter((a) => a.status === s).length;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const responded = applications.filter((a) =>
    ['Interviewing', 'Offered', 'Offer_Accepted', 'Rejected', 'Ghosted'].includes(a.status ?? '')
  ).length;
  const offered = applications.filter((a) =>
    ['Offered', 'Offer_Accepted'].includes(a.status ?? '')
  ).length;

  const totalInterviews = events.filter((e) => e.type === 'Interview').length;
  const doneInterviews = events.filter((e) => e.type === 'Interview' && e.status === 'Done').length;
  const overdueEvents = events.filter((e) => e.status === 'Overdue').length;
  const upcomingEvents = events.filter((e) => e.status === 'Upcoming').length;

  const rows = [
    // Title row
    ['JOB SEARCH ANALYTICS', ''],
    ['Exported on', new Date().toLocaleDateString('en-US', { dateStyle: 'long' })],
    ['', ''],
    // Section: Pipeline
    ['PIPELINE BREAKDOWN', ''],
    ['Total Applications', total],
    ['Wishlist', byStatus('Wishlist')],
    ['Applied', byStatus('Applied')],
    ['Interviewing', byStatus('Interviewing')],
    ['Offered', byStatus('Offered')],
    ['Offer Accepted', byStatus('Offer_Accepted')],
    ['Offer Declined', byStatus('Offer_Declined')],
    ['Rejected', byStatus('Rejected')],
    ['Ghosted', byStatus('Ghosted')],
    ['', ''],
    // Section: Rates
    ['CONVERSION RATES', ''],
    ['Response Rate', `${pct(responded)}%`],
    [
      'Interview Rate',
      `${pct(applications.filter((a) => ['Interviewing', 'Offered', 'Offer_Accepted'].includes(a.status ?? '')).length)}%`,
    ],
    ['Offer Rate', `${pct(offered)}%`],
    ['', ''],
    // Section: Events
    ['EVENTS OVERVIEW', ''],
    ['Total Events', events.length],
    ['Upcoming', upcomingEvents],
    ['Completed', events.filter((e) => e.status === 'Done').length],
    ['Overdue', overdueEvents],
    ['Total Interviews', totalInterviews],
    ['Completed Interviews', doneInterviews],
    ['Assessments', events.filter((e) => e.type === 'Assessment').length],
    ['Follow Ups', events.filter((e) => e.type === 'Follow_Up').length],
    ['Deadlines', events.filter((e) => e.type === 'Deadline').length],
  ];

  const ws = utils.aoa_to_sheet(rows);
  setColWidths(ws, [30, 22]);

  // Title
  applyStyle(ws, 'A1', {
    fill: fill(C.brown),
    font: font({ bold: true, color: { rgb: C.cream }, sz: 14 }),
    alignment: { horizontal: 'left', vertical: 'center' },
  } as unknown as CellStyle);
  applyStyle(ws, 'A2', cellStyle(C.stone, C.brownLight));
  applyStyle(ws, 'B2', cellStyle(C.stone, C.brownLight));

  // Section headers at rows 4, 15, 20 (0-indexed: 3, 14, 19)
  const sectionRows = [3, 14, 19];
  sectionRows.forEach((r) => {
    const addr = utils.encode_cell({ r, c: 0 });
    applyStyle(ws, addr, {
      fill: fill(C.accent),
      font: font({ bold: true, color: { rgb: C.brown }, sz: 10 }),
      alignment: { horizontal: 'left', vertical: 'center' },
      border: thinBorder(C.accent),
    } as unknown as CellStyle);
  });

  // Data rows — alternate shading
  const dataRanges = [
    [4, 12], // pipeline
    [15, 17], // rates
    [20, 28], // events
  ];
  dataRanges.forEach(([start, end]) => {
    for (let r = start; r <= end; r++) {
      const bg = r % 2 === 0 ? C.white : C.stone;
      applyStyle(ws, utils.encode_cell({ r, c: 0 }), cellStyle(bg, C.brown, true));
      applyStyle(ws, utils.encode_cell({ r, c: 1 }), {
        fill: fill(bg),
        font: font({ sz: 10, color: { rgb: C.brownLight } }),
        alignment: { horizontal: 'right', vertical: 'center' },
        border: thinBorder(),
      } as unknown as CellStyle);
    }
  });

  ws['!rows'] = rows.map((_, i) => ({ hpt: i === 0 ? 28 : 20 }));
  return ws;
}

function buildApplicationsSheet(applications: Application[], events: Event[]): WorkSheet {
  const eventsByApp = events.reduce<Record<string, Event[]>>((acc, e) => {
    (acc[e.application_id] ??= []).push(e);
    return acc;
  }, {});

  const headers = [
    'Company',
    'Role',
    'Status',
    'Applied Date',
    'Job Posting URL',
    'Total Events',
    'Interviews',
    'Assessments',
    'Follow Ups',
    'Deadlines',
    'Next Event',
    'Next Event Date',
  ];

  const dataRows = applications.map((app) => {
    const appEvents = eventsByApp[app.id] ?? [];
    const upcoming = appEvents
      .filter((e) => e.status === 'Upcoming')
      .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime())[0];
    return [
      app.company_name,
      app.role_title ?? '',
      app.status?.replace('_', ' ') ?? '',
      app.created_at ? new Date(app.created_at).toLocaleDateString() : '',
      app.jd_url ?? '',
      appEvents.length,
      appEvents.filter((e) => e.type === 'Interview').length,
      appEvents.filter((e) => e.type === 'Assessment').length,
      appEvents.filter((e) => e.type === 'Follow_Up').length,
      appEvents.filter((e) => e.type === 'Deadline').length,
      upcoming?.title ?? '',
      upcoming ? new Date(upcoming.event_time).toLocaleDateString() : '',
    ];
  });

  const ws = utils.aoa_to_sheet([headers, ...dataRows]);
  setColWidths(ws, [22, 22, 16, 14, 36, 12, 12, 12, 12, 12, 22, 16]);

  // Header row
  headers.forEach((_, c) => {
    applyStyle(ws, utils.encode_cell({ r: 0, c }), headerStyle(C.brown));
  });

  // Data rows
  dataRows.forEach((row, ri) => {
    const r = ri + 1;
    const bg = ri % 2 === 0 ? C.white : C.stone;
    row.forEach((_, c) => {
      const addr = utils.encode_cell({ r, c });
      if (c === 2) {
        // Status column — coloured badge
        applyStyle(ws, addr, statusStyle(applications[ri].status ?? null));
      } else if (c >= 5 && c <= 9) {
        // Number columns — right-aligned
        applyStyle(ws, addr, {
          fill: fill(bg),
          font: font({ sz: 10, color: { rgb: C.brownLight } }),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: thinBorder(),
        } as unknown as CellStyle);
      } else {
        applyStyle(ws, addr, cellStyle(bg));
      }
    });
  });

  ws['!rows'] = [{ hpt: 24 }, ...dataRows.map(() => ({ hpt: 20 }))];
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  return ws;
}

function buildEventsSheet(events: Event[], applications: Application[]): WorkSheet {
  const appById = applications.reduce<Record<string, Application>>((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {});

  const headers = ['Company', 'Role', 'Event Title', 'Type', 'Status', 'Date', 'Time'];

  const dataRows = events
    .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime())
    .map((e) => [
      appById[e.application_id]?.company_name ?? '',
      appById[e.application_id]?.role_title ?? '',
      e.title,
      e.type.replace('_', ' '),
      e.status ?? '',
      new Date(e.event_time).toLocaleDateString(),
      new Date(e.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ]);

  const ws = utils.aoa_to_sheet([headers, ...dataRows]);
  setColWidths(ws, [22, 22, 26, 16, 12, 14, 10]);

  headers.forEach((_, c) => {
    applyStyle(ws, utils.encode_cell({ r: 0, c }), headerStyle(C.brownLight));
  });

  dataRows.forEach((row, ri) => {
    const r = ri + 1;
    const bg = ri % 2 === 0 ? C.white : C.stone;
    row.forEach((_, c) => {
      const addr = utils.encode_cell({ r, c });
      if (c === 4) {
        applyStyle(ws, addr, eventStatusStyle(events[ri].status ?? null));
      } else if (c === 3) {
        applyStyle(ws, addr, {
          fill: fill(C.accentLight),
          font: font({ sz: 10, color: { rgb: C.amberText } }),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: thinBorder(),
        } as unknown as CellStyle);
      } else {
        applyStyle(ws, addr, cellStyle(bg));
      }
    });
  });

  ws['!rows'] = [{ hpt: 24 }, ...dataRows.map(() => ({ hpt: 20 }))];
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  return ws;
}

function buildNotesSheet(notes: Note[], applications: Application[], events: Event[]): WorkSheet {
  const appById = applications.reduce<Record<string, Application>>((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {});
  const eventById = events.reduce<Record<string, Event>>((acc, e) => {
    acc[e.id] = e;
    return acc;
  }, {});

  const headers = ['Company', 'Role', 'Linked Event', 'Note', 'Date'];

  const dataRows = notes
    .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
    .map((n) => [
      appById[n.application_id]?.company_name ?? '',
      appById[n.application_id]?.role_title ?? '',
      n.event_id ? (eventById[n.event_id]?.title ?? '') : '—',
      n.content,
      n.created_at ? new Date(n.created_at).toLocaleDateString() : '',
    ]);

  const ws = utils.aoa_to_sheet([headers, ...dataRows]);
  setColWidths(ws, [22, 22, 22, 50, 14]);

  headers.forEach((_, c) => {
    applyStyle(ws, utils.encode_cell({ r: 0, c }), headerStyle(C.accent, C.brown));
  });

  dataRows.forEach((_, ri) => {
    const r = ri + 1;
    const bg = ri % 2 === 0 ? C.white : C.accentLight;
    [0, 1, 2, 3, 4].forEach((c) => {
      const addr = utils.encode_cell({ r, c });
      const isNote = c === 3;
      applyStyle(ws, addr, {
        fill: fill(bg),
        font: font({ sz: 10, color: { rgb: C.brown } }),
        alignment: { vertical: 'top', wrapText: isNote },
        border: thinBorder(),
      } as unknown as CellStyle);
    });
  });

  ws['!rows'] = [{ hpt: 24 }, ...dataRows.map(() => ({ hpt: 36 }))];
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  return ws;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function exportApplicationsXlsx(
  applications: Application[],
  events: Event[],
  notes: Note[] = []
): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) throw new Error('Sharing is not available on this device');

  const wb: WorkBook = utils.book_new();
  utils.book_append_sheet(wb, buildSummarySheet(applications, events), '📊 Summary');
  utils.book_append_sheet(wb, buildApplicationsSheet(applications, events), '📋 Applications');
  utils.book_append_sheet(wb, buildEventsSheet(events, applications), '📅 Events');
  if (notes.length > 0) {
    utils.book_append_sheet(wb, buildNotesSheet(notes, applications, events), '📝 Notes');
  }

  const base64 = write(wb, { type: 'base64', bookType: 'xlsx', cellStyles: true });
  const filename = `Landed_Job_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const fileUri = FileSystem.cacheDirectory + filename;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Export Job Applications',
    UTI: 'com.microsoft.excel.xlsx',
  });
}
