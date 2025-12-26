'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [shop, setShop] = useState('');

  const handleLogin = () => {
    if (!shop) return;
    // Redirect to backend auth
    const shopDomain = shop.includes('.') ? shop : `${shop}.myshopify.com`;
    window.location.href = `http://localhost:4000/api/auth/shopify?shop=${shopDomain}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">ShopAI Login</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Shop Domain</label>
            <input
              type="text"
              placeholder="example.myshopify.com"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Connect with Shopify
          </button>
        </div>
      </div>
    </div>
  );
}
