// Skeleton shown while an admin page loads its data.
export default function AdminLoading() {
  return (
    <div className="a-skeleton" role="status" aria-label="Loading">
      <div className="sk sk-title" />
      <div className="sk sk-sub" />
      <div className="a-skeleton__cards">
        {[0, 1, 2, 3].map((i) => <div className="sk sk-card" key={i} />)}
      </div>
      <div className="sk sk-panel" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
