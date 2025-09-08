import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- UI & CHARTING LIBRARIES ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// --- ICONS ---
import { Plane, Globe, Users, MapPin, Download, Shuffle, Building, Earth, GaugeCircle, ArrowRightLeft, Maximize, Minus, Plus, Filter, Network, Target, Layers } from 'lucide-react';

// --- FALLBACK STATIC DATA (extended for new features) ---
const aviationFallback = {
  "meta": { "source": "OpenFlights", "note": "Static route network, direction-specific unique routes" },
  "metrics": { "active_routes": 36708, "covered_airports": 3193, "active_airlines": 564, "countries_served": 225, "domestic_routes_percent": 47.12, "top_hub": { "iata": "FRA", "connections": 239 }, "avg_dest_per_airport": 11.55, "longest_route": { "from": "SYD", "to": "DFW", "distance_km": 13808.2 } },
  "domestic_vs_international": [ { "name": "International", "value": 19412 }, { "name": "Domestic", "value": 17296 } ],
  "haul_distribution": [ { "label": "Short-haul", "count": 39876 }, { "label": "Medium-haul", "count": 18530 }, { "label": "Long-haul", "count": 8029 } ],
  "continental_hubs": [
    { "continent": "Europe", "hub": "FRA", "connections": 239, "dominance": 85 },
    { "continent": "North America", "hub": "ATL", "connections": 198, "dominance": 72 },
    { "continent": "Asia", "hub": "DXB", "connections": 185, "dominance": 68 },
    { "continent": "Oceania", "hub": "SYD", "connections": 67, "dominance": 91 },
    { "continent": "South America", "hub": "GRU", "connections": 43, "dominance": 78 },
    { "continent": "Africa", "hub": "CAI", "connections": 35, "dominance": 65 }
  ],
  "network_topology": [
    { "metric": "Connectivité", "score": 82 },
    { "metric": "Centralité", "score": 75 },
    { "metric": "Robustesse", "score": 68 },
    { "metric": "Efficacité", "score": 89 },
    { "metric": "Redondance", "score": 71 },
    { "metric": "Densité", "score": 58 }
  ],
  "top_airlines": [ { "airline": "FR", "routes": 2484 }, { "airline": "AA", "routes": 2352 }, { "airline": "UA", "routes": 2178 }, { "airline": "DL", "routes": 1981 }, { "airline": "US", "routes": 1960 }, { "airline": "W6", "routes": 1696 }, { "airline": "U2", "routes": 1616 }, { "airline": "WN", "routes": 1568 }, { "airline": "IB", "routes": 1500 }, { "airline": "KE", "routes": 1464 } ],
  "routes_sample": [
    {"src_iata":"SYD","dst_iata":"DFW","distance_km":13808.2,"airline":"QF","continent":"Oceania"},
    {"src_iata":"JFK","dst_iata":"SIN","distance_km":15344.4,"airline":"SQ","continent":"North America"},
    {"src_iata":"AKL","dst_iata":"DXB","distance_km":14200.3,"airline":"EK","continent":"Oceania"},
    {"src_iata":"LAX","dst_iata":"SIN","distance_km":14113.9,"airline":"SQ","continent":"North America"},
    {"src_iata":"ATL","dst_iata":"JNB","distance_km":13581.8,"airline":"DL","continent":"North America"},
    {"src_iata":"CDG","dst_iata":"SCL","distance_km":11680.1,"airline":"AF","continent":"Europe"},
    {"src_iata":"LHR","dst_iata":"PER","distance_km":14469.7,"airline":"QF","continent":"Europe"},
    {"src_iata":"DOH","dst_iata":"AKL","distance_km":14535.5,"airline":"QR","continent":"Asia"},
    {"src_iata":"FRA","dst_iata":"LAX","distance_km":9200.5,"airline":"LH","continent":"Europe"},
    {"src_iata":"NRT","dst_iata":"JFK","distance_km":10850.2,"airline":"JL","continent":"Asia"}
  ],
  "iata_lookup": {
    "SYD": { "name": "Sydney Kingsford Smith", "city": "Sydney", "country": "Australia", "lat": -33.946111, "lon": 151.177222, "continent": "Oceania" },
    "DFW": { "name": "Dallas/Fort Worth International Airport", "city": "Dallas", "country": "United States", "lat": 32.896828, "lon": -97.037997, "continent": "North America" },
    "JFK": { "name": "John F. Kennedy International Airport", "city": "New York", "country": "United States", "lat": 40.639751, "lon": -73.778925, "continent": "North America" },
    "SIN": { "name": "Singapore Changi Airport", "city": "Singapore", "country": "Singapore", "lat": 1.350189, "lon": 103.994433, "continent": "Asia" },
    "AKL": { "name": "Auckland International Airport", "city": "Auckland", "country": "New Zealand", "lat": -37.008056, "lon": 174.791667, "continent": "Oceania" },
    "DXB": { "name": "Dubai International Airport", "city": "Dubai", "country": "United Arab Emirates", "lat": 25.252778, "lon": 55.364444, "continent": "Asia" },
    "LAX": { "name": "Los Angeles International Airport", "city": "Los Angeles", "country": "United States", "lat": 33.9425, "lon": -118.407222, "continent": "North America" },
    "ATL": { "name": "Hartsfield Jackson Atlanta International Airport", "city": "Atlanta", "country": "United States", "lat": 33.636719, "lon": -84.428067, "continent": "North America" },
    "JNB": { "name": "OR Tambo International Airport", "city": "Johannesburg", "country": "South Africa", "lat": -26.139167, "lon": 28.246111, "continent": "Africa" },
    "CDG": { "name": "Charles de Gaulle Airport", "city": "Paris", "country": "France", "lat": 49.012779, "lon": 2.55, "continent": "Europe" },
    "SCL": { "name": "Arturo Merino Benítez International Airport", "city": "Santiago", "country": "Chile", "lat": -33.393056, "lon": -70.785833, "continent": "South America" },
    "LHR": { "name": "London Heathrow Airport", "city": "London", "country": "United Kingdom", "lat": 51.4775, "lon": -0.461389, "continent": "Europe" },
    "PER": { "name": "Perth International Airport", "city": "Perth", "country": "Australia", "lat": -31.940278, "lon": 115.966944, "continent": "Oceania" },
    "DOH": { "name": "Hamad International Airport", "city": "Doha", "country": "Qatar", "lat": 25.273056, "lon": 51.608056, "continent": "Asia" },
    "FRA": { "name": "Frankfurt am Main Airport", "city": "Frankfurt", "country": "Germany", "lat": 50.033333, "lon": 8.570556, "continent": "Europe" },
    "NRT": { "name": "Narita International Airport", "city": "Tokyo", "country": "Japan", "lat": 35.7647, "lon": 140.3864, "continent": "Asia" }
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
        filtersTitle: "Filtres Avancés",
        continentFilter: "Continent",
        airlineFilter: "Compagnie",
        allContinents: "Tous continents",
        allAirlines: "Toutes compagnies",
        resetFilters: "Réinitialiser",
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
        hubDominanceTitle: "Dominance des Hubs Continentaux",
        networkTopologyTitle: "Analyse Topologique du Réseau",
        connections: "connexions",
        continents: {
            "Europe": "Europe",
            "North America": "Amérique du Nord",
            "South America": "Amérique du Sud",
            "Asia": "Asie",
            "Africa": "Afrique",
            "Oceania": "Océanie"
        }
    },
    en: {
        headerTitle: "AirFlow Dynamics",
        headerSubtitle: "Global Air Traffic Intelligence",
        exportButton: "Export as PDF",
        cockpitTab: "Visual Synthesis",
        analyticsTab: "Detailed Analytics",
        filtersTitle: "Advanced Filters",
        continentFilter: "Continent",
        airlineFilter: "Airline",
        allContinents: "All continents",
        allAirlines: "All airlines",
        resetFilters: "Reset filters",
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
        hubDominanceTitle: "Continental Hub Dominance",
        networkTopologyTitle: "Network Topology Analysis",
        connections: "connections",
        continents: {
            "Europe": "Europe",
            "North America": "North America",
            "South America": "South America",
            "Asia": "Asia",
            "Africa": "Africa",
            "Oceania": "Oceania"
        }
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
    <div className="flex items-center space-x-3 group cursor-pointer" aria-label={label}>
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-800/50 to-slate-900/80 border border-slate-700 rounded-xl flex items-center justify-center group-hover:border-cyan-400/50 transition-all duration-300">
            <Icon className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div>
            <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{label}</div>
            <div className="text-white text-2xl font-semibold font-mono tracking-tight group-hover:text-cyan-300 transition-colors">
                {typeof value === 'number' ? <AnimatedNumber value={value} /> : '...'}
            </div>
        </div>
    </div>
);

const RadialCard = ({ icon: Icon, title, value, unit }) => (
    <div className="relative w-40 h-28 bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-md border border-slate-700/80 rounded-xl flex flex-col items-center justify-center p-2 text-center shadow-xl shadow-black/30 transform transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:shadow-cyan-400/20">
        <Icon className="w-6 h-6 text-cyan-300 mb-1" />
        <span className="text-xs text-slate-300 leading-tight">{title}</span>
        <span className="text-xl font-bold font-mono text-white tracking-tight">{value} <span className="text-sm font-sans text-slate-400">{unit}</span></span>
    </div>
);

const RouteSignatureCard = ({ route, lookup, maxDistance }) => (
    <div className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 space-y-2 transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-cyan-400/10">
        <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-white">{lookup?.[route.src_iata]?.city || route.src_iata} ({route.src_iata})</span>
            <span className="text-slate-400 animate-pulse">→</span>
            <span className="font-semibold text-white">{lookup?.[route.dst_iata]?.city || route.dst_iata} ({route.dst_iata})</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-700 hover:from-cyan-300 hover:to-blue-400" style={{ width: `${(route.distance_km / (maxDistance || route.distance_km)) * 100}%` }}></div>
        </div>
        <div className="text-right text-xs text-slate-300 font-mono">
            {Math.round(route.distance_km).toLocaleString()} km
        </div>
    </div>
);

// --- Enhanced Interactive SVG Map with particle effects ---
const InteractiveSvgMap = ({ data, filters }) => {
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 500 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [selectedAirport, setSelectedAirport] = useState(null);

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

    const filteredRoutes = useMemo(() => {
        const routes = data.routes_sample || [];
        return routes.filter(route => {
            const srcAirport = data.iata_lookup?.[route.src_iata];
            const dstAirport = data.iata_lookup?.[route.dst_iata];
            
            const continentMatch = !filters.continent || 
                srcAirport?.continent === filters.continent || 
                dstAirport?.continent === filters.continent;
            
            const airlineMatch = !filters.airline || route.airline === filters.airline;
            
            return continentMatch && airlineMatch;
        });
    }, [data.routes_sample, data.iata_lookup, filters]);

    const handleZoom = (factor) => {
        setViewBox(prev => {
            const newW = Math.max(500, Math.min(2000, prev.w * factor));
            const newH = Math.max(250, Math.min(1000, prev.h * factor));
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

    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-800 relative bg-gradient-to-br from-slate-900 to-slate-800 cursor-grab shadow-2xl" onMouseLeave={onMouseUp}>
            <svg viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} width="100%" height="100%">
                {/* Enhanced background with gradient */}
                <defs>
                    <radialGradient id="oceanGradient" cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <rect x="0" y="0" width="1000" height="500" fill="url(#oceanGradient)" />
                
                {/* Routes with glow effect */}
                <g>
                    {filteredRoutes.slice(0, 1000).map((route, idx) => {
                        const src = projectedAirports[route.src_iata];
                        const dst = projectedAirports[route.dst_iata];
                        if (!src || !dst) return null;
                        const isSelected = selectedAirport && (route.src_iata === selectedAirport || route.dst_iata === selectedAirport);
                        return (
                            <line 
                                key={idx} 
                                x1={src.x} y1={src.y} 
                                x2={dst.x} y2={dst.y} 
                                stroke={isSelected ? "#22d3ee" : "#0ea5e9"} 
                                strokeWidth={isSelected ? "1.2" : "0.6"} 
                                opacity={isSelected ? "0.8" : "0.4"}
                                filter={isSelected ? "url(#glow)" : "none"}
                                className="transition-all duration-300"
                            />
                        );
                    })}
                </g>
                
                {/* Airports with enhanced styling */}
                <g>
                    {Object.entries(projectedAirports).slice(0, 1500).map(([iata, a]) => {
                        const isSelected = selectedAirport === iata;
                        const isInFilteredRoutes = filteredRoutes.some(r => r.src_iata === iata || r.dst_iata === iata);
                        return (
                            <circle 
                                key={iata} 
                                cx={a.x} cy={a.y} 
                                r={isSelected ? "3" : "1.6"} 
                                fill={isSelected ? "#22d3ee" : (isInFilteredRoutes ? "#e0f2fe" : "#64748b")} 
                                onClick={() => setSelectedAirport(iata === selectedAirport ? null : iata)}
                                className="cursor-pointer transition-all duration-300 hover:r-2.5"
                                filter={isSelected ? "url(#glow)" : "none"}
                            />
                        );
                    })}
                </g>
            </svg>
            
            {/* Enhanced controls */}
            <div className="absolute top-3 right-3 z-[10] flex flex-col space-y-1 no-print">
                <button onClick={() => handleZoom(0.8)} className="w-8 h-8 bg-slate-800/90 backdrop-blur text-white rounded-md flex items-center justify-center hover:bg-slate-700 hover:scale-110 transition-all duration-200" aria-label="Zoom in"><Plus size={16}/></button>
                <button onClick={() => handleZoom(1.25)} className="w-8 h-8 bg-slate-800/90 backdrop-blur text-white rounded-md flex items-center justify-center hover:bg-slate-700 hover:scale-110 transition-all duration-200" aria-label="Zoom out"><Minus size={16}/></button>
                <button onClick={() => setSelectedAirport(null)} className="w-8 h-8 bg-slate-800/90 backdrop-blur text-white rounded-md flex items-center justify-center hover:bg-slate-700 hover:scale-110 transition-all duration-200" aria-label="Reset"><Maximize size={16}/></button>
            </div>
            
            {/* Selected airport info */}
            {selectedAirport && (
                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 text-sm text-white">
                    <div className="font-semibold">{projectedAirports[selectedAirport]?.name}</div>
                    <div className="text-slate-300">{projectedAirports[selectedAirport]?.city}, {projectedAirports[selectedAirport]?.country}</div>
                    <div className="text-cyan-400 text-xs font-mono">{selectedAirport}</div>
                </div>
            )}
        </div>
    );
};

// --- Filter Component ---
const FilterPanel = ({ filters, setFilters, data, content }) => {
    const continents = ['Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania'];
    const airlines = [...new Set((data.routes_sample || []).map(r => r.airline))].sort();

    return (
        <div className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
                <Filter className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">{content.filtersTitle}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm text-slate-300 mb-2">{content.continentFilter}</label>
                    <select 
                        value={filters.continent} 
                        onChange={e => setFilters(f => ({...f, continent: e.target.value}))}
                        className="w-full bg-slate-800/80 text-slate-200 rounded-lg px-3 py-2 border border-slate-700 focus:border-cyan-400 focus:outline-none transition-colors"
                    >
                        <option value="">{content.allContinents}</option>
                        {continents.map(cont => (
                            <option key={cont} value={cont}>{content.continents[cont]}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-300 mb-2">{content.airlineFilter}</label>
                    <select 
                        value={filters.airline} 
                        onChange={e => setFilters(f => ({...f, airline: e.target.value}))}
                        className="w-full bg-slate-800/80 text-slate-200 rounded-lg px-3 py-2 border border-slate-700 focus:border-cyan-400 focus:outline-none transition-colors"
                    >
                        <option value="">{content.allAirlines}</option>
                        {airlines.map(airline => (
                            <option key={airline} value={airline}>{airline}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={() => setFilters({continent: '', airline: ''})}
                        className="w-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-2 rounded-lg border border-slate-700 hover:border-cyan-400 transition-all duration-200"
                    >
                        {content.resetFilters}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Enhanced Chart Components ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur border border-slate-600 rounded-xl p-4 shadow-2xl">
                <p className="text-cyan-300 font-semibold mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between space-x-4 mb-1">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-slate-300 text-sm">{entry.name}</span>
                        </div>
                        <span className="text-white font-bold font-mono">
                            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function App() {
    const [language, setLanguage] = useState('fr');
    const [data, setData] = useState(aviationFallback);
    const [loadedFromJson, setLoadedFromJson] = useState(false);
    const [filters, setFilters] = useState({ continent: '', airline: '' });
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetch('/data/analytics_results.json', { cache: 'no-store' })
          .then(r => { if (!r.ok) throw new Error('JSON introuvable'); return r.json(); })
          .then(json => { setData({...aviationFallback, ...json}); setLoadedFromJson(true); })
          .catch(err => { console.warn('Fallback: ', err.message); });
    }, []);

    const content = i18n[language];

    // Enhanced derived data with filters
    const metrics = data.metrics || {};
    const routesSample = data.routes_sample || [];
    const iataLookup = data.iata_lookup || {};

    // Filter routes based on current filters
    const filteredRoutes = useMemo(() => {
        return routesSample.filter(route => {
            const srcAirport = iataLookup[route.src_iata];
            const dstAirport = iataLookup[route.dst_iata];
            
            const continentMatch = !filters.continent || 
                srcAirport?.continent === filters.continent || 
                dstAirport?.continent === filters.continent;
            
            const airlineMatch = !filters.airline || route.airline === filters.airline;
            
            return continentMatch && airlineMatch;
        });
    }, [routesSample, iataLookup, filters]);

    const signatureRoutes = useMemo(() => 
        [...filteredRoutes].sort((a,b) => (b.distance_km||0) - (a.distance_km||0)).slice(0,4), 
        [filteredRoutes]
    );

    const donut = data.domestic_vs_international || [];
    const haul = data.haul_distribution || [];
    const continentalHubs = data.continental_hubs || [];
    const networkTopology = data.network_topology || [];

    const longHaulItem = haul.find(h => (h.label || '').toLowerCase().includes('long')) || { count: 0 };
    const haulTotal = haul.reduce((acc, h) => acc + (h.count || 0), 0) || 1;
    const longHaulShare = (longHaulItem.count / haulTotal) * 100;
    const avgDistance = filteredRoutes.length ? filteredRoutes.reduce((acc, r) => acc + (r.distance_km || 0), 0) / filteredRoutes.length : 0;

    const topAirlines = (data.top_airlines || []).slice(0, 10);

    return (
        <>
            <style>{`
                :root { --aurora-1: 10, 110, 235; --aurora-2: 60, 10, 180; --aurora-3: 180, 50, 120; }
                .bg-aurora { position: fixed; inset: 0; background: #020617; z-index: -2; }
                .bg-aurora::after { 
                    content: ''; position: absolute; inset: 0; 
                    background-image: 
                        radial-gradient(ellipse 25% 40% at 20% 20%, rgba(var(--aurora-1), 0.3), transparent), 
                        radial-gradient(ellipse 25% 40% at 80% 25%, rgba(var(--aurora-2), 0.2), transparent), 
                        radial-gradient(ellipse 25% 40% at 50% 90%, rgba(var(--aurora-3), 0.2), transparent); 
                    animation: aurora-anim 20s ease-in-out infinite; 
                }
                .bg-noise { 
                    position: fixed; top: -50%; left: -50%; right: -50%; bottom: -50%; 
                    width: 200%; height: 200%; 
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); 
                    animation: noise-anim 3s linear infinite; 
                    opacity: 0.03; z-index: -1; 
                }
                .bg-particles {
                    position: fixed; inset: 0; z-index: -1;
                    background-image: 
                        radial-gradient(2px 2px at 20px 30px, rgba(34, 211, 238, 0.3), transparent),
                        radial-gradient(2px 2px at 40px 70px, rgba(168, 85, 247, 0.3), transparent),
                        radial-gradient(1px 1px at 90px 40px, rgba(34, 211, 238, 0.2), transparent),
                        radial-gradient(1px 1px at 130px 80px, rgba(168, 85, 247, 0.2), transparent);
                    background-repeat: repeat;
                    background-size: 150px 100px;
                    animation: particles-float 25s linear infinite;
                }
                @keyframes aurora-anim { 
                    0%, 100% { transform: scale(1) rotate(0deg); } 
                    33% { transform: scale(1.1) rotate(2deg); }
                    66% { transform: scale(0.95) rotate(-1deg); }
                }
                @keyframes noise-anim { 
                    0% { transform: translate(0,0); } 
                    25% { transform: translate(-5%, 3%); }
                    50% { transform: translate(3%, -4%); }
                    75% { transform: translate(-2%, 2%); }
                    100% { transform: translate(0,0); }
                }
                @keyframes particles-float {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    100% { transform: translate(-100px, -100px) rotate(360deg); }
                }
                @keyframes subtle-float { 
                    0%, 100% { transform: translateY(0) rotate(-1deg); } 
                    50% { transform: translateY(-15px) rotate(1deg); } 
                }
                .animate-subtle-float { animation: subtle-float 8s ease-in-out infinite; }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(34, 211, 238, 0.6); }
                }
                .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
                @media print { 
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
                    .no-print { display: none; } 
                }
            `}</style>

            <div className="bg-aurora"></div>
            <div className="bg-noise"></div>
            <div className="bg-particles"></div>

            <div className="min-h-screen text-slate-200 font-sans">
                <header className="bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 no-print shadow-2xl">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-xl shadow-lg animate-pulse-glow">
                                    <Plane className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        {content.headerTitle}
                                    </h1>
                                    <p className="text-sm text-slate-400">{content.headerSubtitle}{loadedFromJson ? ' • JSON' : ' • fallback'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2 bg-slate-800/60 backdrop-blur rounded-xl p-1 border border-slate-700/50">
                                    <button 
                                        onClick={() => setLanguage('fr')} 
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            language === 'fr' 
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                    >
                                        FR
                                    </button>
                                    <button 
                                        onClick={() => setLanguage('en')} 
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            language === 'en' 
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                    >
                                        EN
                                    </button>
                                </div>
                                <button 
                                    onClick={() => window.print()} 
                                    className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 rounded-xl text-white shadow-xl transition-all duration-200 hover:scale-105"
                                >
                                    <Download className="w-4 h-4"/>
                                    <span>{content.exportButton}</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Tab Navigation */}
                        <div className="flex space-x-2 pb-4 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                    activeTab === 'overview'
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                            >
                                <GaugeCircle className="w-4 h-4" />
                                <span className="font-medium">{content.cockpitTab}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                    activeTab === 'analytics'
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                            >
                                <Target className="w-4 h-4" />
                                <span className="font-medium">{content.analyticsTab}</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Filters */}
                    <FilterPanel filters={filters} setFilters={setFilters} data={data} content={content} />

                    {activeTab === 'overview' && (
                        <>
                            {/* HERO */}
                            <section>
                                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 overflow-hidden shadow-2xl">
                                    <div className="space-y-6">
                                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                            {content.cockpitTab}
                                        </h1>
                                        <p className="text-slate-400 max-w-lg">
                                            Vue d'ensemble data-driven (OpenFlights). KPIs, routes signatures et tendances.
                                        </p>
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
                                <div className="md:col-span-1 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 space-y-3">
                                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                                        <span className="text-sm text-slate-300">{content.longHaulShare}</span>
                                        <span className="font-mono font-bold text-white">{longHaulShare.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                                        <span className="text-sm text-slate-300">{content.avgRouteDistance}</span>
                                        <span className="font-mono font-bold text-white">{Math.round(avgDistance).toLocaleString()} km</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4">
                                    <h3 className="text-sm text-slate-300 mb-3 flex items-center">
                                        <Shuffle className="w-4 h-4 mr-2 text-cyan-400" />
                                        {content.globalRoutesTitle}
                                    </h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {signatureRoutes.map((r, i) => (
                                          <RouteSignatureCard key={`${r.src_iata}-${r.dst_iata}-${i}`} route={r} lookup={iataLookup} maxDistance={metrics?.longest_route?.distance_km || (signatureRoutes[0]?.distance_km || 1)} />
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* MAP */}
                            <section className="mt-8">
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                    <Globe className="w-6 h-6 mr-3 text-cyan-400" />
                                    {content.mapTitle}
                                </h2>
                                <InteractiveSvgMap data={{ routes_sample: filteredRoutes, iata_lookup: iataLookup }} filters={filters} />
                            </section>

                            {/* CHARTS */}
                            <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">{content.donutTitle}</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={donut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                                {donut.map((d, i) => <Cell key={i} fill={i === 0 ? '#22d3ee' : '#10B981'} />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">{content.haulDistTitle}</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={haul} margin={{top: 20, right: 0, left: 0, bottom: 0}}>
                                            <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" vertical={false}/>
                                            <XAxis dataKey="label" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false}/>
                                            <YAxis hide={true}/>
                                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                            <Bar dataKey="count" barSize={40} radius={[8, 8, 0, 0]}>
                                                {(haul || []).map((_, i) => <Cell key={i} fill={['#22d3ee','#F59E0B','#10B981'][i % 3]} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>

                            {/* TOP AIRLINES */}
                            <section className="mt-8 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <Building className="w-5 h-5 mr-2 text-cyan-400" />
                                    {content.topAirlinesTitle}
                                </h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={topAirlines} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="airline" stroke="#94a3b8" fontSize={12} width={80} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                        <Bar dataKey="routes" barSize={18} radius={[0, 10, 10, 0]}>
                                            {topAirlines.map((_, i) => <Cell key={i} fill="#22d3ee" />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </section>
                        </>
                    )}

                    {activeTab === 'analytics' && (
                        <>
                            {/* Hub Dominance */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <Target className="w-6 h-6 mr-3 text-cyan-400" />
                                    {content.hubDominanceTitle}
                                </h2>
                                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={continentalHubs} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="continent" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} />
                                            <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="connections" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="dominance" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>

                            {/* Network Topology */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <Network className="w-6 h-6 mr-3 text-cyan-400" />
                                    {content.networkTopologyTitle}
                                </h2>
                                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <RadarChart data={networkTopology}>
                                            <PolarGrid stroke="rgba(255,255,255,0.2)" />
                                            <PolarAngleAxis dataKey="metric" tick={{fill: '#94a3b8', fontSize: 12}} />
                                            <PolarRadiusAxis domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 10}} tickCount={5} />
                                            <Radar
                                                name="Score"
                                                dataKey="score"
                                                stroke="#22d3ee"
                                                fill="#22d3ee"
                                                fillOpacity={0.3}
                                                strokeWidth={2}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </>
    );
}
