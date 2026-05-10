import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CHILDREN_DATA = [
  { name: 'أحمد محمد', displayName: 'أحمد', age: 8, avatarId: 'lion', favoriteColor: 'emerald', points: 1250, level: 5, streak: 7, totalPlayTime: 3600 },
  { name: 'فاطمة علي', displayName: 'فاطمة', age: 7, avatarId: 'cat', favoriteColor: 'amber', points: 890, level: 3, streak: 3, totalPlayTime: 2400 },
  { name: 'عمر حسن', displayName: 'عمر', age: 9, avatarId: 'dragon', favoriteColor: 'teal', points: 2100, level: 7, streak: 14, totalPlayTime: 5400 },
  { name: 'نور الدين', displayName: 'نور', age: 6, avatarId: 'unicorn', favoriteColor: 'cyan', points: 450, level: 2, streak: 1, totalPlayTime: 1200 },
  { name: 'ليلى كريم', displayName: 'ليلى', age: 10, avatarId: 'panda', favoriteColor: 'rose', points: 3200, level: 9, streak: 21, totalPlayTime: 7200 },
  { name: 'يوسف إبراهيم', displayName: 'يوسف', age: 8, avatarId: 'fox', favoriteColor: 'orange', points: 980, level: 4, streak: 5, totalPlayTime: 2800 },
  { name: 'مريم أحمد', displayName: 'مريم', age: 7, avatarId: 'rabbit', favoriteColor: 'pink', points: 1500, level: 5, streak: 10, totalPlayTime: 4000 },
  { name: 'خالد سعيد', displayName: 'خالد', age: 11, avatarId: 'tiger', favoriteColor: 'amber', points: 4500, level: 10, streak: 30, totalPlayTime: 9000 },
  { name: 'سارة وليد', displayName: 'سارة', age: 9, avatarId: 'dolphin', favoriteColor: 'teal', points: 1800, level: 6, streak: 8, totalPlayTime: 4600 },
  { name: 'زيد رامي', displayName: 'زيد', age: 6, avatarId: 'owl', favoriteColor: 'emerald', points: 320, level: 1, streak: 0, totalPlayTime: 800 },
  { name: 'هدى سامي', displayName: 'هدى', age: 10, avatarId: 'flower', favoriteColor: 'rose', points: 2800, level: 8, streak: 18, totalPlayTime: 6200 },
  { name: 'آدم طارق', displayName: 'آدم', age: 8, avatarId: 'rocket', favoriteColor: 'cyan', points: 1100, level: 4, streak: 4, totalPlayTime: 3000 },
];

const MASTERY_PATTERNS = [
  [95, 88, 72, 65, 80, 45, 55, 30, 20],
  [98, 95, 90, 85, 92, 78, 82, 60, 50],
  [60, 45, 30, 25, 50, 15, 20, 10, 5],
  [85, 80, 70, 55, 75, 40, 50, 25, 15],
  [99, 97, 95, 93, 96, 90, 88, 85, 82],
  [75, 65, 50, 45, 60, 30, 35, 20, 10],
  [90, 85, 78, 70, 82, 55, 60, 40, 30],
  [100, 98, 96, 95, 97, 94, 92, 90, 88],
  [88, 82, 68, 58, 72, 38, 48, 22, 12],
  [40, 30, 20, 15, 35, 8, 12, 5, 2],
  [96, 92, 88, 83, 90, 75, 80, 65, 55],
  [78, 70, 55, 48, 65, 28, 32, 18, 8],
];

const GAME_TYPES = ['multiple-choice', 'true-false', 'matching', 'fill-blank'];

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.badge.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.tableProgress.deleteMany();
  await prisma.unlockedAvatar.deleteMany();
  await prisma.unlockedBackground.deleteMany();
  await prisma.storyProgress.deleteMany();
  await prisma.dailyChallengeAttempt.deleteMany();
  await prisma.dailyChallenge.deleteMany();
  await prisma.child.deleteMany();
  await prisma.parent.deleteMany();

  const parent = await prisma.parent.create({
    data: { name: 'والد أحمد', email: 'parent@example.com' },
  });

  for (let i = 0; i < CHILDREN_DATA.length; i++) {
    const childData = CHILDREN_DATA[i];
    const masteryPattern = MASTERY_PATTERNS[i];
    const now = new Date();
    const lastActive = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    const child = await prisma.child.create({
      data: {
        name: childData.name,
        displayName: childData.displayName,
        age: childData.age,
        avatarId: childData.avatarId,
        favoriteColor: childData.favoriteColor,
        points: childData.points,
        level: childData.level,
        streak: childData.streak,
        totalPlayTime: childData.totalPlayTime,
        bestCombo: Math.floor(Math.random() * 30) + 5,
        comboCount: Math.floor(Math.random() * 20) + 3,
        stars: Math.floor(childData.points / 40),
        gems: Math.floor(childData.points / 200),
        coins: Math.floor(childData.points / 2),
        lastActiveDate: lastActive.toISOString().split('T')[0],
        parentId: i < 6 ? parent.id : null,
      },
    });

    for (let t = 0; t < 9; t++) {
      const mastery = masteryPattern[t];
      const totalAttempts = Math.floor(mastery * 0.5) + Math.floor(Math.random() * 20);
      const correctAnswers = Math.floor(totalAttempts * (mastery / 100));
      const wrongAnswers = totalAttempts - correctAnswers;
      await prisma.tableProgress.create({
        data: {
          childId: child.id,
          tableNumber: t + 1,
          masteryLevel: mastery,
          correctAnswers,
          wrongAnswers,
          totalAttempts,
          avgSpeed: 2 + Math.random() * 6,
          lastPracticed: new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const sessionCount = 5 + Math.floor(Math.random() * 15);
    for (let s = 0; s < sessionCount; s++) {
      const gameType = GAME_TYPES[Math.floor(Math.random() * GAME_TYPES.length)];
      const tableNumber = Math.floor(Math.random() * 9) + 1;
      const correctCount = Math.floor(Math.random() * 15) + 1;
      const wrongCount = Math.floor(Math.random() * 5);
      const duration = 30 + Math.floor(Math.random() * 300);
      await prisma.gameSession.create({
        data: {
          childId: child.id,
          gameType,
          tableNumber,
          score: correctCount * 10 - wrongCount * 5,
          correctCount,
          wrongCount,
          duration,
          questions: '[]',
          completedAt: new Date(now.getTime() - s * Math.random() * 2 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const eligibleBadges: string[] = ['first-game'];
    if (childData.level >= 2) eligibleBadges.push('explorer');
    if (childData.streak >= 3) eligibleBadges.push('streak-3');
    if (childData.streak >= 7) eligibleBadges.push('streak-7');
    if (childData.streak >= 14) eligibleBadges.push('streak-14');
    if (childData.streak >= 30) eligibleBadges.push('streak-30');
    if (childData.points >= 100) eligibleBadges.push('points-100');
    if (childData.points >= 500) eligibleBadges.push('points-500');
    if (childData.points >= 1000) eligibleBadges.push('points-1000');
    if (childData.points >= 5000) eligibleBadges.push('points-5000');
    for (let t = 0; t < 9; t++) {
      if (masteryPattern[t] >= 80) eligibleBadges.push(`table-master-${t + 1}`);
    }
    for (const badgeType of eligibleBadges) {
      await prisma.badge.create({
        data: {
          childId: child.id,
          badgeType,
          earnedAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
