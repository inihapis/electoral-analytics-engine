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
        supportedCandidate: { select: { name: true, color: true } }
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
        supportedCandidate: { select: { name: true, color: true } }
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
      totalVotes: data.totalVotes,
      targetMc: data.targetMc,
      politicalAffiliation: data.politicalAffiliation,
      supportStatus: data.supportStatus,
      characteristic: data.characteristic,
      suratBaiat: data.suratBaiat,
      afiliasiPolitik: data.afiliasiPolitik,
      videoDukungan: data.videoDukungan,
      kedekatanMc: data.kedekatanMc,
      atributFisik: data.atributFisik,
      sosialMedia: data.sosialMedia,
      supportedCandidateId: data.supportedCandidateId,
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
        supportedCandidate: { select: { name: true, color: true } }
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
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats summary' });
  }
};

function parseBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  const text = String(value || '').trim().toLowerCase();
  return ['true', '1', 'yes', 'y'].includes(text);
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

export const bulkUpload = async (req: any, res: Response) => {
  const userId = req.user?.id;

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

    for (const row of rows.slice(1)) {
      const record: Record<string, any> = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      const provinceName = String(record['province_name'] || record['province'] || '').trim();
      if (!provinceName) continue;

      const supportStatus = String(record['support_status'] || record['status'] || '').trim().toUpperCase();
      const characteristic = String(record['characteristic'] || record['karakteristik'] || '').trim().toUpperCase();
      if (!validStatuses.includes(supportStatus) || !validCharacteristics.includes(characteristic)) continue;

      const bpdData: any = {
        provinceName,
        totalVotes: Number(record['total_votes'] ?? record['votes'] ?? 5) || 5,
        targetMc: String(record['target_mc'] || record['targetmc'] || record['target'] || '').trim() || null,
        politicalAffiliation: String(record['political_affiliation'] || record['politicalaffiliation'] || record['affiliation'] || '').trim() || null,
        supportStatus,
        characteristic,
        suratBaiat: parseBoolean(record['surat_baiat'] || record['suratbaiat']),
        afiliasiPolitik: parseBoolean(record['afiliasi_politik'] || record['afiliasipolitik']),
        videoDukungan: parseBoolean(record['video_dukung'] || record['videodukungan'] || record['video_dukungan']),
        kedekatanMc: parseBoolean(record['kedekatan_mc'] || record['kedekatanmc'] || record['kedekatan']),
        atributFisik: parseBoolean(record['atribut_fisik'] || record['atributfisik'] || record['atribut_fisik']),
        sosialMedia: parseBoolean(record['sosial_media'] || record['sosialmedia'] || record['sosial_media']),
      };

      await prisma.bpd.upsert({
        where: { provinceName },
        update: { ...bpdData, updatedById: userId },
        create: { ...bpdData, updatedById: userId }
      });
      uploadResult.push(provinceName);
    }

    res.json({ message: 'Upload berhasil', count: uploadResult.length, processed: uploadResult });
  } catch (error) {
    res.status(500).json({ error: 'Gagal upload BPDs' });
  }
};

export const saveSnapshot = async (req: any, res: Response) => {
  try {
    const bpds = await prisma.bpd.findMany({
      include: {
        updatedBy: { select: { id: true, username: true } },
        indicators: { include: { candidate: true } }
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
      'Support Status', 'Characteristic', 'Surat Baiat', 'Afiliasi Politik',
      'Video Dukungan', 'Kedekatan MC', 'Atribut Fisik', 'Sosial Media',
      'Score (%)', 'Estimated Votes', 'Updated By', 'Updated At'
    ];
    
    const csvRows = bpdsWithScores.map((bpd: any) => [
      bpd.provinceName,
      bpd.totalVotes,
      bpd.targetMc || '',
      bpd.politicalAffiliation || '',
      bpd.supportStatus,
      bpd.characteristic,
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
