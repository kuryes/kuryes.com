import { Metadata } from 'next';

interface SEOProps {
    title: string;
    description: string;
    slug: string;
    image?: string;
}

export function generateSEO({ title, description, slug, image = '/pwa.png' }: SEOProps): Metadata {
    const url = `https://kuryes.com${slug === '/' ? '' : `/${slug}`}`;

    return {
        title,
        description,
        metadataBase: new URL('https://kuryes.com'),
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}
