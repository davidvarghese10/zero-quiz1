import { useState, useEffect } from 'react';
import { Team, Question, ScoreHistoryEntry } from './types';
import { defaultQuestions } from './questionsData';
import SetupScreen from './components/SetupScreen';
import Leaderboard from './components/Leaderboard';
import QuestionGrid from './components/QuestionGrid';
import QuestionModal from './components/QuestionModal';
import AdminPanel from './components/AdminPanel';
import GlassLensCursor from './components/GlassLensCursor';
import { Tv, Shield, Trophy, LayoutGrid, RotateCcw, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'zero_points_quiz_state_v1';

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [activeTeamIndex, setActiveTeamIndex] = useState<number>(0);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'board' | 'standings' | 'admin'>('board');
  const [projectorMode, setProjectorMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize and load state from localStorage
  useEffect(() => {
    try {
      const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedState) {
        const parsed = JSON.parse(storedState);
        if (parsed.teams && parsed.teams.length > 0) {
          setTeams(parsed.teams);
          setQuestions(parsed.questions || defaultQuestions);
          setActiveTeamIndex(parsed.activeTeamIndex ?? 0);
          setQuizStarted(parsed.quizStarted ?? false);
          setActiveTab(parsed.activeTab ?? 'board');
          setProjectorMode(parsed.projectorMode ?? false);
        }
      }
    } catch (e) {
      console.error('Failed to load state from local storage:', e);
    }
  }, []);

  // Save state to localStorage on any state changes
  useEffect(() => {
    if (quizStarted && teams.length > 0) {
      const stateToStore = {
        teams,
        questions,
        activeTeamIndex,
        quizStarted,
        activeTab,
        projectorMode,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToStore));
    }
  }, [teams, questions, activeTeamIndex, quizStarted, activeTab, projectorMode]);

  // Audio trigger helper (using simple web synthesizer for fully custom, high-fidelity sound effects)
  const playSound = (type: 'correct' | 'incorrect' | 'reveal' | 'pass') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'correct') {
        // High upbeat beep-beep
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } else if (type === 'incorrect') {
        // Low buzzing sliding frequency down
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'reveal') {
        // Futuristic chord pad
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.55);
      } else if (type === 'pass') {
        // Double tone sweep up
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (err) {
      console.warn('Audio context was prevented from starting or is not supported:', err);
    }
  };

  // --- ACTIONS ---

  const handleStartQuiz = (registeredTeams: Team[]) => {
    setTeams(registeredTeams);
    setQuestions(defaultQuestions);
    setActiveTeamIndex(0);
    setQuizStarted(true);
    setActiveTab('board');
  };

  const handleSelectQuestion = (question: Question) => {
    playSound('reveal');
    setCurrentQuestionId(question.id);
  };

  // Turn advance helper
  const advanceTurn = (currentTeams: Team[]) => {
    if (currentTeams.length === 0) return;
    setActiveTeamIndex((prev) => (prev + 1) % currentTeams.length);
  };

  // Correct answer callback
  const handleAnswerCorrect = (question: Question, teamId: string) => {
    playSound('correct');
    const timestamp = new Date().toLocaleTimeString();

    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        const newScore = team.score - question.points;
        const entry: ScoreHistoryEntry = {
          id: `hist-${Date.now()}`,
          timestamp,
          action: 'correct',
          points: question.points,
          newScore,
          description: `Solved ${question.category} (${question.points} pts) correctly!`,
        };
        return {
          ...team,
          score: newScore,
          history: [...team.history, entry],
        };
      }
      return team;
    });

    const updatedQuestions = questions.map((q) => {
      if (q.id === question.id) {
        return { ...q, isCompleted: true, solvedByTeamId: teamId };
      }
      return q;
    });

    setTeams(updatedTeams);
    setQuestions(updatedQuestions);
    advanceTurn(updatedTeams);
  };

  // Incorrect answer callback
  const handleAnswerIncorrect = (question: Question, teamId: string) => {
    playSound('incorrect');
    const timestamp = new Date().toLocaleTimeString();

    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        const newScore = team.score + question.points;
        const entry: ScoreHistoryEntry = {
          id: `hist-${Date.now()}`,
          timestamp,
          action: 'incorrect',
          points: question.points,
          newScore,
          description: `Answered ${question.category} (${question.points} pts) incorrectly.`,
        };
        return {
          ...team,
          score: newScore,
          history: [...team.history, entry],
        };
      }
      return team;
    });

    setTeams(updatedTeams);
  };

  // Pass Correct answer callback
  const handlePassCorrect = (question: Question, teamId: string) => {
    playSound('correct');
    const timestamp = new Date().toLocaleTimeString();

    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        const newScore = team.score - question.points;
        const entry: ScoreHistoryEntry = {
          id: `hist-${Date.now()}`,
          timestamp,
          action: 'pass_correct',
          points: question.points,
          newScore,
          description: `Answered passed question: ${question.category} (${question.points} pts) correctly!`,
        };
        return {
          ...team,
          score: newScore,
          history: [...team.history, entry],
        };
      }
      return team;
    });

    const updatedQuestions = questions.map((q) => {
      if (q.id === question.id) {
        return { ...q, isCompleted: true, solvedByTeamId: teamId };
      }
      return q;
    });

    setTeams(updatedTeams);
    setQuestions(updatedQuestions);
    advanceTurn(updatedTeams);
  };

  // Pass Incorrect answer callback
  const handlePassIncorrect = (question: Question, teamId: string) => {
    playSound('incorrect');
    const timestamp = new Date().toLocaleTimeString();

    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        const newScore = team.score + question.points;
        const entry: ScoreHistoryEntry = {
          id: `hist-${Date.now()}`,
          timestamp,
          action: 'pass_incorrect',
          points: question.points,
          newScore,
          description: `Incorrect on passed question: ${question.category} (${question.points} pts).`,
        };
        return {
          ...team,
          score: newScore,
          history: [...team.history, entry],
        };
      }
      return team;
    });

    setTeams(updatedTeams);
  };

  // Skip question
  const handleSkipQuestion = (question: Question) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === question.id) {
        return { ...q, isCompleted: true, solvedByTeamId: null };
      }
      return q;
    });

    setQuestions(updatedQuestions);
    advanceTurn(teams);
  };

  // --- OVERRIDES (From Coordinator Panel) ---

  const handleAddTeamMidGame = (name: string, members: string[]) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      members,
      score: 1000,
      history: [
        {
          id: `hist-init-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'reset',
          points: 1000,
          newScore: 1000,
          description: 'Team added mid-game by event coordinator.',
        },
      ],
    };
    setTeams([...teams, newTeam]);
  };

  const handleRemoveTeamMidGame = (teamId: string) => {
    const updatedTeams = teams.filter((t) => t.id !== teamId);
    setTeams(updatedTeams);

    // Adjust active team index if out of bounds
    if (activeTeamIndex >= updatedTeams.length) {
      setActiveTeamIndex(0);
    }
  };

  const handleAdjustScoreOverride = (teamId: string, delta: number, description: string) => {
    const timestamp = new Date().toLocaleTimeString();

    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        const newScore = team.score + delta;
        const entry: ScoreHistoryEntry = {
          id: `hist-adj-${Date.now()}`,
          timestamp,
          action: delta < 0 ? 'override_subtract' : 'override_add',
          points: Math.abs(delta),
          newScore,
          description,
        };
        return {
          ...team,
          score: newScore,
          history: [...team.history, entry],
        };
      }
      return team;
    });

    setTeams(updatedTeams);
  };

  const handleUpdateQuestionText = (questionId: string, questionText: string, answerText: string) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, questionText, answerText };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleResetGame = (hardReset: boolean) => {
    if (hardReset) {
      setTeams([]);
      setQuestions(defaultQuestions);
      setActiveTeamIndex(0);
      setQuizStarted(false);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      // Soft Reset: keep teams, reset scores to 1000, clear board
      const updatedTeams = teams.map((t) => ({
        ...t,
        score: 1000,
        history: [
          {
            id: `hist-reset-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            action: 'reset' as const,
            points: 1000,
            newScore: 1000,
            description: 'Game soft-reset. All scores restored to 1000.',
          },
        ],
      }));

      // Reset questions completed status
      const resetQuestions = questions.map((q) => ({
        ...q,
        isCompleted: false,
        solvedByTeamId: null,
      }));

      setTeams(updatedTeams);
      setQuestions(resetQuestions);
      setActiveTeamIndex(0);
      setActiveTab('board');
    }
  };

  // --- RENDER ---

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-center relative overflow-hidden">
        <GlassLensCursor />
        <SetupScreen onStartQuiz={handleStartQuiz} />
      </div>
    );
  }

  const selectedQuestionObj = questions.find((q) => q.id === currentQuestionId);

  return (
    <div className={`min-h-screen bg-[#0f172a] text-slate-100 flex flex-col relative overflow-hidden ${projectorMode ? 'p-0 overflow-hidden' : ''}`} id="app-root">
      <GlassLensCursor />
      {/* Top Navigation / Status Header */}
      {!projectorMode && (
        <header className="glass border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-40" id="host-header">
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="bg-sky-400 text-slate-950 p-2 rounded-xl font-black text-sm shadow-md shadow-sky-950/20">
              0P
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white font-display">
                '0' Points Quiz Event Dashboard
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Live monitoring console & scoreboard
              </p>
            </div>
          </div>

          {/* Controls & Nav */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Tab Selection */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center" id="nav-tabs">
              <button
                onClick={() => setActiveTab('board')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'board'
                    ? 'bg-sky-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="tab-btn-board"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Quiz Board</span>
              </button>
              <button
                onClick={() => setActiveTab('standings')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'standings'
                    ? 'bg-sky-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="tab-btn-standings"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Live Standings</span>
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-sky-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="tab-btn-admin"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Coordinator Overrides</span>
              </button>
            </div>

            {/* Utility Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/50"
                title={soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
                id="btn-toggle-sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              </button>
              <button
                onClick={() => setProjectorMode(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 hover:translate-y-[-1px] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-950/30 border border-indigo-500/20"
                title="Enter clean view for projector casting"
                id="btn-enter-projector"
              >
                <Tv className="w-4 h-4" />
                <span>Projector View</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* PROJECTOR VIEW OVERLAY - Sterile, beautiful, high visibility, no tabs */}
      {projectorMode && (
        <div className="fixed inset-0 z-40 bg-[#0f172a] flex flex-col justify-between p-6 overflow-auto" id="projector-canvas">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4" id="projector-top-row">
            <div className="flex items-center gap-3">
              <div className="bg-sky-400 text-slate-950 px-2.5 py-1 rounded-xl font-extrabold text-xs">
                0P
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-white text-display">
                0-Points Quiz Event
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Highlight active team on projector */}
              {teams[activeTeamIndex] && (
                <div className="bg-sky-500/10 border border-sky-500/20 px-4 py-2 rounded-xl text-sm font-semibold" id="projector-turn-display">
                  Active Turn:{' '}
                  <span className="text-sky-400 font-black animate-pulse">
                    {teams[activeTeamIndex].name}
                  </span>
                </div>
              )}
              <button
                onClick={() => setProjectorMode(false)}
                className="text-xs bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                id="btn-exit-projector"
              >
                Exit Projector Mode
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start flex-1" id="projector-layout-grid">
            <div className="xl:col-span-8 h-full" id="projector-board">
              <QuestionGrid
                questions={questions}
                teams={teams}
                onSelectQuestion={handleSelectQuestion}
              />
            </div>
            <div className="xl:col-span-4 h-full" id="projector-leaderboard">
              <Leaderboard teams={teams} activeTeamIndex={activeTeamIndex} />
            </div>
          </div>

          <footer className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500" id="projector-footer">
            <span>Powered by Zero Points Quiz Manager</span>
            <span>Target: 0 Points • Lower is Higher</span>
          </footer>
        </div>
      )}

      {/* Main Content Areas for Standard Coordinator View */}
      {!projectorMode && (
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6" id="main-content-layout">
          {/* Active Turn Banner */}
          {teams[activeTeamIndex] && (
            <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md" id="active-turn-banner">
              <div className="flex items-center gap-3">
                <div className="bg-sky-500/15 text-sky-400 p-2.5 rounded-xl border border-sky-500/20">
                  <Sparkles className="w-5 h-5 animate-spin [animation-duration:15s]" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block">
                    Current Active Selector
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-white">{teams[activeTeamIndex].name}</h2>
                    <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/10">
                      {teams[activeTeamIndex].score} points
                    </span>
                  </div>
                </div>
              </div>

              {/* Coordinator Turn Controls */}
              <div className="flex items-center gap-2" id="turn-controls">
                <button
                  onClick={() => advanceTurn(teams)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer border border-slate-700/40"
                  id="btn-skip-turn"
                >
                  Pass Turn to Next Team
                </button>
                <div className="h-6 w-[1px] bg-slate-800"></div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1.5">Direct selector:</span>
                  <select
                    value={activeTeamIndex}
                    onChange={(e) => setActiveTeamIndex(parseInt(e.target.value))}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold px-2.5 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                    id="select-turn-team"
                  >
                    {teams.map((t, idx) => (
                      <option key={t.id} value={idx}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab Render: Board vs. Standings vs. Overrides */}
          {activeTab === 'board' && (
            <div className="max-w-5xl mx-auto w-full" id="play-board-wrapper">
              <QuestionGrid
                questions={questions}
                teams={teams}
                onSelectQuestion={handleSelectQuestion}
              />
            </div>
          )}
          {activeTab === 'standings' && (
            <div className="max-w-4xl mx-auto w-full" id="leaderboard-wrapper">
              <Leaderboard teams={teams} activeTeamIndex={activeTeamIndex} />
            </div>
          )}
          {activeTab === 'admin' && (
            <div className="w-full" id="admin-panel-wrapper">
              <AdminPanel
                teams={teams}
                questions={questions}
                onAddTeam={handleAddTeamMidGame}
                onRemoveTeam={handleRemoveTeamMidGame}
                onAdjustScore={handleAdjustScoreOverride}
                onUpdateQuestion={handleUpdateQuestionText}
                onResetGame={handleResetGame}
              />
            </div>
          )}
        </main>
      )}

      {/* ACTIVE QUESTION MODAL */}
      {selectedQuestionObj && (
        <QuestionModal
          question={selectedQuestionObj}
          teams={teams}
          activeTeamIndex={activeTeamIndex}
          onClose={() => setCurrentQuestionId(null)}
          onAnswerCorrect={handleAnswerCorrect}
          onAnswerIncorrect={handleAnswerIncorrect}
          onPassCorrect={handlePassCorrect}
          onPassIncorrect={handlePassIncorrect}
          onSkipQuestion={handleSkipQuestion}
        />
      )}
    </div>
  );
}
