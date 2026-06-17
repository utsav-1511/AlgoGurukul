import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Database,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const DIFFICULTIES = [
  { key: 'easy', color: 'bg-emerald-400', text: 'text-emerald-400' },
  { key: 'medium', color: 'bg-amber-400', text: 'text-amber-400' },
  { key: 'hard', color: 'bg-rose-400', text: 'text-rose-400' },
];

const TOPICS = ['array', 'linkedList', 'graph', 'dp', 'math'];

const formatTopic = (topic = 'unknown') => (
  topic === 'linkedList'
    ? 'Linked List'
    : topic.charAt(0).toUpperCase() + topic.slice(1)
);

function AdminDashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(Array.isArray(data) ? data : []);
      setUpdatedAt(new Date());
    } catch (requestError) {
      setError(
        typeof requestError.response?.data === 'string'
          ? requestError.response.data
          : 'Unable to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    axiosClient.get('/problem/getAllProblem')
      .then(({ data }) => {
        if (!active) return;
        setProblems(Array.isArray(data) ? data : []);
        setUpdatedAt(new Date());
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          typeof requestError.response?.data === 'string'
            ? requestError.response.data
            : 'Unable to load dashboard data'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const difficultyCounts = useMemo(
    () => problems.reduce((counts, problem) => {
      counts[problem.difficulty] = (counts[problem.difficulty] || 0) + 1;
      return counts;
    }, {}),
    [problems]
  );

  const topicCounts = useMemo(
    () => problems.reduce((counts, problem) => {
      counts[problem.tags] = (counts[problem.tags] || 0) + 1;
      return counts;
    }, {}),
    [problems]
  );

  const filteredProblems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return problems;

    return problems.filter((problem) =>
      [problem.title, problem.difficulty, problem.tags]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [problems, query]);

  const largestDifficultyCount = Math.max(
    ...DIFFICULTIES.map(({ key }) => difficultyCounts[key] || 0),
    1
  );

  const largestTopicCount = Math.max(
    ...TOPICS.map((topic) => topicCounts[topic] || 0),
    1
  );

  const coverage = problems.length
    ? Math.round(
        (TOPICS.filter((topic) => topicCounts[topic]).length / TOPICS.length) * 100
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#121210] text-zinc-100">
      <header className="sticky top-0 z-20 border-b-2 border-zinc-700 bg-[#2d2d2a] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <NavLink
              to="/admin"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-[#242421] text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-100"
            >
              <ArrowLeft size={16} />
            </NavLink>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-400">
                Admin workspace
              </p>
              <h1 className="text-sm font-semibold text-zinc-100">Reporting Dashboard</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#242421] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-[#2d2d2a] hover:text-zinc-100 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-zinc-700 bg-[#242421] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
                <Sparkles size={11} />
                Live platform report
              </div>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                A clear view of your learning catalog.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Track problem coverage, difficulty balance, and topic distribution from one focused admin view.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock3 size={13} />
              {updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : 'Waiting for data'}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total problems', value: problems.length, icon: BookOpen, accent: 'text-indigo-400' },
            { label: 'Topic coverage', value: `${coverage}%`, icon: BarChart3, accent: 'text-cyan-400' },
            { label: 'Difficulty levels', value: DIFFICULTIES.filter(({ key }) => difficultyCounts[key]).length, icon: Activity, accent: 'text-emerald-400' },
            { label: 'User reports', value: 'API needed', icon: Users, accent: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="rounded-2xl border border-zinc-700 bg-[#242421] p-5">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</span>
                <Icon size={15} className={accent} />
              </div>
              <div className={`text-2xl font-bold tracking-tight ${accent}`}>{loading ? '...' : value}</div>
            </div>
          ))}
        </section>

        <section className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-700 bg-[#242421] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Distribution</p>
                <h3 className="mt-1 text-lg font-semibold text-zinc-100">Difficulty balance</h3>
              </div>
              <Activity size={18} className="text-indigo-400" />
            </div>

            <div className="space-y-5">
              {DIFFICULTIES.map(({ key, color, text }) => {
                const count = difficultyCounts[key] || 0;
                const width = (count / largestDifficultyCount) * 100;
                return (
                  <div key={key}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="capitalize text-zinc-300">{key}</span>
                      <span className={`font-semibold ${text}`}>{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-700 bg-[#242421] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Coverage</p>
                <h3 className="mt-1 text-lg font-semibold text-zinc-100">Topic representation</h3>
              </div>
              <Database size={18} className="text-cyan-400" />
            </div>

            <div className="grid grid-cols-5 items-end gap-3">
              {TOPICS.map((topic) => {
                const count = topicCounts[topic] || 0;
                const height = Math.max((count / largestTopicCount) * 150, count ? 18 : 4);
                return (
                  <div key={topic} className="flex flex-col items-center gap-3">
                    <span className="text-xs font-semibold text-zinc-400">{count}</span>
                    <div className="flex h-40 w-full items-end rounded-xl bg-zinc-900 p-1">
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-indigo-600 to-cyan-400 transition-all duration-700"
                        style={{ height: `${height}px` }}
                      />
                    </div>
                    <span className="max-w-full truncate text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                      {formatTopic(topic)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="overflow-hidden rounded-3xl border border-zinc-700 bg-[#242421]">
            <div className="flex flex-col gap-4 border-b border-zinc-700 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Catalog report</p>
                <h3 className="mt-1 text-lg font-semibold text-zinc-100">Problem inventory</h3>
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#2d2d2a] px-3 py-2">
                <Search size={13} className="text-zinc-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search report"
                  className="w-40 bg-transparent text-xs text-zinc-100 outline-none placeholder:text-zinc-500"
                />
              </label>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {filteredProblems.length ? filteredProblems.map((problem, index) => (
                <div
                  key={problem._id || `${problem.title}-${index}`}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-white/[0.05] px-5 py-4 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">{problem.title}</p>
                    <p className="mt-1 text-[10px] text-zinc-500">Problem #{index + 1}</p>
                  </div>
                  <span className="rounded-md border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400">
                    {formatTopic(problem.tags)}
                  </span>
                  <span className="rounded-md bg-zinc-800 px-2 py-1 text-[10px] capitalize text-zinc-400">
                    {problem.difficulty}
                  </span>
                </div>
              )) : (
                <div className="px-5 py-16 text-center text-sm text-zinc-500">
                  No problems match this report.
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-amber-300/15 bg-amber-950/20 p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-300">
              <Users size={20} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300/60">User reporting</p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-100">Ready for real user analytics</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              The current API does not expose all users or platform-wide submissions. This panel stays honest instead of showing invented numbers.
            </p>
            <div className="mt-6 space-y-3">
              {['Active users', 'Submission trends', 'Acceptance rate', 'Recent user activity'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-zinc-400">
                  <CheckCircle2 size={13} className="text-amber-300/60" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/40 p-3 text-[11px] leading-5 text-zinc-500">
              Connect a protected admin reporting endpoint to replace this availability panel with live user data.
            </div>
          </aside>
        </section>

        <footer className="flex items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          <ShieldCheck size={12} />
          Admin-only reporting view
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
