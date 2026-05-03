import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateCandidateStats } from '../utils/calculations';

const prisma = new PrismaClient();

export const getAllCandidates = async (req: Request, res: Response) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        indicators: {
          include: {
            bpd: {
              include: { updatedBy: { select: { username: true } } }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Calculate real-time stats for each candidate
    const candidatesWithStats = candidates.map(candidate => {
      const stats = calculateCandidateStats([{
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateColor: candidate.color,
        candidateAffiliation: candidate.affiliation ?? undefined,
        indicators: candidate.indicators.map(ind => ({
          estimatedVotes: ind.estimatedVotes,
          score: ind.score,
          totalPoints: ind.totalPoints
        }))
      }])[0];

      return {
        ...candidate,
        ...stats
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
        indicators: {
          include: {
            bpd: {
              include: { updatedBy: { select: { username: true } } }
            }
          }
        }
      }
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
};

export const updateCandidateIndicator = async (req: Request, res: Response) => {
  const { bpdId, candidateId } = req.params;
  const data = req.body;
  const userId = (req as any).user?.id;
  
  try {
    // Recalculate scores
    const { computeBpdScores } = await import('../utils/calculations');
    const { totalPoints, score, estimatedVotes } = computeBpdScores(data);

    const indicator = await prisma.candidateIndicator.upsert({
      where: {
        bpdId_candidateId: { bpdId, candidateId }
      },
      update: {
        ...data,
        totalPoints,
        score,
        estimatedVotes,
      },
      create: {
        bpdId,
        candidateId,
        ...data,
        totalPoints,
        score,
        estimatedVotes,
      },
      include: {
        candidate: true
      }
    });

    res.json(indicator);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update candidate indicator' });
  }
};
