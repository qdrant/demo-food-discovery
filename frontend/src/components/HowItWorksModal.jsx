function HowItWorksModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="how-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p>How it works</p>

            <h2>Food discovery powered by semantic search</h2>
          </div>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="pipeline">
            <div className="pipeline-node">
              <span>1</span>

              <strong>Food data</strong>

              <p>
                Each food has a name, cuisine, description, flavors, and tags.
              </p>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-node">
              <span>2</span>

              <strong>Embeddings</strong>

              <p>
                Dish images are indexed as CLIP embeddings ahead of time. Your
                text query is vectorized with the same model at search time.
              </p>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-node">
              <span>3</span>

              <strong>Vector search</strong>

              <p>
                Qdrant searches the collection for the nearest dish vectors.
              </p>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-node">
              <span>4</span>

              <strong>Taste profile</strong>

              <p>
                Likes and dislikes steer the next set of results.
              </p>
            </div>
          </div>

          <div className="how-section">
            <h3>What the app demonstrates</h3>

            <div className="mode-grid">
              <div className="mode-card">
                <span>Search</span>

                <p>
                  Search by meaning, not just exact words. For example, “spicy
                  noodles” can find ramen, pho, or other similar dishes.
                </p>
              </div>

              <div className="mode-card">
                <span>Recommendations</span>

                <p>
                  With the average-vector strategy, likes are averaged into one
                  taste vector. Best-score, the default, scores each like
                  separately and keeps the strongest match.
                </p>
              </div>

              <div className="mode-card">
                <span>Dislikes</span>

                <p>
                  Dislikes push the search away from those vectors. They are
                  negative examples, not a filter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HowItWorksModal;
