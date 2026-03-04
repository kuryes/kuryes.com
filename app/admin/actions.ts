'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPages, savePages, PageData } from '@/lib/content';

export async function login(formData: FormData) {
    const password = formData.get('password') as string;
    if (password === 'Mkays!') {
        (await cookies()).set('admin_auth', 'true', { httpOnly: true, secure: true });
        redirect('/admin/pages');
    }
    return { error: 'Geçersiz şifre' };
}

export async function logout() {
    (await cookies()).delete('admin_auth');
    redirect('/admin/login');
}

export async function addPage(data: PageData) {
    const currentPages = await getPages();
    // Update or add
    const existingIndex = currentPages.findIndex(p => p.slug === data.slug);
    if (existingIndex > -1) {
        currentPages[existingIndex] = data;
    } else {
        currentPages.push(data);
    }
    await savePages(currentPages);
    redirect('/admin/pages');
}

export async function deletePage(slug: string) {
    const currentPages = await getPages();
    const updated = currentPages.filter(p => p.slug !== slug);
    await savePages(updated);
    redirect('/admin/pages');
}
