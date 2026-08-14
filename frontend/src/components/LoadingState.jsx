function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-spinner" />

      <div>
        <h3>Finding food matches...</h3>

        <p>Searching through semantic food embeddings.</p>
      </div>
    </div>
  );
}

export default LoadingState;
