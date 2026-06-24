import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import {
  ChevronDown, LogOut, Search, Shield,
  BarChart3, User,
} from 'lucide-react';




// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIFFICULTY_BADGES = {
  easy:   'text-green-500 bg-green-500/10',
  medium: 'text-amber-500 bg-amber-500/10',
  hard:   'text-red-500   bg-red-500/10',
};

const getDifficultyBadge = (difficulty = '') =>
  DIFFICULTY_BADGES[difficulty.toLowerCase()] ?? 'text-zinc-500 bg-zinc-500/10';

const formatDifficulty = (difficulty = '') =>
  difficulty.toLowerCase() === 'medium'
    ? 'Med.'
    : difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

const formatTopic = (topic = '') =>
  topic === 'linkedList'
    ? 'Linked List'
    : topic.charAt(0).toUpperCase() + topic.slice(1);

const getAcceptanceDisplay = (problem) => {
  const value = problem.acceptanceRate ?? problem.acceptance;
  if (typeof value !== 'number') return '--';
  return `${value.toFixed(1)}%`;
};

// ─── Logo Mark ────────────────────────────────────────────────────────────────

function LogoMark({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      role="img"
      aria-label="AlgoGurukul"
    >
      <rect width="34" height="34" rx="8" fill="#6366f1" />
      <polyline
        points="9,24 17,10 25,24"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line
        x1="11.5" y1="19.5" x2="22.5" y2="19.5"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="17" cy="24" r="2.2" fill="#a5f3fc" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopicPill({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'border-zinc-500 bg-[#242421] text-zinc-50'
          : 'border-zinc-700 bg-[#121210] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
      }`}
    >
      {label}
      {typeof count === 'number' && (
        <span className="font-mono text-[10px] text-zinc-600">{count}</span>
      )}
    </button>
  );
}

function PillGroup({ value, options, onChange }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-zinc-700 bg-[#1a1a17] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === option.value
              ? 'bg-[#2d2d2a] text-zinc-100 ring-1 ring-zinc-600'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function StatusDot({ solved }) {
  return solved ? (
    <span
      className="mx-auto block h-2 w-2 rounded-full bg-green-500"
      aria-label="Solved"
      role="img"
    />
  ) : (
    <span
      className="mx-auto block h-2 w-2 rounded-full border border-zinc-600"
      aria-label="Open"
      role="img"
    />
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_DEFS = {
  status: [
    { value: 'all',    label: 'All'    },
    { value: 'solved', label: 'Solved' },
    { value: 'open',   label: 'Open'   },
  ],
  difficulty: [
    { value: 'all',    label: 'All'    },
    { value: 'easy',   label: 'Easy'   },
    { value: 'medium', label: 'Med.'   },
    { value: 'hard',   label: 'Hard'   },
  ],
  tag: [
    { value: 'all',        label: 'All Topics'  },
    { value: 'array',      label: 'Array'       },
    { value: 'linkedList', label: 'Linked List' },
    { value: 'graph',      label: 'Graph'       },
    { value: 'dp',         label: 'DP'          },
    { value: 'math',       label: 'Math'        },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = Boolean(user?._id);
  const isAdmin = user?.role === "admin";
  const [problems, setProblems]         = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters]           = useState({
    difficulty: 'all',
    tag:        'all',
    status:     'all',
  });
  const [searchQuery, setSearchQuery]   = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                     = useRef(null);

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (err) {
        console.error('Error fetching problems:', err);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (err) {
        console.error('Error fetching solved problems:', err);
      }
    };

    fetchProblems();
    if (user?._id) fetchSolvedProblems();
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    setDropdownOpen(false);
  };

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => {
    setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
    setSearchQuery('');
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filteredProblems = problems.filter((problem) => {
    const q = searchQuery.trim().toLowerCase();
    if (q && !problem.title?.toLowerCase().includes(q)) return false;
    if (filters.difficulty !== 'all' && problem.difficulty !== filters.difficulty) return false;
    if (filters.tag !== 'all' && problem.tags !== filters.tag) return false;
    const isSolved = solvedProblems.some((sp) => sp._id === problem._id);
    if (filters.status === 'solved' && !isSolved) return false;
    if (filters.status === 'open'   &&  isSolved) return false;
    return true;
  });

  const isFiltered =
    filters.difficulty !== 'all' ||
    filters.tag        !== 'all' ||
    filters.status     !== 'all' ||
    searchQuery.trim() !== '';

  const tagCounts = FILTER_DEFS.tag.reduce((acc, tag) => {
    acc[tag.value] =
      tag.value === 'all'
        ? problems.length
        : problems.filter((p) => p.tags === tag.value).length;
    return acc;
  }, {});

  const initials = user?.firstName?.[0]?.toUpperCase() ?? 'G';

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#121210] text-zinc-100">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-[#1a1a17]">
        <nav
          className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5"
          aria-label="Main navigation"
        >

          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 select-none">
            <LogoMark size={32} />
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-bold tracking-tight text-zinc-100">
                AlgoGurukul
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-indigo-400">
                Practice · Learn · Solve
              </span>
            </div>
          </NavLink>

          {/* User menu */}
          <div className="relative" ref={dropdownRef}>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-transparent px-2.5 py-1.5 transition-colors hover:border-zinc-600"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/15 text-[11px] font-semibold text-indigo-400 ring-1 ring-indigo-500/25">
                  {initials}
                </span>

                <span className="hidden text-xs font-medium text-zinc-300 sm:inline">
                  {user.firstName}
                </span>

                <ChevronDown
                  size={13}
                  className={`text-zinc-600 transition-transform duration-150 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-zinc-700/80 bg-[#1e1e1b] shadow-2xl shadow-black/60"
                >
                  <div className="border-b border-zinc-800 px-3.5 py-3">
                    <p className="text-xs font-semibold text-zinc-100">
                      {user.firstName} {user.lastName}
                    </p>

                    <p className="mt-0.5 text-[11px] text-zinc-600">
                      {user.emailId}
                    </p>
                  </div>

                  <div className="p-1">
                    <NavLink
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      <User size={14} />
                      Profile
                    </NavLink>

                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        <Shield size={14} />
                        Admin Panel
                      </NavLink>
                    )}

                    <div className="my-1 h-px bg-zinc-800" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <LogOut size={14} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/signin"
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
        </nav>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-7xl px-5 py-7">

        {/* Page heading */}
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h1 className="text-sm font-semibold text-zinc-100">Problems</h1>
          <p className="font-mono text-[11px] text-zinc-600">
            {problems.length} problems · {solvedProblems.length} solved
          </p>
        </div>

        {/* Topic pills */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTER_DEFS.tag.map((tag) => (
            <TopicPill
              key={tag.value}
              active={filters.tag === tag.value}
              label={tag.label}
              count={tag.value === 'all' ? undefined : tagCounts[tag.value]}
              onClick={() => setFilter('tag', tag.value)}
            />
          ))}
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">

          {/* Search */}
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
              aria-hidden="true"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-zinc-700 bg-[#1a1a17] pl-9 pr-3 text-xs font-medium text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
              type="search"
              placeholder="Search problems…"
            />
          </div>

          <PillGroup
            value={filters.status}
            options={FILTER_DEFS.status}
            onChange={(v) => setFilter('status', v)}
          />

          <PillGroup
            value={filters.difficulty}
            options={FILTER_DEFS.difficulty}
            onChange={(v) => setFilter('difficulty', v)}
          />

          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-[11px] text-zinc-600">
              {filteredProblems.length} result{filteredProblems.length !== 1 ? 's' : ''}
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Problem table */}
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#1a1a17]">

          {/* Column headers */}
          <div className="grid grid-cols-[40px_minmax(0,1fr)_90px_80px_60px] items-center gap-3 border-b border-zinc-800 bg-[#1e1e1b] px-4 py-2.5 sm:grid-cols-[48px_minmax(0,1fr)_110px_100px_72px] sm:px-6">
            <span className="text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-700">#</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Title</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Tag</span>
            <span className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Accept.</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Diff.</span>
          </div>

          {filteredProblems.length > 0 ? (
            <ul role="list" className="divide-y divide-zinc-800/60">
              {filteredProblems.map((problem, idx) => {
                const isSolved = solvedProblems.some((sp) => sp._id === problem._id);

                return (
                  <li key={problem._id}>
                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="group grid grid-cols-[40px_minmax(0,1fr)_90px_80px_60px] items-center gap-3 px-4 py-3 transition-colors hover:bg-[#1e1e1b] focus-visible:bg-[#1e1e1b] focus-visible:outline-none sm:grid-cols-[48px_minmax(0,1fr)_110px_100px_72px] sm:px-6"
                      aria-label={`${problem.title}, ${problem.difficulty}, ${isSolved ? 'solved' : 'open'}`}
                    >
                      {/* Index */}
                      <span
                        className={`text-center font-mono text-[11px] font-semibold tabular-nums transition-colors ${
                          isSolved
                            ? 'text-green-500'
                            : 'text-zinc-600 group-hover:text-zinc-500'
                        }`}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Title */}
                      <span className="truncate text-xs font-medium text-zinc-300 transition-colors group-hover:text-zinc-100 sm:text-sm">
                        {problem.title}
                      </span>

                      {/* Tag */}
                      <span className="truncate text-[11px] text-zinc-600">
                        {formatTopic(problem.tags)}
                      </span>

                      {/* Acceptance */}
                      <span className="text-right font-mono text-[11px] text-zinc-600">
                        {getAcceptanceDisplay(problem)}
                      </span>

                      {/* Difficulty */}
                      <span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getDifficultyBadge(problem.difficulty)}`}
                        >
                          {formatDifficulty(problem.difficulty)}
                        </span>
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                <Search size={15} className="text-zinc-700" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">
                  No problems match these filters
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-600">
                  Try adjusting the search or filters above.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Homepage;