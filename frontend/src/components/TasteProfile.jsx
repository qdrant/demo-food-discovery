function TasteProfile({ likedCount, dislikedCount, onClear }) {
  const total = likedCount + dislikedCount;

  return (
    <div className="taste-profile">
      <div>
        <span>Taste profile</span>

        <strong>
          {total > 0 ? `${total} choices made` : "Start liking foods"}
        </strong>

        <p>Likes and dislikes guide the semantic recommendations.</p>
      </div>

      <div className="taste-stats">
        <div>
          <span>Liked</span>

          <strong>{likedCount}</strong>
        </div>

        <div>
          <span>Skipped</span>

          <strong>{dislikedCount}</strong>
        </div>

        {total > 0 && <button onClick={onClear}>Reset</button>}
      </div>
    </div>
  );
}

export default TasteProfile;
