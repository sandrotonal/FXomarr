'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="h-10 w-10 bg-gray-200 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{product.title}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <Link href={`/products/${product.id}`} className="text-indigo-600 hover:text-indigo-900">
                    AI Optimize
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
