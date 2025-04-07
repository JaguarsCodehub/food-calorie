import React from 'react';
import { FaUtensils, FaCalendarAlt } from 'react-icons/fa';

interface FoodDiaryEntry {
  name: string;
  calories: number;
  date: string;
}

interface FoodDiaryProps {
  entries: FoodDiaryEntry[];
}

const FoodDiary: React.FC<FoodDiaryProps> = ({ entries }) => {
  return (
    <div className='bg-white rounded-xl shadow-lg p-6'>
      <h2 className='text-5xl font-mono font-bold mb-4 text-black flex items-center'>
        <FaUtensils className='mr-2 text-green-500' />
        Food Diary
      </h2>
      {entries.length === 0 ? (
        <p className='text-gray-500'>No entries yet.</p>
      ) : (
        <ul className='space-y-4'>
          {entries.map((entry, index) => (
            <li key={index} className='border-b pb-2 flex justify-between items-center'>
              <div>
                <p className='font-bold text-black'>{entry.name}</p>
                <p className='text-gray-600'>Calories: {entry.calories}</p>
              </div>
              <p className='text-gray-500 flex items-center'>
                <FaCalendarAlt className='mr-1' />
                {entry.date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FoodDiary;
