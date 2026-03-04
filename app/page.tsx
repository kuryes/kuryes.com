import Link from 'next/link';
import { Suspense } from 'react';
import { KazancTool } from '@/components/KazancTool';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kurye Kazanç Hesaplama 2026 | Paket Başı ve Saatlik Maaşlar',
    description: 'Trendyol Go, Getir, Yemeksepeti kurye maaşları ne kadar? Günlük ve aylık paket başı kurye kazancı hesaplama aracı. Saatlik ücretler ve vergi simülatörü.',
    keywords: 'kurye maaşları, kurye kazanç hesaplama, paket başı kurye, trendyol go maaş, getir kurye maaşı, yemeksepeti kazanç, kurye kdv hesaplama, motorlu kurye',
};

export default function Home() {
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-poppins text-gray-900 mb-6 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Kurye Kazanç Hesaplama</span> ve Maaş Simülatörü 2026
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Motosikletli ve araçlı kuryeler günde, haftada veya ayda ne kadar kazanıyor? Tüm platformlar (Trendyol, Getir, Yemeksepeti) için geçerli <strong>paket başı</strong> ve <strong>saatlik</strong> gelirlerinizi hemen hesaplayın.
                    </p>
                </div>

                {/* Ana Kazanç Aracı */}
                <div id="hesapla">
                    <Suspense fallback={<div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-7xl mx-auto my-8 h-96 animate-pulse rounded-xl" />}>
                        <KazancTool />
                    </Suspense>
                </div>

                {/* PSEO Platform Linkleri */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Platformlara Göre Kurye Kazançları</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Link href="/getir-kurye-kazanci" className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-2xl font-bold">G</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Getir Kurye Kazancı</h3>
                            <p className="text-gray-600">Getir araçlı ve esnaf kurye saatlik garanti ücretleri, paket başı gelir detayları.</p>
                        </Link>

                        <Link href="/trendyol-kurye-kazanci" className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Popüler</div>
                            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-2xl font-bold">T</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">Trendyol Go Kazancı</h3>
                            <p className="text-gray-600">Trendyol Go bonus sistemleri, alevli saatler kazançları ve çalışma modelleri.</p>
                        </Link>

                        <Link href="/yemeksepeti-kurye-kazanci" className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-2xl font-bold">Y</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-500 transition-colors">Yemeksepeti Kazancı</h3>
                            <p className="text-gray-600">Yemeksepeti saha kazancı, paket sayılarına oranlı bülten ve vardiya sistemi.</p>
                        </Link>
                    </div>
                </div>

                {/* SEO Bilgi Alanı */}
                <div className="mt-24 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Kurye Kazançları Hakkında Sıkça Sorulanlar</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Motorlu Kurye Ne Kadar Kazanır?</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                2026 yılı itibariyle motokurye kazançları çalışılan platform, günlük atılan paket sayısı ve vergi kesintilerine göre büyük değişiklik gösterir. Ortalama olarak günde 10 saat çalışan bir esnaf kurye, aylık 40.000₺ ile 90.000₺ arasında brüt ciro yapabilmektedir. Net kazancı hesaplamak için araçımızdaki vergi kesintileri (KDV, Tevfikat) bölümünü kullanabilirsiniz.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Paket Başı Çalışma mı Saatlik Çalışma mı?</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Kazanç hesaplama aracımızda görebileceğiniz üzere; yoğun günlerde ve bonusların (alevli saatler vb.) yüksek olduğu bölgelerde paket başı çalışma çok daha kazançlı olabilir. Ancak siparişin az olduğu sakin dönemlerde saatlik garanti ücret sunan platformlar finansal güvence sağlar. "Bütünden tüme" aracımızı kullanarak hedefinizdeki aylık maaş için bulmanız gereken sipariş sayısını görebilirsiniz.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Şahıs Şirketi Vergi Kesintileri Nelerdir?</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Esnaf kuryeler kestiği fatura üzerinden %20 KDV öderler. Platforma göre bu KDV üzerinden %20 oranında (yani faturanın %4'ü) tevfikat uygulanabilir. KDV haricinde gelir vergisi, bağ-kur primi ve muhasebeci ücreti gibi giderler de bulunmaktadır. Aracımızın sağ kısmındaki simülatör KDV ve tevfikatı sizin için otomatik düşer.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Paket (Ekstra Paket) Ücreti Nedir?</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Çoğu platformda kurye aynı restorandan veya depodan üst üste sipariş aldığında, ikinci ve sonraki paketler için birim fiyat düşer. Örn: İlk paket 80₺ iken, aynı anda götürülen 2. paket 60₺ olarak hesaplanır. Geliştirdiğimiz algoritma Monte Carlo simülasyonu ile bunun ortalamasını alarak size en gerçekçi günlük ciroyu sunar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'Motor kurye ne kadar kazanır?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: '2026 yılı itibariyle motokurye kazançları çalışılan platform, günlük atılan paket sayısı ve vergi kesintilerine göre değişir. Günde 10 saat çalışan bir esnaf kurye aylık ortalama 40.000₺ ile 90.000₺ arasında brüt ciro yapabilmektedir.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Trendyol kurye kazancı ne kadar?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Trendyol Go kurye kazançları günlük paket sayısına, saatlik bonuslara ve kilometreye göre değişir. Aylık kazanç ortalama 35-40 paket/gün ile 70.000₺-90.000₺ brüt bandında olabilir. Hesaplama aracımızdan detaylı simülasyon yapabilirsiniz.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Getir kurye maaşı ne kadar?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Getir kurye maaşları paket başı ücret ve saatlik garanti ücret modellerine göre değişir. Günlük 40 paket civarı atan bir kurye aylık brüt 80.000₺-100.000₺ bandında kazanç elde edebilir. Kesintiler sonrası net için aracımızı kullanın.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Kurye aylık ne kadar kazanır?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Kurye aylık kazancı platforma, günlük paket sayısına ve çalışma gününe göre değişir. Ortalama 26 gün çalışan, günde 35-45 paket atan bir kurye aylık 60.000₺-95.000₺ brüt kazanabilir. Net kazanç KDV ve tevfikat kesintileri sonrası hesaplanır.',
                                },
                            },
                        ],
                    }),
                }}
            />
        </div>
    );
}
