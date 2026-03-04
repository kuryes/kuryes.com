import { KazancTool } from '@/components/KazancTool';
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
    title: 'Kurye Kazanç Hesaplayıcı 2026',
    description: 'Türkiye genelinde farklı kurye firmaları için günlük ve aylık net kazanç hesaplayıcı.',
    slug: '/kazanc',
});

export default function Kazanc() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Kurye Kazanç Hesaplama Aracı</h1>
                <p className="text-lg text-gray-600">
                    Paket başı ücretinizi, günlük paket sayınızı ve yakıt masrafınızı girerek brüt ve net kurye gelirinizi öğrenin.
                </p>
            </div>
            <KazancTool />
        </div>
    );
}
