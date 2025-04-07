import { FaWalking, FaRunning, FaBicycle } from 'react-icons/fa';

interface CalorieBurnInfoProps {
  calories: number;
}

const CalorieBurnInfo = ({ calories }: CalorieBurnInfoProps) => {
  // Calculate minutes needed for each activity
  // Using average metabolic equivalents (METs)
  const walkingMinutes = Math.round((calories / 4.0) * (60 / 300)); // Walking 3mph ≈ 4.0 METs
  const runningMinutes = Math.round((calories / 10.0) * (60 / 300)); // Running 6mph ≈ 10.0 METs
  const cyclingMinutes = Math.round((calories / 6.0) * (60 / 300)); // Cycling 10mph ≈ 6.0 METs

  return (
    <div className='bg-gray-50 border-2 border-black p-6'>
      <h3 className='text-lg font-semibold mb-4 text-black'>
        How long would it take to burn off {calories.toFixed(0)} Calories?
      </h3>

      <div className='space-y-3 text-black'>
        <div className='flex justify-between items-center border-b pb-2'>
          <div className='flex items-center'>
            <FaWalking className='mr-2 text-blue-500' />
            <span>Walking (3mph)</span>
          </div>
          <span className='font-medium'>{walkingMinutes} minutes</span>
        </div>

        <div className='flex justify-between items-center border-b pb-2'>
          <div className='flex items-center'>
            <FaRunning className='mr-2 text-green-500' />
            <span>Running (6mph)</span>
          </div>
          <span className='font-medium'>{runningMinutes} minutes</span>
        </div>

        <div className='flex justify-between items-center pb-2'>
          <div className='flex items-center'>
            <FaBicycle className='mr-2 text-red-500' />
            <span>Bicycling (10mph)</span>
          </div>
          <span className='font-medium'>{cyclingMinutes} minutes</span>
        </div>
      </div>

      <p className='text-sm text-gray-500 mt-4'>
        Values estimated based on person weighing 140 lbs.
      </p>
    </div>
  );
};

export default CalorieBurnInfo;
