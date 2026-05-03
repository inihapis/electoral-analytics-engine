import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { computeBpdScores, calculateAggregateStats, TARGET_VOTES } from '../utils/calculations';

const prisma = new PrismaClient();
const SNAPSHOT_DIR = path.resolve(__dirname, '../../snapshots');
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'last-snapshot.json');

interface BpdWithScores {
  score: number;
  estimatedVotes: number;
  updatedBy: { username: string };
}

export const getAllBpds = async (req: Request, res: Response) => {
  try {
    const bpds = await prisma.bpd.findMany({
      include: { 
        updatedBy: { select: { username: true } },
        supportedCandidate: { select: { name: true } }
      }
    });
    
    const bpdsWithScores = bpds.map((bpd: any) => {
      const { totalPoints, score, estimatedVotes } = computeBpdScores(bpd);

      return {
        ...bpd,
        totalPoints,
        score,
        estimatedVotes
      };
    });

    res.json(bpdsWithScores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BPD data' });
  }
};

export const getBpdById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const bpd = await prisma.bpd.findUnique({
      where: { id },
      include: { 
        updatedBy: { select: { username: true } },
        supportedCandidate: { select: { name: true } }
      }
    });
    if (!bpd) return res.status(404).json({ error: 'BPD not found' });
    res.json(bpd);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BPD data' });
  }
};

export const updateBpd = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const userId = (req as any).user?.id;
  
  // Validasi field yang wajib diisi
  if (!data.provinceName) {
    return res.status(400).json({ error: 'Nama provinsi wajib diisi' });
  }
  
  if (!data.supportStatus) {
    return res.status(400).json({ error: 'Status dukungan wajib dipilih' });
  }
  
  if (!data.characteristic) {
    return res.status(400).json({ error: 'Karakteristik wajib dipilih' });
  }
  
  // Validasi enum values
  const validStatuses = ['TERKUNCI', 'MENGARAH', 'DINAMIS'];
  const validCharacteristics = ['SOLID', 'RENTAN', 'WASPADA'];
  
  if (!validStatuses.includes(data.supportStatus)) {
    return res.status(400).json({ error: 'Status dukungan tidak valid. Pilih: Terkunci, Mengarah, atau Dinamis' });
  }
  
  if (!validCharacteristics.includes(data.characteristic)) {
    return res.status(400).json({ error: 'Karakteristik tidak valid. Pilih: Solid, Rentan, atau Waspada' });
  }
  
    try {
      const bpdUpdateData: any = {
        provinceName: data.provinceName,
        totalVotes: Number(data.totalVotes) || 5,
        targetMc: data.targetMc,
        politicalAffiliation: data.politicalAffiliation,
        supportStatus: data.supportStatus,
        characteristic: data.characteristic,
        suratBaiat: Boolean(data.suratBaiat),
        afiliasiPolitik: Boolean(data.afiliasiPolitik),
        videoDukungan: Boolean(data.videoDukungan),
        kedekatanMc: Boolean(data.kedekatanMc),
        atributFisik: Boolean(data.atributFisik),
        sosialMedia: Boolean(data.sosialMedia),
        supportedCandidateId: data.supportedCandidateId || null,
        updatedById: userId,
      };

      const bpd = await prisma.bpd.update({
      where: { id },
      data: bpdUpdateData
    });
    res.json(bpd);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update BPD' });
  }
};

export const createBpd = async (req: Request, res: Response) => {
  const data = req.body;
  const userId = (req as any).user?.id;
  
  // Validasi field yang wajib diisi
  if (!data.provinceName) {
    return res.status(400).json({ error: 'Nama provinsi wajib diisi' });
  }
  
  if (!data.supportStatus) {
    return res.status(400).json({ error: 'Status dukungan wajib dipilih' });
  }
  
  if (!data.characteristic) {
    return res.status(400).json({ error: 'Karakteristik wajib dipilih' });
  }
  
  // Validasi enum values
  const validStatuses = ['TERKUNCI', 'MENGARAH', 'DINAMIS'];
  const validCharacteristics = ['SOLID', 'RENTAN', 'WASPADA'];
  
  if (!validStatuses.includes(data.supportStatus)) {
    return res.status(400).json({ error: 'Status dukungan tidak valid. Pilih: Terkunci, Mengarah, atau Dinamis' });
  }
  
  if (!validCharacteristics.includes(data.characteristic)) {
    return res.status(400).json({ error: 'Karakteristik tidak valid. Pilih: Solid, Rentan, atau Waspada' });
  }
  
  try {
    const bpd = await prisma.bpd.create({
      data: {
        ...data,
        updatedById: userId
      },
      include: { 
        updatedBy: { select: { username: true } },
        supportedCandidate: { select: { name: true } }
      }
    });
    res.json(bpd);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create BPD' });
  }
};

export const deleteBpd = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.bpd.delete({
      where: { id }
    });
    res.json({ message: 'BPD deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete BPD' });
  }
};

export const getStatsSummary = async (req: Request, res: Response) => {
  try {
    const bpds = await prisma.bpd.findMany({
      include: { updatedBy: { select: { username: true } } }
    });
    
    const bpdsWithScores = bpds.map((bpd: any) => {
      const { score, estimatedVotes } = computeBpdScores(bpd);

      return {
        ...bpd,
        score,
        estimatedVotes
      };
    });

    const { totalDukungan, totalEfektif, progress } = calculateAggregateStats(bpdsWithScores);

    const stats = {
      totalBpds: bpds.length,
      totalDukungan,
      totalEfektif,
      targetVotes: TARGET_VOTES,
      progress: progress,
      terkunci: bpds.filter((b: any) => b.supportStatus === 'TERKUNCI').length,
      mengarah: bpds.filter((b: any) => b.supportStatus === 'MENGARAH').length,
      dinamis: bpds.filter((b: any) => b.supportStatus === 'DINAMIS').length,
      solid: bpds.filter((b: any) => b.characteristic === 'SOLID').length,
      rentan: bpds.filter((b: any) => b.characteristic === 'RENTAN').length,
      waspada: bpds.filter((b: any) => b.characteristic === 'WASPADA').length,
      unassigned: bpds.filter((b: any) => !b.supportedCandidateId).length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats summary' });
  }
};

function parseBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const text = String(value || '').trim().toLowerCase();
  return ['true', '1', 'yes', 'y', 'ya', 'terpenuhi', 'v'].includes(text);
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

export const bulkUpload = async (req: any, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Sesi anda telah berakhir atau ID user tidak ditemukan' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];

    if (rows.length <= 1) {
      return res.status(400).json({ error: 'File tidak berisi data yang valid' });
    }

    const headers = rows[0].map((cell) => normalizeHeader(String(cell)));
    const validStatuses = ['TERKUNCI', 'MENGARAH', 'DINAMIS'];
    const validCharacteristics = ['SOLID', 'RENTAN', 'WASPADA'];
    const uploadResult: string[] = [];
    const errors: string[] = [];

    // Map common aliases to canonical enum values
    const statusMap: Record<string, string> = {
      'TERKUNCI': 'TERKUNCI', 'LOCKED': 'TERKUNCI', 'FIX': 'TERKUNCI',
      'MENGARAH': 'MENGARAH', 'TENDENCY': 'MENGARAH',
      'DINAMIS': 'DINAMIS', 'DYNAMIC': 'DINAMIS', 'FLOATING': 'DINAMIS'
    };

    const charMap: Record<string, string> = {
      'SOLID': 'SOLID', 'KUAT': 'SOLID',
      'RENTAN': 'RENTAN', 'WEAK': 'RENTAN', 'VULNERABLE': 'RENTAN',
      'WASPADA': 'WASPADA', 'WARNING': 'WASPADA', 'CAUTION': 'WASPADA'
    };

    // Fetch all candidates to map names to IDs
    const allCandidates = await prisma.candidate.findMany();

    for (const [rowIndex, row] of rows.slice(1).entries()) {
      const record: Record<string, any> = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      // Flexible header mapping
      const provinceName = String(
        record['province_name'] || record['province'] || record['provinsi'] || record['wilayah'] || record['nama_provinsi'] || ''
      ).trim();
      
      if (!provinceName) {
        errors.push(`Baris ${rowIndex + 2}: Nama provinsi kosong`);
        continue;
      }

      let supportStatus = String(
        record['support_status'] || record['status'] || record['status_dukungan'] || 'DINAMIS'
      ).trim().toUpperCase();
      
      let characteristic = String(
        record['characteristic'] || record['karakteristik'] || record['sifat'] || 'WASPADA'
      ).trim().toUpperCase();

      // Normalize values using maps
      supportStatus = statusMap[supportStatus] || (validStatuses.includes(supportStatus) ? supportStatus : 'DINAMIS');
      characteristic = charMap[characteristic] || (validCharacteristics.includes(characteristic) ? characteristic : 'WASPADA');

      // Find candidate ID by name
      const candidateName = String(
        record['supported_candidate'] || record['candidate'] || record['caketum'] || record['calon'] || ''
      ).trim();
      
      let supportedCandidateId = null;
      if (candidateName && candidateName !== '-') {
        const found = allCandidates.find(c => c.name.toLowerCase() === candidateName.toLowerCase());
        if (found) {
          supportedCandidateId = found.id;
        }
      }

      const bpdData: any = {
        provinceName,
        totalVotes: Number(record['total_votes'] ?? record['votes'] ?? record['suara'] ?? 5) || 5,
        targetMc: String(record['target_mc'] || record['targetmc'] || record['target'] || '').trim() || null,
        politicalAffiliation: String(record['political_affiliation'] || record['politicalaffiliation'] || record['affiliation'] || '').trim() || null,
        supportStatus,
        characteristic,
        suratBaiat: parseBoolean(record['surat_baiat'] || record['suratbaiat'] || record['baiat']),
        afiliasiPolitik: parseBoolean(record['afiliasi_politik'] || record['afiliasipolitik'] || record['afiliasi']),
        videoDukungan: parseBoolean(record['video_dukung'] || record['videodukungan'] || record['video_dukungan'] || record['video']),
        kedekatanMc: parseBoolean(record['kedekatan_mc'] || record['kedekatanmc'] || record['kedekatan']),
        atributFisik: parseBoolean(record['atribut_fisik'] || record['atributfisik'] || record['atribut']),
        sosialMedia: parseBoolean(record['sosial_media'] || record['sosialmedia'] || record['sosmed']),
        supportedCandidateId,
      };

      try {
        await prisma.bpd.upsert({
          where: { provinceName },
          update: { ...bpdData, updatedById: userId },
          create: { ...bpdData, updatedById: userId }
        });
        uploadResult.push(provinceName);
      } catch (err: any) {
        console.error(`Error saving row ${rowIndex + 2}:`, err);
        errors.push(`Baris ${rowIndex + 2} (${provinceName}): ${err.message || 'Gagal simpan'}`);
      }
    }

    res.json({ 
      message: uploadResult.length > 0 ? 'Upload berhasil' : 'Upload selesai dengan catatan', 
      count: uploadResult.length, 
      processed: uploadResult,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Bulk Upload Error:', error);
    res.status(500).json({ 
      error: 'Gagal upload BPDs', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

export const saveSnapshot = async (req: any, res: Response) => {
  try {
    const bpds = await prisma.bpd.findMany({
      include: {
        updatedBy: { select: { id: true, username: true } },
        supportedCandidate: { select: { id: true, name: true } }
      }
    });

    await fs.promises.mkdir(SNAPSHOT_DIR, { recursive: true });
    await fs.promises.writeFile(SNAPSHOT_FILE, JSON.stringify({ savedAt: new Date().toISOString(), bpds }, null, 2), 'utf-8');

    res.json({ message: 'Snapshot berhasil disimpan', path: SNAPSHOT_FILE });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menyimpan snapshot' });
  }
};

export const restoreSnapshot = async (req: any, res: Response) => {
  try {
    if (!fs.existsSync(SNAPSHOT_FILE)) {
      return res.status(404).json({ error: 'Snapshot tidak ditemukan' });
    }

    const fileContent = await fs.promises.readFile(SNAPSHOT_FILE, 'utf-8');
    const snapshot = JSON.parse(fileContent);
    const bpds = snapshot.bpds || [];

    await prisma.$transaction(
      bpds.map((bpd: any) =>
        prisma.bpd.upsert({
          where: { provinceName: bpd.provinceName },
          update: {
            totalVotes: bpd.totalVotes,
            targetMc: bpd.targetMc,
            politicalAffiliation: bpd.politicalAffiliation,
            supportStatus: bpd.supportStatus,
            characteristic: bpd.characteristic,
            suratBaiat: bpd.suratBaiat,
            afiliasiPolitik: bpd.afiliasiPolitik,
            videoDukungan: bpd.videoDukungan,
            kedekatanMc: bpd.kedekatanMc,
            atributFisik: bpd.atributFisik,
            sosialMedia: bpd.sosialMedia,
            supportedCandidateId: bpd.supportedCandidateId,
            updatedById: bpd.updatedById,
          },
          create: {
            provinceName: bpd.provinceName,
            totalVotes: bpd.totalVotes,
            targetMc: bpd.targetMc,
            politicalAffiliation: bpd.politicalAffiliation,
            supportStatus: bpd.supportStatus,
            characteristic: bpd.characteristic,
            suratBaiat: bpd.suratBaiat,
            afiliasiPolitik: bpd.afiliasiPolitik,
            videoDukungan: bpd.videoDukungan,
            kedekatanMc: bpd.kedekatanMc,
            atributFisik: bpd.atributFisik,
            sosialMedia: bpd.sosialMedia,
            supportedCandidateId: bpd.supportedCandidateId,
            updatedById: bpd.updatedById,
          }
        })
      )
    );

    res.json({ message: 'Snapshot berhasil direstore', restored: bpds.length });
  } catch (error) {
    res.status(500).json({ error: 'Gagal merestore snapshot' });
  }
};

export const exportToCsv = async (req: Request, res: Response) => {
  try {
    const bpds = await prisma.bpd.findMany({
      include: { updatedBy: { select: { username: true } } }
    });
    
    const bpdsWithScores = bpds.map((bpd: any) => {
      const { totalPoints, score, estimatedVotes } = computeBpdScores(bpd);

      return {
        ...bpd,
        totalPoints,
        score,
        estimatedVotes
      };
    });

    // Convert to CSV format
    const csvHeaders = [
      'Province Name', 'Total Votes', 'Target MC', 'Political Affiliation',
      'Support Status', 'Characteristic', 'Supported Candidate', 'Surat Baiat', 
      'Afiliasi Politik', 'Video Dukungan', 'Kedekatan MC', 'Atribut Fisik', 
      'Sosial Media', 'Score (%)', 'Estimated Votes', 'Updated By', 'Updated At'
    ];
    
    const csvRows = bpdsWithScores.map((bpd: any) => [
      bpd.provinceName,
      bpd.totalVotes,
      bpd.targetMc || '',
      bpd.politicalAffiliation || '',
      bpd.supportStatus,
      bpd.characteristic,
      bpd.supportedCandidate?.name || '-',
      bpd.suratBaiat ?? false,
      bpd.afiliasiPolitik ?? false,
      bpd.videoDukungan ?? false,
      bpd.kedekatanMc ?? false,
      bpd.atributFisik ?? false,
      bpd.sosialMedia ?? false,
      bpd.score,
      bpd.estimatedVotes,
      bpd.updatedBy.username,
      bpd.updatedAt.toISOString().split('T')[0]
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map((row: any[]) => row.map((field: any) => `"${field}"`).join(','))
      .join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bpd_export.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export BPDs' });
  }
};
