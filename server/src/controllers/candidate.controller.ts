import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export const getAllCandidates = async (req: Request, res: Response) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        supportedBpds: {
          include: { updatedBy: { select: { username: true } } }
        }
      },
      orderBy: { name: 'asc' }
    });

    const candidatesWithStats = candidates.map(candidate => {
      const { computeBpdScores } = require('../utils/calculations');
      
      const bpdScores = candidate.supportedBpds.map(bpd => computeBpdScores(bpd));
      
      const totalBpdDukung = candidate.supportedBpds.length;
      // Suara Riil: Integer (BPD * 5)
      const totalSuaraRiil = totalBpdDukung * 5;
      // Suara Efektif: Float (Analytical)
      const totalSuaraEfektif = bpdScores.reduce((acc, s) => acc + s.estimatedVotes, 0);
      
      const totalSkorProbabilitas = bpdScores.reduce((acc, s) => acc + s.score, 0);
      const progress = Math.round((totalSuaraEfektif / 96) * 100 * 100) / 100;

      return {
        ...candidate,
        totalBpdDukung,
        totalSuaraRiil,
        totalSuaraEfektif: Math.round(totalSuaraEfektif * 100) / 100,
        totalSkorProbabilitas: Math.round(totalSkorProbabilitas * 100) / 100,
        progress
      };
    });

    res.json(candidatesWithStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

export const getCandidateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        supportedBpds: {
          include: { updatedBy: { select: { username: true } } }
        }
      }
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
};
