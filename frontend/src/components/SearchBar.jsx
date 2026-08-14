function SearchBar({
  query,
  setQuery,
  onSearch,
  onExampleSearch,
  loading,
  examples,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <>
      <form className="search-box" onSubmit={handleSubmit}>
        <span className="search-icon">⌕</span>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for food, flavor, cuisine..."
        />

        {query && (
          <button
            type="button"
            className="clear-button"
            onClick={() => setQuery("")}
          >
            ×
          </button>
        )}

        <button className="search-submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="search-tools">
        <div>
          <span className="example-label">Example searches</span>

          <div className="chips">
            {examples.map((example) => (
              <button key={example} onClick={() => onExampleSearch(example)}>
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchBar;
