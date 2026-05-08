import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { translations } from '../i18n/translations';
import { formatDate } from '../utils/format';

const ADMIN_PASSWORD = '85208520ffff';
const ADMIN_SESSION_KEY = 'habarhub:super-admin-auth';

function toDisplayTitle(value) {
  if (value && typeof value === 'object') {
    return value.zh || value.en || value.ru || value.kk || '';
  }

  return value || '';
}

function isDeletedPost(post) {
  return Boolean(post?.is_deleted || post?.deleted_at || post?.status === 'deleted');
}

function isHiddenPost(post) {
  return Boolean(post?.hidden || post?.is_hidden || post?.status === 'hidden');
}

function getDeletePayload(post) {
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(post, 'is_deleted')) {
    payload.is_deleted = true;
  }

  if (Object.prototype.hasOwnProperty.call(post, 'deleted_at')) {
    payload.deleted_at = new Date().toISOString();
  }

  if (Object.prototype.hasOwnProperty.call(post, 'status')) {
    payload.status = 'deleted';
  }

  return payload;
}

function getRestoreDeletedPayload(post) {
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(post, 'is_deleted')) {
    payload.is_deleted = false;
  }

  if (Object.prototype.hasOwnProperty.call(post, 'deleted_at')) {
    payload.deleted_at = null;
  }

  if (Object.prototype.hasOwnProperty.call(post, 'status')) {
    payload.status = isHiddenPost(post) ? 'hidden' : 'active';
  }

  return payload;
}

export default function SuperAdminPage({ language, onRefreshListings }) {
  const t = translations[language];
  const [password, setPassword] = useState('');
  const [isAuthed, setIsAuthed] = useState(
    () => window.localStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  );
  const [activeTab, setActiveTab] = useState('posts');
  const [postFilter, setPostFilter] = useState('normal');
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTone, setToastTone] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = useMemo(
    () => [
      { id: 'posts', label: t.adminPostsTab },
      { id: 'reports', label: t.adminReportsTab }
    ],
    [t.adminPostsTab, t.adminReportsTab]
  );

  const postFilters = useMemo(
    () => [
      { id: 'all', label: t.adminFilterAll },
      { id: 'normal', label: t.adminFilterNormal },
      { id: 'hidden', label: t.adminFilterHidden },
      { id: 'deleted', label: t.adminFilterDeleted }
    ],
    [t.adminFilterAll, t.adminFilterDeleted, t.adminFilterHidden, t.adminFilterNormal]
  );

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visiblePosts = posts.filter((post) => {
      if (postFilter === 'all') {
        return true;
      }

      if (postFilter === 'hidden') {
        return isHiddenPost(post) && !isDeletedPost(post);
      }

      if (postFilter === 'deleted') {
        return isDeletedPost(post);
      }

      return !isHiddenPost(post) && !isDeletedPost(post);
    });

    if (!normalizedQuery) {
      return visiblePosts;
    }

    return visiblePosts.filter((post) => {
      const categoryLabel = translations[language][post.category] || post.category || '';
      const content = [
        toDisplayTitle(post.title),
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
  }, [language, postFilter, posts, query]);

  useEffect(() => {
    document.title = 'HabarHub - Super Admin';
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2600);

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
        setToastTone('error');
        setToastMessage(t.adminActionError);
      } else {
        setPosts(postsData || []);
      }

      if (reportsError) {
        console.error('Failed to load reports:', reportsError);
        setToastTone('error');
        setToastMessage(t.adminReportsLoadError);
      } else {
        setReports(reportsData || []);
      }

      setIsLoading(false);
    }

    loadAdminData();
  }, [isAuthed, t.adminActionError, t.adminReportsLoadError]);

  function showToast(message, tone = 'success') {
    setToastTone(tone);
    setToastMessage(message);
  }

  function handleLogin(event) {
    event.preventDefault();

    if (password !== ADMIN_PASSWORD) {
      showToast(t.adminWrongPassword, 'error');
      return;
    }

    window.localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    setIsAuthed(true);
    setPassword('');
  }

  async function handleDeletePost(id) {
    if (!window.confirm(t.deleteConfirm)) {
      return;
    }

    const targetPost = posts.find((item) => String(item.id) === String(id));
    if (!targetPost) {
      showToast(t.adminActionError, 'error');
      return;
    }

    const deletePayload = getDeletePayload(targetPost);

    if (!Object.keys(deletePayload).length) {
      console.error('Admin soft delete failed: no soft-delete columns found on posts row');
      showToast(t.adminSoftDeleteConfigError || t.adminActionError, 'error');
      return;
    }

    const { error } = await supabase.from('posts').update(deletePayload).eq('id', id);

    if (error) {
      console.error('Admin soft delete failed:', error);
      showToast(error.message || t.adminActionError, 'error');
      return;
    }

    setPosts((current) =>
      current.map((item) =>
        String(item.id) === String(id) ? { ...item, ...deletePayload } : item
      )
    );
    setReports((current) => current.filter((item) => String(item.post_id) !== String(id)));
    showToast(t.adminActionSuccessDelete);
    await onRefreshListings?.();
  }

  async function handlePermanentlyDeletePost(id) {
    if (!window.confirm(t.adminPermanentDeleteConfirm || t.deleteConfirm)) {
      return;
    }

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      console.error('Admin permanent delete failed:', error);
      showToast(error.message || t.adminActionError, 'error');
      return;
    }

    setPosts((current) => current.filter((item) => String(item.id) !== String(id)));
    setReports((current) => current.filter((item) => String(item.post_id) !== String(id)));
    showToast(t.adminActionSuccessPermanentDelete || t.adminActionSuccessDelete);
    await onRefreshListings?.();
  }

  async function handleHidePost(id) {
    const targetPost = posts.find((item) => String(item.id) === String(id));
    const hidePayload = { hidden: true };

    if (targetPost && Object.prototype.hasOwnProperty.call(targetPost, 'is_hidden')) {
      hidePayload.is_hidden = true;
    }

    if (targetPost && Object.prototype.hasOwnProperty.call(targetPost, 'status')) {
      hidePayload.status = 'hidden';
    }

    const { error } = await supabase.from('posts').update(hidePayload).eq('id', id);

    if (error) {
      console.error('Admin hide failed:', error);
      showToast(error.message || t.adminActionError, 'error');
      return;
    }

    setPosts((current) =>
      current.map((item) =>
        String(item.id) === String(id) ? { ...item, ...hidePayload } : item
      )
    );
    showToast(t.adminActionSuccessHide);
    await onRefreshListings?.();
  }

  async function handleRestorePost(id) {
    const targetPost = posts.find((item) => String(item.id) === String(id));
    if (!targetPost) {
      showToast(t.adminActionError, 'error');
      return;
    }

    const restorePayload = isDeletedPost(targetPost)
      ? getRestoreDeletedPayload(targetPost)
      : { hidden: false };

    if (!isDeletedPost(targetPost) && Object.prototype.hasOwnProperty.call(targetPost, 'is_hidden')) {
      restorePayload.is_hidden = false;
    }

    if (!isDeletedPost(targetPost) && Object.prototype.hasOwnProperty.call(targetPost, 'status')) {
      restorePayload.status = 'active';
    }

    const { error } = await supabase.from('posts').update(restorePayload).eq('id', id);

    if (error) {
      console.error('Admin restore failed:', error);
      showToast(error.message || t.adminActionError, 'error');
      return;
    }

    setPosts((current) =>
      current.map((item) =>
        String(item.id) === String(id) ? { ...item, ...restorePayload } : item
      )
    );
    showToast(t.adminActionSuccessRestore);
    await onRefreshListings?.();
  }

  async function handleResolveReport(id) {
    const { error } = await supabase
      .from('reports')
      .update({ status: 'processed' })
      .eq('id', id);

    if (error) {
      console.error('Resolve report failed:', error);
      showToast(t.adminActionError, 'error');
      return;
    }

    setReports((current) =>
      current.map((item) =>
        String(item.id) === String(id) ? { ...item, status: 'processed' } : item
      )
    );
    showToast(t.adminActionSuccessProcess);
  }

  async function handleIgnoreReport(id) {
    const { error } = await supabase.from('reports').delete().eq('id', id);

    if (error) {
      console.error('Ignore report failed:', error);
      showToast(t.adminActionError, 'error');
      return;
    }

    setReports((current) => current.filter((item) => String(item.id) !== String(id)));
    showToast(t.adminActionSuccessIgnore);
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
        {toastMessage ? (
          <div className="mx-auto mb-4 flex max-w-md justify-center">
            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-soft ${
                toastTone === 'error' ? 'bg-rose-500' : 'bg-[#16A34A]'
              }`}
            >
              {toastMessage}
            </div>
          </div>
        ) : null}

        <div className="mx-auto max-w-md rounded-[30px] bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#16A34A]">
            HabarHub Admin
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {t.adminTitle}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t.adminLoginHint}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t.adminPassword}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#16A34A]"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15803D]"
            >
              {t.adminEnter}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-40 mx-auto flex max-w-md justify-center px-4">
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-soft ${
              toastTone === 'error' ? 'bg-rose-500' : 'bg-[#16A34A]'
            }`}
          >
            {toastMessage}
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-[1320px] space-y-4">
        <section className="rounded-[30px] bg-gradient-to-br from-emerald-50 via-white to-slate-100 p-5 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#16A34A]">
                HabarHub Admin
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                {t.adminTitle}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {t.adminPanelHint}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-[22px] bg-white p-2 shadow-soft">
              {tabs.map((tab) => {
                const active = tab.id === activeTab;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active ? 'bg-[#16A34A] text-white' : 'text-slate-500'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'posts' ? (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-[22px] bg-white p-2 shadow-soft md:grid-cols-4">
                {postFilters.map((filter) => {
                  const active = filter.id === postFilter;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setPostFilter(filter.id)}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        active ? 'bg-[#16A34A] text-white' : 'text-slate-500'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.adminSearchPlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#16A34A]"
              />
            </div>
          ) : null}
        </section>

        {isLoading ? (
          <div className="rounded-[28px] bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
            Loading...
          </div>
        ) : null}

        {!isLoading && activeTab === 'posts' ? (
          filteredPosts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredPosts.map((post) => (
                <article key={post.id} className="rounded-[28px] bg-white p-5 shadow-soft">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-bold leading-6 text-slate-900">
                        {toDisplayTitle(post.title) || '-'}
                      </h2>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {isDeletedPost(post) ? (
                          <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
                            {t.adminFilterDeleted}
                          </span>
                        ) : null}
                        {isHiddenPost(post) && !isDeletedPost(post) ? (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                            {t.adminHidden}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      {t.posted}: {formatDate(post.created_at, language)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.adminPostPhone}: {post.phone || '-'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.adminPostCategory}: {translations[language][post.category] || post.category || '-'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.adminPostCity}: {post.location || '-'}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        isDeletedPost(post)
                          ? handlePermanentlyDeletePost(post.id)
                          : handleDeletePost(post.id)
                      }
                      className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white"
                    >
                      {isDeletedPost(post)
                        ? t.adminPermanentDelete || t.adminDeletePost
                        : t.adminDeletePost}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        isHiddenPost(post) ? handleRestorePost(post.id) : handleHidePost(post.id)
                      }
                      disabled={false}
                      className="rounded-2xl border border-[#16A34A]/20 bg-[#16A34A]/5 px-4 py-3 text-sm font-semibold text-[#16A34A]"
                    >
                      {isDeletedPost(post)
                        ? t.adminRestorePost
                        : isHiddenPost(post)
                          ? t.adminRestorePost
                          : t.adminHidePost}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
              {query.trim() ? t.notFound : t.adminNoPosts}
            </div>
          )
        ) : null}

        {!isLoading && activeTab === 'reports' ? (
          reports.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reports.map((report) => {
                const processed = report.status === 'processed';

                return (
                  <article key={report.id} className="rounded-[28px] bg-white p-5 shadow-soft">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-base font-bold leading-6 text-slate-900">
                          {report.post_title || '-'}
                        </h2>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            processed
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {processed ? t.adminProcessed : t.adminPending}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {t.adminReportTime}: {formatDate(report.created_at, language)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t.adminReportReason}: {report.reason || '-'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t.adminReportStatus}: {processed ? t.adminProcessed : t.adminPending}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t.adminPostPhone}: {report.post_phone || '-'}
                      </p>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
                        <span className="font-semibold text-slate-700">{t.adminReportDetail}: </span>
                        {report.detail?.trim() || t.adminNoDetail}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleHidePost(report.post_id)}
                        className="rounded-2xl border border-[#16A34A]/20 bg-[#16A34A]/5 px-4 py-3 text-sm font-semibold text-[#16A34A]"
                      >
                        {t.adminHidePost}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePost(report.post_id)}
                        className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white"
                      >
                        {t.adminDeletePost}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report.id)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        {t.adminProcessReport}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleIgnoreReport(report.id)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500"
                      >
                        {t.adminIgnoreReport}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
              {t.adminNoReports}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
