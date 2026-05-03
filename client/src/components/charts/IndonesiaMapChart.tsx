import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useState } from 'react';
import { CANDIDATE_COLORS } from '@/utils/constants';

interface IndonesiaMapChartProps {
  data: Array<{
    provinceName: string;
    dominantCandidate: string | null;
    supportStatus: string;
  }>;
}

// Simplified SVG paths for Indonesia provinces (placeholder - in production use actual GeoJSON)
const INDONESIA_GEO = [
  { id: 'aceh', name: 'Aceh', d: 'M 50 20 L 60 25 L 55 35 L 45 30 Z' },
  { id: 'sumatera-utara', name: 'Sumatera Utara', d: 'M 50 35 L 60 40 L 55 50 L 45 45 Z' },
  { id: 'sumatera-barat', name: 'Sumatera Barat', d: 'M 45 45 L 55 50 L 50 60 L 40 55 Z' },
  { id: 'riau', name: 'Riau', d: 'M 60 50 L 70 55 L 65 65 L 55 60 Z' },
  { id: 'kepulauan-riau', name: 'Kepulauan Riau', d: 'M 70 45 L 80 50 L 75 60 L 65 55 Z' },
  { id: 'jambi', name: 'Jambi', d: 'M 50 60 L 60 65 L 55 75 L 45 70 Z' },
  { id: 'sumatera-selatan', name: 'Sumatera Selatan', d: 'M 45 70 L 55 75 L 50 85 L 40 80 Z' },
  { id: 'bangka-belitung', name: 'Bangka Belitung', d: 'M 60 75 L 70 80 L 65 90 L 55 85 Z' },
  { id: 'bengkulu', name: 'Bengkulu', d: 'M 40 80 L 50 85 L 45 95 L 35 90 Z' },
  { id: 'lampung', name: 'Lampung', d: 'M 45 90 L 55 95 L 50 105 L 40 100 Z' },
  { id: 'dki-jakarta', name: 'DKI Jakarta', d: 'M 100 120 L 110 125 L 105 135 L 95 130 Z' },
  { id: 'jawa-barat', name: 'Jawa Barat', d: 'M 95 130 L 110 135 L 105 150 L 90 145 Z' },
  { id: 'banten', name: 'Banten', d: 'M 100 125 L 115 130 L 110 140 L 95 135 Z' },
  { id: 'jawa-tengah', name: 'Jawa Tengah', d: 'M 90 145 L 110 150 L 105 165 L 85 160 Z' },
  { id: 'di-yogyakarta', name: 'DI Yogyakarta', d: 'M 95 160 L 105 165 L 100 170 L 90 165 Z' },
  { id: 'jawa-timur', name: 'Jawa Timur', d: 'M 85 160 L 105 165 L 100 180 L 80 175 Z' },
  { id: 'bali', name: 'Bali', d: 'M 80 175 L 90 180 L 85 190 L 75 185 Z' },
  { id: 'nusa-tenggara-barat', name: 'Nusa Tenggara Barat', d: 'M 75 185 L 85 190 L 80 200 L 70 195 Z' },
  { id: 'nusa-tenggara-timur', name: 'Nusa Tenggara Timur', d: 'M 70 195 L 80 200 L 75 210 L 65 205 Z' },
  { id: 'kalimantan-barat', name: 'Kalimantan Barat', d: 'M 120 80 L 140 85 L 135 100 L 115 95 Z' },
  { id: 'kalimantan-tengah', name: 'Kalimantan Tengah', d: 'M 135 95 L 155 100 L 150 115 L 130 110 Z' },
  { id: 'kalimantan-selatan', name: 'Kalimantan Selatan', d: 'M 130 110 L 150 115 L 145 130 L 125 125 Z' },
  { id: 'kalimantan-timur', name: 'Kalimantan Timur', d: 'M 145 105 L 165 110 L 160 125 L 140 120 Z' },
  { id: 'kalimantan-utara', name: 'Kalimantan Utara', d: 'M 125 70 L 145 75 L 140 90 L 120 85 Z' },
  { id: 'sulawesi-utara', name: 'Sulawesi Utara', d: 'M 170 90 L 185 95 L 180 110 L 165 105 Z' },
  { id: 'gorontalo', name: 'Gorontalo', d: 'M 175 100 L 190 105 L 185 120 L 170 115 Z' },
  { id: 'sulawesi-tengah', name: 'Sulawesi Tengah', d: 'M 165 110 L 180 115 L 175 130 L 160 125 Z' },
  { id: 'sulawesi-barat', name: 'Sulawesi Barat', d: 'M 160 115 L 175 120 L 170 135 L 155 130 Z' },
  { id: 'sulawesi-selatan', name: 'Sulawesi Selatan', d: 'M 155 125 L 170 130 L 165 145 L 150 140 Z' },
  { id: 'sulawesi-tenggara', name: 'Sulawesi Tenggara', d: 'M 150 140 L 165 145 L 160 160 L 145 155 Z' },
  { id: 'maluku', name: 'Maluku', d: 'M 180 150 L 195 155 L 190 170 L 175 165 Z' },
  { id: 'maluku-utara', name: 'Maluku Utara', d: 'M 185 140 L 200 145 L 195 160 L 180 155 Z' },
  { id: 'papua', name: 'Papua', d: 'M 200 160 L 230 165 L 225 190 L 195 185 Z' },
  { id: 'papua-barat', name: 'Papua Barat', d: 'M 195 165 L 215 170 L 210 185 L 190 180 Z' },
  { id: 'papua-tengah', name: 'Papua Tengah', d: 'M 210 170 L 230 175 L 225 190 L 205 185 Z' },
  { id: 'papua-pegunungan', name: 'Papua Pegunungan', d: 'M 215 175 L 235 180 L 230 195 L 210 190 Z' },
  { id: 'papua-selatan', name: 'Papua Selatan', d: 'M 205 185 L 225 190 L 220 205 L 200 200 Z' },
  { id: 'papua-barat-daya', name: 'Papua Barat Daya', d: 'M 200 190 L 220 195 L 215 210 L 195 205 Z' },
];

export default function IndonesiaMapChart({ data }: IndonesiaMapChartProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const getProvinceColor = (provinceName: string) => {
    const provinceData = data.find(p => p.provinceName === provinceName);
    if (!provinceData || !provinceData.dominantCandidate) {
      return CANDIDATE_COLORS.GRAY;
    }
    return CANDIDATE_COLORS[provinceData.dominantCandidate] || CANDIDATE_COLORS.GRAY;
  };

  const getProvinceData = (provinceName: string) => {
    return data.find(p => p.provinceName === provinceName);
  };

  return (
    <div className="w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 800, center: [118, -2] }}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup>
          <Geographies geography={INDONESIA_GEO}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const provinceName = geo.properties?.name || geo.name;
                const isHovered = hoveredProvince === provinceName;

                return (
                  <Geography
                    key={geo.properties?.id || geo.id}
                    geography={geo}
                    fill={getProvinceColor(provinceName)}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2 : 1}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', opacity: 0.8 },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={() => setHoveredProvince(provinceName)}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-[10px] font-black uppercase tracking-tighter text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CANDIDATE_COLORS.BLUE }} />
          <span>Reynaldo Bryan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CANDIDATE_COLORS.RED }} />
          <span>Ade Jona</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CANDIDATE_COLORS.YELLOW }} />
          <span>Afie Kalla</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CANDIDATE_COLORS.GREEN }} />
          <span>Anthony Leong</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CANDIDATE_COLORS.GRAY }} />
          <span>Belum Menentukan</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredProvince && (
        <div className="absolute z-50 pointer-events-none p-3 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-2xl min-w-[200px] animate-in fade-in zoom-in-95 duration-200" style={{ left: '50%', transform: 'translateX(-50%)' }}>
          <div className="font-black text-slate-900 border-b border-slate-100 pb-2 mb-2 uppercase tracking-tight">{hoveredProvince}</div>
          {(() => {
            const provinceData = getProvinceData(hoveredProvince);
            if (!provinceData) return <div className="text-[10px] font-bold text-slate-400 uppercase">Belum ada data diinput</div>;
            return (
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <span className="text-[10px] font-black text-slate-700 uppercase">{provinceData.supportStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Caketum</span>
                  <span className="text-[10px] font-black text-primary uppercase">{provinceData.dominantCandidate ? provinceData.dominantCandidate : 'Belum menentukan'}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
