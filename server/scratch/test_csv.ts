import * as XLSX from 'xlsx';

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

const csvContent = `province_name,total_votes,target_mc,political_affiliation,supported_candidate,support_status,characteristic,surat_baiat,afiliasi_politik,video_dukung,kedekatan_mc,atribut_fisik,sosial_media
Aceh,5,Target MC Aceh,Partai A,,DINAMIS,WASPADA,false,false,false,false,false,false
DKI Jakarta,5,Target MC Jakarta,Partai B,Ade Jona,TERKUNCI,SOLID,true,true,true,true,true,true
Jawa Barat,5,Target MC Jabar,Partai C,Anthony Leong,MENGARAH,RENTAN,true,false,true,true,false,true`;

const workbook = XLSX.read(Buffer.from(csvContent), { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];

console.log('Rows count:', rows.length);
const headers = rows[0].map((cell) => normalizeHeader(String(cell)));
console.log('Headers:', headers);

const validStatuses = ['TERKUNCI', 'MENGARAH', 'DINAMIS'];
const validCharacteristics = ['SOLID', 'RENTAN', 'WASPADA'];

for (const row of rows.slice(1)) {
    const record: Record<string, any> = {};
    headers.forEach((header, index) => {
        record[header] = row[index];
    });
    console.log('Record province:', record['province_name']);
    console.log('Record status:', record['support_status']);
    console.log('Record characteristic:', record['characteristic']);
}
