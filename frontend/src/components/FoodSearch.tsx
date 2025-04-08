import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FoodItem {
  food_name: string;
  nf_calories: number;
  nf_protein: number;
  nf_total_fat: number;
  nf_total_carbohydrate: number;
  nf_sugars: number;
  nf_dietary_fiber: number;
  nf_sodium: number;
  nf_cholesterol: number;
}

interface NutritionInfo {
  name: string;
  calories: number;
  confidence: number;
  serving_info: string;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugars: number;
  sodium: number;
  cholesterol: number;
}

interface FoodSearchProps {
  onSelectFood: (food: NutritionInfo) => void;
  onClearQuery: () => void;
}

const FoodSearch: React.FC<FoodSearchProps> = ({
  onSelectFood,
  onClearQuery,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFoodData = async () => {
      if (query.length > 2) {
        // Start searching after 3 characters
        setLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:8000/nutritionix/search/${query}` // Adjust the endpoint as needed
          );
          setResults(response.data.foods);
        } catch (error) {
          console.error('Error fetching food data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchFoodData();
    }, 300); // Debounce the search input

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (food: FoodItem) => {
    const nutritionInfo: NutritionInfo = {
      name: food.food_name,
      calories: food.nf_calories,
      confidence: 1.0,
      serving_info: '',
      protein: food.nf_protein,
      carbohydrates: food.nf_total_carbohydrate,
      fat: food.nf_total_fat,
      fiber: food.nf_dietary_fiber,
      sugars: food.nf_sugars,
      sodium: food.nf_sodium,
      cholesterol: food.nf_cholesterol,
    };
    onSelectFood(nutritionInfo);
    setQuery('');
    onClearQuery();
  };

  return (
    <div className='mb-6'>
      <h1 className='text-2xl mt-8 font-bold text-gray-800 mb-2'>Try Manual Entry</h1>
      <input
        type='text'
        placeholder='Search for food...'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className='border border-gray-300 rounded-md p-2 w-full text-gray-700'
      />
      {loading && <p className='text-gray-500'>Loading...</p>}
      <ul className='mt-2 bg-white border border-gray-300 rounded-md shadow-md'>
        {results.map((food, index) => (
          <li
            key={index}
            onClick={() => handleSelect(food)}
            className='cursor-pointer hover:bg-gray-200 text-black bg-slate-400 p-2 transition duration-200'
          >
            {food.food_name} - {food.nf_calories} cal
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoodSearch;
