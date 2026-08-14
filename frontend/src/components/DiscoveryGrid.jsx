import FoodCard from "./FoodCard";

function DiscoveryGrid({ foods, likedIds, dislikedIds, onReaction, onOpenDetail, scored }) {
  return (
    <section className="discovery-section">
      <div className="results-header">
        <div>
          <span>Recommended results</span>

          <p>Like or skip cards to refine your food discovery feed.</p>
        </div>

        <div className="result-metrics">
          <span>{foods.length} foods</span>
        </div>
      </div>

      <div className="food-grid">
        {foods.map((food) => (
          <FoodCard
            key={food.id}
            food={food}
            isLiked={likedIds.includes(food.id)}
            isDisliked={dislikedIds.includes(food.id)}
            onReaction={onReaction}
            onOpenDetail={onOpenDetail}
            scored={scored}
          />
        ))}
      </div>
    </section>
  );
}

export default DiscoveryGrid;
