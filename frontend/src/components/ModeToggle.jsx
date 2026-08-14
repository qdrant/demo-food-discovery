function ModeToggle({ mode }) {
  const modes = [
    {
      id: "discover",
      label: "Discover",
    },
    {
      id: "search",
      label: "Search",
    },
    {
      id: "recommend",
      label: "Taste profile",
    },
  ];

  return (
    <div className="segmented">
      {modes.map((item) => (
        <button
          key={item.id}
          className={mode === item.id ? "active" : ""}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default ModeToggle;
