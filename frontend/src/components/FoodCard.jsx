import { useState } from "react";

function FoodCard({ food, onReaction, isLiked, isDisliked, onOpenDetail, scored }) {
  const rating = food.restaurant?.rating;
  const [imageOk, setImageOk] = useState(Boolean(food.image_url));

  const stateClass = isLiked ? "is-liked" : isDisliked ? "is-disliked" : "";

  return (
    <article
      className={`food-card ${stateClass}`}
      onClick={() => onOpenDetail?.(food)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpenDetail?.(food);
      }}
    >
      <div className="food-photo">
        {imageOk ? (
          <img
            src={food.image_url}
            alt={food.name}
            loading="lazy"
            onError={() => setImageOk(false)}
          />
        ) : (
          <span>🍽️</span>
        )}
        {scored && typeof food.score === "number" && (
          <span className="food-score">Match {food.score.toFixed(3)}</span>
        )}
      </div>

      <div className="food-card-body">
        <div className="food-tags">
          {food.restaurant?.name && <span>{food.restaurant.name}</span>}
          {typeof rating === "number" && <span>★ {rating.toFixed(1)}</span>}
        </div>

        <h3>{food.name}</h3>

        <p>{food.description}</p>
      </div>

      <div className="food-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="dislike-button"
          aria-pressed={isDisliked}
          onClick={() => onReaction(food, "dislike")}
        >
          {isDisliked ? "Disliked" : "Dislike"}
        </button>
        <button
          className="like-button"
          aria-pressed={isLiked}
          onClick={() => onReaction(food, "like")}
        >
          {isLiked ? "Liked" : "Like"}
        </button>
      </div>
    </article>
  );
}

export default FoodCard;
