export const Loader = ({ text = "Loading..." }) => (
  <div className="loader">
    <div className="spinner" />
    <p>{text}</p>
  </div>
);

export const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return <div className="error-banner">⚠️ {message}</div>;
};

export const EmptyState = ({ icon = "📭", text = "Nothing here yet" }) => (
  <div className="empty-state">
    <span className="empty-icon">{icon}</span>
    <p>{text}</p>
  </div>
);
