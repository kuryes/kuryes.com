import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <div className="w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col">
                <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
                <nav className="flex-1 space-y-2">
                    <Link href="/admin/pages" className="block px-4 py-2 hover:bg-gray-700 rounded">PSEO Sayfaları</Link>
                    <Link href="/admin/pages/new" className="block px-4 py-2 hover:bg-gray-700 rounded">Yeni Ekle</Link>
                </nav>
                <Link href="/" className="block px-4 py-2 hover:bg-red-600 rounded text-sm text-gray-300">Siteye Dön</Link>
            </div>
            <div className="flex-1 p-8">
                {children}
            </div>
        </div>
    );
}
