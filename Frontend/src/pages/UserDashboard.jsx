import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Circle,
  Code2,
  Layers3,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const DIFFICULTIES = [
  { key: 'easy', color: 'bg-emerald-400', text: 'text-emerald-400' },
  { key: 'medium', color: 'bg-amber-400', text: 'text-amber-400' },
  { key: 'hard', color: 'bg-rose-400', text: 'text-rose-400' },
];

const TOPICS = ['array', 'linkedList', 'graph', 'dp', 'math'];

const formatTopic = (topic = '') => (
  topic === 'linkedList'
    ? 'Linked List'
    : topic.charAt(0).toUpperCase() + topic.slice(1)
);

function UserDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([
      axiosClient.get('/problem/getAllProblem'),
      axiosClient.get('/problem/problemSolvedByUser'),
    ])
      .then(([problemResponse, solvedResponse]) => {
        if (!active) return;
        setProblems(Array.isArray(problemResponse.data) ? problemResponse.data : []);
        setSolvedProblems(Array.isArray(solvedResponse.data) ? solvedResponse.data : []);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          typeof requestError.response?.data === 'string'
            ? requestError.response.data
            : 'Unable to load your progress'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const solvedIds = useMemo(
    () => new Set(solvedProblems.map((problem) => problem._id)),
    [solvedProblems]
  );

  const solvedDetails = useMemo(
    () => problems.filter((problem) => solvedIds.has(problem._id)),
    [problems, solvedIds]
  );

  const difficultyProgress = useMemo(
    () => DIFFICULTIES.map(({ key, color, text }) => {
      const total = problems.filter((problem) => problem.difficulty === key).length;
      const solved = solvedDetails.filter((problem) => problem.difficulty === key).length;
      return { key, color, text, total, solved };
    }),
    [problems, solvedDetails]
  );

  const topicProgress = useMemo(
    () => TOPICS.map((topic) => {
      const total = problems.filter((problem) => problem.tags === topic).length;
      const solved = solvedDetails.filter((problem) => problem.tags === topic).length;
      return { topic, total, solved };
    }),
    [problems, solvedDetails]
  );

  const solvedCount = solvedDetails.length;
  const completion = problems.length ? Math.round((solvedCount / problems.length) * 100) : 0;
  const remaining = Math.max(problems.length - solvedCount, 0);
  const strongestTopic = [...topicProgress].sort((a, b) => b.solved - a.solved)[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="sticky top-0 z-20 border-b border-white/[0.07] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft size={16} />
            </NavLink>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">Learner dashboard</p>
              <h1 className="text-sm font-semibold">Your progress</h1>
            </div>
          </div>
          <NavLink
            to="/"
            className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
          >
            <Code2 size={13} />
            Practice
          </NavLink>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0a] p-7 sm:p-9">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_210px] lg:items-center">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
                Welcome back, {user?.firstName || 'Learner'}
              </p>
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Every solved problem is visible progress.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/35">
                Review your strengths, find the gaps, and choose what to practice next.
              </p>
            </div>

            <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[conic-gradient(#6366f1_var(--progress),rgba(255,255,255,0.06)_0)] p-3" style={{ '--progress': `${completion}%` }}>
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#0a0a0a]">
                <span className="text-4xl font-bold text-indigo-400">{loading ? '...' : `${completion}%`}</span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/25">Completed</span>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Solved', value: solvedCount, icon: CheckCircle2, color: 'text-indigo-400' },
            { label: 'Remaining', value: remaining, icon: Target, color: 'text-amber-400' },
            { label: 'Total problems', value: problems.length, icon: BookOpen, color: 'text-cyan-400' },
            { label: 'Strongest topic', value: strongestTopic?.solved ? formatTopic(strongestTopic.topic) : 'Start solving', icon: Trophy, color: 'text-emerald-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-5">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">{label}</span>
                <Icon size={15} className={color} />
              </div>
              <div className={`truncate text-2xl font-bold ${color}`}>{loading ? '...' : value}</div>
            </div>
          ))}
        </section>

        <section className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.07] bg-[#0a0a0a] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">Progress</p>
                <h3 className="mt-1 text-lg font-semibold">By difficulty</h3>
              </div>
              <BarChart3 size={18} className="text-indigo-400" />
            </div>
            <div className="space-y-6">
              {difficultyProgress.map(({ key, color, text, total, solved }) => {
                const percentage = total ? Math.round((solved / total) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="capitalize text-white/60">{key}</span>
                      <span className={`font-semibold ${text}`}>{solved}/{total}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-[#0a0a0a] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">Coverage</p>
                <h3 className="mt-1 text-lg font-semibold">By topic</h3>
              </div>
              <Layers3 size={18} className="text-cyan-400" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {topicProgress.map(({ topic, total, solved }) => (
                <div key={topic} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/55">{formatTopic(topic)}</span>
                    {solved ? <CheckCircle2 size={13} className="text-cyan-400" /> : <Circle size={13} className="text-white/15" />}
                  </div>
                  <div className="text-xl font-bold text-white/75">{solved}<span className="text-xs font-normal text-white/20">/{total}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0a0a0a]">
          <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">Completed work</p>
              <h3 className="mt-1 text-lg font-semibold">Solved problems</h3>
            </div>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>

          {solvedDetails.length ? solvedDetails.map((problem, index) => (
            <NavLink
              key={problem._id}
              to={`/problem/${problem._id}`}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-white/[0.05] px-5 py-4 transition last:border-0 hover:bg-white/[0.03]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white/75">{problem.title}</p>
                <p className="mt-1 text-[10px] text-white/20">Solved #{index + 1}</p>
              </div>
              <span className="rounded-md border border-white/[0.08] px-2 py-1 text-[10px] text-white/35">{formatTopic(problem.tags)}</span>
              <CheckCircle2 size={15} className="text-indigo-400" />
            </NavLink>
          )) : (
            <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
              <Target size={24} className="text-white/15" />
              <p className="text-sm text-white/30">Solve your first problem to start building progress.</p>
              <NavLink to="/" className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">Start practicing</NavLink>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;
