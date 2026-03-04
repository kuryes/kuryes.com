import { getPages } from '@/lib/content';
import { deletePage } from '@/app/admin/actions';
import Link from 'next/link';

export default async function AdminPagesList() {
    const pages = await getPages();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">PSEO Sayfaları</h1>
                <Link href="/admin/pages/new" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium">
                    Yeni Sayfa Ekle
                </Link>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pages.map((p) => (
                            <tr key={p.slug}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/{p.slug}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                    <Link href={`/admin/pages/${p.slug}`} className="text-indigo-600 hover:text-indigo-900">Düzenle</Link>
                                    <form action={async () => {
                                        'use server';
                                        await deletePage(p.slug);
                                    }} className="inline">
                                        <button type="submit" className="text-red-600 hover:text-red-900">Sil</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {pages.length === 0 && (
                            <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Henüz sayfa yok.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
