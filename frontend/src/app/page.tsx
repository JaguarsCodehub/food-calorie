'use client'
import { useState } from 'react';
import axios from 'axios';
import NutritionCard from '@/components/NutritionCard';
import FileUpload from '@/components/FileUpload';
import ChatBot from '@/components/Chatbot';
import NutritionChart from '@/components/NutritionChart';
import CalorieBurnInfo from '@/components/CalorieBurnInfo';
// import BarcodeScanner from '@/components/BarCodeScanner';
import FoodDiary from '@/components/FoodDiary';
// import { FaBarcode } from 'react-icons/fa';
// import ManualFoodEntry from '@/components/ManualFoodEntry';
import FoodSearch from '@/components/FoodSearch';

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

interface Results {
  food_items: NutritionInfo[];
  total_calories: number;
  success: boolean;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [diaryEntries, setDiaryEntries] = useState<{ name: string; calories: number; date: string }[]>([]);
  const [foodEntries, setFoodEntries] = useState<{ name: string; calories: number }[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setFile(file);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setPreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/analyze-food', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleBarcodeDetected = async (barcode: string) => {
  //   try {
  //     const response = await axios.get(`http://localhost:8000/barcode/${barcode}`);
  //     setResults(response.data);
  //   } catch (error) {
  //     console.error('Error fetching barcode data:', error);
  //   }
  // };

  const addToDiary = (item: NutritionInfo) => {
    const newEntry = {
      name: item.name,
      calories: item.calories,
      date: new Date().toLocaleDateString(),
    };
    setDiaryEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const handleAddFood = (food: { name: string; calories: number }) => {
    setFoodEntries((prevEntries) => [...prevEntries, food]);
    setTotalCalories((prevTotal) => prevTotal + food.calories);
  };

  const handleSelectFood = (food: { food_name: string; nf_calories: number }) => {
    const newFood = { name: food.food_name, calories: food.nf_calories };
    handleAddFood(newFood);
  };

  const handleDeleteFood = (index: number) => {
    const foodToDelete = foodEntries[index];
    setFoodEntries((prevEntries) => prevEntries.filter((_, i) => i !== index));
    setTotalCalories((prevTotal) => prevTotal - foodToDelete.calories);
  };

  const clearQuery = () => {
    // This function can be used to clear any additional state if needed
  };

  return (
    <div className='min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      {/* ChatBot positioned at bottom right */}
      <div className='fixed bottom-4 right-4 z-50'>
        <ChatBot />
      </div>

      <div className='max-w-fit mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Food Recognition & Calorie Estimation
          </h1>
        </div>

        {/* Main content grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Left column - Upload and Preview */}
          <div className='bg-white rounded-xl shadow-md p-8'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <FileUpload onFileSelect={setFile} onPreviewChange={setPreview} />

              {preview && (
                <div className='mt-4'>
                  <img
                    src={preview}
                    alt='Preview'
                    className='max-w-full h-auto rounded-lg'
                  />
                </div>
              )}

              <button
                type='submit'
                disabled={!file || loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </button>
            </form>
          </div>

          {/* Right column - Results */}
          <div className='bg-white rounded-xl shadow-md p-8'>
            {results ? (
              <div>
                {/* Total Calories */}
                <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
                  <p className='text-5xl font-mono font-bold text-gray-900'>
                    Total Calories: {results.total_calories.toFixed(0)}
                  </p>
                </div>

                {/* Two-column layout for chart and burn info */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
                  {/* Nutrition Chart */}
                  {results.food_items.length > 0 && (
                    <div>
                      <NutritionChart
                        protein={results.food_items.reduce(
                          (sum, item) => sum + item.protein,
                          0
                        )}
                        carbohydrates={results.food_items.reduce(
                          (sum, item) => sum + item.carbohydrates,
                          0
                        )}
                        fat={results.food_items.reduce(
                          (sum, item) => sum + item.fat,
                          0
                        )}
                      />
                    </div>
                  )}

                  {/* Calorie Burn Information */}
                  <div>
                    <CalorieBurnInfo calories={results.total_calories} />
                  </div>
                </div>

                {/* Food Items Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  {results.food_items.map((item, index) => (
                    <div key={index}>
                      <NutritionCard nutritionInfo={item} />
                      <button
                        onClick={() => addToDiary(item)}
                        className='mt-2 w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600'
                      >
                        Add to Diary
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='text-center text-gray-500'>
                Upload and analyze an image to see results
              </div>
            )}
          </div>
        </div>

        <FoodSearch onSelectFood={handleSelectFood} onClearQuery={clearQuery} />

        <div className='mt-6'>
          <h2 className='text-lg font-bold text-black'>Food Entries</h2>
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-300 rounded-lg'>
              <thead>
                <tr className='bg-gray-200 text-gray-600 uppercase text-sm leading-normal'>
                  <th className='py-3 px-6 text-left'>Food</th>
                  <th className='py-3 px-6 text-left'>Calories</th>
                  <th className='py-1 px-2 text-left'>Remove</th>
                </tr>
              </thead>
              <tbody className='text-gray-600 text-sm font-light'>
                {foodEntries.map((entry, index) => (
                  <tr
                    key={index}
                    className='border-b border-gray-300 hover:bg-gray-100'
                  >
                    <td className='py-3 px-6'>{entry.name}</td>
                    <td className='py-3 px-6'>{entry.calories} cal</td>
                    <td className='py-3 px-6'>
                      <button
                        onClick={() => handleDeleteFood(index)}
                        className='text-red-500 hover:text-red-700'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-4 font-bold text-black'>
            Total Calories: {totalCalories} cal
          </div>
        </div>

        {/* Barcode Scanner */}
        {/* <div className='bg-white mt-5 shadow-md p-8 border-black border-2'>
          <h2 className='text-4xl font-mono font-bold mb-4 flex items-center text-black'>
            <FaBarcode className='mr-2 text-green-500' />
            Scan a Barcode
          </h2>
          <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
        </div> */}

        {/* Food Diary */}
        <div className='mt-8 border-black border-2'>
          <FoodDiary entries={diaryEntries} />
        </div>

        {/* <ManualFoodEntry onAddFood={handleAddFood} /> */}
      </div>
    </div>
  );
}