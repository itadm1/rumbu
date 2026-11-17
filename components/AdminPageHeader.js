// Page title block used at the top of every admin page.
export default function AdminPageHeader({ title, description, children }) {
  return (
    <div className="a-pagehead">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="a-pagehead__actions">{children}</div>}
    </div>
  );
}
