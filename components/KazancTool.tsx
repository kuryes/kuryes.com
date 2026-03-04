'use client';

import { useState, useEffect } from 'react';

interface KazancToolProps {
    initialPackageFee?: number;
    initialPackagesPerDay?: number;
    initialWorkDaysPerMonth?: number;
    initialFuelCostPerDay?: number;
}

export function KazancTool({
    initialPackageFee = 80,
    initialPackagesPerDay = 40,
    initialWorkDaysPerMonth = 26,
    initialFuelCostPerDay = 0,
}: KazancToolProps) {
    // Sol taraf: Kazanç Inputları
    const [workHours, setWorkHours] = useState(10);
    const [ordersPerHour, setOrdersPerHour] = useState(initialPackagesPerDay > 0 ? initialPackagesPerDay / 10 : 4);
    const [pkgFeeInput, setPkgFeeInput] = useState(initialPackageFee);
    const [kdvDahil, setKdvDahil] = useState(false);

    const [useKm, setUseKm] = useState(false);
    const [kmFee, setKmFee] = useState(5);
    const [avgKm, setAvgKm] = useState(5);

    const [mode, setMode] = useState<'paket' | 'saat'>('paket');
    const [hourlyFee, setHourlyFee] = useState(170);
    const [saatlikHesapTipi, setSaatlikHesapTipi] = useState<'saatlikten' | 'toplamdan'>('saatlikten');
    const [aylikToplamUcret, setAylikToplamUcret] = useState(44200);

    const [useSecondPackage, setUseSecondPackage] = useState(false);
    const [secondPackageFeeInput, setSecondPackageFeeInput] = useState(70);

    const [dailyBonuses, setDailyBonuses] = useState<{ id: string; packageCount: number; bonusAmount: number }[]>([]);
    const [weeklyBonuses, setWeeklyBonuses] = useState<{ id: string; packageCount: number; bonusAmount: number }[]>([]);
    const [isBonusAccordionOpen, setIsBonusAccordionOpen] = useState(false);

    const [izinVar, setIzinVar] = useState(initialWorkDaysPerMonth === 26);

    // Sağ taraf: Kesinti Inputları
    const [vergiKesinti, setVergiKesinti] = useState(20);
    const [tevfikat, setTevfikat] = useState(false);

    // Modal durumları
    const [isKmModalOpen, setIsKmModalOpen] = useState(false);
    const [isSecondPackageModalOpen, setIsSecondPackageModalOpen] = useState(false);
    const [isManuelModalOpen, setIsManuelModalOpen] = useState(false);

    // Modal içindeki Manuel Hesaplama için state
    const [manuelTotalKazanc, setManuelTotalKazanc] = useState<number>(0);

    // Çıktı state'leri
    const [results, setResults] = useState({
        dailyBrut: 0,
        weeklyBrut: 0,
        monthlyBrut: 0,

        dailyKDV: 0,
        weeklyKDV: 0,
        monthlyKDV: 0,

        dailyTevfikat: 0,
        weeklyTevfikat: 0,
        monthlyTevfikat: 0,

        dailyPackageCount: 0,
        weeklyPackageCount: 0,
        monthlyPackageCount: 0,

        dailyNet: 0,
        weeklyNet: 0,
        monthlyNet: 0,
    });

    const monteCarloSimulation = (iterations = 1000) => {
        const pkgFee = kdvDahil ? (pkgFeeInput / 1.20) : pkgFeeInput;
        const secondPackageFee = kdvDahil ? (secondPackageFeeInput / 1.20) : secondPackageFeeInput;

        const packageDistribution = [
            { count: 1, probability: 0.60 },
            { count: 2, probability: 0.25 },
            { count: 3, probability: 0.10 },
            { count: 4, probability: 0.05 }
        ];

        let totalPerPackageEarnings = 0;

        for (let i = 0; i < iterations; i++) {
            const random = Math.random();
            let packageCount = 1;
            let cumulativeProbability = 0;

            for (const dist of packageDistribution) {
                cumulativeProbability += dist.probability;
                if (random <= cumulativeProbability) {
                    packageCount = dist.count;
                    break;
                }
            }

            let totalEarningsForDelivery = pkgFee;
            if (packageCount >= 2) {
                totalEarningsForDelivery += secondPackageFee * (packageCount - 1);
            }

            if (useKm) {
                totalEarningsForDelivery += kmFee * avgKm;
            }

            const perPackageEarnings = totalEarningsForDelivery / packageCount;
            totalPerPackageEarnings += perPackageEarnings;
        }

        const avgPerPackageKDVHaric = totalPerPackageEarnings / iterations;
        const avgPerPackageBrut = kdvDahil ? (avgPerPackageKDVHaric * 1.20) : avgPerPackageKDVHaric;

        return avgPerPackageBrut;
    };

    useEffect(() => {
        // KDV Dahil ise birim fiyatı hesapla (Total / 1.20)
        const pkgFee = kdvDahil ? (pkgFeeInput / 1.20) : pkgFeeInput;

        // Paket ücreti hesaplama (KDV hariç tutarla)
        let perPackageKDVHaric = 0;

        if (mode === 'paket') {
            if (useSecondPackage) {
                perPackageKDVHaric = monteCarloSimulation(1000);
                // Monte carlo kdv'li dönebilir diye düzeltme, fonksiyon icinde brut yapıyoruz.
                // Düzeltmek adına monte carlo'dan döneni kdv harice geri cevir
                if (kdvDahil) {
                    perPackageKDVHaric = perPackageKDVHaric / 1.20;
                }
            } else {
                perPackageKDVHaric = pkgFee;
            }
        }

        let actualHourlyFee = hourlyFee;
        if (mode === 'saat' && saatlikHesapTipi === 'toplamdan') {
            const totalDays = izinVar ? 26 : 30;
            const targetDailyKDVHaric = kdvDahil ? (aylikToplamUcret / totalDays) / 1.20 : (aylikToplamUcret / totalDays);
            const dailyKmEarnings = useKm ? (kmFee * avgKm) : 0;
            actualHourlyFee = (targetDailyKDVHaric - dailyKmEarnings) / workHours;
            if (actualHourlyFee < 0) actualHourlyFee = 0;
        }

        const dailyKmEarnings = mode === 'saat' && useKm ? (kmFee * avgKm) : 0;
        const hourlyEarnings = mode === 'saat' ? (actualHourlyFee * workHours) + dailyKmEarnings : 0;
        const packageEarningsKDVHaric = mode === 'paket' ? (perPackageKDVHaric * ordersPerHour * workHours) : 0;

        const baseDailyKDVHaric = packageEarningsKDVHaric + hourlyEarnings;

        // Paket sayıları
        const dailyPackageCount = ordersPerHour * workHours;
        const weeklyPackageCount = dailyPackageCount * (izinVar ? 6 : 7);
        const monthlyPackageCount = dailyPackageCount * (izinVar ? 26 : 30);

        // Bonus hesaplamaları
        let dailyBonusKDVHaric = 0;
        let weeklyBonusKDVHaric = 0;

        if (mode === 'paket') {
            const achievedDailyBonuses = dailyBonuses.filter(b => dailyPackageCount >= b.packageCount);
            if (achievedDailyBonuses.length > 0) {
                const maxBonus = Math.max(...achievedDailyBonuses.map(b => b.bonusAmount));
                dailyBonusKDVHaric = kdvDahil ? (maxBonus / 1.20) : maxBonus;
            }

            const achievedWeeklyBonuses = weeklyBonuses.filter(b => weeklyPackageCount >= b.packageCount);
            if (achievedWeeklyBonuses.length > 0) {
                const maxBonus = Math.max(...achievedWeeklyBonuses.map(b => b.bonusAmount));
                weeklyBonusKDVHaric = kdvDahil ? (maxBonus / 1.20) : maxBonus;
            }
        }

        const finalDailyKDVHaric = baseDailyKDVHaric + dailyBonusKDVHaric;
        const dailyBrutVal = kdvDahil ? (finalDailyKDVHaric * 1.20) : finalDailyKDVHaric;

        // Haftalık ve Aylık Brüt (Bonuslar dahil)
        const gunSayisiHaftalik = izinVar ? 6 : 7;
        const gunSayisiAylik = izinVar ? 26 : 30;
        const aydakiHaftaSayisi = gunSayisiAylik / gunSayisiHaftalik;

        const weeklyBaseBrut = dailyBrutVal * gunSayisiHaftalik;
        const weeklyBonusBrut = kdvDahil ? (weeklyBonusKDVHaric * 1.20) : weeklyBonusKDVHaric;
        const weeklyBrutVal = weeklyBaseBrut + weeklyBonusBrut;

        const monthlyBrutVal = (dailyBrutVal * gunSayisiAylik) + (weeklyBonusBrut * aydakiHaftaSayisi);

        // KDV Kesinti
        const dailyKDVVal = (finalDailyKDVHaric * vergiKesinti) / 100;

        const weeklyKDVHaric = (finalDailyKDVHaric * gunSayisiHaftalik) + weeklyBonusKDVHaric;
        const weeklyKDVVal = (weeklyKDVHaric * vergiKesinti) / 100;

        const monthlyKDVHaric = (finalDailyKDVHaric * gunSayisiAylik) + (weeklyBonusKDVHaric * aydakiHaftaSayisi);
        const monthlyKDVVal = (monthlyKDVHaric * vergiKesinti) / 100;

        const dailyTevfikatVal = tevfikat ? (dailyKDVVal * 20) / 100 : 0;
        const weeklyTevfikatVal = tevfikat ? (weeklyKDVVal * 20) / 100 : 0;
        const monthlyTevfikatVal = tevfikat ? (monthlyKDVVal * 20) / 100 : 0;

        // Yakıt ve Diğer gider eklentisi (opsiyonel extra) - eski kodda yakıt yoktu statik tool olarak.
        // Ancak PSEO için initialFuelCostPerDay'i harici düşmek istersen burada dailyNet'ten düşebiliriz.
        // Şimdilik kazanc.html orijinal koduna tam sadık kalıyoruz.

        const dailyNetVal = dailyBrutVal - dailyKDVVal - dailyTevfikatVal - initialFuelCostPerDay;
        const weeklyNetVal = weeklyBrutVal - weeklyKDVVal - weeklyTevfikatVal - (initialFuelCostPerDay * (izinVar ? 6 : 7));
        const monthlyNetVal = monthlyBrutVal - monthlyKDVVal - monthlyTevfikatVal - (initialFuelCostPerDay * (izinVar ? 26 : 30));

        setResults({
            dailyBrut: dailyBrutVal,
            weeklyBrut: weeklyBrutVal,
            monthlyBrut: monthlyBrutVal,

            dailyKDV: dailyKDVVal,
            weeklyKDV: weeklyKDVVal,
            monthlyKDV: monthlyKDVVal,

            dailyTevfikat: dailyTevfikatVal,
            weeklyTevfikat: weeklyTevfikatVal,
            monthlyTevfikat: monthlyTevfikatVal,

            dailyPackageCount,
            weeklyPackageCount,
            monthlyPackageCount,

            dailyNet: dailyNetVal,
            weeklyNet: weeklyNetVal,
            monthlyNet: monthlyNetVal,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        workHours, ordersPerHour, pkgFeeInput, kdvDahil,
        useKm, kmFee, avgKm, mode, hourlyFee, saatlikHesapTipi, aylikToplamUcret, useSecondPackage,
        secondPackageFeeInput, dailyBonuses, weeklyBonuses, izinVar, vergiKesinti, tevfikat, initialFuelCostPerDay
    ]);

    const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-7xl mx-auto my-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Sol: Earnings Calculator */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Ne kadar kazanırım?</h2>
                            </div>
                            <div className="flex items-center bg-gray-100 p-1 rounded-lg shrink-0">
                                <button onClick={() => setMode('paket')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'paket' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Paket</button>
                                <button onClick={() => setMode('saat')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'saat' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Saat</button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Günlük Çalışma Saati</label>
                                    <div className="flex items-center text-gray-700">
                                        <input type="checkbox" id="kdvDahil" checked={kdvDahil} onChange={e => setKdvDahil(e.target.checked)} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded" />
                                        <label htmlFor="kdvDahil" className="ml-2 text-sm font-medium">KDV Dahil</label>
                                    </div>
                                </div>
                                <input type="number" min="0" max="24" value={workHours} onChange={(e) => setWorkHours(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                            </div>

                            {mode === 'paket' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Saatte Ortalama Sipariş</label>
                                    <input type="number" min="0" max="20" value={ordersPerHour} onChange={(e) => setOrdersPerHour(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                                </div>
                            )}

                            {mode === 'paket' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Paket Başına Ücret (₺)</label>
                                        <input type="number" min="0" max="200" step="0.01" value={pkgFeeInput} onChange={e => setPkgFeeInput(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                                    </div>

                                    <div className="flex items-center text-gray-700">
                                        <input type="checkbox" id="useSecondPackage" checked={useSecondPackage} onChange={e => {
                                            setUseSecondPackage(e.target.checked);
                                            if (e.target.checked) setIsSecondPackageModalOpen(true);
                                        }} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded" />
                                        <label htmlFor="useSecondPackage" className="ml-2 text-sm font-medium">2. Paket ücreti dahil edilsin</label>
                                    </div>

                                    <div className={useSecondPackage ? '' : 'opacity-50 pointer-events-none'}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">2. Paket Ücreti (₺)</label>
                                        <input type="number" min="0" step="0.01" value={secondPackageFeeInput} onChange={e => setSecondPackageFeeInput(Number(e.target.value))} disabled={!useSecondPackage} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                                    </div>
                                </>
                            )}

                            {mode === 'saat' && (
                                <div className="space-y-4">
                                    <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                                        <button onClick={() => setSaatlikHesapTipi('saatlikten')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${saatlikHesapTipi === 'saatlikten' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Saatlik Ücretten Maaşa</button>
                                        <button onClick={() => setSaatlikHesapTipi('toplamdan')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${saatlikHesapTipi === 'toplamdan' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Aylık Maaştan Ücrete</button>
                                    </div>

                                    {saatlikHesapTipi === 'saatlikten' ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Saatlik Ücret (₺)</label>
                                            <input type="number" min="0" step="0.01" value={hourlyFee} onChange={e => setHourlyFee(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Aylık Toplam Maaş Hedefi (₺)</label>
                                            <input type="number" min="0" step="1" value={aylikToplamUcret} onChange={e => setAylikToplamUcret(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                                            <div className="mt-2 text-sm text-gray-600">
                                                Hesaplanan Saatlik Ücret (Net Prim Hariç): <strong className="text-red-600">
                                                    {Math.max(0, ((kdvDahil ? (aylikToplamUcret / (izinVar ? 26 : 30)) / 1.20 : (aylikToplamUcret / (izinVar ? 26 : 30))) - (useKm ? (kmFee * avgKm) : 0)) / workHours).toFixed(2)} ₺
                                                </strong>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center text-gray-700">
                                <input type="checkbox" id="useKm" checked={useKm} onChange={e => {
                                    setUseKm(e.target.checked);
                                    if (e.target.checked) setIsKmModalOpen(true);
                                }} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded" />
                                <label htmlFor="useKm" className="ml-2 text-sm font-medium">Km ücreti dahil edilsin</label>
                            </div>

                            <div className={useKm ? '' : 'opacity-50 pointer-events-none'}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Km Başına Ücret (₺)</label>
                                <input type="number" min="0" step="0.01" value={kmFee} onChange={e => setKmFee(Number(e.target.value))} disabled={!useKm} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                            </div>

                            <div className={useKm ? '' : 'opacity-50 pointer-events-none'}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ortalama Mesafe (km)</label>
                                <input type="number" min="0" step="0.1" value={avgKm} onChange={e => setAvgKm(Number(e.target.value))} disabled={!useKm} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
                                <p className="text-xs text-gray-500 mt-1">⚠️ <strong>İstatistiksel ortalama:</strong> Gerçek mesafeler 1-15km arasında değişebilir.</p>
                            </div>

                            {mode === 'paket' && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden shrink-0 mt-4 mb-2">
                                    <button
                                        onClick={() => setIsBonusAccordionOpen(!isBonusAccordionOpen)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="font-semibold text-gray-800">🎁 Günlük ve Haftalık Bonuslar</span>
                                        <svg className={`w-5 h-5 transform transition-transform ${isBonusAccordionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>

                                    {isBonusAccordionOpen && (
                                        <div className="p-4 space-y-6 bg-white shrink-0">
                                            {/* Günlük Bonus */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-sm text-gray-700">Günlük Paket Bonusu</h4>
                                                    <button onClick={() => setDailyBonuses([...dailyBonuses, { id: Date.now().toString(), packageCount: 30, bonusAmount: 100 }])} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition font-medium">+ Kural Ekle</button>
                                                </div>
                                                {dailyBonuses.length === 0 && <p className="text-xs text-gray-400 italic">Günlük bonus kuralı eklenmedi.</p>}
                                                <div className="space-y-2">
                                                    {dailyBonuses.map(bonus => (
                                                        <div key={bonus.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <input type="number" min="1" value={bonus.packageCount} onChange={e => setDailyBonuses(dailyBonuses.map(b => b.id === bonus.id ? { ...b, packageCount: Number(e.target.value) } : b))} className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500" />
                                                                <span className="text-xs text-gray-600 whitespace-nowrap">pakete ulaşınca</span>
                                                            </div>
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <input type="number" min="0" step="1" value={bonus.bonusAmount} onChange={e => setDailyBonuses(dailyBonuses.map(b => b.id === bonus.id ? { ...b, bonusAmount: Number(e.target.value) } : b))} className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500" />
                                                                <span className="text-xs text-gray-600">₺ bonus</span>
                                                            </div>
                                                            <button onClick={() => setDailyBonuses(dailyBonuses.filter(b => b.id !== bonus.id))} className="text-gray-400 hover:text-red-500 p-1 w-fit self-end sm:self-auto bg-gray-100 sm:bg-transparent rounded px-2">
                                                                <span className="sm:hidden text-xs mr-2">Sil</span><svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <hr className="border-gray-100" />

                                            {/* Haftalık Bonus */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-sm text-gray-700">Haftalık Paket Bonusu</h4>
                                                    <button onClick={() => setWeeklyBonuses([...weeklyBonuses, { id: Date.now().toString(), packageCount: 200, bonusAmount: 500 }])} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition font-medium">+ Kural Ekle</button>
                                                </div>
                                                {weeklyBonuses.length === 0 && <p className="text-xs text-gray-400 italic">Haftalık bonus kuralı eklenmedi.</p>}
                                                <div className="space-y-2">
                                                    {weeklyBonuses.map(bonus => (
                                                        <div key={bonus.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <input type="number" min="1" step="5" value={bonus.packageCount} onChange={e => setWeeklyBonuses(weeklyBonuses.map(b => b.id === bonus.id ? { ...b, packageCount: Number(e.target.value) } : b))} className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500" />
                                                                <span className="text-xs text-gray-600 whitespace-nowrap">pakete ulaşınca</span>
                                                            </div>
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <input type="number" min="0" step="5" value={bonus.bonusAmount} onChange={e => setWeeklyBonuses(weeklyBonuses.map(b => b.id === bonus.id ? { ...b, bonusAmount: Number(e.target.value) } : b))} className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500" />
                                                                <span className="text-xs text-gray-600">₺ bonus</span>
                                                            </div>
                                                            <button onClick={() => setWeeklyBonuses(weeklyBonuses.filter(b => b.id !== bonus.id))} className="text-gray-400 hover:text-red-500 p-1 w-fit self-end sm:self-auto bg-gray-100 sm:bg-transparent rounded px-2">
                                                                <span className="sm:hidden text-xs mr-2">Sil</span><svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center text-gray-700">
                                <input type="checkbox" id="izinGunu" checked={izinVar} onChange={e => setIzinVar(e.target.checked)} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded" />
                                <label htmlFor="izinGunu" className="ml-2 text-sm font-medium">İzin günü var (hafta: 6 gün, ay: 26 gün)</label>
                            </div>

                            <div className="bg-red-50 rounded-lg p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-sm text-gray-500">Günlük Kazanç</p>
                                        <p className="text-2xl font-bold text-red-600">{formatter.format(results.dailyBrut)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Haftalık Kazanç</p>
                                        <p className="text-2xl font-bold text-red-600">{formatter.format(results.weeklyBrut)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Aylık Kazanç</p>
                                        <p className="text-2xl font-bold text-red-600">{formatter.format(results.monthlyBrut)}</p>
                                    </div>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="text-xs text-gray-400">*Brüt kazanç (kesintiler öncesi)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sağ: Deduction Simulator */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Kesinti olursa ne olur?</h2>
                            </div>
                            <button onClick={() => setIsManuelModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
                                Manuel Hesapla
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">KDV Kesintisi (%)</label>
                                <input type="range" min="0" max="30" step="1" value={vergiKesinti} onChange={e => setVergiKesinti(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                    <span>0%</span>
                                    <span>{vergiKesinti}%</span>
                                    <span>30%</span>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-700">
                                <input type="checkbox" id="tevfikat" checked={tevfikat} onChange={e => setTevfikat(e.target.checked)} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded" />
                                <label htmlFor="tevfikat" className="ml-2 text-sm font-medium">Tevfikat uygula (KDV'nin %20'si)</label>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-800">Günlük</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Brüt Günlük Kazanç:</span>
                                            <span className="font-semibold text-gray-800">{formatter.format(results.dailyBrut)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">KDV:</span>
                                            <span className="font-semibold text-red-500">{formatter.format(results.dailyKDV)}</span>
                                        </div>
                                        {tevfikat && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Tevfikat:</span>
                                                <span className="font-semibold text-red-500">{formatter.format(results.dailyTevfikat)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-800">Haftalık</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Brüt Haftalık Kazanç:</span>
                                            <span className="font-semibold text-gray-800">{formatter.format(results.weeklyBrut)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">KDV:</span>
                                            <span className="font-semibold text-red-500">{formatter.format(results.weeklyKDV)}</span>
                                        </div>
                                        {tevfikat && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Tevfikat:</span>
                                                <span className="font-semibold text-red-500">{formatter.format(results.weeklyTevfikat)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-800">Aylık</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Brüt Aylık Kazanç:</span>
                                            <span className="font-semibold text-gray-800">{formatter.format(results.monthlyBrut)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">KDV:</span>
                                            <span className="font-semibold text-red-500">{formatter.format(results.monthlyKDV)}</span>
                                        </div>
                                        {tevfikat && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Tevfikat:</span>
                                                <span className="font-semibold text-red-500">{formatter.format(results.monthlyTevfikat)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {mode === 'paket' && (
                                        <>
                                            <hr className="border-gray-200" />

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-semibold text-gray-800">Günlük Toplam Paket:</span>
                                                    <span className="text-lg font-bold text-teal-600">{Number(results.dailyPackageCount).toLocaleString('tr-TR')}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-semibold text-gray-800">Haftalık Toplam Paket:</span>
                                                    <span className="text-lg font-bold text-teal-600">{Number(results.weeklyPackageCount).toLocaleString('tr-TR')}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-semibold text-gray-800">Aylık Toplam Paket:</span>
                                                    <span className="text-lg font-bold text-teal-600">{Number(results.monthlyPackageCount).toLocaleString('tr-TR')}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <hr className="border-gray-200" />

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-gray-800">Günlük Net:</span>
                                            <span className="text-lg font-bold text-red-600">{formatter.format(results.dailyNet)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-gray-800">Haftalık Net:</span>
                                            <span className="text-lg font-bold text-red-600">{formatter.format(results.weeklyNet)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-gray-800">Aylık Net:</span>
                                            <span className="text-lg font-bold text-red-600">{formatter.format(results.monthlyNet)}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-sm text-blue-700 space-y-3">
                                    <div>
                                        <p className="font-semibold mb-2">📋 Vergi Bilgileri:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li><strong>KDV:</strong> Moto kuryeler için devletin belirlediği KDV oranı %20'dir</li>
                                            <li><strong>Tevfikat:</strong> Uygulandığında, KDV'nin %20'si tevfikat olarak kesilir</li>
                                            <li><strong>Gelir Vergisi:</strong> Türkiye'de serbest meslek erbabı olarak çalışan kuryeler için gelir vergisi dilimleri uygulanır</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 border-l-4 border-l-red-600 px-4">
                                <p className="font-semibold text-red-800 text-sm mb-1">⚠️ Yasal Uyarı - İstatistiksel Hesaplama</p>
                                <p className="text-xs text-red-800">
                                    Bu hesaplayıcı istatistiksel modelleme kullanır. Gerçek kazançlar platform politikaları ve diğer faktörlere bağlı olarak değişebilir.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* KM Modalı */}
            {isKmModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center" onClick={() => { setIsKmModalOpen(false); setUseKm(false); }}>
                    <div className="bg-white rounded-xl p-6 max-w-md mx-4 relative" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">📏 Mesafe Hesaplama Bilgisi</h3>
                        </div>

                        <div className="space-y-3 text-sm text-gray-700">
                            <p><strong>Ortalama Mesafe Hesaplama:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-4 text-xs">
                                <li>Gerçek teslimat mesafeleri <strong>1-15km</strong> arasında değişir</li>
                                <li>Bu değer <strong>istatistiksel ortalama</strong>dır</li>
                            </ul>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setIsKmModalOpen(false); setUseKm(false); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">İptal</button>
                            <button onClick={() => setIsKmModalOpen(false)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Anladım</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Paket Modalı */}
            {isSecondPackageModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center" onClick={() => { setIsSecondPackageModalOpen(false); setUseSecondPackage(false); }}>
                    <div className="bg-white rounded-xl p-6 max-w-md mx-4 relative" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">⚠️ Önemli Bilgilendirme</h3>
                        </div>

                        <div className="space-y-3 text-sm text-gray-700">
                            <p><strong>2. Paket Ücreti Hesaplama:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-4 text-xs">
                                <li>Bu hesaplama <strong>Monte Carlo simülasyonu</strong> kullanır</li>
                                <li>Paket dağılımı: %60 tek, %25 çift, vb.</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setIsSecondPackageModalOpen(false); setUseSecondPackage(false); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">İptal</button>
                            <button onClick={() => setIsSecondPackageModalOpen(false)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Anladım</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manuel Hesapla Modalı */}
            {isManuelModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setIsManuelModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">Manuel Hesaplama</h3>
                                <button onClick={() => setIsManuelModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2">Total Kazanç (Brüt Kazanç KDV Dahil) ₺</label>
                                    <input type="number" value={manuelTotalKazanc || ''} onChange={e => setManuelTotalKazanc(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600" placeholder="0.00" step="0.01" min="0" />
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">KDV:</span>
                                        <span className="text-lg font-bold text-red-600">{formatter.format((manuelTotalKazanc / 1.20) * 0.20)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Tevfikat:</span>
                                        <span className="text-lg font-bold text-teal-600">{formatter.format(((manuelTotalKazanc / 1.20) * 0.20) * 0.20)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                                        <span className="text-sm font-medium text-gray-700">Birim Fiyatı (KDV Hariç):</span>
                                        <span className="text-xl font-bold text-green-600">{formatter.format(manuelTotalKazanc / 1.20)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button onClick={() => setIsManuelModalOpen(false)} className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Kapat</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
