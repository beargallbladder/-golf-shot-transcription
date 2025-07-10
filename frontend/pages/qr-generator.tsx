import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { NextSeo } from 'next-seo';

const QRGenerator = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [retailerId, setRetailerId] = useState('');
  const [simulatorId, setSimulatorId] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    const baseUrl = 'https://beatmybag.com';
    const params = new URLSearchParams();
    
    if (retailerId) params.append('retailer', retailerId);
    if (simulatorId) params.append('sim', simulatorId);
    params.append('source', 'qr-simulator');
    
    const fullUrl = `${baseUrl}?${params.toString()}`;
    
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        await QRCode.toCanvas(canvas, fullUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: '#1F2937',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        
        // Generate downloadable URL
        const dataUrl = canvas.toDataURL('image/png');
        setQrCodeUrl(dataUrl);
      }
    } catch (error) {
      console.error('QR Code generation failed:', error);
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `golfsimple-qr-${retailerId || 'generic'}.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && qrCodeUrl) {
      printWindow.document.write(`
        <html>
          <head>
            <title>GolfSimple QR Code - ${retailerId}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                text-align: center; 
                font-family: Arial, sans-serif;
              }
              .qr-container {
                border: 2px solid #52B788;
                border-radius: 12px;
                padding: 30px;
                margin: 20px auto;
                width: fit-content;
                background: white;
              }
              .header {
                color: #52B788;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .subtitle {
                color: #6B7280;
                font-size: 16px;
                margin-bottom: 20px;
              }
              .instructions {
                color: #374151;
                font-size: 14px;
                margin-top: 20px;
                max-width: 400px;
              }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="header">🏌️ Start Your Golf Analysis</div>
              <div class="subtitle">Scan to capture your swing at beatmybag.com</div>
              <img src="${qrCodeUrl}" alt="GolfSimple QR Code" />
              <div class="instructions">
                📱 Scan with your phone camera<br/>
                🎯 Capture your golf shots instantly<br/>
                📊 Get AI-powered analysis<br/>
                🏆 Compete on leaderboards
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      <NextSeo
        title="QR Code Generator - Golf Simulator Integration | GolfSimple"
        description="Generate QR codes for golf simulators to instantly connect customers to beatmybag.com"
        noindex={true}
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏌️ Golf Simulator QR Generator
            </h1>
            <p className="text-gray-600 mb-8">
              Create QR codes for golf simulators that link to <strong>beatmybag.com</strong>
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Configuration Panel */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retailer ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={retailerId}
                    onChange={(e) => setRetailerId(e.target.value)}
                    placeholder="e.g., golfworld-main"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Track which retailer customers came from
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Simulator ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={simulatorId}
                    onChange={(e) => setSimulatorId(e.target.value)}
                    placeholder="e.g., sim-bay-1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Track which simulator bay was used
                  </p>
                </div>

                <button
                  onClick={generateQRCode}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium transition-colors"
                >
                  🎯 Generate QR Code
                </button>

                {qrCodeUrl && (
                  <div className="flex gap-3">
                    <button
                      onClick={downloadQR}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
                    >
                      📥 Download PNG
                    </button>
                    <button
                      onClick={printQR}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 text-sm"
                    >
                      🖨️ Print
                    </button>
                  </div>
                )}
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto"
                    style={{ display: qrCodeUrl ? 'block' : 'none' }}
                  />
                  {!qrCodeUrl && (
                    <div className="text-center text-gray-500">
                      <div className="text-6xl mb-4">📱</div>
                      <p>QR code will appear here</p>
                    </div>
                  )}
                </div>

                {qrCodeUrl && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Preview URL:
                    </p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      beatmybag.com?{retailerId && `retailer=${retailerId}&`}
                      {simulatorId && `sim=${simulatorId}&`}source=qr-simulator
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Implementation Guide */}
            <div className="mt-12 bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-green-800 mb-4">
                🚀 Implementation Guide
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h3 className="font-bold text-green-700 mb-2">1. Print & Laminate</h3>
                  <ul className="text-green-600 space-y-1">
                    <li>• Print on high-quality paper</li>
                    <li>• Laminate for durability</li>
                    <li>• Size: 4"x4" recommended</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-green-700 mb-2">2. Position on Simulator</h3>
                  <ul className="text-green-600 space-y-1">
                    <li>• Near the tee area</li>
                    <li>• Eye-level placement</li>
                    <li>• Good lighting for scanning</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-green-700 mb-2">3. Customer Journey</h3>
                  <ul className="text-green-600 space-y-1">
                    <li>• Scan → beatmybag.com opens</li>
                    <li>• Capture golf shots instantly</li>
                    <li>• AI analysis & leaderboards</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRGenerator;