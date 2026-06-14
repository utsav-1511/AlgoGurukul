    import { useEffect, useState } from 'react';
    import { NavLink } from 'react-router';
    import { useDispatch, useSelector } from 'react-redux';
    import axiosClient from '../utils/axiosClient';
    import { logoutUser } from '../authSlice';
    import {
    BookOpen, CheckCircle2, Code2, LogOut,
    Shield, UserCircle, ChevronDown, BarChart2
    } from 'lucide-react';

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    /** Maps a difficulty string to the matching DaisyUI badge + text color classes. */
    const getDifficultyBadgeColor = (difficulty = '') => {
    switch (difficulty.toLowerCase()) {
        case 'easy':   return 'badge-success';
        case 'medium': return 'badge-warning';
        case 'hard':   return 'badge-error';
        default:       return 'badge-neutral';
    }
    };

    /** Returns a Tailwind text-color class for the mini progress bars. */
    const getDifficultyBarColor = (level) => {
    switch (level) {
        case 'easy':   return 'bg-success';
        case 'medium': return 'bg-warning';
        case 'hard':   return 'bg-error';
        default:       return 'bg-base-content';
    }
    };

    // ─── Component ────────────────────────────────────────────────────────────────

    function Homepage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [problems, setProblems]           = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [filters, setFilters]             = useState({
        difficulty: 'all',
        tag:        'all',
        status:     'all',
    });

    // Fetch all problems + solved list on mount / user change
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

    /** Dispatch logout action and wipe local solved list. */
    const handleLogout = () => {
        dispatch(logoutUser());
        setSolvedProblems([]);
    };

    // ── Derived data ────────────────────────────────────────────────────────────

    /** Problems visible after applying the three active filters. */
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

    const solvedCount = solvedProblems.length;

    /** { easy: N, medium: N, hard: N } counts across all problems. */
    const difficultyCounts = problems.reduce((counts, problem) => {
        counts[problem.difficulty] = (counts[problem.difficulty] || 0) + 1;
        return counts;
    }, {});

    /** Completion percentage, capped at 100. */
    const completionPct =
        problems.length > 0
        ? Math.round((solvedCount / problems.length) * 100)
        : 0;

    // ── Render ──────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-base-100">

        {/* ── Navbar ── */}
        <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-base-300/60 bg-base-100/90 px-6 backdrop-blur-md h-14">

            {/* Brand */}
            <NavLink to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-content">
                <Code2 size={15} />
            </span>
            AlgoGurukul
            </NavLink>

            {/* User menu */}
            <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                className="btn btn-ghost btn-sm flex items-center gap-2 normal-case font-medium"
            >
                {/* Avatar circle with user initial */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20">
                {user?.firstName?.[0]?.toUpperCase() || 'G'}
                </div>
                <span className="hidden sm:inline">{user?.firstName || 'Guest'}</span>
                <ChevronDown size={14} className="text-base-content/40" />
            </div>

            <ul className="dropdown-content menu menu-sm mt-2 w-44 rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-lg">
                {/* Admin link — only shown to admins */}
                {user?.role === 'admin' && (
                <li>
                    <NavLink to="/admin" className="gap-2 rounded-lg text-sm">
                    <Shield size={14} />
                    Admin panel
                    </NavLink>
                </li>
                )}
                <li>
                <button
                    onClick={handleLogout}
                    className="gap-2 rounded-lg text-sm text-error/80 hover:text-error hover:bg-error/10"
                >
                    <LogOut size={14} />
                    Log out
                </button>
                </li>
            </ul>
            </div>
        </nav>

        {/* ── Main ── */}
        <main className="mx-auto w-full max-w-5xl px-4 py-8 lg:py-10">

            {/* ── Hero grid: summary + difficulty breakdown ── */}
            <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_220px]">

            {/* Left: headline + stat chips */}
            <div className="rounded-2xl border border-base-300/60 bg-base-200/40 p-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
                Practice dashboard
                </p>
                <h1 className="text-3xl font-bold tracking-tight">Problem Set</h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/55">
                Filter by status, difficulty, and topic. Open any problem to code,
                run examples, and use the AI helper.
                </p>

                {/* Stat chips */}
                <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-xl border border-base-300/60 bg-base-100 px-4 py-3">
                    <div className="text-2xl font-bold leading-none">{problems.length}</div>
                    <div className="mt-1 text-[11px] text-base-content/45">Total problems</div>
                </div>
                <div className="rounded-xl border border-base-300/60 bg-base-100 px-4 py-3">
                    <div className="text-2xl font-bold leading-none text-success">{solvedCount}</div>
                    <div className="mt-1 text-[11px] text-base-content/45">Solved</div>
                </div>
                <div className="rounded-xl border border-base-300/60 bg-base-100 px-4 py-3">
                    <div className="text-2xl font-bold leading-none text-base-content/70">
                    {completionPct}%
                    </div>
                    <div className="mt-1 text-[11px] text-base-content/45">Completion</div>
                </div>
                </div>
            </div>

            {/* Right: difficulty breakdown with mini bars */}
            <div className="rounded-2xl border border-base-300/60 bg-base-200/40 p-6">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-base-content/40">
                <BarChart2 size={13} />
                Difficulty mix
                </div>

                <div className="space-y-4">
                {['easy', 'medium', 'hard'].map((level) => {
                    const count = difficultyCounts[level] || 0;
                    const pct   = problems.length > 0 ? (count / problems.length) * 100 : 0;
                    return (
                    <div key={level}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="capitalize font-medium text-base-content/70">{level}</span>
                        <span className={`badge badge-sm ${getDifficultyBadgeColor(level)}`}>
                            {count}
                        </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-300/50">
                        <div
                            className={`h-full rounded-full ${getDifficultyBarColor(level)} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                        />
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>
            </section>

            {/* ── Filter bar ── */}
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-base-300/60 bg-base-200/40 px-4 py-3">
            {/* Label */}
            <span className="text-[11px] font-semibold uppercase tracking-widest text-base-content/35 mr-1">
                Filter
            </span>

            {/* Status filter */}
            <select
                className="select select-bordered select-sm min-w-[150px] rounded-lg bg-base-100 text-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
                <option value="all">All problems</option>
                <option value="solved">Solved only</option>
            </select>

            {/* Difficulty filter */}
            <select
                className="select select-bordered select-sm min-w-[150px] rounded-lg bg-base-100 text-sm"
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
                <option value="all">All difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>

            {/* Tag filter */}
            <select
                className="select select-bordered select-sm min-w-[150px] rounded-lg bg-base-100 text-sm"
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            >
                <option value="all">All topics</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
                <option value="math">Math</option>
            </select>

            {/* Live result count */}
            <span className="ml-auto text-[12px] text-base-content/40">
                {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''}
            </span>
            </div>

            {/* ── Problem list ── */}
            <div className="overflow-hidden rounded-2xl border border-base-300/60 bg-base-200/40">

            {/* Column headings */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-base-300/60 bg-base-100/60 px-5 py-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/30">Title</span>
                <span className="hidden text-[10px] font-bold uppercase tracking-widest text-base-content/30 sm:block">Topic</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/30">Status</span>
            </div>

            {filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => {
                const isSolved = solvedProblems.some((sp) => sp._id === problem._id);

                return (
                    <NavLink
                    key={problem._id}
                    to={`/problem/${problem._id}`}
                    className="group grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-base-300/50 px-5 py-4 transition-colors hover:bg-base-100/70 last:border-b-0"
                    >
                    {/* Title + badges */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                        {/* Coloured icon accent */}
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                            <BookOpen size={14} />
                        </span>
                        <h2 className="truncate text-sm font-semibold">{problem.title}</h2>
                        </div>

                        {/* Difficulty + tag badges (tag only visible when tag col is hidden on mobile) */}
                        <div className="mt-2 flex gap-2 pl-9">
                        <div className={`badge badge-sm ${getDifficultyBadgeColor(problem.difficulty)}`}>
                            {problem.difficulty}
                        </div>
                        <div className="badge badge-sm badge-outline sm:hidden">
                            {problem.tags}
                        </div>
                        </div>
                    </div>

                    {/* Topic badge — hidden on small screens */}
                    <div className="hidden sm:block">
                        <span className="badge badge-outline badge-sm">{problem.tags}</span>
                    </div>

                    {/* Solved / Open status */}
                    {isSolved ? (
                        <div className="flex items-center gap-1.5 text-success text-xs font-semibold">
                        <CheckCircle2 size={14} />
                        Solved
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-base-content/30 text-xs font-medium">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-base-content/20" />
                        Open
                        </div>
                    )}
                    </NavLink>
                );
                })
            ) : (
                /* Empty state */
                <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-300/40">
                    <BookOpen size={22} className="text-base-content/30" />
                </div>
                <p className="text-sm font-medium text-base-content/50">
                    No problems match those filters.
                </p>
                <button
                    className="btn btn-xs btn-ghost text-primary"
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