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

// ─── Constants (unchanged) ────────────────────────────────────────────────────

const DIFFICULTIES = [
  { key: 'easy',   color: 'bg-emerald-400', text: 'text-emerald-400', rail: 'bg-emerald-400' },
  { key: 'medium', color: 'bg-amber-400',   text: 'text-amber-400',   rail: 'bg-amber-400'   },
  { key: 'hard',   color: 'bg-rose-400',    text: 'text-rose-400',    rail: 'bg-rose-400'    },
];

const TOPICS = ['array', 'linkedList', 'graph', 'dp', 'math'];

const formatTopic = (topic = '') =>
  topic === 'linkedList'
    ? 'Linked List'
    : topic.charAt(0).toUpperCase() + topic.slice(1);

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Skeleton shimmer block for loading states */
function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-800/60 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Section heading with optional icon */
function SectionHeader({ eyebrow, title, icon: Icon }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          {eyebrow}
        </p>
        <h2 className="mt-0.5 text-base font-semibold text-zinc-100">{title}</h2>
      </div>
      {Icon && <Icon size={16} className="text-zinc-600" aria-hidden="true" />}
    </div>
  );
}

/** Reusable card wrapper */
function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-xl border border-zinc-900 bg-zinc-950 ${className}`}
    >
      {children}
    </div>
  );
}

/** Single difficulty progress row */
function DifficultyBar({ label, solved, total, colorClass, textClass, loading }) {
  const percentage = total ? Math.round((solved / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm capitalize text-zinc-400">{label}</span>
        {loading ? (
          <Skeleton className="h-3.5 w-12" />
        ) : (
          <span className={`text-xs font-semibold tabular-nums ${textClass}`}>
            {solved}
            <span className="font-normal text-zinc-600">/{total}</span>
          </span>
        )}
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-zinc-900"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} progress: ${solved} of ${total} solved`}
      >
        {!loading && (
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${percentage}%` }}
          />
        )}
        {loading && <Skeleton className="h-full w-2/3 rounded-full" />}
      </div>
    </div>
  );
}

/** Individual topic card */
function TopicCard({ topic, solved, total, loading }) {
  const hasAny = total > 0;
  const allSolved = hasAny && solved === total;
  return (
    <div className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{formatTopic(topic)}</span>
        {loading ? (
          <Skeleton className="h-3 w-3 rounded-full" />
        ) : allSolved ? (
          <CheckCircle2 size={12} className="text-emerald-400" aria-label="All solved" />
        ) : solved > 0 ? (
          <Circle size={12} className="text-indigo-400" aria-label="In progress" />
        ) : (
          <Circle size={12} className="text-zinc-700" aria-label="Not started" />
        )}
      </div>
      {loading ? (
        <Skeleton className="h-5 w-16" />
      ) : (
        <p className="text-lg font-semibold tabular-nums text-zinc-200">
          {hasAny ? solved : '—'}
          {hasAny && (
            <span className="text-xs font-normal text-zinc-600">/{total}</span>
          )}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function UserDashboard() {
  const { user } = useSelector((state) => state.auth);

  // ── State (unchanged) ────────────────────────────────────────────────────────
  const [problems, setProblems]         = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // ── Effect (unchanged logic) ─────────────────────────────────────────────────
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

    return () => { active = false; };
  }, []);

  // ── Derived data (unchanged logic) ───────────────────────────────────────────
  const solvedIds = useMemo(
    () => new Set(solvedProblems.map((p) => p._id)),
    [solvedProblems]
  );

  const solvedDetails = useMemo(
    () => problems.filter((p) => solvedIds.has(p._id)),
    [problems, solvedIds]
  );

  const difficultyProgress = useMemo(
    () => DIFFICULTIES.map(({ key, color, text }) => {
      const total  = problems.filter((p) => p.difficulty === key).length;
      const solved = solvedDetails.filter((p) => p.difficulty === key).length;
      return { key, color, text, total, solved };
    }),
    [problems, solvedDetails]
  );

  const topicProgress = useMemo(
    () => TOPICS.map((topic) => {
      const total  = problems.filter((p) => p.tags === topic).length;
      const solved = solvedDetails.filter((p) => p.tags === topic).length;
      return { topic, total, solved };
    }),
    [problems, solvedDetails]
  );

  const solvedCount    = solvedDetails.length;
  const completion     = problems.length ? Math.round((solvedCount / problems.length) * 100) : 0;
  const remaining      = Math.max(problems.length - solvedCount, 0);
  const strongestTopic = [...topicProgress].sort((a, b) => b.solved - a.solved)[0];

  // ── Rail segments: proportion of each difficulty within solved set ────────────
  const railSegments = useMemo(() => {
    if (!problems.length) return [];
    return difficultyProgress.map(({ key, rail, total }) => ({
      key,
      rail,
      width: problems.length ? (total / problems.length) * 100 : 0,
      solvedWidth: problems.length ? (difficultyProgress.find(d => d.key === key)?.solved ?? 0) / problems.length * 100 : 0,
    }));
  }, [problems, difficultyProgress]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* ── Header / Nav ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-5">

          {/* Left: back + brand */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              aria-label="Back to problems"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
            >
              <ArrowLeft size={14} aria-hidden="true" />
            </NavLink>
            <div className="hidden sm:block h-4 w-px bg-zinc-800" aria-hidden="true" />
            <span className="hidden sm:block text-sm font-medium text-zinc-400">
              Progress
            </span>
          </div>

          {/* Right: CTA */}
          <NavLink
            to="/"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-400"
          >
            <Code2 size={12} aria-hidden="true" />
            Practice
          </NavLink>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 space-y-6">

        {/* ── Error state ─────────────────────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-400"
          >
            {error}
          </div>
        )}

        {/* ── Profile + Completion Rail ────────────────────────────────────── */}
        <Card className="px-6 py-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-lg font-semibold text-indigo-400 ring-1 ring-indigo-500/20"
                aria-hidden="true"
              >
                {user?.firstName?.[0]?.toUpperCase() ?? 'G'}
              </div>
              <div>
                <h1 className="text-base font-semibold text-zinc-100">
                  {user?.firstName ?? 'Learner'}
                </h1>
                <p className="text-sm text-zinc-500">
                  {loading ? (
                    <Skeleton className="inline-block h-3.5 w-24 align-middle" />
                  ) : (
                    `${solvedCount} of ${problems.length} problems solved`
                  )}
                </p>
              </div>
            </div>

            {/* Completion percentage */}
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Completion
              </p>
              {loading ? (
                <Skeleton className="mt-1 h-8 w-14 ml-auto" />
              ) : (
                <p className="mt-0.5 text-3xl font-bold tabular-nums text-zinc-100">
                  {completion}
                  <span className="text-xl font-medium text-zinc-500">%</span>
                </p>
              )}
            </div>
          </div>

          {/* ── Signature element: segmented completion rail ──────────────── */}
          <div className="mt-5">
            <div
              className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-900"
              role="img"
              aria-label={`Completion: ${completion}% — easy ${difficultyProgress[0]?.solved ?? 0}, medium ${difficultyProgress[1]?.solved ?? 0}, hard ${difficultyProgress[2]?.solved ?? 0}`}
            >
              {!loading && railSegments.map(({ key, rail, solvedWidth }) => (
                <div
                  key={key}
                  className={`h-full ${rail} first:rounded-l-full last:rounded-r-full`}
                  style={{ width: `${solvedWidth}%` }}
                />
              ))}
            </div>
            {/* Rail legend */}
            <div className="mt-2.5 flex items-center gap-4">
              {difficultyProgress.map(({ key, text, solved }) => (
                <span key={key} className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                    key === 'easy' ? 'bg-emerald-400' : key === 'medium' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} aria-hidden="true" />
                  <span className="capitalize">{key}</span>
                  {!loading && (
                    <span className={`font-semibold tabular-nums ${text}`}>{solved}</span>
                  )}
                </span>
              ))}
              <span className="ml-auto text-[11px] text-zinc-700 tabular-nums">
                {!loading && `${remaining} remaining`}
              </span>
            </div>
          </div>
        </Card>

        {/* ── Stat strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Solved',
              value: solvedCount,
              icon: CheckCircle2,
              accent: 'text-indigo-400',
            },
            {
              label: 'Easy',
              value: difficultyProgress[0]?.solved,
              icon: Target,
              accent: 'text-emerald-400',
            },
            {
              label: 'Medium',
              value: difficultyProgress[1]?.solved,
              icon: BarChart3,
              accent: 'text-amber-400',
            },
            {
              label: 'Hard',
              value: difficultyProgress[2]?.solved,
              icon: TrendingUp,
              accent: 'text-rose-400',
            },
          ].map(({ label, value, icon: Icon, accent }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  {label}
                </span>
                <Icon size={13} className={accent} aria-hidden="true" />
              </div>
              {loading ? (
                <Skeleton className="mt-3 h-7 w-10" />
              ) : (
                <p className={`mt-2.5 text-2xl font-bold tabular-nums ${accent}`}>
                  {value}
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* ── Strongest topic callout (only when there is one) ─────────────── */}
        {!loading && strongestTopic?.solved > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-900/40 px-4 py-3">
            <Trophy size={14} className="shrink-0 text-amber-400" aria-hidden="true" />
            <p className="text-sm text-zinc-400">
              Strongest topic:{' '}
              <span className="font-semibold text-zinc-200">
                {formatTopic(strongestTopic.topic)}
              </span>
              <span className="ml-2 text-zinc-600 tabular-nums">
                {strongestTopic.solved} solved
              </span>
            </p>
          </div>
        )}

        {/* ── Difficulty + Topic ───────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Difficulty bars */}
          <Card className="p-5">
            <SectionHeader
              eyebrow="Progress"
              title="By difficulty"
              icon={BarChart3}
            />
            <div className="space-y-5">
              {difficultyProgress.map(({ key, color, text, total, solved }) => (
                <DifficultyBar
                  key={key}
                  label={key}
                  solved={solved}
                  total={total}
                  colorClass={color}
                  textClass={text}
                  loading={loading}
                />
              ))}
            </div>
          </Card>

          {/* Topic coverage */}
          <Card className="p-5">
            <SectionHeader
              eyebrow="Coverage"
              title="By topic"
              icon={Layers3}
            />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {topicProgress.map(({ topic, total, solved }) => (
                <TopicCard
                  key={topic}
                  topic={topic}
                  total={total}
                  solved={solved}
                  loading={loading}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* ── Solved problem list ──────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
            <SectionHeader
              eyebrow="Completed work"
              title="Solved problems"
            />
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" aria-hidden="true" />
          </div>

          {/* Column headers */}
          {!loading && solvedDetails.length > 0 && (
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-zinc-900 bg-zinc-900/30 px-5 py-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">Title</span>
              <span className="hidden text-[10px] font-bold uppercase tracking-widest text-zinc-700 sm:block">Topic</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">Difficulty</span>
            </div>
          )}

          {loading ? (
            <div className="divide-y divide-zinc-900">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="ml-auto h-4 w-14" />
                </div>
              ))}
            </div>
          ) : solvedDetails.length > 0 ? (
            <ul role="list" className="divide-y divide-zinc-900">
              {solvedDetails.map((problem) => {
                const diff = problem.difficulty?.toLowerCase();
                const diffStyle =
                  diff === 'easy'   ? 'text-emerald-400 bg-emerald-400/[0.08] ring-1 ring-emerald-400/20' :
                  diff === 'medium' ? 'text-amber-400 bg-amber-400/[0.08] ring-1 ring-amber-400/20'       :
                  diff === 'hard'   ? 'text-rose-400 bg-rose-400/[0.08] ring-1 ring-rose-400/20'         :
                                      'text-zinc-500 bg-zinc-800 ring-1 ring-zinc-700';

                return (
                  <li key={problem._id}>
                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="group grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-900/40 focus-visible:bg-zinc-900/40 focus-visible:outline-none"
                      aria-label={`${problem.title}, ${problem.difficulty}`}
                    >
                      {/* Title */}
                      <div className="flex min-w-0 items-center gap-2.5">
                        <BookOpen
                          size={13}
                          className="shrink-0 text-zinc-700 group-hover:text-indigo-400 transition-colors"
                          aria-hidden="true"
                        />
                        <span className="truncate text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                          {problem.title}
                        </span>
                      </div>

                      {/* Topic */}
                      <span className="hidden items-center rounded-md bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-zinc-800 sm:inline-flex">
                        {formatTopic(problem.tags)}
                      </span>

                      {/* Difficulty badge */}
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${diffStyle}`}
                      >
                        {problem.difficulty}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                <Target size={18} className="text-zinc-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">No solved problems yet</p>
                <p className="mt-1 text-[13px] text-zinc-600">
                  Head to the problem list and make your first submission.
                </p>
              </div>
              <NavLink
                to="/"
                className="rounded-lg border border-zinc-800 px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition-colors"
              >
                Start practicing
              </NavLink>
            </div>
          )}
        </Card>

        {/* Bottom spacing */}
        <div className="h-4" aria-hidden="true" />
      </main>
    </div>
  );
}

export default UserDashboard;