export const metadata = {
    title: 'Gizlilik Politikası | Kuryes',
};

export default function Gizlilik() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-gray-800">
            <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası</h1>
            <p className="mb-4">Kuryes olarak kişisel verilerinizin gizliliğine ve güvenliğine önem veriyoruz.</p>
            {/* İleride eski sayfadan içerik alınabilir, şimdilik placeholder */}
            <h2 className="text-xl font-semibold mt-8 mb-4">Veri Toplama ve Kullanımı</h2>
            <p>Sitemizdeki hesaplama araçları tarayıcı üzerinde (istemci tarafında) çalışır. Girdiğiniz kazanç bilgileri sunucularımıza kaydedilmez.</p>
        </div>
    );
}
