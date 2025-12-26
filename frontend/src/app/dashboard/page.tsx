'use client';
import Layout from '@/components/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
          <p className="text-3xl font-bold mt-2">124</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-medium">AI Generations</h3>
          <p className="text-3xl font-bold mt-2">45</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-medium">Saved Time</h3>
          <p className="text-3xl font-bold mt-2">12 hrs</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
           {/* Mock activity */}
           <div className="flex items-center justify-between border-b pb-2">
             <span>Generated description for "Summer T-Shirt"</span>
             <span className="text-sm text-gray-500">2 mins ago</span>
           </div>
           <div className="flex items-center justify-between border-b pb-2">
             <span>Sync completed</span>
             <span className="text-sm text-gray-500">1 hour ago</span>
           </div>
        </div>
      </div>
    </Layout>
  );
}
