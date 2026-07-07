import { Team } from '../types';
import { motion } from 'motion/react';
import { Trophy, Clock, History, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useState } from 'react';

interface LeaderboardProps {
  teams: Team[];
  activeTeamIndex: number;
}

export default function Leaderboard({ teams, activeTeamIndex }: LeaderboardProps) {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Sort teams: lowest score first (closest to 0 points wins)
  // If scores are equal, sort alphabetically by team name
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return a.name.localeCompare(b.name);
  });

  const activeTeam = teams[activeTeamIndex];

  const toggleHistory = (teamId: string) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
    } else {
      setExpandedTeamId(teamId);
    }
  };

  return (
    <div className="liquid-glass glass-specular-highlight p-6 shadow-xl" id="leaderboard-panel">
      <div className="flex items-center justify-between mb-6" id="leaderboard-header">
        <div>
          <h2 className="text-xl font-extrabold text-white text-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-sky-400" />
            Live Standings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Target: <span className="text-sky-400 font-bold">0 Points</span>. Lower scores rank higher.
          </p>
        </div>
        {activeTeam && (
          <div className="bg-sky-500/10 border border-sky-500/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs" id="active-team-indicator">
            <Clock className="w-4 h-4 text-sky-400 animate-spin [animation-duration:8s]" />
            <div>
              <span className="text-slate-400">Current Turn:</span>{' '}
              <strong className="text-sky-400 font-bold">{activeTeam.name}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3" id="leaderboard-list">
        {sortedTeams.map((team, rankIndex) => {
          const isCurrentTurn = activeTeam && activeTeam.id === team.id;
          const isExpanded = expandedTeamId === team.id;
          const isLeader = rankIndex === 0;

          // Compute distance to 0
          const distToZero = Math.abs(team.score);

          // Render ranks
          let rankBadge = (
            <span className="text-xs font-mono font-bold bg-slate-800 text-slate-400 w-6 h-6 flex items-center justify-center rounded-full">
              {rankIndex + 1}
            </span>
          );
          if (isLeader) {
            rankBadge = (
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-400 w-6 h-6 flex items-center justify-center rounded-full border border-amber-500/30">
                👑
              </span>
            );
          }

          return (
            <motion.div
              layoutId={`leaderboard-card-${team.id}`}
              key={team.id}
              className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                isCurrentTurn
                  ? 'active-team-row bg-sky-950/20 border-sky-500/50 shadow-md shadow-sky-950/10'
                  : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700/80'
              }`}
              id={`leaderboard-row-${team.id}`}
            >
              {/* Row Header */}
              <div
                onClick={() => toggleHistory(team.id)}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {rankBadge}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm md:text-base text-slate-100">
                        {team.name}
                      </span>
                      {isCurrentTurn && (
                        <span className="text-[10px] font-bold bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          Active Turn
                        </span>
                      )}
                    </div>
                    {/* Members inline */}
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="truncate max-w-[180px] md:max-w-[300px]">
                        {team.members.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Score */}
                  <div className="text-right">
                    <div
                      className={`text-lg md:text-xl font-black font-mono tracking-tight ${
                        team.score === 0
                          ? 'text-sky-400 animate-bounce'
                          : team.score < 500
                          ? 'text-sky-300'
                          : team.score < 1000
                          ? 'text-amber-300'
                          : 'text-rose-300'
                      }`}
                    >
                      {team.score}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      points
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-white p-1 rounded bg-slate-900/50">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible History Section */}
              {isExpanded && (
                <div className="border-t border-slate-800/60 bg-slate-950/40 p-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-3">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Transaction History</span>
                  </div>

                  {team.history.length === 0 ? (
                    <p className="text-slate-500 italic">No points transactions recorded.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {team.history
                        .slice()
                        .reverse()
                        .map((entry) => {
                          let actionColor = 'text-slate-400';
                          let sign = '';

                          if (entry.action === 'correct' || entry.action === 'pass_correct') {
                            actionColor = 'text-emerald-400';
                            sign = '-';
                          } else if (entry.action === 'incorrect' || entry.action === 'pass_incorrect') {
                            actionColor = 'text-rose-400';
                            sign = '+';
                          } else if (entry.action === 'override_subtract') {
                            actionColor = 'text-emerald-400';
                            sign = '-';
                          } else if (entry.action === 'override_add') {
                            actionColor = 'text-rose-400';
                            sign = '+';
                          }

                          return (
                            <div
                              key={entry.id}
                              className="flex items-start justify-between bg-slate-900/30 border border-slate-800/40 p-2.5 rounded-lg text-[11px]"
                            >
                              <div className="space-y-0.5">
                                <p className="text-slate-200 font-medium">
                                  {entry.description}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {entry.timestamp}
                                </p>
                              </div>
                              <div className="text-right font-mono pl-3">
                                <span className={`font-bold ${actionColor}`}>
                                  {sign}
                                  {entry.points} pts
                                </span>
                                <div className="text-[9px] text-slate-500">
                                  bal: {entry.newScore}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
