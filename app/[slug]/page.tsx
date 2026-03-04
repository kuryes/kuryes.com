import { Suspense } from 'react';
import { getPageBySlug, getPages, parsePseoSlug } from '@/lib/content';
import { KazancTool } from '@/components/KazancTool';
import { generateSEO } from '@/lib/seo';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

function capitalizeCity(city: string): string {
  return city.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
}

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
    const { city } = parsePseoSlug(params.slug);
    const displayTitle = city
        ? `${capitalizeCity(city)} ${page.platform} Kurye Kazancı 2026`
        : page.title;

    return generateSEO({
        title: displayTitle,
        description: page.intro,
        slug: params.slug,
    });
}

export default async function PseoPage({ params }: { params: { slug: string } }) {
    const page = await getPageBySlug(params.slug);

    if (!page) {
        notFound();
    }

    const { city } = parsePseoSlug(params.slug);
    const displayTitle = city
        ? `${capitalizeCity(city)} ${page.platform} Kurye Kazancı 2026`
        : page.title;

    const allPages = await getPages();
    const otherPages = allPages.filter(p => p.slug !== params.slug);

    return (
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">{displayTitle}</h1>
                <p className="text-xl text-gray-600 leading-relaxed">{page.intro}</p>
            </div>

            <Suspense fallback={<div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-7xl mx-auto my-8 h-96 animate-pulse rounded-xl" />}>
                <KazancTool
                    initialPackageFee={page.package_fee}
                    initialPackagesPerDay={page.packages_per_day}
                    initialFuelCostPerDay={page.fuel_cost_per_day}
                    initialWorkDaysPerMonth={page.work_days_per_month}
                />
            </Suspense>

            {page.content && (
                <div className="max-w-3xl mx-auto mt-12 prose prose-lg prose-red text-gray-700">
                    <p>{page.content}</p>
                </div>
            )}

            {otherPages.length > 0 && (
                <div className="max-w-3xl mx-auto mt-16 pt-10 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Benzer hesaplamalar</h3>
                    <ul className="flex flex-col space-y-4 sm:flex-row sm:flex-wrap sm:space-y-0 sm:gap-4">
                        {otherPages.map((p) => (
                            <li key={p.slug}>
                                <Link href={`/${p.slug}`} className="text-red-600 hover:text-red-800 font-medium">
                                    {p.platform} kurye kazancı
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

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
