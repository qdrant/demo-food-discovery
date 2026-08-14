import { useState } from "react";

function FoodDetailModal({ food, onClose, onReaction, scored }) {
  const rating = food.restaurant?.rating;
  const [imageOk, setImageOk] = useState(Boolean(food.image_url));

  function react(reaction) {
    onReaction?.(food, reaction);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="how-modal food-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p>
              {food.restaurant?.name}
              {typeof rating === "number" ? `  ·  ★ ${rating.toFixed(1)}` : ""}
            </p>
            <h2>{food.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {imageOk && (
            <img
              className="food-detail-image"
              src={food.image_url}
              alt={food.name}
              onError={() => setImageOk(false)}
            />
          )}

          <p className="food-detail-desc">{food.description}</p>

          {scored && typeof food.score === "number" && (
            <div className="score">Match {food.score.toFixed(3)}</div>
          )}

          <div className="food-actions">
            <button className="dislike-button" onClick={() => react("dislike")}>
              Dislike
            </button>
            <button className="like-button" onClick={() => react("like")}>
              Like
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FoodDetailModal;
