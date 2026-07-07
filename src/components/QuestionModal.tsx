import React, { useState } from 'react';
import { Question, Team } from '../types';
import { HelpCircle, Check, X, ArrowLeftRight, Eye, Play, CornerDownRight, RotateCcw } from 'lucide-react';

interface QuestionModalProps {
  question: Question;
  teams: Team[];
  activeTeamIndex: number;
  onClose: () => void;
  onAnswerCorrect: (question: Question, teamId: string) => void;
  onAnswerIncorrect: (question: Question, teamId: string) => void;
  onPassCorrect: (question: Question, teamId: string) => void;
  onPassIncorrect: (question: Question, teamId: string) => void;
  onSkipQuestion: (question: Question) => void;
}

export default function QuestionModal({
  question,
  teams,
  activeTeamIndex,
  onClose,
  onAnswerCorrect,
  onAnswerIncorrect,
  onPassCorrect,
  onPassIncorrect,
  onSkipQuestion,
}: QuestionModalProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [passMode, setPassMode] = useState(false);
  const [passTeamId, setPassTeamId] = useState<string>('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [verificationResult, setVerificationResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleVerifyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;

    const cleanStr = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();

    const isMatch = cleanStr(typedAnswer) === cleanStr(question.answerText);
    if (isMatch) {
      setVerificationResult('correct');
      setShowAnswer(true);
    } else {
      setVerificationResult('incorrect');
    }
  };

  const activeTeam = teams[activeTeamIndex];
  const otherTeams = teams.filter(t => t.id !== activeTeam?.id);

  // Default to first other team when passMode is toggled
  const handleTogglePassMode = () => {
    if (!passMode) {
      setPassMode(true);
      if (otherTeams.length > 0) {
        setPassTeamId(otherTeams[0].id);
      }
    } else {
      setPassMode(false);
      setPassTeamId('');
    }
  };

  const handleCorrect = () => {
    onAnswerCorrect(question, activeTeam.id);
    onClose();
  };

  const handleIncorrect = () => {
    onAnswerIncorrect(question, activeTeam.id);
    // Don't close immediately in case they want to pass next!
  };

  const handlePassCorrect = () => {
    if (!passTeamId) return;
    onPassCorrect(question, passTeamId);
    onClose();
  };

  const handlePassIncorrect = () => {
    if (!passTeamId) return;
    onPassIncorrect(question, passTeamId);
    // Keep open so they can pass to another team or skip
  };

  const handleSkip = () => {
    onSkipQuestion(question);
    onClose();
  };

  // Styles based on category
  let modalTheme = {
    accent: 'emerald',
    ring: 'focus:ring-emerald-500',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    pill: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  };

  if (question.category === 'Sports') {
    modalTheme = {
      accent: 'amber',
      ring: 'focus:ring-amber-500',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/5',
      pill: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    };
  } else if (question.category === 'Rajagiri') {
    modalTheme = {
      accent: 'sky',
      ring: 'focus:ring-sky-500',
      border: 'border-sky-500/20',
      bg: 'bg-sky-500/5',
      pill: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    };
  } else if (question.category === 'Entertainment') {
    modalTheme = {
      accent: 'rose',
      ring: 'focus:ring-rose-500',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/5',
      pill: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    };
  } else if (question.category === 'Tech') {
    modalTheme = {
      accent: 'indigo',
      ring: 'focus:ring-indigo-500',
      border: 'border-indigo-500/20',
      bg: 'bg-indigo-500/5',
      pill: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    };
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm" id="question-modal-overlay">
      <div
        className="relative glass rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        id="question-modal-content"
      >
        {/* Banner with category and points */}
        <div className={`p-6 border-b border-slate-800 flex items-center justify-between ${modalTheme.bg}`} id="modal-top-banner">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${modalTheme.pill}`}>
              {question.category}
            </span>
            <span className="text-sm font-mono font-bold text-slate-300">
              {question.points} Points Question
            </span>
          </div>
          {activeTeam && (
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Current Turn:</span>
              <span className="text-sm font-black text-slate-200">{activeTeam.name}</span>
            </div>
          )}
        </div>

        {/* Question Text */}
        <div className="p-8 space-y-6" id="modal-body">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-6 h-6 text-slate-500 mt-1 shrink-0" />
              <h3 className="text-xl md:text-2xl font-extrabold text-white text-display leading-relaxed">
                {question.questionText}
              </h3>
            </div>
          </div>

          {/* Answer Input Section */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-3 glass shadow-inner" id="answer-submission-section">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span>✍️ Submit Answer for Turn: {activeTeam ? activeTeam.name : 'Unknown'}</span>
            </h4>
            <form onSubmit={handleVerifyAnswer} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Type the team's answer here to verify..."
                value={typedAnswer}
                onChange={(e) => {
                  setTypedAnswer(e.target.value);
                  if (verificationResult) setVerificationResult(null);
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                id="input-typed-answer"
                disabled={showAnswer && verificationResult === 'correct'}
              />
              <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                id="btn-verify-answer"
                disabled={showAnswer && verificationResult === 'correct'}
              >
                Verify Answer
              </button>
            </form>

            {verificationResult === 'correct' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Excellent! That's correct. Click the "Correct" button below to award points!</span>
              </div>
            )}
            {verificationResult === 'incorrect' && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-lg">
                <X className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Incorrect! Try a different answer or pass/reveal the answer.</span>
              </div>
            )}
          </div>

          {/* Answer Box */}
          <div className="pt-4" id="answer-reveal-area">
            {showAnswer ? (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5" id="answer-card">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block mb-1">
                  Correct Answer:
                </span>
                <p className="text-lg font-bold text-slate-100">{question.answerText}</p>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                id="btn-reveal-answer"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                Reveal Correct Answer
              </button>
            )}
          </div>

          {/* PASS ENGINE COLLAPSIBLE */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-4" id="pass-engine-area">
            <div className="flex items-center justify-between" id="pass-header">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-300">Question Passing Manager</span>
              </div>
              <button
                onClick={handleTogglePassMode}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  passMode
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
                id="btn-toggle-pass"
              >
                {passMode ? 'Cancel Pass Mode' : 'Pass Question'}
              </button>
            </div>

            {passMode && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200" id="pass-selector-panel">
                <div className="flex flex-col sm:flex-row gap-3 items-end" id="pass-action-row">
                  <div className="w-full" id="pass-team-select-group">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                      Select Recipient Team:
                    </label>
                    <select
                      value={passTeamId}
                      onChange={(e) => setPassTeamId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      id="select-pass-team"
                    >
                      <option value="" disabled>-- Choose Team --</option>
                      {otherTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} (Current: {team.score} pts)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto shrink-0" id="pass-submission-buttons">
                    <button
                      onClick={handlePassCorrect}
                      disabled={!passTeamId}
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      id="btn-pass-correct"
                    >
                      <Check className="w-3.5 h-3.5" /> Correct (-{question.points})
                    </button>
                    <button
                      onClick={handlePassIncorrect}
                      disabled={!passTeamId}
                      className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      id="btn-pass-incorrect"
                    >
                      <X className="w-3.5 h-3.5" /> Incorrect (+{question.points})
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-amber-300 leading-relaxed">
                  💡 Passing correct answers immediately marks the question completed. Passing incorrect answers penalized that team but keeps this question screen open for other passes or cancellation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="modal-footer">
          {/* Active team direct outcome */}
          <div className="flex items-center gap-2" id="direct-outcomes-section">
            {!passMode && (
              <>
                <span className="text-xs text-slate-500 font-semibold mr-1">Active Team Outcome:</span>
                <button
                  onClick={handleCorrect}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/20 hover:translate-y-[-1px]"
                  id="btn-direct-correct"
                >
                  <Check className="w-4 h-4 text-slate-950" /> Correct (-{question.points})
                </button>
                <button
                  onClick={handleIncorrect}
                  className="bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/30 text-rose-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  id="btn-direct-incorrect"
                >
                  <X className="w-4 h-4 text-rose-400" /> Incorrect (+{question.points})
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end" id="administrative-outcomes-section">
            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-slate-800 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
              title="Mark completed without changing scores"
              id="btn-skip-question"
            >
              Skip Question
            </button>
            <button
              onClick={onClose}
              className="text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              id="btn-close-modal"
            >
              Keep Unsolved & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
