import { getPageBySlug, getPages } from '@/lib/content';
import { KazancTool } from '@/components/KazancTool';
import { generateSEO } from '@/lib/seo';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateStaticParams() {
    const pages = await getPages();
    return pages.map((page) => ({
        slug: page.slug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const page = await getPageBySlug(params.slug);
    if (!page) {
        return {
            title: 'Sayfa Bulunamadı',
        };
    }

    return generateSEO({
        title: page.title,
        description: page.intro,
        slug: params.slug,
    });
}

export default async function PseoPage({ params }: { params: { slug: string } }) {
    const page = await getPageBySlug(params.slug);

    if (!page) {
        notFound();
    }

    return (
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">{page.title}</h1>
                <p className="text-xl text-gray-600 leading-relaxed">{page.intro}</p>
            </div>

            <KazancTool
                initialPackageFee={page.package_fee}
                initialPackagesPerDay={page.packages_per_day}
                initialFuelCostPerDay={page.fuel_cost_per_day}
                initialWorkDaysPerMonth={page.work_days_per_month}
            />

            {page.content && (
                <div className="max-w-3xl mx-auto mt-12 prose prose-lg prose-red text-gray-700">
                    <p>{page.content}</p>
                </div>
            )}

            <div className="max-w-3xl mx-auto mt-16 pt-10 border-t border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ayrıca İnceleyin</h3>
                <ul className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-8">
                    <li>
                        <Link href="/getir-kurye-kazanci" className="text-red-600 hover:text-red-800 font-medium">Getir Kazanç</Link>
                    </li>
                    <li>
                        <Link href="/trendyol-kurye-kazanci" className="text-red-600 hover:text-red-800 font-medium">Trendyol Go Kazanç</Link>
                    </li>
                    <li>
                        <Link href="/yemeksepeti-kurye-kazanci" className="text-red-600 hover:text-red-800 font-medium">Yemeksepeti Kazanç</Link>
                    </li>
                </ul>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": page.title,
                        "description": page.intro,
                        "author": {
                            "@type": "Organization",
                            "name": "Kuryes",
                            "url": "https://kuryes.com"
                        }
                    })
                }}
            />
        </article>
    );
}
