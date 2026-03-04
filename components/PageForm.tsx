'use client';

import type { PageData } from '@/lib/content';
import { addPage } from '@/app/admin/actions';
import { useState } from 'react';

export default function PageForm({ initialData }: { initialData?: PageData }) {
    const [data, setData] = useState<PageData>(initialData || {
        slug: '',
        title: '',
        intro: '',
        platform: '',
        package_fee: 0,
        packages_per_day: 0,
        work_days_per_month: 26,
        fuel_cost_per_day: 0,
        content: '',
        city: undefined,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value || undefined
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addPage(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 shadow rounded">
            <div>
                <label className="block text-sm font-medium">Slug (URL)</label>
                <input name="slug" value={data.slug} onChange={handleChange} required className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-medium">Başlık (SEO Title / H1)</label>
                <input name="title" value={data.title} onChange={handleChange} required className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-medium">Platform Adı</label>
                <input name="platform" value={data.platform} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-medium">Şehir (opsiyonel, slug: city-platform-kurye-kazanci)</label>
                <input name="city" value={data.city ?? ''} onChange={handleChange} placeholder="örn: istanbul" className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-medium">Kısa Açıklama (Intro)</label>
                <textarea name="intro" value={data.intro} onChange={handleChange} required className="w-full border p-2 rounded" />
            </div>

            <h3 className="text-lg font-bold mt-6 mb-2">Varsayılan Araç Değerleri</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Paket Başı Ücret</label>
                    <input type="number" name="package_fee" value={data.package_fee} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Günlük Paket Sayısı</label>
                    <input type="number" name="packages_per_day" value={data.packages_per_day} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Aylık Çalışma Günü</label>
                    <input type="number" name="work_days_per_month" value={data.work_days_per_month} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Günlük Yakıt Gideri</label>
                    <input type="number" name="fuel_cost_per_day" value={data.fuel_cost_per_day} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">İçerik (Makale/Açıklama)</label>
                <textarea name="content" value={data.content ?? ''} onChange={handleChange} className="w-full border p-2 rounded h-32" />
            </div>

            <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700">
                Kaydet
            </button>
        </form>
    );
}
