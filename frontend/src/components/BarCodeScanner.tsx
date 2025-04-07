import { useEffect, useState } from 'react';
import Quagga from 'quagga';
import Tesseract from 'tesseract.js';
import { FaCamera, FaRedo } from 'react-icons/fa';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
}

const BarcodeScanner = ({ onBarcodeDetected }: BarcodeScannerProps) => {
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const initializeScanner = () => {
    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: document.getElementById('interactive'),
          constraints: {
            facingMode: 'environment', // Use back camera on mobile devices
          },
          area: { // Adjust the area to capture more of the camera feed
            top: "20%",    // top offset
            right: "10%",  // right offset
            left: "10%",   // left offset
            bottom: "20%", // bottom offset
          },
        },
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'upc_reader',
            'upc_e_reader',
            'code_128_reader', // Added more readers for flexibility
            'code_39_reader',
          ],
          debug: {
            drawBoundingBox: true,
            showPattern: true,
          },
        },
      },
      (err) => {
        if (err) {
          console.error('Error initializing Quagga:', err);
          return;
        }
        Quagga.start();
      }
    );

    // Add detection handling
    Quagga.onDetected((result) => {
      const code = result.codeResult.code;
      if (code && code !== lastScanned) {
        setLastScanned(code);
        setScanning(false);
        Quagga.stop();
        onBarcodeDetected(code);
      }
    });
  };

  const recognizeText = async (image: HTMLImageElement) => {
    const { data: { text } } = await Tesseract.recognize(image, 'eng');
    if (text) {
      const cleanedText = text.replace(/\D/g, ''); // Remove non-digit characters
      if (cleanedText.length >= 8) { // Check if it's a valid barcode length
        setLastScanned(cleanedText);
        setScanning(false);
        onBarcodeDetected(cleanedText);
      }
    }
  };

  useEffect(() => {
    if (scanning) {
      initializeScanner();
    }

    return () => {
      Quagga.stop();
    };
  }, [scanning]);

  const handleReset = () => {
    setLastScanned(null);
    setScanning(true);
  };

  return (
    <div className="relative">
      <div 
        id="interactive" 
        className="viewport relative"
        style={{ width: '100%', height: '400px' }}
      >
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-4">
            <p className="text-lg font-semibold mb-2 text-black">
              Last scanned barcode: {lastScanned}
            </p>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaRedo />
              Scan Again
            </button>
          </div>
        )}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-48 h-48 border-2 border-red-500 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-center text-gray-600">
        {scanning ? (
          <div className="flex items-center justify-center gap-2">
            <FaCamera className="text-xl" />
            <p>Center the barcode in the box</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BarcodeScanner;
