import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import {
  BookOpen, CheckCircle2, Code2, LogOut,
  Shield, ChevronDown, BarChart3
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDifficultyColor = (difficulty = '') => {
  switch (difficulty.toLowerCase()) {
    case 'easy':   return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'hard':   return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    default:       return 'text-white/40 bg-white/5 border-white/10';
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems]             = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters]               = useState({
    difficulty: 'all',
    tag:        'all',
    status:     'all',
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user?._id) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  // ── Derived data ────────────────────────────────────────────────────────────

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch =
      filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch =
      filters.status === 'all' ||
      (filters.status === 'solved' &&
        solvedProblems.some((sp) => sp._id === problem._id));
    return difficultyMatch && tagMatch && statusMatch;
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-black/80 px-6 backdrop-blur-md h-14">

        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 font-bold text-sm tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <Code2 size={14} />
          </span>
          <span className="text-white">AlgoGurukul</span>
        </NavLink>

        {/* User menu */}
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05] transition-all duration-150">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold ring-1 ring-indigo-500/30">
              {user?.firstName?.[0]?.toUpperCase() || 'G'}
            </div>
            <span className="hidden sm:inline">{user?.firstName || 'Guest'}</span>
            <ChevronDown size={13} className="text-white/30" />
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1.5 w-44 origin-top-right scale-95 opacity-0 group-focus-within:scale-100 group-focus-within:opacity-100 transition-all duration-150 rounded-xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl shadow-black/60 p-1.5 z-50">
              <NavLink
                to="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <BarChart3 size={13} />
                My progress
              </NavLink>
            
              <NavLink
                to="/admin"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <Shield size={13} />
                Admin panel
              </NavLink>
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/[0.08] transition-colors"
            >
              <LogOut size={13} />
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="mx-auto w-full max-w-7xl px-5 py-10">

        {/* ── Problem set intro ──
        <section className="relative mb-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808] p-6">
            <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 right-8 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl" />

            <p className="relative mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Practice Library
            </p>
            <h1 className="relative text-3xl font-bold tracking-tight text-white">
              Problem Set
            </h1>
            <p className="relative mt-2 max-w-xl text-sm leading-relaxed text-white/35">
              Filter by status, difficulty, and topic. Open any problem to code,
              run examples, and use the AI helper.
            </p>
        </section> */}

        {/* ── Filter bar ── */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.07] bg-[#080808] px-4 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/20 mr-1">
            Filter
          </span>

          {[
            {
              value: filters.status,
              onChange: (v) => setFilters({ ...filters, status: v }),
              options: [
                { value: 'all', label: 'All problems' },
                { value: 'solved', label: 'Solved only' },
              ],
            },
            {
              value: filters.difficulty,
              onChange: (v) => setFilters({ ...filters, difficulty: v }),
              options: [
                { value: 'all', label: 'All difficulties' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ],
            },
            {
              value: filters.tag,
              onChange: (v) => setFilters({ ...filters, tag: v }),
              options: [
                { value: 'all', label: 'All topics' },
                { value: 'array', label: 'Array' },
                { value: 'linkedList', label: 'Linked List' },
                { value: 'graph', label: 'Graph' },
                { value: 'dp', label: 'DP' },
                { value: 'math', label: 'Math' },
              ],
            },
          ].map((sel, i) => (
            <select
              key={i}
              className="min-w-[148px] rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/40 transition-colors appearance-none cursor-pointer hover:border-white/15 hover:text-white"
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
            >
              {sel.options.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#111] text-white">
                  {o.label}
                </option>
              ))}
            </select>
          ))}

          <span className="ml-auto text-[11px] text-white/25 tabular-nums">
            {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Problem list ── */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808]">

          {/* Column headings */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">Title</span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 sm:block">Topic</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">Status</span>
          </div>

          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem, idx) => {
              const isSolved = solvedProblems.some((sp) => sp._id === problem._id);

              return (
                <NavLink
                  key={problem._id}
                  to={`/problem/${problem._id}`}
                  className={`group grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 transition-all duration-150 hover:bg-white/[0.03] ${
                    idx !== filteredProblems.length - 1 ? 'border-b border-white/[0.05]' : ''
                  }`}
                >
                  {/* Title + badges */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/15 transition-colors">
                        <BookOpen size={13} />
                      </span>
                      <h2 className="truncate text-sm font-semibold text-white/85 group-hover:text-white transition-colors">
                        {problem.title}
                      </h2>
                    </div>

                    <div className="mt-2 flex gap-2 pl-10">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <span className="inline-flex items-center rounded-md border border-white/[0.08] px-2 py-0.5 text-[10px] font-medium text-white/30 sm:hidden">
                        {problem.tags}
                      </span>
                    </div>
                  </div>

                  {/* Topic badge */}
                  <div className="hidden sm:block">
                    <span className="inline-flex items-center rounded-md border border-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-white/30">
                      {problem.tags}
                    </span>
                  </div>

                  {/* Solved / Open */}
                  {isSolved ? (
                    <div className="flex items-center gap-1.5 text-indigo-400 text-[11px] font-semibold">
                      <CheckCircle2 size={13} />
                      Solved
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-white/20 text-[11px] font-medium">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/15" />
                      Open
                    </div>
                  )}
                </NavLink>
              );
            })
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.07]">
                <BookOpen size={20} className="text-white/20" />
              </div>
              <p className="text-sm font-medium text-white/30">
                No problems match those filters.
              </p>
              <button
                className="mt-1 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                onClick={() => setFilters({ difficulty: 'all', tag: 'all', status: 'all' })}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Homepage;
