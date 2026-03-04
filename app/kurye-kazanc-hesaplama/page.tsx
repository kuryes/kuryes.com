import { Suspense } from 'react';
import { KazancTool } from '@/components/KazancTool';
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
    title: 'Kurye Kazanç Hesaplama 2026 | Paket Başı ve Saatlik Maaş Simülatörü',
    description: 'Türkiye genelinde farklı kurye firmaları için günlük ve aylık net kazanç hesaplayıcı. Paket başı ücret, KDV ve tevfikat simülatörü.',
    slug: 'kurye-kazanc-hesaplama',
});

function ToolFallback() {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-7xl mx-auto my-8 h-96 animate-pulse" />
    );
}

export default function KuryeKazancHesaplama() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Kurye Kazanç Hesaplama Aracı</h1>
                <p className="text-lg text-gray-600">
                    Paket başı ücretinizi, günlük paket sayınızı ve yakıt masrafınızı girerek brüt ve net kurye gelirinizi öğrenin.
                </p>
            </div>
            <Suspense fallback={<ToolFallback />}>
                <KazancTool />
            </Suspense>
        </div>
    );
}
