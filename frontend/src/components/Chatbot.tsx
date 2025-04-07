import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with error handling
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
);

export default function ChatBot() {
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'bot'; content: string }>
  >([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setError('API key not configured');
      return;
    }

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const chat = model.startChat({
        history: messages.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: msg.content,
        })),
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: 'bot', content: text }]);
    } catch (error) {
      console.error('Error:', error);
      setError('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
        </svg>
      </button>
    );
  }

  return (
    <div className='fixed top-4 left-4 flex flex-col h-[500px] w-[350px] bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
      <div className='bg-indigo-600 p-4 rounded-t-lg flex justify-between items-center'>
        <h2 className='text-white font-semibold'>Nutrition Assistant</h2>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className='flex justify-start'>
            <div className='bg-gray-100 rounded-lg p-3'>
              <div className='animate-pulse flex space-x-2'>
                <div className='h-2 w-2 bg-gray-400 rounded-full animate-bounce'></div>
                <div className='h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100'></div>
                <div className='h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200'></div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className='flex justify-center'>
            <div className='bg-red-100 text-red-600 rounded-lg p-3'>
              {error}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className='p-4 border-t border-gray-200'>
        <div className='flex space-x-2'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ask about nutrition, diet, or fitness...'
            className='flex-1 p-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <button
            type='submit'
            disabled={isLoading || !input.trim()}
            className='bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors'
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
