const ProgressBar = ({ percentage = 0, label }) => {
  const clamped = Math.min(100, Math.max(0, percentage));
  return (
    <div className="progress-bar-wrapper">
      {label && <p className="progress-bar-label">{label}</p>}
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${clamped}%` }} />
      </div>
      <span className="progress-bar-percentage">{clamped}%</span>
    </div>
  );
};

export default ProgressBar;
