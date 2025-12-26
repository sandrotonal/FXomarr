'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { useParams } from 'next/navigation';

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // AI Params
  const [tone, setTone] = useState('Sales-oriented');
  const [language, setLanguage] = useState('en');

  // Results
  const [generatedDesc, setGeneratedDesc] = useState<any>(null);

  useEffect(() => {
    if (id) {
        api.get(`/products/${id}`).then(res => setProduct(res.data));
    }
  }, [id]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
        const res = await api.post('/products/generate-description', {
            productId: id,
            tone,
            language,
            targetAudience: 'General'
        });
        setGeneratedDesc(res.data);
    } catch (e) {
        alert("Failed to generate");
    } finally {
        setLoading(false);
    }
  };

  const handlePushToShopify = async () => {
     if (!generatedDesc) return;
     try {
         await api.put(`/products/${id}/shopify`, {
             description: generatedDesc.description
         });
         alert("Updated on Shopify!");
     } catch (e) {
         alert("Failed to update");
     }
  };

  if (!product) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div className="flex gap-6">
        {/* Left: Current Product */}
        <div className="w-1/2">
            <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
            <div className="bg-white p-6 rounded shadow mb-6">
                <h3 className="font-bold mb-2">Current Description</h3>
                <div className="prose text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h3 className="font-bold mb-4">AI Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">Tone</label>
                        <select className="w-full border p-2 rounded" value={tone} onChange={e => setTone(e.target.value)}>
                            <option>Sales-oriented</option>
                            <option>Professional</option>
                            <option>Fun/Witty</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Language</label>
                        <select className="w-full border p-2 rounded" value={language} onChange={e => setLanguage(e.target.value)}>
                            <option value="en">English</option>
                            <option value="tr">Turkish</option>
                        </select>
                    </div>
                </div>
                <button
                    disabled={loading}
                    onClick={handleGenerate}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50">
                    {loading ? 'Generating...' : 'Generate AI Description'}
                </button>
            </div>
        </div>

        {/* Right: AI Output */}
        <div className="w-1/2">
            {generatedDesc && (
                <div className="bg-white p-6 rounded shadow border-2 border-green-500">
                    <h3 className="font-bold mb-2 text-green-700">AI Suggestion</h3>
                    <div className="prose text-sm mb-4" dangerouslySetInnerHTML={{ __html: generatedDesc.description }} />

                    <div className="mb-4">
                        <h4 className="font-semibold text-sm">Key Features:</h4>
                        <ul className="list-disc pl-5 text-sm">
                            {generatedDesc.bullet_points?.map((bp: string, i: number) => <li key={i}>{bp}</li>)}
                        </ul>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handlePushToShopify}
                            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                            Push to Shopify
                        </button>
                        <button
                            onClick={() => setGeneratedDesc(null)}
                            className="px-4 py-2 border rounded hover:bg-gray-50">
                            Discard
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
