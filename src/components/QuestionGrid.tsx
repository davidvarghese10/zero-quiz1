import { Question, Team, QuizCategory } from '../types';
import { Check, Lock, Star, Sparkles } from 'lucide-react';

interface QuestionGridProps {
  questions: Question[];
  teams: Team[];
  onSelectQuestion: (question: Question) => void;
}

export default function QuestionGrid({ questions, teams, onSelectQuestion }: QuestionGridProps) {
  const categories: QuizCategory[] = ['Tech', 'Sports', 'Rajagiri', 'Entertainment'];
  const pointLevels = [20, 40, 60, 80];

  const getQuestion = (category: QuizCategory, points: number) => {
    return questions.find(q => q.category === category && q.points === points);
  };

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return '';
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : '';
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-xl" id="question-grid-panel">
      <div className="flex items-center justify-between mb-6" id="grid-header">
        <div>
          <h2 className="text-xl font-extrabold text-white text-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            Quiz Board
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Select a point value to reveal the corresponding trivia question.
          </p>
        </div>
        <div className="flex gap-2 text-[10px]" id="difficulty-legend">
          <span className="bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800">20/40 Easy</span>
          <span className="bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800">60/80 Hard</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="board-grid">
        {categories.map((category) => {
          // Color coding for each category to look gorgeous
          let catColorClasses = {
            bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
            border: 'border-indigo-500/30',
            buttonActive: 'hover:bg-indigo-600/20 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200',
            buttonIcon: 'text-indigo-400',
          };

          if (category === 'Sports') {
            catColorClasses = {
              bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
              border: 'border-amber-500/30',
              buttonActive: 'hover:bg-amber-600/20 hover:border-amber-500/50 text-amber-300 hover:text-amber-200',
              buttonIcon: 'text-amber-400',
            };
          } else if (category === 'Rajagiri') {
            catColorClasses = {
              bg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
              border: 'border-sky-500/30',
              buttonActive: 'hover:bg-sky-600/20 hover:border-sky-500/50 text-sky-300 hover:text-sky-200',
              buttonIcon: 'text-sky-400',
            };
          } else if (category === 'Entertainment') {
            catColorClasses = {
              bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
              border: 'border-rose-500/30',
              buttonActive: 'hover:bg-rose-600/20 hover:border-rose-500/50 text-rose-300 hover:text-rose-200',
              buttonIcon: 'text-rose-400',
            };
          }

          return (
            <div
              key={category}
              className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-3"
              id={`category-column-${category}`}
            >
              {/* Category Title Header */}
              <div
                className={`p-3 rounded-lg border font-black text-center text-sm tracking-wider uppercase text-display ${catColorClasses.bg}`}
              >
                {category}
              </div>

              {/* Point Values in Column */}
              <div className="flex flex-col gap-2.5">
                {pointLevels.map((points) => {
                  const question = getQuestion(category, points);
                  if (!question) return null;

                  const solvedTeamName = getTeamName(question.solvedByTeamId);

                  if (question.isCompleted) {
                    return (
                      <div
                        key={points}
                        className="p-4 bg-slate-950/40 border border-slate-900 rounded-lg flex flex-col items-center justify-center h-20 text-center opacity-45 relative overflow-hidden"
                        id={`grid-cell-${category}-${points}-completed`}
                      >
                        <span className="text-xs font-mono line-through text-slate-500 font-bold">
                          {points} PTS
                        </span>
                        {solvedTeamName ? (
                          <div className="flex items-center gap-1 mt-1 text-[9px] text-sky-400 font-bold uppercase tracking-wider max-w-full">
                            <Check className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{solvedTeamName}</span>
                          </div>
                        ) : (
                          <div className="text-[9px] text-slate-500 mt-1 font-mono uppercase">
                            Skipped
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={points}
                      onClick={() => onSelectQuestion(question)}
                      className={`p-4 bg-slate-950 border border-slate-800/80 rounded-lg flex flex-col items-center justify-center h-20 text-center transition-all cursor-pointer group ${catColorClasses.buttonActive}`}
                      id={`grid-cell-${category}-${points}`}
                    >
                      <span className="text-lg font-black font-mono tracking-tight text-white group-hover:scale-105 transition-transform">
                        {points}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono tracking-wide uppercase mt-0.5 group-hover:text-slate-400 transition-colors">
                        Points
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
