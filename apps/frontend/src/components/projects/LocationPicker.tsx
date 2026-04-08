import { useState, useCallback, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
export interface LocationValue {
    address: string;
    latitude: number;
    longitude: number;
}
interface Props {
    value?: LocationValue;
    onChange: (location: LocationValue) => void;
    error?: string;
}
interface GeocodingFeature {
    id: string;
    place_name: string;
    center: [
        number,
        number
    ];
}
const LocationPicker = ({ value, onChange, error }: Props) => {
    const [query, setQuery] = useState(value?.address ?? '');
    const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [viewState, setViewState] = useState({
        longitude: value?.longitude ?? 0,
        latitude: value?.latitude ?? 20,
        zoom: value ? 13 : 1.5,
    });
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchAddress = useCallback(async (q: string) => {
        if (q.trim().length < 3) {
            setSuggestions([]);
            return;
        }
        setIsSearching(true);
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&limit=5`;
            const res = await fetch(url);
            const data = await res.json();
            setSuggestions(data.features ?? []);
        }
        catch {
            setSuggestions([]);
        }
        finally {
            setIsSearching(false);
        }
    }, []);
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current)
            clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchAddress(val), 400);
    };
    const selectSuggestion = (feature: GeocodingFeature) => {
        const [lng, lat] = feature.center;
        setQuery(feature.place_name);
        setSuggestions([]);
        setViewState({ longitude: lng, latitude: lat, zoom: 14 });
        onChange({ address: feature.place_name, latitude: lat, longitude: lng });
    };
    const handleMapClick = useCallback(async (e: {
        lngLat: {
            lng: number;
            lat: number;
        };
    }) => {
        const { lng, lat } = e.lngLat;
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
            const res = await fetch(url);
            const data = await res.json();
            const placeName: string = data.features?.[0]?.place_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setQuery(placeName);
            onChange({ address: placeName, latitude: lat, longitude: lng });
        }
        catch {
            const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setQuery(fallback);
            onChange({ address: fallback, latitude: lat, longitude: lng });
        }
    }, [onChange]);
    return (<div className="space-y-3">
      
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10">
          search
        </span>
        <input type="text" placeholder="Search site address..." className={`input-standard w-full pl-11 h-12 ${error ? 'border-rose-300' : ''}`} value={query} onChange={handleQueryChange} autoComplete="off"/>
        {isSearching && (<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 animate-spin text-lg">
            progress_activity
          </span>)}

        
        {suggestions.length > 0 && (<ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50">
            {suggestions.map((s) => (<li key={s.id} className="px-5 py-3 text-sm font-medium text-primary hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0" onMouseDown={() => selectSuggestion(s)}>
                <span className="material-symbols-outlined text-base text-secondary shrink-0">location_on</span>
                <span className="truncate">{s.place_name}</span>
              </li>))}
          </ul>)}
      </div>

      
      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ height: 320 }}>
        <Map {...viewState} onMove={(e) => setViewState(e.viewState)} onClick={handleMapClick} mapStyle="mapbox://styles/mapbox/light-v11" mapboxAccessToken={MAPBOX_TOKEN} cursor="crosshair">
          <NavigationControl position="top-right"/>
          {value?.latitude && value?.longitude && (<Marker longitude={value.longitude} latitude={value.latitude} anchor="bottom">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-secondary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white !text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    location_on
                  </span>
                </div>
                <div className="w-1 h-3 bg-secondary rounded-b-full"/>
              </div>
            </Marker>)}
        </Map>
      </div>

      
      {value?.latitude && value?.longitude && (<div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-secondary">my_location</span>
            {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
          </span>
          <button type="button" className="text-rose-400 hover:text-rose-600 transition-colors" onClick={() => { setQuery(''); onChange({ address: '', latitude: 0, longitude: 0 }); }}>
            Clear
          </button>
        </div>)}

      {error && <p className="text-xs text-rose-500 font-medium ml-1">{error}</p>}
    </div>);
};
export default LocationPicker;
