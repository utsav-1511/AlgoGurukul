import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Edit3, Mail, Square, Trash2, UserRound } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

function ProfilePanel() {
  const { user } = useSelector((state) => state.auth);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fullName = `${user?.firstName || 'Learner'} ${user?.lastName || ''}`.trim();
  const initials = `${user?.firstName?.[0] || 'G'}${user?.lastName?.[0] || ''}`.toUpperCase();
  const handle = user?.emailId ? `@${user.emailId.split('@')[0]}` : '@learner';
  const detailRows = [
    { icon: UserRound, label: 'First name', value: user?.firstName || '-' },
    { icon: UserRound, label: 'Last name', value: user?.lastName || '-' },
    { icon: Mail, label: 'Email', value: user?.emailId || '-' },
  ];

  const onUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    setLoadingUpdate(true);
    try {
      await axiosClient.put('/profile', { firstName, lastName });
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(
        typeof err?.response?.data === 'string'
          ? err.response.data
          : err?.response?.data?.message || err?.message || 'Unable to update profile'
      );
    } finally {
      setLoadingUpdate(false);
    }
  };

  const onDelete = async () => {
    const ok = window.confirm('Are you sure you want to delete your profile?');
    if (!ok) return;

    setMessage('');
    setError('');

    setLoadingDelete(true);
    try {
      await axiosClient.delete('/profile');
      setMessage('Profile deleted successfully');
    } catch (err) {
      setError(
        typeof err?.response?.data === 'string'
          ? err.response.data
          : err?.response?.data?.message || err?.message || 'Unable to delete profile'
      );
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-700 bg-[#242421] px-5 py-6 shadow-xl shadow-black/20 sm:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-4xl font-semibold text-indigo-300">
            {initials}
          </div>

          <div className="min-w-0 pt-0.5">
            <h2 className="text-2xl font-semibold leading-tight text-zinc-100 sm:text-[28px]">
              {fullName}
            </h2>
            <p className="mt-2 text-lg font-semibold text-zinc-400">{handle}</p>

            <div className="mt-3 inline-flex min-w-[224px] items-center gap-3 rounded-full border-2 border-zinc-600/80 px-4 py-1.5 text-zinc-300">
              <Square size={14} className="shrink-0 text-indigo-400" aria-hidden="true" />
              <div className="leading-tight">
                <p className="text-sm font-semibold">Rank</p>
                <p className="text-lg font-semibold tabular-nums">--</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {detailRows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex min-w-0 items-center gap-4 text-zinc-300">
                  <Icon size={19} className="shrink-0 text-zinc-400" aria-hidden="true" />
                  <span className="truncate text-base font-semibold text-zinc-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:pt-1">
          <button
            type="button"
            onClick={() => {
              setIsEditing((v) => !v);
              setMessage('');
              setError('');
            }}
            className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-zinc-600 bg-transparent px-8 py-4 text-lg font-semibold text-zinc-100 transition-colors hover:border-zinc-400 hover:bg-zinc-800/60"
          >
            <Edit3 size={22} aria-hidden="true" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>

          <button
            disabled={loadingDelete}
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-zinc-600 bg-transparent px-8 py-4 text-lg font-semibold text-zinc-100 transition-colors hover:border-rose-500 hover:bg-rose-950/30 disabled:opacity-60"
          >
            <Trash2 size={22} aria-hidden="true" />
            {loadingDelete ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {(message || error) && (
        <div
          role={error ? 'alert' : 'status'}
          className={
            error
              ? 'mt-5 rounded-lg border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-300'
              : 'mt-5 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300'
          }
        >
          {error || message}
        </div>
      )}

      {isEditing && (
        <form onSubmit={onUpdate} className="mt-6 space-y-5 border-t border-zinc-700/70 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-400">
                First name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-[#2f2f2d] px-4 py-3 text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
                type="text"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-400">
                Last name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-[#2f2f2d] px-4 py-3 text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
                type="text"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-400">
              Email
            </label>
            <input
              value={user?.emailId || ''}
              readOnly
              className="w-full rounded-lg border border-zinc-700 bg-[#2f2f2d] px-4 py-3 text-zinc-400 outline-none"
              type="email"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              disabled={loadingUpdate}
              type="submit"
              className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 disabled:opacity-60"
            >
              {loadingUpdate ? 'Updating...' : 'Save changes'}
            </button>

            <button
              disabled={loadingDelete}
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-rose-900/80 bg-rose-950/40 px-5 py-3 text-sm font-semibold text-rose-300 transition-colors hover:border-rose-600 hover:bg-rose-950/70 disabled:opacity-60"
            >
              {loadingDelete ? 'Deleting...' : 'Delete account'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default ProfilePanel;
