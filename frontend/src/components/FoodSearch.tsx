import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FoodItem {
  food_name: string;
  nf_calories: number;
}

interface FoodSearchProps {
  onSelectFood: (food: FoodItem) => void;
  onClearQuery: () => void;
}

const FoodSearch: React.FC<FoodSearchProps> = ({ onSelectFood, onClearQuery }) => {
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
    onSelectFood(food);
    setQuery('');
    onClearQuery();
  };

  return (
    <div className='mb-6'>
      <h1 className='text-2xl font-bold text-gray-800 mb-2'>Search for Food</h1>
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
          <div key={index}>
            <li
              key={index}
              onClick={() => handleSelect(food)}
              className='cursor-pointer hover:bg-gray-200 p-2 transition duration-200'
            >
              {food.food_name} - {food.nf_calories} cal
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default FoodSearch;
