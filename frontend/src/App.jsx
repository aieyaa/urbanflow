import { useState, useEffect } from 'react';
import { 
  Activity, 
  MapPin, 
  Search, 
  RefreshCw, 
  Layers, 
  Database, 
  Compass, 
  Navigation,
  Info
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [parkings, setParkings] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'ouvert', 'plein', 'ferme'
  const [selectedParking, setSelectedParking] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch health (DB + PostGIS status)
      const healthRes = await fetch(`${API_URL}/api/health`).catch(() => null);
      if (healthRes && healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData);
      } else {
        setHealth({ status: 'Error', database: 'Disconnected' });
      }

      // Fetch parkings
      const parkingsRes = await fetch(`${API_URL}/api/parkings`);
      if (!parkingsRes.ok) throw new Error('Impossible de charger les données des parkings');
      const parkingsData = await parkingsRes.json();
      setParkings(parkingsData);
      
      if (parkingsData.length > 0 && !selectedParking) {
        setSelectedParking(parkingsData[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map status integer or string to readable format
  const getStatusInfo = (statusVal) => {
    // 5 = Ouvert, 1 = Fermé, 2 = Complet / Abonnés seulement
    const statusStr = String(statusVal).toLowerCase();
    if (statusStr === '5' || statusStr.includes('ouvert')) {
      return { label: 'Ouvert', class: 'ouvert' };
    } else if (statusStr === '1' || statusStr.includes('ferme')) {
      return { label: 'Fermé', class: 'ferme' };
    } else if (statusStr === '2' || statusStr.includes('complet') || statusStr.includes('plein')) {
      return { label: 'Plein', class: 'plein' };
    }
    return { label: 'Inconnu', class: 'ferme' };
  };

  // Filter parkings based on search & status
  const filteredParkings = parkings.filter(item => {
    const name = (item.grp_nom || '').toLowerCase();
    const statusInfo = getStatusInfo(item.grp_statut);
    
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'ouvert') return matchesSearch && statusInfo.class === 'ouvert';
    if (filterStatus === 'plein') return matchesSearch && statusInfo.class === 'plein';
    if (filterStatus === 'ferme') return matchesSearch && statusInfo.class === 'ferme';
    
    return matchesSearch;
  });

  // Calculate occupation percentage
  const getOccupancyRate = (available, capacity) => {
    if (!capacity || capacity <= 0) return 0;
    const occupied = capacity - available;
    const rate = Math.round((occupied / capacity) * 100);
    return Math.max(0, Math.min(100, rate)); // clamp between 0-100
  };

  const getProgressColorClass = (rate) => {
    if (rate >= 90) return 'progress-red';
    if (rate >= 70) return 'progress-orange';
    return 'progress-green';
  };

  // Stats calculation
  const totalSpots = parkings.reduce((acc, curr) => acc + (curr.grp_exploitation || 0), 0);
  const totalAvailable = parkings.reduce((acc, curr) => acc + (curr.grp_dispo || 0), 0);
  const openCount = parkings.filter(p => getStatusInfo(p.grp_statut).class === 'ouvert').length;

  return (
    <>
      <div className="bg-mesh"></div>
      
      <div className="container">
        {/* Header */}
        <header>
          <div className="logo-container">
            <div className="logo-icon">
              <Compass size={24} />
            </div>
            <div>
              <h1>Urbanflow</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Flux urbains & Disponibilité Parkings Nantes Métropole
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Database & PostGIS status */}
            {health ? (
              <div className={`status-badge ${health.database === 'Connected' ? 'connected' : 'disconnected'}`}>
                <Database size={14} />
                <span>PostGIS : {health.database === 'Connected' ? 'Actif' : 'Inactif'}</span>
                <span className="pulse-dot"></span>
              </div>
            ) : (
              <div className="status-badge">
                <Database size={14} className="animate-spin" />
                <span>Vérification BDD...</span>
              </div>
            )}
            
            <button className="filter-btn" onClick={fetchData} title="Rafraîchir les données">
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        {/* Quick Stats Strip */}
        {/* <section className="stats-strip">
          <div className="card stat-card">
            <div className="stat-icon-wrapper">
              <Activity size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-value">{openCount} / {parkings.length}</span>
              <span className="stat-label">Parkings Ouverts</span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <Layers size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-value">{totalAvailable.toLocaleString()}</span>
              <span className="stat-label">Places Libres</span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
              <Navigation size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-value">{totalSpots.toLocaleString()}</span>
              <span className="stat-label font-heading">Capacité Totale</span>
            </div>
          </div>
        </section> */}

        {/* Dashboard Grid */}
        {/* <div className="dashboard-grid"> */}
          {/* Left Panel: List & Search */}
          {/* <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="controls-row">
              <h2>Parkings en Temps Réel</h2>
              
              <div className="flex-gap">
                <button 
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  Tous
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'ouvert' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('ouvert')}
                >
                  Ouverts
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'plein' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('plein')}
                >
                  Pleins
                </button>
              </div>
            </div>

            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Rechercher un parking..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem', animation: 'spin 2s linear infinite' }} />
                <p>Chargement des parkings de Nantes...</p>
              </div>
            ) : error ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
                <p>Erreur : {error}</p>
                <button className="filter-btn" onClick={fetchData} style={{ marginTop: '1rem' }}>Réessayer</button>
              </div>
            ) : filteredParkings.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Info size={32} style={{ margin: '0 auto 1rem' }} />
                <p>Aucun parking ne correspond à vos critères.</p>
              </div>
            ) : (
              <div className="parking-list">
                {filteredParkings.map((item) => {
                  const statusInfo = getStatusInfo(item.grp_statut);
                  const available = item.grp_dispo || 0;
                  const capacity = item.grp_exploitation || 1;
                  const occupancyRate = getOccupancyRate(available, capacity);
                  const isSelected = selectedParking?.grp_identifiant === item.grp_identifiant;

                  return (
                    <div 
                      key={item.grp_identifiant} 
                      className="parking-item"
                      style={{ 
                        borderColor: isSelected ? 'var(--primary)' : '',
                        background: isSelected ? 'rgba(59, 130, 246, 0.08)' : ''
                      }}
                      onClick={() => setSelectedParking(item)}
                    >
                      <div className="parking-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="parking-title">{item.grp_nom}</span>
                          <span className={`status-pill ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="parking-meta">
                          <span>Disponible: <strong>{available}</strong></span>
                          <span>Capacité: {capacity}</span>
                        </div>
                        <div className="progress-container">
                          <div 
                            className={`progress-bar ${getProgressColorClass(occupancyRate)}`}
                            style={{ width: `${occupancyRate}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="parking-stats">
                        <span className="capacity-number" style={{ color: occupancyRate > 90 ? 'var(--danger)' : 'var(--text-primary)' }}>
                          {occupancyRate}%
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupé</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section> */}

          {/* Right Panel: PostGIS Map Visualisation */}
          {/* <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2>Visualisation PostGIS</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Positionnement géospatial des parkings nantais (données géographiques projetées).
            </p>

            <div className="map-visual">
              <div className="map-grid-overlay"></div>
              
              {/* Display mock nodes inside the map representing coordinates 
              {filteredParkings.slice(0, 15).map((p, index) => {
                // Generate relative position for visualization using their coordinates or index to simulate space
                const lat = p.location?.lat || p.geo_point_2d?.lat;
                const lon = p.location?.lon || p.geo_point_2d?.lon;
                
                // Nantes bound approximation
                // Lat: ~47.21, Lon: ~-1.55
                // Let's map coordinates to percentage bounds of the box
                let topPercent = 50;
                let leftPercent = 50;
                
                if (lat && lon) {
                  const minLat = 47.18;
                  const maxLat = 47.25;
                  const minLon = -1.62;
                  const maxLon = -1.50;
                  
                  topPercent = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
                  leftPercent = ((lon - minLon) / (maxLon - minLon)) * 100;
                  
                  // Clamp to 5%-95% to avoid falling off edges
                  topPercent = Math.max(10, Math.min(90, topPercent));
                  leftPercent = Math.max(10, Math.min(90, leftPercent));
                } else {
                  // Fallback: spiral layout
                  const angle = index * 0.9;
                  const radius = 25 + index * 4;
                  topPercent = 50 + Math.sin(angle) * radius;
                  leftPercent = 50 + Math.cos(angle) * radius;
                }

                const isSelected = selectedParking?.grp_identifiant === p.grp_identifiant;
                const statusInfo = getStatusInfo(p.grp_statut);
                
                let dotColor = 'var(--primary)';
                if (statusInfo.class === 'ferme') dotColor = 'var(--danger)';
                if (statusInfo.class === 'plein') dotColor = 'var(--warning)';

                return (
                  <div
                    key={p.grp_identifiant}
                    className="city-node"
                    style={{
                      top: `${topPercent}%`,
                      left: `${leftPercent}%`,
                      backgroundColor: dotColor,
                      boxShadow: isSelected ? `0 0 15px 4px ${dotColor}` : `0 0 6px 1px ${dotColor}`,
                      transform: isSelected ? 'scale(1.5)' : 'scale(1)',
                      zIndex: isSelected ? 10 : 1,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setSelectedParking(p)}
                    title={p.grp_nom}
                  />
                );
              })}

              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', zIndex: 5, background: 'rgba(0,0,0,0.6)', padding: '0.5rem', borderRadius: '6px' }}>
                <span>Nantes Ouest (-1.62)</span>
                <span>Nantes Est (-1.50)</span>
              </div>
            </div>

            {selectedParking && (
              <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MapPin size={16} className="text-primary" />
                  {selectedParking.grp_nom}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  <div>Identifiant: <strong style={{ color: 'var(--text-primary)' }}>{selectedParking.grp_identifiant}</strong></div>
                  <div>Statut: <span style={{ textTransform: 'uppercase' }} className={`status-pill ${getStatusInfo(selectedParking.grp_statut).class}`}>{getStatusInfo(selectedParking.grp_statut).label}</span></div>
                  <div>Coordonnées Lat: <span style={{ color: 'var(--text-primary)' }}>{selectedParking.location?.lat || selectedParking.geo_point_2d?.lat || 'N/A'}</span></div>
                  <div>Coordonnées Lon: <span style={{ color: 'var(--text-primary)' }}>{selectedParking.location?.lon || selectedParking.geo_point_2d?.lon || 'N/A'}</span></div>
                </div>
              </div>
            )}
          </section> */}
        </div>
      {/* </div> */}
    </>
  );
}

export default App;
