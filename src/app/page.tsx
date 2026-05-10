'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { useGameStore } from '@/stores/game-store';
import { generateQuestions } from '@/lib/game-engine/question-generator';
import { getRecommendedTable } from '@/lib/game-engine/adaptive-engine';
import { AVATARS, BADGE_DEFINITIONS } from '@/lib/game-engine/constants';
import type { AppView, ChildProfile, TableProgressData, GameConfig, Question } from '@/types';

// Components
import LandingPage from '@/components/landing/LandingPage';
import LoginPage from '@/components/profile/LoginPage';
import ProfileSetup from '@/components/profile/ProfileSetup';
import ChildSelector from '@/components/profile/ChildSelector';
import ChildDashboard from '@/components/dashboard/ChildDashboard';
import GameSelector from '@/components/games/GameSelector';
import MultipleChoiceGame from '@/components/games/MultipleChoiceGame';
import TrueFalseGame from '@/components/games/TrueFalseGame';
import MatchingGame from '@/components/games/MatchingGame';
import FillBlankGame from '@/components/games/FillBlankGame';
import GameResults from '@/components/games/GameResults';
import ProgressMap from '@/components/world/ProgressMap';
import AchievementsPage from '@/components/achievements/AchievementsPage';
import DailyChallenge from '@/components/challenges/DailyChallenge';
import StoryMode from '@/components/story/StoryMode';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ParentDashboard from '@/components/parent/ParentDashboard';
import SettingsPage from '@/components/settings/SettingsPage';
import AICoach from '@/components/shared/AICoach';
import SoundToggle from '@/components/shared/SoundToggle';
import LeaderboardPage from '@/components/leaderboard/LeaderboardPage';
import ShopPage from '@/components/shop/ShopPage';
import PracticeMode from '@/components/practice/PracticeMode';
import SpeedTestPage from '@/components/speedtest/SpeedTestPage';

const AVATAR_MAP: Record<string, string> = {
  lion: '🦁', cat: '🐱', bear: '🐻', rabbit: '🐰', elephant: '🐘',
  tiger: '🐯', dog: '🐶', owl: '🦉', monkey: '🐵', panda: '🐼',
  frog: '🐸', penguin: '🐧', fox: '🦊', unicorn: '🦄', dragon: '🐉',
  'star-face': '🤩', 'cool-face': '😎', 'heart-face': '😍', 'party-face': '🥳', 'nerd-face': '🤓',
  apple: '🍎', strawberry: '🍓', watermelon: '🍉', banana: '🍌',
  rocket: '🚀', crown: '👑', gem: '💎', trophy: '🏆', rainbow: '🌈', balloon: '🎈',
};

// Views that require authentication
const AUTH_REQUIRED_VIEWS: AppView[] = [
  'dashboard',
  'game-select',
  'game-play',
  'game-results',
  'world-map',
  'achievements',
  'daily-challenge',
  'story-mode',
  'settings',
  'leaderboard',
  'shop',
  'practice',
  'speed-test',
];

export default function Home() {
  const {
    currentView,
    selectedChild,
    selectedTable,
    selectedGameType,
    isAuthenticated,
    navigate,
    setSelectedChild,
    setSelectedTable,
    setSelectedGameType,
    setAdminMode,
    setParentMode,
    authenticate,
    logout,
    soundEnabled,
    musicEnabled,
    toggleSound,
    toggleMusic,
  } = useAppStore();

  const { resetGame } = useGameStore();

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [tableProgress, setTableProgress] = useState<TableProgressData[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Array<{ badgeType: string; earnedAt: string }>>([]);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [gameResult, setGameResult] = useState<any>(null);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coachMessage, setCoachMessage] = useState<{ show: boolean; type: 'encouragement' | 'hint' | 'celebration' | 'comfort' | 'guidance' }>({
    show: false,
    type: 'encouragement',
  });

  // Handler for updating child profile from settings
  const handleUpdateProfile = async (updates: Partial<{ displayName: string; avatarId: string; favoriteColor: string }>) => {
    if (!selectedChild) return;
    try {
      const res = await fetch(`/api/children/${selectedChild.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChild(data.data);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Fetch children list
  const fetchChildren = useCallback(async () => {
    try {
      const res = await fetch('/api/children');
      const data = await res.json();
      if (data.success) {
        setChildren(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch children:', error);
    }
  }, []);

  // Fetch child data (progress, badges, etc.)
  const fetchChildData = useCallback(async (childId: string) => {
    setIsLoading(true);
    try {
      const [progressRes, badgesRes] = await Promise.all([
        fetch(`/api/progress?childId=${childId}`),
        fetch(`/api/badges?childId=${childId}`),
      ]);
      
      const progressData = await progressRes.json();
      const badgesData = await badgesRes.json();
      
      if (progressData.success) setTableProgress(progressData.data);
      if (badgesData.success) setEarnedBadges(badgesData.data);
    } catch (error) {
      console.error('Failed to fetch child data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create child profile
  const handleCreateChild = async (profile: {
    name: string;
    displayName: string;
    age: number;
    avatarId: string;
    favoriteColor: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        const child = data.data;
        setSelectedChild(child);
        authenticate(child.id);
        await fetchChildData(child.id);
        navigate('dashboard');
        showCoach('celebration');
      }
    } catch (error) {
      console.error('Failed to create child:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Select existing child (from LoginPage)
  const handleSelectChild = async (childId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/children/${childId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedChild(data.data.child);
        authenticate(childId);
        await fetchChildData(childId);
        navigate('dashboard');
      }
    } catch (error) {
      console.error('Failed to select child:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle shop purchase
  const handleShopPurchase = async (itemType: string, itemId: string, cost: number, currency: 'coins' | 'gems') => {
    if (!selectedChild) return;

    try {
      const updates: Record<string, number> = {};
      if (currency === 'coins') {
        updates.coins = Math.max(0, selectedChild.coins - cost);
      } else {
        updates.gems = Math.max(0, selectedChild.gems - cost);
      }

      const res = await fetch(`/api/children/${selectedChild.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChild(data.data);
      }
    } catch (error) {
      console.error('Failed to process purchase:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setTableProgress([]);
    setEarnedBadges([]);
    setGameQuestions([]);
    setGameResult(null);
    setGameConfig(null);
  };

  // Save game session
  const saveGameSession = async (result: any) => {
    if (!selectedChild || !gameConfig) return;
    
    try {
      // Save game session
      await fetch('/api/game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: selectedChild.id,
          gameType: gameConfig.gameType,
          tableNumber: gameConfig.tableNumber === 'mixed' ? 0 : gameConfig.tableNumber,
          score: result.score,
          correctCount: result.correctCount,
          wrongCount: result.wrongCount,
          duration: result.duration,
          bestCombo: result.bestCombo,
        }),
      });

      // Update progress for affected tables
      const tables = gameConfig.tableNumber === 'mixed' 
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9] 
        : [gameConfig.tableNumber];
      
      // Note: For 'mixed' table mode, dividing correct/wrong counts equally across all tables
      // is an approximation. This distributes fractional counts using Math.round.
      for (const t of tables) {
        await fetch('/api/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            childId: selectedChild.id,
            tableNumber: t,
            correct: Math.round(result.correctCount / tables.length),
            wrong: Math.round(result.wrongCount / tables.length),
            speed: result.duration > 0 ? (result.duration * 1000) / (result.correctCount + result.wrongCount) : 0,
          }),
        });
      }

      // Refresh child data first so badges check uses up-to-date progress
      await fetchChildData(selectedChild.id);

      // Check for badges (after data refresh so progress is current)
      await checkAndAwardBadges(result);
      
      // Refresh child profile
      const childRes = await fetch(`/api/children/${selectedChild.id}`);
      const childData = await childRes.json();
      if (childData.success) {
        setSelectedChild(childData.data.child);
      }
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  };

  // Check and award badges
  const checkAndAwardBadges = async (result: any) => {
    if (!selectedChild) return;
    
    const badgesToCheck: string[] = [];
    
    // First game badge
    if (result.correctCount + result.wrongCount > 0) {
      badgesToCheck.push('first-game');
    }
    
    // Perfect game
    if (result.wrongCount === 0 && result.correctCount > 0) {
      badgesToCheck.push('perfect-game');
    }
    
    // Combo badges
    if (result.bestCombo >= 5) badgesToCheck.push('combo-5');
    if (result.bestCombo >= 10) badgesToCheck.push('combo-10');
    if (result.bestCombo >= 25) badgesToCheck.push('combo-25');
    if (result.bestCombo >= 50) badgesToCheck.push('combo-50');
    
    // Points badges
    const newPoints = (selectedChild.points || 0) + (result.pointsEarned || 0);
    if (newPoints >= 100) badgesToCheck.push('points-100');
    if (newPoints >= 500) badgesToCheck.push('points-500');
    if (newPoints >= 1000) badgesToCheck.push('points-1000');
    if (newPoints >= 5000) badgesToCheck.push('points-5000');

    // Table mastery badges
    for (const prog of tableProgress) {
      if (prog.masteryLevel >= 0.8) {
        badgesToCheck.push(`table-master-${prog.tableNumber}`);
      }
    }

    for (const badgeType of badgesToCheck) {
      try {
        await fetch('/api/badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ childId: selectedChild.id, badgeType }),
        });
      } catch (error) {
        console.error('Failed to award badge:', error);
      }
    }
  };

  // Start a game
  const handleStartGame = (gameType: string, tableNum: number | 'mixed', difficulty: 'easy' | 'medium' | 'hard') => {
    const config: GameConfig = {
      gameType: gameType as any,
      tableNumber: tableNum,
      questionCount: gameType === 'matching' ? 5 : difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12,
      difficulty,
    };
    
    setGameConfig(config);
    setSelectedTable(tableNum);
    setSelectedGameType(gameType as any);
    
    const questions = generateQuestions(config);
    setGameQuestions(questions);
    
    navigate('game-play');
  };

  // Handle game completion
  const handleGameComplete = (result: any) => {
    // Calculate rewards based on game results
    const accuracy = result.correctCount + result.wrongCount > 0
      ? result.correctCount / (result.correctCount + result.wrongCount)
      : 0;

    const pointsEarned = result.score || 0;
    const starsEarned = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.4 ? 1 : 0;
    const coinsEarned = Math.round(result.correctCount * 5 + (result.bestCombo || 0) * 2);
    const gemsEarned = accuracy === 1 ? 3 : accuracy >= 0.8 ? 1 : 0;

    const enrichedResult = {
      ...result,
      pointsEarned,
      starsEarned,
      coinsEarned,
      gemsEarned,
    };

    setGameResult(enrichedResult);
    saveGameSession(enrichedResult);
    navigate('game-results');
    if (starsEarned === 3) {
      showCoach('celebration');
    }
  };

  // Play again
  const handlePlayAgain = () => {
    if (gameConfig) {
      const questions = generateQuestions(gameConfig);
      setGameQuestions(questions);
      resetGame();
      navigate('game-play');
    }
  };

  // Show AI coach message
  const showCoach = (type: 'encouragement' | 'hint' | 'celebration' | 'comfort' | 'guidance') => {
    setCoachMessage({ show: true, type });
  };

  // Initial data fetch
  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // Refresh data when navigating to dashboard
  useEffect(() => {
    if (currentView === 'dashboard' && selectedChild) {
      fetchChildData(selectedChild.id);
    }
  }, [currentView, selectedChild, fetchChildData]);

  // Authentication guard: redirect to landing if not authenticated for protected views
  useEffect(() => {
    if (AUTH_REQUIRED_VIEWS.includes(currentView) && !isAuthenticated) {
      navigate('landing');
    }
  }, [currentView, isAuthenticated, navigate]);

  // Get recommended table
  const recommendedTable = tableProgress.length > 0 ? getRecommendedTable(tableProgress) : 1;

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage
            onStart={() => {
              // Always go to login page first
              navigate('login');
            }}
            onAdmin={() => {
              setAdminMode(true);
              navigate('admin');
            }}
            onParent={() => {
              setParentMode(true);
              navigate('parent');
            }}
          />
        );

      case 'login':
        return (
          <LoginPage
            childList={children.map(c => ({
              id: c.id,
              name: c.name,
              displayName: c.displayName,
              avatarId: c.avatarId,
              level: c.level,
              points: c.points,
            }))}
            onSelectChild={handleSelectChild}
            onNewChild={() => navigate('profile-setup')}
            onBack={() => navigate('landing')}
          />
        );

      case 'child-select':
        return (
          <ChildSelector
            childProfiles={children}
            onSelect={handleSelectChild}
            onNewChild={() => navigate('profile-setup')}
            onBack={() => navigate('login')}
          />
        );

      case 'profile-setup':
        return (
          <ProfileSetup
            onComplete={handleCreateChild}
            onBack={() => {
              if (children.length > 0) {
                navigate('login');
              } else {
                navigate('landing');
              }
            }}
          />
        );

      case 'dashboard':
        return selectedChild && isAuthenticated ? (
          <ChildDashboard
            child={selectedChild}
            tableProgress={tableProgress}
            earnedBadges={earnedBadges}
            onStartGame={() => navigate('game-select')}
            onDailyChallenge={() => navigate('daily-challenge')}
            onAchievements={() => navigate('achievements')}
            onWorldMap={() => navigate('world-map')}
            onStoryMode={() => navigate('story-mode')}
            onProfile={() => navigate('profile-setup')}
            onSettings={() => navigate('settings')}
            onLeaderboard={() => navigate('leaderboard')}
            onShop={() => navigate('shop')}
            onPractice={() => navigate('practice')}
            onSpeedTest={() => navigate('speed-test')}
            onBack={() => {
              handleLogout();
            }}
          />
        ) : null;

      case 'game-select':
        return isAuthenticated ? (
          <GameSelector
            onSelectGame={handleStartGame}
            onBack={() => navigate('dashboard')}
            recommendedTable={recommendedTable}
          />
        ) : null;

      case 'game-play':
        if (gameQuestions.length === 0 || !isAuthenticated) return null;
        
        switch (selectedGameType) {
          case 'multiple-choice':
            return (
              <MultipleChoiceGame
                questions={gameQuestions}
                onComplete={handleGameComplete}
                onBack={() => navigate('game-select')}
              />
            );
          case 'true-false':
            return (
              <TrueFalseGame
                questions={gameQuestions}
                onComplete={handleGameComplete}
                onBack={() => navigate('game-select')}
              />
            );
          case 'matching':
            return (
              <MatchingGame
                questions={gameQuestions}
                onComplete={handleGameComplete}
                onBack={() => navigate('game-select')}
              />
            );
          case 'fill-blank':
            return (
              <FillBlankGame
                questions={gameQuestions}
                onComplete={handleGameComplete}
                onBack={() => navigate('game-select')}
              />
            );
          default:
            return null;
        }

      case 'game-results':
        return gameResult && isAuthenticated ? (
          <GameResults
            result={gameResult}
            onPlayAgain={handlePlayAgain}
            onDashboard={() => navigate('dashboard')}
          />
        ) : null;

      case 'world-map':
        return isAuthenticated ? (
          <ProgressMap
            tableProgress={tableProgress}
            onSelectTable={(tableNumber) => {
              setSelectedTable(tableNumber);
              navigate('game-select');
            }}
            onBack={() => navigate('dashboard')}
          />
        ) : null;

      case 'achievements':
        return isAuthenticated ? (
          <AchievementsPage
            earnedBadges={earnedBadges}
            onBack={() => navigate('dashboard')}
          />
        ) : null;

      case 'daily-challenge':
        return isAuthenticated ? (
          <DailyChallenge
            streak={selectedChild?.streak || 0}
            lastActiveDate={selectedChild?.lastActiveDate || null}
            onStartChallenge={(tables, difficulty) => {
              handleStartGame('multiple-choice', 'mixed', difficulty);
            }}
            onBack={() => navigate('dashboard')}
          />
        ) : null;

      case 'story-mode':
        return isAuthenticated ? (
          <StoryMode
            tableProgress={tableProgress}
            onSelectChapter={(tableNumber) => {
              setSelectedTable(tableNumber);
              handleStartGame('multiple-choice', tableNumber, 'easy');
            }}
            onBack={() => navigate('dashboard')}
          />
        ) : null;

      case 'settings':
        return selectedChild && isAuthenticated ? (
          <SettingsPage
            child={selectedChild}
            onBack={() => navigate('dashboard')}
            onUpdateProfile={handleUpdateProfile}
            soundEnabled={soundEnabled}
            musicEnabled={musicEnabled}
            toggleSound={toggleSound}
            toggleMusic={toggleMusic}
          />
        ) : null;

      case 'leaderboard':
        return selectedChild && isAuthenticated ? (
          <LeaderboardPage
            currentChild={{
              id: selectedChild.id,
              name: selectedChild.name,
              displayName: selectedChild.displayName,
              avatarId: selectedChild.avatarId,
              points: selectedChild.points,
              level: selectedChild.level,
            }}
            onBack={() => navigate('dashboard')}
          />
        ) : null;

      case 'shop':
        return selectedChild && isAuthenticated ? (
          <ShopPage
            currentChild={{
              id: selectedChild.id,
              name: selectedChild.name,
              displayName: selectedChild.displayName,
              avatarId: selectedChild.avatarId,
              coins: selectedChild.coins,
              gems: selectedChild.gems,
              points: selectedChild.points,
              level: selectedChild.level,
            }}
            onBack={() => navigate('dashboard')}
            onPurchase={handleShopPurchase}
          />
        ) : null;

      case 'practice':
        return selectedChild && isAuthenticated ? (
          <PracticeMode
            currentChild={{
              id: selectedChild.id,
              name: selectedChild.name,
              displayName: selectedChild.displayName,
              avatarId: selectedChild.avatarId,
              points: selectedChild.points,
              level: selectedChild.level,
            }}
            tableProgress={tableProgress}
            onBack={() => navigate('dashboard')}
            onStartGame={(gameType, tableNumber, difficulty) => {
              handleStartGame(gameType, tableNumber, difficulty);
            }}
          />
        ) : null;

      case 'speed-test':
        return isAuthenticated ? (
          <SpeedTestPage
            onBack={() => navigate('dashboard')}
            onComplete={(result) => {
              // Save the speed test result as a game session
              const enrichedResult = {
                ...result,
                pointsEarned: result.score,
                starsEarned: 0,
                coinsEarned: Math.round(result.correctCount * 3),
                gemsEarned: 0,
              };
              setGameResult(enrichedResult);
              // Set a game config for the speed test so saveGameSession works
              const speedTestConfig: GameConfig = {
                gameType: 'multiple-choice' as any,
                tableNumber: 'mixed',
                questionCount: result.correctCount + result.wrongCount,
                difficulty: 'medium',
              };
              setGameConfig(speedTestConfig);
              // Save to database if child is selected
              if (selectedChild) {
                // Need to set config first then save on next tick
                setTimeout(() => saveGameSession(enrichedResult), 0);
              }
              navigate('game-results');
            }}
          />
        ) : null;

      case 'admin':
        return (
          <AdminDashboard
            onBack={() => {
              setAdminMode(false);
              navigate('landing');
            }}
          />
        );

      case 'parent':
        return selectedChild ? (
          <ParentDashboard
            childId={selectedChild.id}
            onBack={() => {
              setParentMode(false);
              navigate('landing');
            }}
          />
        ) : (
          <ParentDashboard
            childId=""
            onBack={() => {
              setParentMode(false);
              navigate('landing');
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen">
      <SoundToggle />
      <motion.div
        key={currentView}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderView()}
      </motion.div>
      <AICoach
        type={coachMessage.type}
        show={coachMessage.show}
        onHide={() => setCoachMessage(prev => ({ ...prev, show: false }))}
      />
    </main>
  );
}
