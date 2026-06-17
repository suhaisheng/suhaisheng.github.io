(() => {
  const COUNTAPI_BASE = 'https://countapi.mileshilliard.com/api/v1';
  const COUNTRY_META = {
    AU: { name: 'Australia', lat: -25.27, lng: 133.77 },
    CA: { name: 'Canada', lat: 56.13, lng: -106.35 },
    CH: { name: 'Switzerland', lat: 46.82, lng: 8.23 },
    CN: { name: 'China', lat: 35.86, lng: 104.19 },
    DE: { name: 'Germany', lat: 51.16, lng: 10.45 },
    ES: { name: 'Spain', lat: 40.46, lng: -3.74 },
    FR: { name: 'France', lat: 46.22, lng: 2.21 },
    GB: { name: 'United Kingdom', lat: 55.37, lng: -3.43 },
    HK: { name: 'Hong Kong', lat: 22.32, lng: 114.17 },
    IN: { name: 'India', lat: 20.59, lng: 78.96 },
    IT: { name: 'Italy', lat: 41.87, lng: 12.56 },
    JP: { name: 'Japan', lat: 36.20, lng: 138.25 },
    KR: { name: 'South Korea', lat: 35.90, lng: 127.77 },
    MY: { name: 'Malaysia', lat: 4.21, lng: 101.97 },
    NL: { name: 'Netherlands', lat: 52.13, lng: 5.29 },
    RU: { name: 'Russia', lat: 61.52, lng: 105.31 },
    SE: { name: 'Sweden', lat: 60.12, lng: 18.64 },
    SG: { name: 'Singapore', lat: 1.35, lng: 103.82 },
    TW: { name: 'Taiwan', lat: 23.70, lng: 120.96 },
    US: { name: 'United States', lat: 37.09, lng: -95.71 },
  };
  const TRACKED_COUNTRIES = Object.keys(COUNTRY_META);

  const locationEl = document.getElementById('stat-location');
  const countriesWrap = document.getElementById('stat-countries');
  const countriesListEl = document.getElementById('stat-countries-list');
  const mapWrap = document.getElementById('visitor-map-wrap');
  const mapEl = document.getElementById('visitor-map');

  let leafletPromise;
  let visitorMap;

  function countryFlag(code) {
    if (!code || code.length !== 2) {
      return '';
    }

    return String.fromCodePoint(
      ...[...code.toUpperCase()].map((char) => 127397 + char.charCodeAt(0))
    );
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function ensureLeaflet() {
    if (window.L) {
      return Promise.resolve(window.L);
    }

    if (!leafletPromise) {
      leafletPromise = loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
        .then(() => window.L);
    }

    return leafletPromise;
  }

  async function countApiRequest(action, key) {
    const response = await fetch(`${COUNTAPI_BASE}/${action}/${key}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`CountAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    return Number(data.value) || 0;
  }

  async function fetchGeo() {
    const endpoints = [
      'https://ipwho.is/',
      'https://ipapi.co/json/',
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { cache: 'no-store' });
        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        if (endpoint.includes('ipwho.is') && data.success) {
          return {
            city: data.city,
            country: data.country,
            countryCode: data.country_code?.toUpperCase(),
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
          };
        }

        if (endpoint.includes('ipapi.co') && !data.error) {
          return {
            city: data.city,
            country: data.country_name,
            countryCode: data.country_code?.toUpperCase(),
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
          };
        }
      } catch {
        // Try the next provider.
      }
    }

    return null;
  }

  async function loadCountryStats(currentCountryCode) {
    const codes = [...new Set([currentCountryCode, ...TRACKED_COUNTRIES].filter(Boolean))];
    const results = await Promise.all(
      codes.map(async (code) => {
        try {
          const value = await countApiRequest('get', `haisheng-su-homepage-country-${code.toLowerCase()}`);
          return { code, value };
        } catch {
          return { code, value: 0 };
        }
      })
    );

    return results
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  function renderCountryList(active) {
    if (!active.length || !countriesWrap || !countriesListEl) {
      return;
    }

    countriesListEl.textContent = active
      .map((item) => {
        const flag = countryFlag(item.code);
        const name = COUNTRY_META[item.code]?.name || item.code;
        return `${flag ? `${flag} ` : ''}${name} (${item.value})`;
      })
      .join(' · ');

    countriesWrap.hidden = false;
  }

  async function renderVisitorMap(active, geo) {
    if (!mapWrap || !mapEl || !active.length) {
      return;
    }

    try {
      const L = await ensureLeaflet();
      mapWrap.hidden = false;

      if (visitorMap) {
        visitorMap.remove();
        visitorMap = null;
      }

      visitorMap = L.map(mapEl, {
        scrollWheelZoom: false,
        worldCopyJump: true,
        minZoom: 1,
        maxZoom: 5,
      }).setView([24, 10], 2);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(visitorMap);

      const maxValue = Math.max(...active.map((item) => item.value), 1);

      active.forEach(({ code, value }) => {
        const meta = COUNTRY_META[code];
        if (!meta) {
          return;
        }

        const radius = 7 + (value / maxValue) * 16;
        L.circleMarker([meta.lat, meta.lng], {
          radius,
          fillColor: '#2563eb',
          color: '#1d4ed8',
          weight: 1.5,
          fillOpacity: 0.72,
        })
          .addTo(visitorMap)
          .bindPopup(`<strong>${meta.name}</strong><br>${value} visit${value === 1 ? '' : 's'}`);
      });

      if (Number.isFinite(geo?.latitude) && Number.isFinite(geo?.longitude)) {
        L.circleMarker([geo.latitude, geo.longitude], {
          radius: 8,
          fillColor: '#dc2626',
          color: '#ffffff',
          weight: 2.5,
          fillOpacity: 0.95,
        })
          .addTo(visitorMap)
          .bindPopup('<strong>You are here</strong>');
      }

      setTimeout(() => visitorMap.invalidateSize(), 120);
    } catch {
      mapWrap.hidden = true;
    }
  }

  async function initStats() {
    let geo = null;

    try {
      geo = await fetchGeo();
    } catch {
      geo = null;
    }

    if (geo && locationEl) {
      const city = geo.city || 'Unknown city';
      const country = geo.country || 'Unknown country';
      const flag = countryFlag(geo.countryCode);
      locationEl.textContent = `${flag ? `${flag} ` : ''}${city}, ${country}`;
    }

    try {
      await countApiRequest('hit', 'haisheng-su-homepage-total');
      if (geo?.countryCode) {
        await countApiRequest('hit', `haisheng-su-homepage-country-${geo.countryCode.toLowerCase()}`);
      }

      const active = await loadCountryStats(geo?.countryCode);
      renderCountryList(active);
      await renderVisitorMap(active, geo);
    } catch {
      if (countriesWrap) {
        countriesWrap.hidden = true;
      }
      if (mapWrap) {
        mapWrap.hidden = true;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStats);
  } else {
    initStats();
  }
})();
