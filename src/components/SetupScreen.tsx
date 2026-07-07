import React, { useState } from 'react';
import { Team } from '../types';
import { Plus, Trash2, Play, Users, Sparkles } from 'lucide-react';

interface SetupScreenProps {
  onStartQuiz: (teams: Team[]) => void;
}

export default function SetupScreen({ onStartQuiz }: SetupScreenProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [member1, setMember1] = useState('');
  const [member2, setMember2] = useState('');
  const [member3, setMember3] = useState('');
  const [member4, setMember4] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameTrimmed = newTeamName.trim();
    if (!nameTrimmed) {
      setError('Team name cannot be empty');
      return;
    }

    if (teams.some(t => t.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      setError('A team with this name already exists');
      return;
    }

    const m1 = member1.trim();
    const m2 = member2.trim();
    const m3 = member3.trim();
    const m4 = member4.trim();

    if (!m1 || !m2 || !m3) {
      setError('Please fill in at least 3 mandatory member names (Member 1, 2, and 3)');
      return;
    }

    const membersArray = [m1, m2, m3];
    if (m4) {
      membersArray.push(m4);
    }

    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: nameTrimmed,
      members: membersArray,
      score: 1000,
      history: [
        {
          id: `hist-init-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'reset',
          points: 1000,
          newScore: 1000,
          description: 'Team registered with initial starting balance.',
        },
      ],
    };

    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setMember1('');
    setMember2('');
    setMember3('');
    setMember4('');
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  const loadDemoTeams = () => {
    const demoTeams: Team[] = [
      {
        id: 'demo-team-1',
        name: 'Binary Builders',
        members: ['Anoop', 'Binu', 'Catherine', 'Deepak'],
        score: 1000,
        history: [
          {
            id: 'demo-hist-1',
            timestamp: new Date().toLocaleTimeString(),
            action: 'reset',
            points: 1000,
            newScore: 1000,
            description: 'Team registered (Demo)',
          },
        ],
      },
      {
        id: 'demo-team-2',
        name: 'Rajagiri Royals',
        members: ['Eldho', 'Fathima', 'Gautham'],
        score: 1000,
        history: [
          {
            id: 'demo-hist-2',
            timestamp: new Date().toLocaleTimeString(),
            action: 'reset',
            points: 1000,
            newScore: 1000,
            description: 'Team registered (Demo)',
          },
        ],
      },
      {
        id: 'demo-team-3',
        name: 'Piston heads',
        members: ['Hari', 'Irene', 'Jobin', 'Karthik'],
        score: 1000,
        history: [
          {
            id: 'demo-hist-3',
            timestamp: new Date().toLocaleTimeString(),
            action: 'reset',
            points: 1000,
            newScore: 1000,
            description: 'Team registered (Demo)',
          },
        ],
      },
    ];
    setTeams(demoTeams);
  };

  const handleStart = () => {
    if (teams.length < 2) {
      setError('Please register at least two teams to play the quiz.');
      return;
    }
    onStartQuiz(teams);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4" id="setup-screen-container">
      {/* Brand Header */}
      <div className="text-center mb-10" id="brand-header">
        <div className="inline-flex items-center justify-center bg-sky-500/10 text-sky-400 p-3 rounded-2xl mb-4 border border-sky-500/20 glass">
          <Sparkles className="w-8 h-8 animate-pulse text-sky-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-display tracking-tight text-sky-400 mb-3">
          0-POINTS <span className="text-slate-400 font-light italic text-sm md:text-base ml-1">Championship</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Welcome to the digital dashboard for the '0' Points Quiz. Teams start with{' '}
          <strong className="text-white font-semibold">1000 points</strong>. Correct answers{' '}
          <span className="text-sky-400 font-bold">decrease</span> points, incorrect answers{' '}
          <span className="text-rose-400 font-bold">increase</span> points. The goal is to reach{' '}
          <strong className="text-sky-400 font-bold">exactly 0 points</strong>!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8" id="setup-grid">
        {/* Registration Form */}
        <div className="md:col-span-5 liquid-glass glass-specular-highlight p-6 shadow-xl flex flex-col justify-between" id="registration-form-panel">
          <div>
            <h2 className="text-lg font-bold text-white mb-4 text-display flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              Register New Team
            </h2>

            <form onSubmit={addTeam} className="space-y-4" id="add-team-form">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Code Warriors"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                  id="input-team-name"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Team Members <span className="text-sky-400 text-[10px] lowercase italic">(first 3 are mandatory)</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Member 1 (Mandatory)"
                    value={member1}
                    onChange={(e) => setMember1(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                    id="input-member-1"
                  />
                  <input
                    type="text"
                    placeholder="Member 2 (Mandatory)"
                    value={member2}
                    onChange={(e) => setMember2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                    id="input-member-2"
                  />
                  <input
                    type="text"
                    placeholder="Member 3 (Mandatory)"
                    value={member3}
                    onChange={(e) => setMember3(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                    id="input-member-3"
                  />
                  <input
                    type="text"
                    placeholder="Member 4 (Optional)"
                    value={member4}
                    onChange={(e) => setMember4(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                    id="input-member-4"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium" id="setup-error-alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full liquid-btn text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                id="btn-register-team"
              >
                <Plus className="w-4 h-4" /> Add Team
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-800/60 mt-6" id="quick-actions">
            <button
              onClick={loadDemoTeams}
              className="w-full bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              id="btn-demo-setup"
            >
              ⚡ Quick Demo Setup (3 Teams)
            </button>
          </div>
        </div>

        {/* Registered Teams List */}
        <div className="md:col-span-7 liquid-glass glass-specular-highlight p-6 shadow-xl flex flex-col justify-between" id="registered-teams-panel">
          <div>
            <div className="flex items-center justify-between mb-4" id="registered-teams-header">
              <h2 className="text-lg font-bold text-white text-display flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-sky-400" />
                Registered Teams ({teams.length})
              </h2>
              {teams.length > 0 && (
                <button
                  onClick={() => setTeams([])}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                  id="btn-clear-all-teams"
                >
                  Clear All
                </button>
              )}
            </div>

            {teams.length === 0 ? (
              <div className="h-64 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-500" id="empty-teams-state">
                <Users className="w-12 h-12 mb-3 opacity-30 text-slate-400" />
                <p className="text-sm font-semibold text-slate-400 mb-1">No teams registered yet</p>
                <p className="text-xs max-w-xs leading-relaxed">
                  Fill out the form on the left or click the "Quick Demo Setup" button to populate standard testing teams.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1" id="teams-list">
                {teams.map((team, index) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                    id={`team-item-${team.id}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          #{index + 1}
                        </span>
                        <h3 className="font-bold text-slate-200 text-sm">{team.name}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {team.members.map((member, mIdx) => (
                          <span
                            key={mIdx}
                            className="text-[10px] bg-slate-900 border border-slate-800/80 text-slate-400 px-2 py-0.5 rounded-md"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => removeTeam(team.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove team"
                      id={`btn-remove-${team.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800/60 mt-6" id="start-action">
            <button
              onClick={handleStart}
              disabled={teams.length < 2}
              className={`w-full font-black text-base py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 ${
                teams.length >= 2
                  ? 'liquid-btn cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
              id="btn-start-quiz"
            >
              <Play className="w-5 h-5 fill-current" /> START QUIZ EVENT
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-2">
              Ensure you have registered all teams before proceeding. You can also adjust or add teams later in the Admin panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple embedded icons to reduce dependencies or ensure icons compile perfectly.
function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6v1a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
    </svg>
  );
}
