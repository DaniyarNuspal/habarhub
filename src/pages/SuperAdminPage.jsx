import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { translations } from '../i18n/translations';
import { formatDate } from '../utils/format';

const ADMIN_PASSWORD = 'oralman2026';
const ADMIN_SESSION_KEY = 'habarhub:super-admin-auth';

export default function SuperAdminPage({ language, onRefreshListings }) {
  const t = translations[language];
  const [password, setPassword] = useState('');
  const [isAuthed, setIsAuthed] = useState(() => window.localStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  const [activeTab, setActiveTab] = useState('posts');
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = useMemo(
    () => [
      { id: 'posts', label: t.adminPostsTab },
      { id: 'reports', label: t.adminReportsTab }
    ],
    [t.adminPostsTab, t.adminReportsTab]
  );

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) => {
      const categoryLabel = translations[language][post.category] || post.category || '';
      const content = [
        post.title,
        post.phone,
        post.location,
        post.category,
        categoryLabel
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return content.includes(normalizedQuery);
    });
  }, [language, posts, query]);

  useEffect(() => {
    document.title = 'HabarHub - Super Admin';
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!isAuthed) {
      return;
    }

    async function loadAdminData() {
      setIsLoading(true);

      const [{ data: postsData, error: postsError }, { data: reportsData, error: reportsError }] =
        await Promise.all([
          supabase.from('posts').select('*').order('created_at', { ascending: false }),
          supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200)
        ]);

      if (postsError) {
        console.error('Failed to load admin posts:', postsError);
      } else {
        setPosts(postsData || []);
      }

      if (reportsError) {
        console.error('Failed to load reports:', reportsError);
      } else {
        setReports(reportsData || []);
      }

      setIsLoading(false);
    }

    loadAdminData();
  }, [isAuthed]);

  function handleLogin(event) {
    event.preventDefault();

    if (password !== ADMIN_PASSWORD) {
      setToastMessage(t.adminWrongPassword);
      return;
    }

    window.localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    setIsAuthed(true);
    setPassword('');
  }

  async function handleDeletePost(id) {
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      console.error('Admin delete failed:', error);
      return;
    }

    setPosts((current) => current.filter((item) => String(item.id) !== String(id)));
    setReports((current) => current.filter((item) => String(item.post_id) !== String(id)));
    setToastMessage(t.adminActionSuccessDelete);
    await onRefreshListings?.();
  }

  async function handleHidePost(id) {
    const { error } = await supabase
      .from('posts')
      .update({ hidden: true })
      .eq('id', id);

    if (error) {
      console.error('Admin hide failed:', error);
      return;
    }

    setPosts((current) =>
      current.map((item) =>
        String(item.id) === String(id) ? { ...item, hidden: true } : item
      )
    );
    setToastMessage(t.adminActionSuccessHide);
    await onRefreshListings?.();
  }

  async function handleRestorePost(id) {
    const { error } = await supabase
      .from('posts')
      .update({ hidden: false })
      .eq('id', id);

    if (error) {
      console.error('Admin restore failed:', error);
      return;
    }

    setPosts((current) =>
      current.map((item) =>
        String(item.id) === String(id) ? { ...item, hidden: false } : item
      )
    );
    setToastMessage(t.adminActionSuccessRestore);
    await onRefreshListings?.();
  }

  async function handleIgnoreReport(id) {
    const { error } = await supabase.from('reports').delete().eq('id', id);

    if (error) {
      console.error('Ignore report failed:', error);
      return;
    }

    setReports((current) => current.filter((item) => String(item.id) !== String(id)));
    setToastMessage(t.adminActionSuccessIgnore);
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        {toastMessage ? (
          <div className="mx-auto mb-4 flex max-w-md justify-center">
            <div className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
              {toastMessage}
            </div>
          </div>
        ) : null}

        <div className="mx-auto max-w-md rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-soft">
          <h1 className="text-2xl font-black text-white">{t.adminTitle}</h1>
          <form className="mt-5 space-y-4" onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t.adminPassword}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-[#16A34A]"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white"
            >
              {t.adminEnter}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-40 mx-auto flex max-w-md justify-center px-4">
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 shadow-soft">
            {toastMessage}
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-[28px] border border-slate-800 bg-slate-900 p-5">
          <h1 className="text-2xl font-black text-white">{t.adminTitle}</h1>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-[22px] bg-slate-950 p-2">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active ? 'bg-[#16A34A] text-white' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          {activeTab === 'posts' ? (
            <div className="mt-4">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.adminSearchPlaceholder}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#16A34A]"
              />
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
            Loading...
          </div>
        ) : null}

        {!isLoading && activeTab === 'posts' ? (
          filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-[28px] border border-slate-800 bg-slate-900 p-4 shadow-soft"
              >
                <div className="space-y-2">
                  <p className="text-sm font-bold text-white">{post.title}</p>
                  <p className="text-xs text-slate-400">
                    {t.posted}: {formatDate(post.created_at, language)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.adminPostPhone}: {post.phone || '-'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.adminPostCategory}: {translations[language][post.category] || post.category}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.adminPostCity}: {post.location || '-'}
                  </p>
                  {post.hidden ? (
                    <span className="inline-flex rounded-full bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-300">
                      {t.adminHidden}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    {t.adminDeletePost}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      post.hidden ? handleRestorePost(post.id) : handleHidePost(post.id)
                    }
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200"
                  >
                    {post.hidden ? t.adminRestorePost : t.adminHidePost}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
              {query.trim() ? t.notFound : t.adminNoPosts}
            </div>
          )
        ) : null}

        {!isLoading && activeTab === 'reports' ? (
          reports.length > 0 ? (
            reports.map((report) => (
              <article
                key={report.id}
                className="rounded-[28px] border border-slate-800 bg-slate-900 p-4 shadow-soft"
              >
                <div className="space-y-2">
                  <p className="text-sm font-bold text-white">{report.post_title || '-'}</p>
                  <p className="text-xs text-slate-400">
                    {t.adminReportReason}: {report.reason}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.adminReportTime}: {formatDate(report.created_at, language)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.adminPostPhone}: {report.post_phone || '-'}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeletePost(report.post_id)}
                    className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    {t.adminDeletePost}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIgnoreReport(report.id)}
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200"
                  >
                    {t.adminIgnoreReport}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
              {t.adminNoReports}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
