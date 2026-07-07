import React, { useState } from 'react';
import { Team, Question, ScoreHistoryEntry } from '../types';
import { ShieldAlert, Plus, Trash2, Edit2, RotateCcw, Check, Sparkles, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

interface AdminPanelProps {
  teams: Team[];
  questions: Question[];
  onAddTeam: (name: string, members: string[]) => void;
  onRemoveTeam: (teamId: string) => void;
  onAdjustScore: (teamId: string, delta: number, description: string) => void;
  onUpdateQuestion: (questionId: string, questionText: string, answerText: string) => void;
  onResetGame: (hardReset: boolean) => void; // hardReset clears teams, softReset keeps teams but clears scores/board
}

export default function AdminPanel({
  teams,
  questions,
  onAddTeam,
  onRemoveTeam,
  onAdjustScore,
  onUpdateQuestion,
  onResetGame,
}: AdminPanelProps) {
  // New Team states
  const [newTeamName, setNewTeamName] = useState('');
  const [member1, setMember1] = useState('');
  const [member2, setMember2] = useState('');
  const [member3, setMember3] = useState('');
  const [member4, setMember4] = useState('');
  const [addTeamError, setAddTeamError] = useState<string | null>(null);

  // Score override states
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [overrideValue, setOverrideValue] = useState<number | ''>('');
  const [overrideDesc, setOverrideDesc] = useState('');
  const [scoreError, setScoreError] = useState<string | null>(null);

  // Question editing states
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQText, setEditQText] = useState('');
  const [editAText, setEditAText] = useState('');

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState<'soft' | 'hard' | null>(null);

  const handleAddTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddTeamError(null);

    const name = newTeamName.trim();
    if (!name) {
      setAddTeamError('Team name is required');
      return;
    }

    if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      setAddTeamError('Team name already exists');
      return;
    }

    const m1 = member1.trim();
    const m2 = member2.trim();
    const m3 = member3.trim();
    const m4 = member4.trim();

    if (!m1 || !m2 || !m3) {
      setAddTeamError('Please fill in at least 3 mandatory member names (Member 1, 2, and 3)');
      return;
    }

    const members = [m1, m2, m3];
    if (m4) {
      members.push(m4);
    }

    onAddTeam(name, members);
    setNewTeamName('');
    setMember1('');
    setMember2('');
    setMember3('');
    setMember4('');
  };

  const handleScoreAdjustSubmit = (action: 'add' | 'subtract') => {
    setScoreError(null);
    if (!selectedTeamId) {
      setScoreError('Please select a team');
      return;
    }

    if (overrideValue === '' || Number(overrideValue) <= 0) {
      setScoreError('Please enter a valid positive points value');
      return;
    }

    const value = Number(overrideValue);
    const delta = action === 'add' ? value : -value;
    const desc = overrideDesc.trim() || `Administrative score adjustment (${action === 'add' ? 'Penalty' : 'Bonus'})`;

    onAdjustScore(selectedTeamId, delta, desc);
    setOverrideValue('');
    setOverrideDesc('');
  };

  const startEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditQText(q.questionText);
    setEditAText(q.answerText);
  };

  const saveQuestionEdit = () => {
    if (!editingQuestionId) return;
    onUpdateQuestion(editingQuestionId, editQText.trim(), editAText.trim());
    setEditingQuestionId(null);
  };

  return (
    <div className="space-y-8" id="admin-panel-container">
      {/* SECTION 1: MANUAL SCORE ADJUSTMENTS */}
      <div className="glass rounded-2xl p-6 shadow-xl" id="admin-score-adjust-card">
        <h2 className="text-lg font-black text-white text-display flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-sky-400" />
          Coordinator Score Adjuster
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="score-adjust-form-grid">
          {/* Target Team */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
              id="select-override-team"
            >
              <option value="">-- Choose Team --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.score} pts)
                </option>
              ))}
            </select>
          </div>

          {/* Point Value */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Points to Modify
            </label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={overrideValue}
              onChange={(e) => {
                const val = e.target.value;
                setOverrideValue(val === '' ? '' : Math.abs(parseInt(val)));
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
              id="input-override-points"
            />
          </div>

          {/* Explanation */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Reason / Memo
            </label>
            <input
              type="text"
              placeholder="e.g. Penalty for delay or bonus point"
              value={overrideDesc}
              onChange={(e) => setOverrideDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
              id="input-override-reason"
            />
          </div>

          {/* Apply actions */}
          <div className="md:col-span-2 flex items-end gap-2">
            <button
              onClick={() => handleScoreAdjustSubmit('add')}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
              title="Add points (penalizes team)"
              id="btn-override-add-points"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Add Score (+)</span>
            </button>
            <button
              onClick={() => handleScoreAdjustSubmit('subtract')}
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
              title="Deduct points (rewards team)"
              id="btn-override-deduct-points"
            >
              <ArrowDown className="w-3.5 h-3.5 text-slate-950" />
              <span>Deduct (-)</span>
            </button>
          </div>
        </div>

        {scoreError && (
          <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg" id="score-error-banner">
            {scoreError}
          </div>
        )}

        {/* Quick Click Adjusters for each team directly */}
        <div className="mt-6 pt-5 border-t border-slate-800/60" id="quick-overrides-section">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Quick Overrides per Team
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="quick-overrides-grid">
            {teams.map((t) => (
              <div
                key={t.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-xs block truncate text-slate-200">{t.name}</span>
                  <span className="font-mono text-[11px] text-slate-500">{t.score} points</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => onAdjustScore(t.id, -20, 'Quick override: reward -20 points')}
                    className="bg-sky-950 text-sky-400 border border-sky-500/20 px-1.5 py-1 rounded text-[10px] font-bold hover:bg-sky-900 transition-colors cursor-pointer"
                  >
                    -20
                  </button>
                  <button
                    onClick={() => onAdjustScore(t.id, -50, 'Quick override: reward -50 points')}
                    className="bg-sky-950 text-sky-400 border border-sky-500/20 px-1.5 py-1 rounded text-[10px] font-bold hover:bg-sky-900 transition-colors cursor-pointer"
                  >
                    -50
                  </button>
                  <button
                    onClick={() => onAdjustScore(t.id, 20, 'Quick override: penalty +20 points')}
                    className="bg-rose-950 text-rose-400 border border-rose-500/20 px-1.5 py-1 rounded text-[10px] font-bold hover:bg-rose-900 transition-colors cursor-pointer"
                  >
                    +20
                  </button>
                  <button
                    onClick={() => onAdjustScore(t.id, 50, 'Quick override: penalty +50 points')}
                    className="bg-rose-950 text-rose-400 border border-rose-500/20 px-1.5 py-1 rounded text-[10px] font-bold hover:bg-rose-900 transition-colors cursor-pointer"
                  >
                    +50
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: ADD / REMOVE TEAMS MID-QUIZ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-secondary-panels">
        {/* Register team mid-game */}
        <div className="lg:col-span-5 glass rounded-2xl p-6 shadow-xl flex flex-col justify-between" id="add-team-mid-game-panel">
          <div>
            <h2 className="text-lg font-black text-white text-display flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-sky-400" />
              Add Late Team
            </h2>
            <form onSubmit={handleAddTeamSubmit} className="space-y-4" id="late-team-form">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyper Threads"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Team Members <span className="text-sky-400 text-[10px] lowercase italic">(first 3 are mandatory)</span>
                </label>
                <input
                  type="text"
                  placeholder="Member 1 (Mandatory)"
                  value={member1}
                  onChange={(e) => setMember1(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="text"
                  placeholder="Member 2 (Mandatory)"
                  value={member2}
                  onChange={(e) => setMember2(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="text"
                  placeholder="Member 3 (Mandatory)"
                  value={member3}
                  onChange={(e) => setMember3(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="text"
                  placeholder="Member 4 (Optional)"
                  value={member4}
                  onChange={(e) => setMember4(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {addTeamError && (
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded" id="late-team-error">
                  {addTeamError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-slate-950 font-black text-xs py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Insert Late Team (Starts with 1000 pts)
              </button>
            </form>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/60" id="current-teams-manager">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">Remove Existing Teams</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1" id="remove-teams-list">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800/80"
                >
                  <span className="text-xs font-bold truncate text-slate-200">{t.name}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove ${t.name}? This is irreversible.`)) {
                        onRemoveTeam(t.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Board Reset & Maintenance */}
        <div className="lg:col-span-7 glass rounded-2xl p-6 shadow-xl flex flex-col justify-between" id="reset-maintenance-panel">
          <div>
            <h2 className="text-lg font-black text-white text-display flex items-center gap-2 mb-4">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Event Reset Console
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Need to restart or fix the board? Use the options below. Make sure to choose carefully as these actions change the game records instantly.
            </p>

            <div className="space-y-4" id="reset-action-buttons">
              {/* Soft Reset */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Soft Reset (Keep Registered Teams)</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Resets all questions back to unanswered, returns all team scores to 1000 points, and wipes history cards. Your registered teams and members remain intact.
                  </p>
                </div>
                <button
                  onClick={() => setShowResetConfirm('soft')}
                  className="bg-amber-600/10 hover:bg-amber-600 text-amber-400 hover:text-slate-950 font-bold text-xs py-2 px-3 border border-amber-500/20 hover:border-transparent rounded-lg shrink-0 transition-colors cursor-pointer"
                  id="btn-soft-reset"
                >
                  Soft Reset
                </button>
              </div>

              {/* Hard Reset */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Hard Reset (Wipe Everything)</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Completely resets the app. Removes all registered teams, resets all questions, and takes you back to the team setup registration screen.
                  </p>
                </div>
                <button
                  onClick={() => setShowResetConfirm('hard')}
                  className="bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white font-bold text-xs py-2 px-3 border border-rose-500/20 hover:border-transparent rounded-lg shrink-0 transition-colors cursor-pointer"
                  id="btn-hard-reset"
                >
                  Hard Reset
                </button>
              </div>
            </div>

            {/* Reset confirmation prompt */}
            {showResetConfirm && (
              <div className="mt-6 p-4 bg-amber-500/5 border-2 border-amber-500/20 rounded-xl space-y-3 animate-in fade-in-50 duration-150" id="reset-confirmation-modal">
                <div className="flex gap-2 items-start text-amber-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold">Confirm Game Reset</h5>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      You selected a <span className="font-bold underline">{showResetConfirm} reset</span>. This will erase the ongoing quiz progress immediately. Are you sure?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowResetConfirm(null)}
                    className="text-[10px] text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-950 font-semibold transition-colors cursor-pointer"
                    id="btn-cancel-reset"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={() => {
                      onResetGame(showResetConfirm === 'hard');
                      setShowResetConfirm(null);
                    }}
                    className="text-[10px] bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded font-black transition-colors cursor-pointer"
                    id="btn-confirm-reset"
                  >
                    Yes, Reset!
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: QUESTION BOARD EDITING */}
      <div className="glass rounded-2xl p-6 shadow-xl" id="admin-questions-editor-card">
        <h2 className="text-lg font-black text-white text-display flex items-center gap-2 mb-4">
          <Edit2 className="w-5 h-5 text-sky-400" />
          Edit Board Questions
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Need to customize questions during runtime, fix typo errors, or swap a question on-the-fly? You can directly replace the questions and answers on the quiz board.
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1" id="questions-list-editor">
          {questions.map((q) => {
            const isEditing = editingQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                id={`q-edit-row-${q.id}`}
              >
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-indigo-500/10 font-mono">
                      {q.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {q.points} PTS
                    </span>
                    {q.isCompleted && (
                      <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-sky-500/10">
                        Done
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 w-full" id={`q-inputs-${q.id}`}>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Question</label>
                        <textarea
                          value={editQText}
                          onChange={(e) => setEditQText(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Answer</label>
                        <input
                          type="text"
                          value={editAText}
                          onChange={(e) => setEditAText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                        Q: {q.questionText}
                      </p>
                      <p className="text-[11px] text-sky-400 font-medium mt-1">
                        A: {q.answerText}
                      </p>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex gap-2 w-full md:w-auto justify-end" id={`q-editor-actions-${q.id}`}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setEditingQuestionId(null)}
                        className="bg-slate-900 hover:bg-slate-850 text-slate-400 font-semibold text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveQuestionEdit}
                        className="bg-sky-600 hover:bg-sky-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-slate-950" /> Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditQuestion(q)}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Question
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
