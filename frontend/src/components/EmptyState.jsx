function EmptyState({ tasteCount, onReset }) {
  return (
    <div className="empty-state">
      <div className="empty-state-header">
        <span>No foods showing</span>

        <h3>Try refreshing your discovery feed</h3>

        <p>
          {tasteCount > 0
            ? "You have liked or skipped everything currently visible."
            : "Search for a flavor, cuisine, or food style to begin."}
        </p>
      </div>

      <button className="compare-button" onClick={onReset}>
        Reset discovery
      </button>
    </div>
  );
}

export default EmptyState;
