interface NutritionCardProps {
  nutritionInfo: {
    name: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugars: number;
    sodium: number;
    cholesterol: number;
    serving_info: string;
    confidence: number;
  };
}

export default function NutritionCard({ nutritionInfo }: NutritionCardProps) {
  return (
    <div className='bg-white p-6 shadow-md max-w-md w-full border-gray-400 border-2'>
      <div className='border-b-4 border-black pb-2'>
        <h2 className='text-3xl font-bold text-black'>Nutrition Facts</h2>
      </div>

      <p className='text-xl text-white px-2 font-bold mt-4 rounded-md bg-gray-400'>Food Item: {nutritionInfo.name}</p>

      <div className='py-2 border-b border-gray-300'>
        <p className='font-bold text-black'>
          Serving Size: {nutritionInfo.serving_info}
        </p>
      </div>

      <div className='mt-2 text-sm text-gray-600'>
        <p className='text-black font-bold font-mono'>
          Detection Confidence: {nutritionInfo.confidence.toFixed(1)}%
        </p>
      </div>

      <div className='py-4 border-b-8 border-black'>
        <div className='flex justify-between items-baseline'>
          <h3 className='text-4xl font-bold text-black'>Calories</h3>
          <span className='text-4xl text-black font-bold'>
            {nutritionInfo.calories.toFixed(0)}
          </span>
        </div>
      </div>

      <div className='border-b border-gray-800'>
        <div className='py-2 border-b border-black'>
          <div className='flex justify-between'>
            <span className='font-bold text-black'>Total Fat</span>
            <span className='text-black'>{nutritionInfo.fat.toFixed(1)}g</span>
          </div>
        </div>

        <div className='py-2 border-b border-gray-800'>
          <div className='flex justify-between'>
            <span className='font-bold text-black'>Cholesterol</span>
            <span className='text-black'>
              {nutritionInfo.cholesterol.toFixed(1)}mg
            </span>
          </div>
        </div>

        <div className='py-2 border-b border-gray-800'>
          <div className='flex justify-between'>
            <span className='font-bold text-black'>Sodium</span>
            <span className='text-black'>
              {nutritionInfo.sodium.toFixed(1)}mg
            </span>
          </div>
        </div>

        <div className='py-2 border-b border-gray-800'>
          <div className='flex justify-between text-black'>
            <span className='font-bold'>Total Carbohydrates</span>
            <span>{nutritionInfo.carbohydrates.toFixed(1)}g</span>
          </div>
          <div className='pl-4 flex justify-between text-black'>
            <span>Dietary Fiber</span>
            <span>{nutritionInfo.fiber.toFixed(1)}g</span>
          </div>
          <div className='pl-4 flex justify-between text-black'>
            <span>Sugars</span>
            <span>{nutritionInfo.sugars.toFixed(1)}g</span>
          </div>
        </div>

        <div className='py-2'>
          <div className='flex justify-between text-black'>
            <span className='font-bold'>Protein</span>
            <span>{nutritionInfo.protein.toFixed(1)}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}
