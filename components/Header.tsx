import Link from 'next/link';

export function Header() {
    return (
        <>
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <img src="/logo.svg" alt="KURYΕS.com" className="h-12 md:h-14 w-auto" />
                            </Link>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <Link href="/" className="text-gray-800 hover:text-red-500 transition-colors">Ana Sayfa</Link>
                            <Link href="/kurye-kazanc-hesaplama" className="text-gray-800 hover:text-red-500 transition-colors">Kazanç Hesapla</Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-2">
                <p className="text-sm font-medium">Kuryelerin Platformu</p>
            </div>
        </>
    );
}
