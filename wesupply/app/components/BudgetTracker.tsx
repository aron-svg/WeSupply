type GroceryItem = {
  name: string;
  details: string;
  price: number;
};

type BudgetTrackerProps = {
  weeklyBudget: number;
  items: GroceryItem[];
  taxRate?: number;
};

export default function BudgetTracker({ weeklyBudget, items, taxRate = 0.05 }: BudgetTrackerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const percentage = Math.round((total / weeklyBudget) * 100);
  const progressWidth = Math.min(percentage, 100);
  const remaining = weeklyBudget - total;

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🛒</span>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Weekly Shopping List</h3>
          <p className="text-sm text-gray-500">{currentDate}</p>
        </div>
      </div>
      
      <div className="border-t-2 border-dashed border-gray-200 pt-6 mb-6"></div>
      
      {/* Items List */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-start">
            <div>
              <p className="text-gray-900 font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">{item.details}</p>
            </div>
            <span className="text-gray-900 font-semibold">${item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-dashed border-gray-200 pt-4 mb-4"></div>

      {/* Subtotal */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700">Subtotal</span>
        <span className="text-gray-900 font-semibold">${subtotal.toFixed(2)}</span>
      </div>

      {/* Tax */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <span className="text-gray-700">Tax ({(taxRate * 100).toFixed(0)}%)</span>
        <span className="text-gray-900 font-semibold">${tax.toFixed(2)}</span>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6 text-xl font-bold">
        <span className="text-gray-900">Total</span>
        <span className="text-emerald-600">${total.toFixed(2)}</span>
      </div>

      {/* Weekly Budget Progress */}
      <div className="bg-emerald-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Weekly Budget</span>
          <span className="text-sm font-bold text-gray-900">
            ${total.toFixed(2)} / ${weeklyBudget.toFixed(2)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-500 ${
              percentage > 100 ? 'bg-red-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* Status Message */}
        {remaining > 0 ? (
          <p className="text-center text-sm font-semibold text-emerald-600">
            You're <span className="text-emerald-700">${remaining.toFixed(2)} under budget</span> this week! 🔥
          </p>
        ) : (
          <p className="text-center text-sm font-semibold text-red-600">
            ⚠️ You're ${Math.abs(remaining).toFixed(2)} over budget this week!
          </p>
        )}
      </div>
    </div>
  );
}
