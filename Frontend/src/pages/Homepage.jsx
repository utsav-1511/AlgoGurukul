import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import {
  BookOpen, CheckCircle2, Code2, LogOut,
  Shield, ChevronDown, BarChart3, Circle,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES = {
  easy:   'text-emerald-400 bg-emerald-400/[0.08] ring-1 ring-emerald-400/20',
  medium: 'text-amber-400  bg-amber-400/[0.08]  ring-1 ring-amber-400/20',
  hard:   'text-rose-400   bg-rose-400/[0.08]   ring-1 ring-rose-400/20',
};

const getDifficultyStyle = (difficulty = '') =>
  DIFFICULTY_STYLES[difficulty.toLowerCase()] ?? 'text-zinc-500 bg-zinc-500/[0.08] ring-1 ring-zinc-500/20';

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A single filter pill group (All / option / option …) */
function FilterGroup({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mr-0.5 hidden sm:inline">
        {label}
      </span>
      <div className="flex items-center gap-0.5 rounded-lg bg-zinc-900 p-0.5 ring-1 ring-zinc-800">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-100 ${
              value === opt.value
                ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Mobile-friendly native select fallback */
function FilterSelect({ value, options, onChange }) {
  return (
    <select
      className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 appearance-none cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-zinc-950">
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Solved / Open status cell */
function StatusCell({ solved }) {
  if (solved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
        <CheckCircle2 size={12} strokeWidth={2.5} />
        Solved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-600">
      <Circle size={10} strokeWidth={2} />
      Open
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const FILTER_DEFS = {
  status: [
    { value: 'all',    label: 'All'    },
    { value: 'solved', label: 'Solved' },
  ],
  difficulty: [
    { value: 'all',    label: 'All'    },
    { value: 'easy',   label: 'Easy'   },
    { value: 'medium', label: 'Medium' },
    { value: 'hard',   label: 'Hard'   },
  ],
  tag: [
    { value: 'all',        label: 'All'         },
    { value: 'array',      label: 'Array'       },
    { value: 'linkedList', label: 'Linked List' },
    { value: 'graph',      label: 'Graph'       },
    { value: 'dp',         label: 'DP'          },
    { value: 'math',       label: 'Math'        },
  ],
};

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ── State (unchanged) ────────────────────────────────────────────────────────
  const [problems, setProblems]             = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters]               = useState({
    difficulty: 'all',
    tag:        'all',
    status:     'all',
  });

  // Dropdown open/close via useState (replaces fragile group-focus-within hack)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── Side effects (unchanged logic) ──────────────────────────────────────────
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers (unchanged) ─────────────────────────────────────────────────────
  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    setDropdownOpen(false);
  };

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters({ difficulty: 'all', tag: 'all', status: 'all' });

  // ── Derived data (unchanged) ─────────────────────────────────────────────────
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

  const isFiltered =
    filters.difficulty !== 'all' || filters.tag !== 'all' || filters.status !== 'all';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* ── Navbar ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-sm">
        <nav
          className="mx-auto flex h-13 max-w-7xl items-center justify-between px-5"
          aria-label="Main navigation"
        >
          {/* Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100 hover:text-white transition-colors"
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500 text-white"
              aria-hidden="true"
            >
              <Code2 size={13} strokeWidth={2.5} />
            </span>
            AlgoGurukul
          </NavLink>

          {/* User menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all duration-100"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-bold ring-1 ring-indigo-500/25"
                aria-hidden="true"
              >
                {user?.firstName?.[0]?.toUpperCase() ?? 'G'}
              </span>
              <span className="hidden sm:inline text-zinc-300">
                {user?.firstName ?? 'Guest'}
              </span>
              <ChevronDown
                size={12}
                className={`text-zinc-600 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/50 py-1 z-50"
              >
                <NavLink
                  to="/dashboard"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
                >
                  <BarChart3 size={13} aria-hidden="true" />
                  My progress
                </NavLink>

                <NavLink
                  to="/admin"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
                >
                  <Shield size={13} aria-hidden="true" />
                  Admin panel
                </NavLink>

                <div className="my-1 border-t border-zinc-800" role="separator" />

                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/[0.07] transition-colors"
                >
                  <LogOut size={13} aria-hidden="true" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-7xl px-5 py-8">

        {/* ── Page heading ────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-zinc-100">Problems</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {problems.length} problems · {solvedProblems.length} solved
          </p>
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────────────── */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

          {/* Pill filters — visible on sm+ */}
          <div className="hidden sm:flex flex-wrap items-center gap-3">
            <FilterGroup
              label="Status"
              value={filters.status}
              options={FILTER_DEFS.status}
              onChange={(v) => setFilter('status', v)}
            />
            <FilterGroup
              label="Difficulty"
              value={filters.difficulty}
              options={FILTER_DEFS.difficulty}
              onChange={(v) => setFilter('difficulty', v)}
            />
            <FilterGroup
              label="Topic"
              value={filters.tag}
              options={FILTER_DEFS.tag}
              onChange={(v) => setFilter('tag', v)}
            />
          </div>

          {/* Select dropdowns — mobile only */}
          <div className="flex sm:hidden flex-wrap gap-2">
            <FilterSelect
              value={filters.status}
              options={FILTER_DEFS.status}
              onChange={(v) => setFilter('status', v)}
            />
            <FilterSelect
              value={filters.difficulty}
              options={FILTER_DEFS.difficulty}
              onChange={(v) => setFilter('difficulty', v)}
            />
            <FilterSelect
              value={filters.tag}
              options={FILTER_DEFS.tag}
              onChange={(v) => setFilter('tag', v)}
            />
          </div>

          {/* Right side: count + clear */}
          <div className="flex items-center gap-3 ml-auto">
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Clear filters
              </button>
            )}
            <span className="text-[11px] text-zinc-600 tabular-nums">
              {filteredProblems.length} result{filteredProblems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── Problem table ────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden">

          {/* Column headers */}
          <div className="grid grid-cols-[2.5rem_1fr_auto_auto] sm:grid-cols-[2.5rem_1fr_auto_auto_auto] gap-x-4 border-b border-zinc-900 px-4 py-2.5 bg-zinc-900/40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">#</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">Title</span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-zinc-700">Topic</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">Difficulty</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">Status</span>
          </div>

          {filteredProblems.length > 0 ? (
            <ul role="list">
              {filteredProblems.map((problem, idx) => {
                const isSolved = solvedProblems.some((sp) => sp._id === problem._id);

                return (
                  <li
                    key={problem._id}
                    className={idx !== filteredProblems.length - 1 ? 'border-b border-zinc-900' : ''}
                  >
                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="group grid grid-cols-[2.5rem_1fr_auto_auto] sm:grid-cols-[2.5rem_1fr_auto_auto_auto] items-center gap-x-4 px-4 py-3.5 transition-colors duration-100 hover:bg-zinc-900/50 focus-visible:bg-zinc-900/50 focus-visible:outline-none"
                      aria-label={`${problem.title}, ${problem.difficulty}, ${isSolved ? 'solved' : 'open'}`}
                    >
                      {/* Index */}
                      <span className="text-[11px] font-mono text-zinc-700 group-hover:text-zinc-500 transition-colors tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Title */}
                      <span className="min-w-0">
                        <span className="flex items-center gap-2.5">
                          <BookOpen
                            size={13}
                            className="shrink-0 text-zinc-700 group-hover:text-indigo-400 transition-colors"
                            aria-hidden="true"
                          />
                          <span className="truncate text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                            {problem.title}
                          </span>
                        </span>
                      </span>

                      {/* Topic — hidden on mobile */}
                      <span className="hidden sm:inline-flex items-center rounded-md bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-zinc-800">
                        {problem.tags}
                      </span>

                      {/* Difficulty badge */}
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${getDifficultyStyle(problem.difficulty)}`}
                      >
                        {problem.difficulty}
                      </span>

                      {/* Status */}
                      <StatusCell solved={isSolved} />
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* ── Empty state ──────────────────────────────────────────────────── */
            <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                <BookOpen size={18} className="text-zinc-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">No problems match these filters</p>
                <p className="mt-1 text-[13px] text-zinc-600">
                  Try adjusting the difficulty, topic, or status filter.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="rounded-lg border border-zinc-800 px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition-colors"
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