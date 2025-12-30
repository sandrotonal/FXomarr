import React from 'react';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r h-screen fixed">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary">ShopAI SaaS</h1>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href="/products" className="block px-6 py-3 text-gray-700 hover:bg-gray-100">
            Products
          </Link>
        </nav>
      </aside>
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
