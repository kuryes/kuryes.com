import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-sm">© 2026 Kuryes</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <Link href="/gizlilik" className="hover:text-red-400 transition-colors">Gizlilik</Link>
                        <Link href="/kullanim-sartlari" className="hover:text-red-400 transition-colors">Kullanım Şartları</Link>
                        <Link href="/cerez-politikasi" className="hover:text-red-400 transition-colors">Çerez Politikası</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
