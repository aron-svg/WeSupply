type Meal = {
  name: string;
  calories: number;
};

type CalorieTrackerProps = {
  dailyGoal: number;
  todaysMeals: Meal[];
};

export default function CalorieTracker({ dailyGoal, todaysMeals }: CalorieTrackerProps) {
  const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const percentage = Math.round((totalCalories / dailyGoal) * 100);
  const progressWidth = Math.min(percentage, 100);

  // Determine bar color based on percentage
  const getBarColor = () => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage < 40) return 'bg-red-400';
    if (percentage < 80) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  // Determine text color based on percentage
  const getTextColor = () => {
    if (percentage > 100) return 'text-red-600';
    if (percentage < 40) return 'text-red-600';
    if (percentage < 80) return 'text-orange-600';
    return 'text-emerald-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Today's Calorie Intake</h3>
      
      {/* Meals List */}
      <div className="space-y-3 mb-6">
        {todaysMeals.map((meal, index) => (
          <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-700 font-medium">{meal.name}</span>
            <span className="text-gray-900 font-semibold">{meal.calories} cal</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-4 text-lg font-bold">
        <span className="text-gray-900">Total</span>
        <span className={getTextColor()}>{totalCalories} / {dailyGoal} cal</span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="text-center">
        <span className={`text-lg font-bold ${getTextColor()}`}>
          {percentage}% of daily goal
        </span>
      </div>

      {/* Dynamic Messages */}
      {percentage < 40 ? (
        <p className="text-center text-lg font-semibold text-red-600 mt-3 animate-pulse">
          🍽️ Don't forget to eat enough!
        </p>
      ) : percentage < 80 ? (
        <p className="text-center text-lg font-semibold text-orange-600 mt-3 animate-pulse">
          💪 Keep up!
        </p>
      ) : percentage >= 85 && percentage < 100 ? (
        <p className="text-center text-lg font-semibold text-emerald-600 mt-3 animate-pulse">
          🎯 You're almost there!
        </p>
      ) : percentage > 100 ? (
        <p className="text-center text-lg font-semibold text-red-600 mt-3 animate-pulse">
          ⚠️ Take it easy tomorrow!
        </p>
      ) : null}

      {/* Status Message */}
      {percentage > 100 ? (
        <p className="text-center text-sm text-red-600 mt-2">
          You've exceeded your daily goal by {totalCalories - dailyGoal} calories
        </p>
      ) : percentage >= 80 && percentage < 85 ? (
        <p className="text-center text-sm text-gray-600 mt-2">
          {dailyGoal - totalCalories} calories remaining today
        </p>
      ) : null}
    </div>
  );
}
