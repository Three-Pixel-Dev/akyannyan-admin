import type { MemberLevelCode } from '../types/member-levels-code.types';

function excelEscape(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatGeneratedDate(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** Build a SpreadsheetML .xls workbook Excel opens natively (no extra deps). */
export function buildMemberLevelCodesExcelXml(codes: MemberLevelCode[]): string {
  const header = ['Generated Date', 'Code', 'Level', 'Redeemed By', 'Status'];
  const rowsXml = [
    `<Row>${header.map((h) => `<Cell><Data ss:Type="String">${excelEscape(h)}</Data></Cell>`).join('')}</Row>`,
    ...codes.map((code) => {
      const redeemedBy =
        code.userDisplayName ||
        code.userEmail ||
        (code.userId != null ? `User #${code.userId}` : '');
      const cells = [
        formatGeneratedDate(code.createdAt),
        code.code ?? '',
        code.memberLevelName ?? '',
        redeemedBy,
        code.status ?? '',
      ];
      return `<Row>${cells
        .map((v) => `<Cell><Data ss:Type="String">${excelEscape(v)}</Data></Cell>`)
        .join('')}</Row>`;
    }),
  ].join('');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="User Codes">
  <Table>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;
}

export function downloadMemberLevelCodesExcel(codes: MemberLevelCode[], filename?: string): void {
  const xml = buildMemberLevelCodesExcelXml(codes);
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `user-codes-${stamp}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
