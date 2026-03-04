import Link from 'next/link';
import { Suspense } from 'react';
import { KazancTool } from '@/components/KazancTool';
import { generateSEO } from '@/lib/seo';
import { getPages } from '@/lib/content';

export const metadata = generateSEO({
    title: 'Kurye Ne Kadar Kazanır? 2026 Kurye Maaşları ve Kazanç Hesaplama',
    description: 'Kurye aylık ne kadar kazanır? Getir, Trendyol Go, Yemeksepeti kurye maaşları, paket başı ücretler ve net kazanç hesaplama. Kurye kazancı rehberi.',
    slug: 'kurye-ne-kadar-kazanir',
});

export default async function KuryeNeKadarKazanir() {
    const pages = await getPages();

    return (
        <div className="bg-gray-50 min-h-screen">
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Kurye Ne Kadar Kazanır?
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        2026 yılında kurye maaşları ve aylık kazanç rehberi. Platform bazlı gelirler, vergi kesintileri ve hesaplama aracı.
                    </p>
                </div>

                <div className="prose prose-lg prose-gray max-w-none mb-16">
                    <p className="text-gray-700 leading-relaxed">
                        Türkiye&apos;de motosikletli ve araçlı kurye olarak çalışanların kazançları, bağlı oldukları platforma (Getir, Trendyol Go, Yemeksepeti vb.), günlük teslim ettikleri paket sayısına, çalışma saatine ve vergi kesintilerine göre büyük farklılık gösterir. Bu sayfada kurye ne kadar kazanır sorusuna yanıt veriyor, brüt ve net kazanç hesaplama aracı ile kendi senaryonuzu test etmenizi sağlıyoruz.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Esnaf (şahıs şirketi) kuryeler genelde paket başı veya saatlik ücret alır. Paket başı çalışanlar yoğun bölgelerde ve bonuslu dönemlerde daha yüksek gelir elde edebilir; saatlik garanti ücret sunan platformlar ise siparişin az olduğu günlerde finansal güvence sağlar. KDV (%20) ve tevfikat gibi kesintiler net maaşı etkiler. Aşağıdaki hesaplama aracı ile günlük, haftalık ve aylık brüt ile net kazancınızı görebilirsiniz.
                    </p>
                </div>

                <div id="hesapla" className="mb-16">
                    <Suspense fallback={<div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-7xl mx-auto my-8 h-96 animate-pulse rounded-xl" />}>
                        <KazancTool />
                    </Suspense>
                </div>

                {pages.length > 0 && (
                    <div className="mb-16 pt-10 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Platformlara Göre Kurye Kazanç Sayfaları</h2>
                        <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                            {pages.map((p) => (
                                <li key={p.slug}>
                                    <Link href={`/${p.slug}`} className="text-red-600 hover:text-red-800 font-medium">
                                        {p.platform} kurye kazancı
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Kurye Kazancı Hakkında Sıkça Sorulanlar</h2>
                    <dl className="space-y-6">
                        <div>
                            <dt className="text-lg font-semibold text-gray-800 mb-2">Motor kurye ne kadar kazanır?</dt>
                            <dd className="text-gray-600">
                                2026 itibariyle motokurye kazançları platform, günlük paket sayısı ve vergi kesintilerine göre değişir. Günde 10 saat çalışan bir esnaf kurye aylık ortalama 40.000₺–90.000₺ brüt ciro yapabilir. Net için hesaplama aracındaki KDV ve tevfikat bölümünü kullanabilirsiniz.
                            </dd>
                        </div>
                        <div>
                            <dt className="text-lg font-semibold text-gray-800 mb-2">Trendyol kurye kazancı ne kadar?</dt>
                            <dd className="text-gray-600">
                                Trendyol Go kurye kazançları günlük paket sayısına, saatlik bonuslara ve kilometreye göre değişir. <Link href="/trendyol-kurye-kazanci" className="text-red-600 hover:underline">Trendyol kurye kazancı</Link> sayfamızdan detaylı hesaplama yapabilirsiniz.
                            </dd>
                        </div>
                        <div>
                            <dt className="text-lg font-semibold text-gray-800 mb-2">Getir kurye maaşı ne kadar?</dt>
                            <dd className="text-gray-600">
                                Getir kurye maaşları paket başı ve saatlik modellere göre farklılık gösterir. <Link href="/getir-kurye-kazanci" className="text-red-600 hover:underline">Getir kurye kazancı</Link> sayfamızda güncel ücretler ve hesaplama aracı bulunur.
                            </dd>
                        </div>
                        <div>
                            <dt className="text-lg font-semibold text-gray-800 mb-2">Kurye aylık ne kadar kazanır?</dt>
                            <dd className="text-gray-600">
                                Kurye aylık kazancı platforma, günlük paket sayısına ve çalışma gününe göre değişir. Ortalama 26 gün, günde 35–45 paket atan bir kurye aylık 60.000₺–95.000₺ brüt kazanabilir. Net kazanç KDV ve tevfikat sonrası hesaplanır.
                            </dd>
                        </div>
                    </dl>
                </div>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            mainEntity: [
                                { '@type': 'Question', name: 'Motor kurye ne kadar kazanır?', acceptedAnswer: { '@type': 'Answer', text: '2026 itibariyle motokurye kazançları platform ve günlük paket sayısına göre değişir. Günde 10 saat çalışan esnaf kurye aylık ortalama 40.000₺–90.000₺ brüt ciro yapabilir.' } },
                                { '@type': 'Question', name: 'Trendyol kurye kazancı ne kadar?', acceptedAnswer: { '@type': 'Answer', text: 'Trendyol Go kurye kazançları günlük paket sayısına, saatlik bonuslara ve kilometreye göre değişir. Sayfamızdaki hesaplama aracı ile detaylı simülasyon yapabilirsiniz.' } },
                                { '@type': 'Question', name: 'Getir kurye maaşı ne kadar?', acceptedAnswer: { '@type': 'Answer', text: 'Getir kurye maaşları paket başı ve saatlik modellere göre farklılık gösterir. Günlük 40 paket civarı atan bir kurye aylık 80.000₺–100.000₺ brüt kazanabilir.' } },
                                { '@type': 'Question', name: 'Kurye aylık ne kadar kazanır?', acceptedAnswer: { '@type': 'Answer', text: 'Kurye aylık kazancı platforma ve günlük paket sayısına göre değişir. 26 gün çalışan, günde 35–45 paket atan kurye aylık 60.000₺–95.000₺ brüt kazanabilir.' } },
                            ],
                        }),
                    }}
                />
            </article>
        </div>
    );
}
