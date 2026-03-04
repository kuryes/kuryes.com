import { getPageBySlug } from '@/lib/content';
import PageForm from '@/components/PageForm';

export default async function EditPage({ params }: { params: { slug: string } }) {
    const page = await getPageBySlug(params.slug);

    if (!page) return <p>Sayfa bulunamadı.</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">PSEO Sayfasını Düzenle</h1>
            <PageForm initialData={page} />
        </div>
    );
}
