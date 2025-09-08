import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- UI & CHARTING LIBRARIES ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- ICONS ---
import { Plane, Globe, Users, MapPin, Download, Shuffle, Building, Earth, GaugeCircle, ArrowRightLeft, Maximize, Minus, Plus } from 'lucide-react';

// --- FALLBACK STATIC DATA (used only if JSON fetch fails) ---
const aviationFallback = {
  "meta": { "source": "OpenFlights", "note": "Static route network, direction-specific unique routes" },
  "metrics": { "active_routes": 36708, "covered_airports": 3193, "active_airlines": 564, "countries_served": 225, "domestic_routes_percent": 47.12, "top_hub": { "iata": "FRA", "connections": 239 }, "avg_dest_per_airport": 11.55, "longest_route": { "from": "SYD", "to": "DFW", "distance_km": 13808.2 } },
  "domestic_vs_international": [ { "name": "International", "value": 19412 }, { "name": "Domestic", "value": 17296 } ],
  "haul_distribution": [ { "label": "Short-haul", "count": 39876 }, { "label": "Medium-haul", "count": 18530 }, { "label": "Long-haul", "count": 8029 } ],
  "top_airlines": [ { "airline": "FR", "routes": 2484 }, { "airline": "AA", "routes": 2352 }, { "airline": "UA", "routes": 2178 }, { "airline": "DL", "routes": 1981 }, { "airline": "US", "routes": 1960 }, { "airline": "W6", "routes": 1696 }, { "airline": "U2", "routes": 1616 }, { "airline": "WN", "routes": 1568 }, { "airline": "IB", "routes": 1500 }, { "airline": "KE", "routes": 1464 } ],
  "routes_sample": [
    {"src_iata":"SYD","dst_iata":"DFW","distance_km":13808.2,"airline":"QF"},
    {"src_iata":"JFK","dst_iata":"SIN","distance_km":15344.4,"airline":"SQ"},
    {"src_iata":"AKL","dst_iata":"DXB","distance_km":14200.3,"airline":"EK"},
    {"src_iata":"LAX","dst_iata":"SIN","distance_km":14113.9,"airline":"SQ"},
    {"src_iata":"ATL","dst_iata":"JNB","distance_km":13581.8,"airline":"DL"},
    {"src_iata":"CDG","dst_iata":"SCL","distance_km":11680.1,"airline":"AF"},
    {"src_iata":"LHR","dst_iata":"PER","distance_km":14469.7,"airline":"QF"},
    {"src_iata":"DOH","dst_iata":"AKL","distance_km":14535.5,"airline":"QR"}
  ],
  "iata_lookup": {
    "SYD": { "name": "Sydney Kingsford Smith", "city": "Sydney", "country": "Australia", "lat": -33.946111, "lon": 151.177222 },
    "DFW": { "name": "Dallas/Fort Worth International Airport", "city": "Dallas", "country": "United States", "lat": 32.896828, "lon": -97.037997 },
    "JFK": { "name": "John F. Kennedy International Airport", "city": "New York", "country": "United States", "lat": 40.639751, "lon": -73.778925 },
    "SIN": { "name": "Singapore Changi Airport", "city": "Singapore", "country": "Singapore", "lat": 1.350189, "lon": 103.994433 },
    "AKL": { "name": "Auckland International Airport", "city": "Auckland", "country": "New Zealand", "lat": -37.008056, "lon": 174.791667 },
    "DXB": { "name": "Dubai International Airport", "city": "Dubai", "country": "United Arab Emirates", "lat": 25.252778, "lon": 55.364444 },
    "LAX": { "name": "Los Angeles International Airport", "city": "Los Angeles", "country": "United States", "lat": 33.9425, "lon": -118.407222 },
    "ATL": { "name": "Hartsfield Jackson Atlanta International Airport", "city": "Atlanta", "country": "United States", "lat": 33.636719, "lon": -84.428067 },
    "JNB": { "name": "OR Tambo International Airport", "city": "Johannesburg", "country": "South Africa", "lat": -26.139167, "lon": 28.246111 },
    "CDG": { "name": "Charles de Gaulle Airport", "city": "Paris", "country": "France", "lat": 49.012779, "lon": 2.55 },
    "SCL": { "name": "Arturo Merino Benítez International Airport", "city": "Santiago", "country": "Chile", "lat": -33.393056, "lon": -70.785833 },
    "LHR": { "name": "London Heathrow Airport", "city": "London", "country": "United Kingdom", "lat": 51.4775, "lon": -0.461389 },
    "PER": { "name": "Perth International Airport", "city": "Perth", "country": "Australia", "lat": -31.940278, "lon": 115.966944 },
    "DOH": { "name": "Hamad International Airport", "city": "Doha", "country": "Qatar", "lat": 25.273056, "lon": 51.608056 }
  }
};

// --- INTERNATIONALIZATION (i18n) CONTENT ---
const i18n = {
    fr: {
        headerTitle: "AirFlow Dynamics",
        headerSubtitle: "Intelligence du Trafic Aérien Mondial",
        exportButton: "Exporter en PDF",
        cockpitTab: "Synthèse Visuelle",
        analyticsTab: "Analyses Détaillées",
        kpiRoutes: "Routes Actives",
        kpiAirports: "Aéroports Desservis",
        kpiAirlines: "Compagnies Aériennes",
        kpiCountries: "Pays Connectés",
        longestRoute: "Route la plus Longue",
        topHub: "Hub le plus Connecté",
        avgDestPerAirport: "Dest. / Aéroport",
        longHaulShare: "Part Long-Courrier",
        avgRouteDistance: "Distance Moyenne des Vols",
        globalRoutesTitle: "4 Routes Mondiales Signatures",
        topAirlinesTitle: "Top 10 Compagnies par Routes",
        donutTitle: "Domestique vs. International",
        haulDistTitle: "Distribution par Distance",
        mapTitle: "Explorateur de Routes Globales",
        connections: "connexions",
    },
    en: {
        headerTitle: "AirFlow Dynamics",
        headerSubtitle: "Global Air Traffic Intelligence",
        exportButton: "Export as PDF",
        cockpitTab: "Visual Synthesis",
        analyticsTab: "Detailed Analytics",
        kpiRoutes: "Active Routes",
        kpiAirports: "Airports Served",
        kpiAirlines: "Airlines Operating",
        kpiCountries: "Countries Connected",
        longestRoute: "Longest Route",
        topHub: "Busiest Hub",
        avgDestPerAirport: "Dest. / Airport",
        longHaulShare: "Long-Haul Share",
        avgRouteDistance: "Average Route Distance",
        globalRoutesTitle: "4 Signature Global Routes",
        topAirlinesTitle: "Top 10 Airlines by Routes",
        donutTitle: "Domestic vs. International",
        haulDistTitle: "Distribution by Haul",
        mapTitle: "Global Route Explorer",
        connections: "connections",
    }
};

// --- UI COMPONENTS ---
const AnimatedNumber = ({ value }) => {
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node || isNaN(value)) return;

        const startValue = parseFloat(node.textContent.replace(/,/g, '')) || 0;
        let animationFrameId;
        const startTime = performance.now();
        const duration = 1500; // ms

        const animateFrame = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const currentValue = startValue + (value - startValue) * easedProgress;
            node.textContent = Math.round(currentValue).toLocaleString('en-US');

            if (progress < 1) animationFrameId = requestAnimationFrame(animateFrame);
            else node.textContent = Math.round(value).toLocaleString('en-US');
        };

        animationFrameId = requestAnimationFrame(animateFrame);
        return () => cancelAnimationFrame(animationFrameId);
    }, [value]);

    return <span ref={ref}>0</span>;
};

const HeroKpi = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-3" aria-label={label}>
        <div className="flex-shrink-0 w-12 h-12 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
            <div className="text-slate-400 text-sm">{label}</div>
            <div className="text-white text-2xl font-semibold font-mono tracking-tight">
                {typeof value === 'number' ? <AnimatedNumber value={value} /> : '...'}
            </div>
        </div>
    </div>
);

const RadialCard = ({ icon: Icon, title, value, unit }) => (
    <div className="relative w-40 h-28 bg-slate-900/50 backdrop-blur-md border border-slate-700/80 rounded-xl flex flex-col items-center justify-center p-2 text-center shadow-lg shadow-black/20 transform transition-transform hover:scale-105">
        <Icon className="w-6 h-6 text-cyan-300 mb-1" />
        <span className="text-xs text-slate-300 leading-tight">{title}</span>
        <span className="text-xl font-bold font-mono text-white tracking-tight">{value} <span className="text-sm font-sans text-slate-400">{unit}</span></span>
    </div>
);

const RouteSignatureCard = ({ route, lookup, maxDistance }) => (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 space-y-2 transition-all hover:border-cyan-400/50 hover:bg-slate-800/50">
        <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-white">{lookup?.[route.src_iata]?.city || route.src_iata} ({route.src_iata})</span>
            <span className="text-slate-400">→</span>
            <span className="font-semibold text-white">{lookup?.[route.dst_iata]?.city || route.dst_iata} ({route.dst_iata})</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${(route.distance_km / (maxDistance || route.distance_km)) * 100}%` }}></div>
        </div>
        <div className="text-right text-xs text-slate-300 font-mono">
            {Math.round(route.distance_km).toLocaleString()} km
        </div>
    </div>
);

// --- Lightweight Interactive SVG Map (pan/zoom/filter) ---
const InteractiveSvgMap = ({ data }) => {
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 500 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [filteredRoutes, setFilteredRoutes] = useState(data.routes_sample || []);

    const project = (lon, lat) => {
        const x = (lon + 180) * (1000 / 360);
        const y = 500 - (500 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
        return { x, y };
    };

    const projectedAirports = useMemo(() => {
        const lookup = data.iata_lookup || {};
        return Object.fromEntries(
            Object.entries(lookup).map(([iata, a]) => [iata, { ...a, ...project(a.lon, a.lat) }])
        );
    }, [data.iata_lookup]);

    const handleZoom = (factor) => {
        setViewBox(prev => {
            const newW = prev.w * factor;
            const newH = prev.h * factor;
            return {
                w: newW, h: newH,
                x: prev.x + (prev.w - newW) / 2,
                y: prev.y + (prev.h - newH) / 2,
            };
        });
    };

    const onMouseDown = (e) => { setIsPanning(true); setStartPoint({ x: e.clientX, y: e.clientY }); };
    const onMouseMove = (e) => {
        if (!isPanning) return;
        const dx = (startPoint.x - e.clientX) * (viewBox.w / 1000);
        const dy = (startPoint.y - e.clientY) * (viewBox.h / 500);
        setViewBox(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        setStartPoint({ x: e.clientX, y: e.clientY });
    };
    const onMouseUp = () => setIsPanning(false);

    const filterByAirport = (iata) => {
        const base = data.routes_sample || [];
        setFilteredRoutes(base.filter(r => r.src_iata === iata || r.dst_iata === iata));
    };
    const resetFilter = () => setFilteredRoutes(data.routes_sample || []);

    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-900 cursor-grab" onMouseLeave={onMouseUp}>
            <svg viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} width="100%" height="100%">
                {/* Simplified world shape */}
                <rect x="0" y="0" width="1000" height="500" fill="#0f172a" />
                <g>
                    {(filteredRoutes || []).slice(0, 2000).map((route, idx) => {
                        const src = projectedAirports[route.src_iata];
                        const dst = projectedAirports[route.dst_iata];
                        if (!src || !dst) return null;
                        return <line key={idx} x1={src.x} y1={src.y} x2={dst.x} y2={dst.y} stroke="#0ea5e9" strokeWidth="0.6" opacity="0.55" />;
                    })}
                </g>
                <g>
                    {Object.entries(projectedAirports).slice(0, 2000).map(([iata, a]) => (
                        <circle key={iata} cx={a.x} cy={a.y} r="1.6" fill="#e0f2fe" onClick={() => filterByAirport(iata)} />
                    ))}
                </g>
            </svg>
            <div className="absolute top-3 right-3 z-[10] flex flex-col space-y-1 no-print">
                <button onClick={() => handleZoom(0.8)} className="w-8 h-8 bg-slate-800/80 text-white rounded-md flex items-center justify-center hover:bg-slate-700" aria-label="Zoom in"><Plus size={16}/></button>
                <button onClick={() => handleZoom(1.25)} className="w-8 h-8 bg-slate-800/80 text-white rounded-md flex items-center justify-center hover:bg-slate-700" aria-label="Zoom out"><Minus size={16}/></button>
                <button onClick={resetFilter} className="w-8 h-8 bg-slate-800/80 text-white rounded-md flex items-center justify-center hover:bg-slate-700" aria-label="Reset"><Maximize size={16}/></button>
            </div>
        </div>
    );
};

export default function App() {
    const [language, setLanguage] = useState('fr');
    const [data, setData] = useState(aviationFallback);
    const [loadedFromJson, setLoadedFromJson] = useState(false);

    useEffect(() => {
        fetch('/data/analytics_results.json', { cache: 'no-store' })
          .then(r => { if (!r.ok) throw new Error('JSON introuvable'); return r.json(); })
          .then(json => { setData(json); setLoadedFromJson(true); })
          .catch(err => { console.warn('Fallback: ', err.message); });
    }, []);

    const content = i18n[language];

    // Derived data (robust to missing fields)
    const metrics = data.metrics || {};
    const routesSample = data.routes_sample || [];
    const iataLookup = data.iata_lookup || {};

    const signatureRoutes = useMemo(() => [...routesSample].sort((a,b) => (b.distance_km||0) - (a.distance_km||0)).slice(0,4), [routesSample]);

    const donut = data.domestic_vs_international || [];
    const haul = data.haul_distribution || [];

    const longHaulItem = haul.find(h => (h.label || '').toLowerCase().includes('long')) || { count: 0 };
    const haulTotal = haul.reduce((acc, h) => acc + (h.count || 0), 0) || 1;
    const longHaulShare = (longHaulItem.count / haulTotal) * 100;
    const avgDistance = routesSample.length ? routesSample.reduce((acc, r) => acc + (r.distance_km || 0), 0) / routesSample.length : 0;

    const topAirlines = (data.top_airlines || []).slice(0, 10);

    return (
        <>
            <style>{`
                :root { --aurora-1: 10, 110, 235; --aurora-2: 60, 10, 180; --aurora-3: 180, 50, 120; }
                .bg-aurora { position: fixed; inset: 0; background: #020617; z-index: -2; }
                .bg-aurora::after { content: ''; position: absolute; inset: 0; background-image: radial-gradient(ellipse 25% 40% at 20% 20%, rgba(var(--aurora-1), 0.3), transparent), radial-gradient(ellipse 25% 40% at 80% 25%, rgba(var(--aurora-2), 0.2), transparent), radial-gradient(ellipse 25% 40% at 50% 90%, rgba(var(--aurora-3), 0.2), transparent); animation: aurora-anim 15s ease-in-out infinite; }
                .bg-noise { position: fixed; top: -50%; left: -50%; right: -50%; bottom: -50%; width: 200%; height: 200%; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); animation: noise-anim 2s linear infinite; opacity: 0.02; z-index: -1; }
                @keyframes aurora-anim { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.2) rotate(5deg); } }
                @keyframes noise-anim { 0% { transform: translate(0,0); } 100% { transform: translate(-10%,5%); } }
                @keyframes subtle-float { 0%, 100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-15px) rotate(1deg); } }
                .animate-subtle-float { animation: subtle-float 8s ease-in-out infinite; }
                @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none; } }
            `}</style>

            <div className="bg-aurora"></div>
            <div className="bg-noise"></div>

            <div className="min-h-screen text-slate-200 font-sans">
                <header className="bg-slate-950/50 backdrop-blur-lg border-b border-slate-800/80 sticky top-0 z-50 no-print">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-3">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700"><Plane className="w-6 h-6 text-cyan-400" /></div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">{content.headerTitle}</h1>
                                    <p className="text-xs text-slate-400">{content.headerSubtitle}{loadedFromJson ? ' • JSON' : ' • fallback'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => setLanguage('fr')} className={`px-2 py-1 text-xs rounded-md ${language === 'fr' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:bg-slate-700'}`}>FR</button>
                                    <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs rounded-md ${language === 'en' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:bg-slate-700'}`}>EN</button>
                                </div>
                                <button onClick={() => window.print()} className="hidden sm:flex items-center space-x-2 px-3 py-2 text-xs font-semibold bg-slate-800/80 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700/80 hover:text-white transition-colors">
                                    <Download className="w-4 h-4"/><span>{content.exportButton}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* HERO */}
                    <section>
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 overflow-hidden">
                            <div className="space-y-6">
                                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{content.cockpitTab}</h1>
                                <p className="text-slate-400 max-w-lg">Vue d'ensemble data-driven (OpenFlights). KPIs, routes signatures et tendances.</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <HeroKpi icon={Globe} label={content.kpiRoutes} value={metrics.active_routes ?? 0} />
                                    <HeroKpi icon={MapPin} label={content.kpiAirports} value={metrics.covered_airports ?? 0} />
                                    <HeroKpi icon={Building} label={content.kpiAirlines} value={metrics.active_airlines ?? 0} />
                                    <HeroKpi icon={Earth} label={content.kpiCountries} value={metrics.countries_served ?? 0} />
                                </div>
                            </div>
                            <div className="relative h-64 md:h-full flex items-center justify-center">
                                <Plane className="w-48 h-48 md:w-64 md:h-64 text-slate-300 animate-subtle-float" strokeWidth={0.5} aria-hidden="true"/>
                                <div className="absolute bottom-0 right-0 grid grid-cols-3 gap-3">
                                   <RadialCard icon={ArrowRightLeft} title={content.longestRoute} value={Math.round(metrics?.longest_route?.distance_km || 0).toLocaleString()} unit="km"/>
                                   <RadialCard icon={Users} title={content.topHub} value={metrics?.top_hub?.iata || '—'} unit={`${metrics?.top_hub?.connections || 0} ${content.connections}`}/>
                                   <RadialCard icon={GaugeCircle} title={content.avgDestPerAirport} value={(metrics?.avg_dest_per_airport ?? 0).toFixed(1)} unit=""/>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Extra KPIs + Signature routes */}
                    <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
                                <span className="text-sm text-slate-300">{content.longHaulShare}</span>
                                <span className="font-mono font-bold text-white">{longHaulShare.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
                                <span className="text-sm text-slate-300">{content.avgRouteDistance}</span>
                                <span className="font-mono font-bold text-white">{Math.round(avgDistance).toLocaleString()} km</span>
                            </div>
                        </div>
                        <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
                            <h3 className="text-sm text-slate-300 mb-2">{content.globalRoutesTitle}</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {signatureRoutes.map((r, i) => (
                                  <RouteSignatureCard key={`${r.src_iata}-${r.dst_iata}-${i}`} route={r} lookup={iataLookup} maxDistance={metrics?.longest_route?.distance_km || (signatureRoutes[0]?.distance_km || 1)} />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* MAP */}
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold text-white mb-4">{content.mapTitle}</h2>
                        <InteractiveSvgMap data={{ routes_sample: routesSample, iata_lookup: iataLookup }} />
                    </section>

                    {/* CHARTS */}
                    <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">{content.donutTitle}</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={donut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {donut.map((d, i) => <Cell key={i} fill={i === 0 ? '#22d3ee' : '#10B981'} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">{content.haulDistTitle}</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={haul} margin={{top: 20, right: 0, left: 0, bottom: 0}}>
                                    <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="label" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false}/>
                                    <YAxis hide={true}/>
                                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}/>
                                    <Bar dataKey="count" barSize={40} radius={[8, 8, 0, 0]}>
                                        {(haul || []).map((_, i) => <Cell key={i} fill={['#22d3ee','#F59E0B','#10B981'][i % 3]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* TOP AIRLINES */}
                    <section className="mt-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Top 10</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={topAirlines} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="airline" stroke="#94a3b8" fontSize={12} width={80} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                <Bar dataKey="routes" barSize={18} radius={[0, 10, 10, 0]}>
                                    {topAirlines.map((_, i) => <Cell key={i} fill="#22d3ee" />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </section>
                </main>
            </div>
        </>
    );
}
