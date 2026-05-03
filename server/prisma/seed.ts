import { PrismaClient, CandidateColor } from '@prisma/client';
import bcrypt from 'bcrypt';
import { computeBpdScores } from '../src/utils/calculations';

const prisma = new PrismaClient();

const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
  "Jambi", "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung",
  "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta",
  "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
  "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Tengah", "Papua Pegunungan", "Papua Selatan", "Papua Barat Daya"
];

const CANDIDATES = [
  { name: 'Reynaldo Bryan', color: CandidateColor.BLUE, affiliation: 'Nasdem' },
  { name: 'Ade Jona', color: CandidateColor.RED, affiliation: 'Gerindra' },
  { name: 'Afie Kalla', color: CandidateColor.YELLOW, affiliation: 'Golkar' },
  { name: 'Anthony Leong', color: CandidateColor.GREEN, affiliation: 'Gerindra' },
];

async function main() {
  // Create Superadmin with hashed password
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  
  const superadmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
  });

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create regular User
  const regularUser = await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: {
      username: 'user',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('Users created/verified');

  // Create 4 Candidates
  const candidates = [];
  for (const candidateData of CANDIDATES) {
    const candidate = await prisma.candidate.upsert({
      where: { name: candidateData.name },
      update: {},
      create: {
        name: candidateData.name,
        color: candidateData.color,
        affiliation: candidateData.affiliation,
      },
    });
    candidates.push(candidate);
  }
  console.log('4 Candidates created/verified');

  // Create 38 BPDs with realistic data
  for (let i = 0; i < PROVINCES.length; i++) {
    const province = PROVINCES[i];
    
    // Create realistic variations
    const statuses = ['TERKUNCI', 'MENGARAH', 'DINAMIS'];
    const characteristics = ['SOLID', 'RENTAN', 'WASPADA'];
    
    // Weighted random selection (more likely to be DINAMIS/WASPADA)
    const randomStatus = Math.random() < 0.3 ? statuses[Math.floor(Math.random() * 2)] : 'DINAMIS';
    const randomCharacteristic = Math.random() < 0.4 ? characteristics[Math.floor(Math.random() * 2)] : 'WASPADA';
    
    // Assign a candidate to the BPD
    const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
    
    const bpd = await prisma.bpd.upsert({
      where: { provinceName: province },
      update: {},
      create: {
        provinceName: province,
        totalVotes: 5,
        targetMc: `MC Target ${province}`,
        politicalAffiliation: `Partai Koalisi ${Math.floor(Math.random() * 3) + 1}`,
        supportStatus: randomStatus as any,
        characteristic: randomCharacteristic as any,
        suratBaiat: Math.random() > 0.5,
        afiliasiPolitik: Math.random() > 0.5,
        videoDukungan: Math.random() > 0.5,
        kedekatanMc: Math.random() > 0.5,
        atributFisik: Math.random() > 0.5,
        sosialMedia: Math.random() > 0.5,
        updatedById: superadmin.id,
        supportedCandidateId: randomCandidate.id,
      },
    });

    // Create candidate indicators for each candidate
    for (const candidate of candidates) {
      // Create realistic candidate indicators based on candidate strength and province status
      const candidateStrength = Math.random();
      const isStrong = candidateStrength > 0.5;
      
      // Base indicators on province status
      const baseIndicators = {
        suratBaiat: Math.random() > 0.5, // Increased probability
        afiliasiPolitik: Math.random() > 0.4, // Increased probability
        videoDukungan: Math.random() > 0.6, // Increased probability
        kedekatanMc: Math.random() > 0.3, // Increased probability
        atributFisik: Math.random() > 0.3,
        sosialMedia: Math.random() > 0.4,
      };

      const { totalPoints, score, estimatedVotes } = computeBpdScores(baseIndicators);

      await prisma.candidateIndicator.upsert({
        where: {
          bpdId_candidateId: {
            bpdId: bpd.id,
            candidateId: candidate.id,
          },
        },
        update: {
          suratBaiat: baseIndicators.suratBaiat,
          afiliasiPolitik: baseIndicators.afiliasiPolitik,
          videoDukungan: baseIndicators.videoDukungan,
          kedekatanMc: baseIndicators.kedekatanMc,
          atributFisik: baseIndicators.atributFisik,
          sosialMedia: baseIndicators.sosialMedia,
          totalPoints,
          score,
          estimatedVotes,
        },
        create: {
          bpdId: bpd.id,
          candidateId: candidate.id,
          suratBaiat: baseIndicators.suratBaiat,
          afiliasiPolitik: baseIndicators.afiliasiPolitik,
          videoDukungan: baseIndicators.videoDukungan,
          kedekatanMc: baseIndicators.kedekatanMc,
          atributFisik: baseIndicators.atributFisik,
          sosialMedia: baseIndicators.sosialMedia,
          totalPoints,
          score,
          estimatedVotes,
        },
      });
    }
  }

  console.log(`38 BPD entries with candidate indicators created/verified`);
  console.log('Seed completed - All calculated values will be computed in real-time by backend');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
