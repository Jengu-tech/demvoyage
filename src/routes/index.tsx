import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { InstallPrompt } from "@/components/InstallPrompt";
import { saveTicket } from "@/lib/tickets-supabase";

export const Route = createFileRoute("/")({
  component: Index,
});

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const ALL_CITIES = [
  { n: "Dakar", d: "Capitale" },
  { n: "Thiès", d: "70 km de Dakar" },
  { n: "Tivaouane", d: "80 km de Dakar" },
  { n: "Touba", d: "193 km de Dakar" },
  { n: "Kaolack", d: "194 km de Dakar" },
  { n: "Saint-Louis", d: "263 km de Dakar" },
  { n: "Ziguinchor", d: "480 km de Dakar" },
];

const REGIONS = [
  { n: "Dakar", d: "Capitale" },
  { n: "Thiès", d: "70 km · 1h30" },
  { n: "Tivaouane", d: "80 km · 1h45" },
  { n: "Touba", d: "193 km · 3h" },
  { n: "Kaolack", d: "194 km · 2h45" },
  { n: "Saint-Louis", d: "263 km · 4h" },
  { n: "Ziguinchor", d: "480 km · 7h" },
];

const AIRPORTS = [
  { n: "AIBD", full: "Aéroport Int. Blaise Diagne", d: "45 km · 50min", badge: "AIBD" },
  { n: "Ziguinchor Airport", full: "Aéroport de Ziguinchor", d: "480 km · 7h (route)", badge: "ZIG" },
];

type Trip = { c: string; type: string; heure: string; prix: number; tag: string };

const TRIPS: Record<string, Trip[]> = {
  Thiès: [
    { c: "DDD Express", type: "Standard", heure: "06h00", prix: 3500, tag: "Climatisé" },
    { c: "Ndiaga Ndiaye", type: "VIP", heure: "07h30", prix: 5000, tag: "Luxe · Climatisé" },
  ],
  Tivaouane: [
    { c: "Mouride Transport", type: "Standard", heure: "06h30", prix: 3000, tag: "Direct" },
    { c: "Sen Cars", type: "VIP", heure: "08h00", prix: 4500, tag: "Climatisé · WiFi" },
  ],
  Touba: [
    { c: "Mouride Express", type: "Standard", heure: "05h00", prix: 5000, tag: "Direct · Climatisé" },
    { c: "Touba VIP", type: "VIP", heure: "06h00", prix: 7500, tag: "Luxe · Repas" },
    { c: "Al Amine Transport", type: "Standard", heure: "10h00", prix: 4500, tag: "Climatisé" },
  ],
  Kaolack: [
    { c: "Thiossane Cars", type: "Standard", heure: "07h00", prix: 4000, tag: "Direct" },
    { c: "Sénégal Premium", type: "VIP", heure: "08h30", prix: 6000, tag: "Climatisé · WiFi" },
  ],
  "Saint-Louis": [
    { c: "Sahel Express", type: "Standard", heure: "06h00", prix: 6000, tag: "Direct" },
    { c: "Fleuve Nord VIP", type: "VIP", heure: "07h00", prix: 9000, tag: "Luxe · Climatisé" },
  ],
  Ziguinchor: [
    { c: "Casa Mance", type: "Standard", heure: "06h00", prix: 9500, tag: "Direct" },
    { c: "Casamance VIP", type: "VIP", heure: "06h30", prix: 14000, tag: "Luxe · Climatisé" },
  ],
  AIBD: [
    { c: "Airport Shuttle DEM", type: "Standard", heure: "Toutes les 2h", prix: 4000, tag: "Direct aéroport" },
    { c: "VIP Airport Transfer", type: "VIP", heure: "Sur demande", prix: 8000, tag: "Prise en charge à domicile" },
  ],
  "Ziguinchor Airport": [
    { c: "Casa Mance", type: "Standard", heure: "06h00", prix: 9500, tag: "Via aéroport" },
    { c: "Air Route VIP", type: "VIP", heure: "06h30", prix: 15000, tag: "Luxe · Transfert direct" },
  ],
};

type Screen = "home" | "results" | "confirm" | "success";

function formatDate(d: Date) {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function Header() {
  const [hover, setHover] = useState(false);
  return (
    <div className="header" style={{
      backgroundImage: "url('/bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      borderRadius: "0 0 24px 24px",
      animation: "fadeIn 0.4s ease-out"
    }}>
      <div className="logo-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" style={{ height: 32, width: 32, borderRadius: 8, transition: "transform 0.2s" }} />
          <div>
            <div className="logo" style={{ fontSize: 20, lineHeight: 1.2 }}>
              DEM<span>.</span>
            </div>
            <div className="slogan" style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
              Niou Dem
            </div>
          </div>
        </div>
        <a href="/tickets" style={{ textDecoration: "none" }}>
          <div 
            className="avatar" 
            style={{ transition: "transform 0.2s", transform: hover ? "scale(1.1)" : "scale(1)", cursor: "pointer" }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            🎫
          </div>
        </a>
      </div>
      <div className="greeting" style={{ textAlign: "center", marginTop: 16, animation: "slideIn 0.4s ease-out" }}>
        <span>Bonsoir</span>
        <strong>Où voulez-vous aller ?</strong>
      </div>
    </div>
  );
}

function Index() {
  const [screen, setScreen] = useState<Screen>("home");
  const [dep, setDep] = useState<string | null>(null);
  const [depOpen, setDepOpen] = useState(false);
  const [tab, setTab] = useState<"region" | "airport">("region");
  const [dest, setDest] = useState<string | null>(null);
  const [destDist, setDestDist] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const [pax, setPax] = useState(1);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [ticketCode] = useState(
    () => "DEM-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
  );
  const [nom, setNom] = useState("");
  const [clickAnim, setClickAnim] = useState(false);

  const dates = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 4 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      return d;
    });
  }, []);

  const canSearch = dep && dest && date;

  const destList: { n: string; d: string; full?: string; badge?: string }[] =
    tab === "region"
      ? REGIONS.filter((x) => x.n !== dep)
      : AIRPORTS;

  const trips = dest ? TRIPS[dest] || [] : [];

  const handleScreenChange = (newScreen: Screen) => {
    setClickAnim(true);
    setTimeout(() => {
      setScreen(newScreen);
      setClickAnim(false);
    }, 150);
  };

  return (
    <div className="dem">
      <div className="app">
        <InstallPrompt />

        {screen === "home" && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <Header />
            <div className="screen">
              <div className="section-title">Votre départ</div>
              <div 
                className="depart-card" 
                onClick={() => setDepOpen((o) => !o)}
                style={{ transition: "transform 0.1s", cursor: "pointer" }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div className="depart-icon">📍</div>
                <div className="depart-info">
                  <div className="depart-label">Je pars de</div>
                  <div className="depart-val">{dep ?? "Choisir une ville..."}</div>
                </div>
                <span style={{ fontSize: 13, color: "var(--dem-muted)" }}>▼</span>
              </div>

              {depOpen && (
                <div className="dep-list" style={{ animation: "fadeIn 0.2s ease-out" }}>
                  {ALL_CITIES.map((c) => (
                    <div
                      key={c.n}
                      className="dep-item"
                      onClick={() => {
                        setDep(c.n);
                        setDest(null);
                        setDepOpen(false);
                      }}
                      style={{ transition: "background 0.1s", cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--dem-green-light)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: dep === c.n ? "var(--dem-green)" : "var(--dem-text)",
                          }}
                        >
                          {c.n}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--dem-muted)" }}>{c.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {dep && (
                <div style={{ animation: "slideIn 0.3s ease-out" }}>
                  <div className="section-title">Type de trajet</div>
                  <div className="category-tabs">
                    <div
                      className={`ctab${tab === "region" ? " active" : ""}`}
                      onClick={() => {
                        setTab("region");
                        setDest(null);
                      }}
                      style={{ transition: "all 0.2s", cursor: "pointer" }}
                    >
                      Régions
                    </div>
                    <div
                      className={`ctab ctab-airport${tab === "airport" ? " active" : ""}`}
                      onClick={() => {
                        setTab("airport");
                        setDest(null);
                      }}
                      style={{ transition: "all 0.2s", cursor: "pointer" }}
                    >
                      Aéroports
                    </div>
                  </div>

                  <div className="section-title">Choisir la destination</div>
                  <div className="dest-grid">
                    {destList.map((x) => {
                      const isAirport = tab === "airport";
                      const selected = dest === x.n;
                      return (
                        <div
                          key={x.n}
                          className={`dest-card${isAirport ? " airport" : ""}${selected ? " selected" : ""}`}
                          onClick={() => {
                            setDest(x.n);
                            setDestDist(x.d);
                          }}
                          style={{ 
                            transition: "all 0.2s ease", 
                            cursor: "pointer",
                            transform: selected ? "scale(1.02)" : "scale(1)"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                          onMouseLeave={(e) => e.currentTarget.style.transform = selected ? "scale(1.02)" : "scale(1)"}
                        >
                          <span className="dest-name">
                            {"full" in x && x.full ? x.full : x.n}
                          </span>
                          <span className="dest-dist">{x.d}</span>
                          {"badge" in x && x.badge && (
                            <span className="dest-badge">{x.badge}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="section-title">Date du voyage</div>
              <div className="date-row">
                {dates.map((d, i) => {
                  const selected = date?.toDateString() === d.toDateString();
                  return (
                    <div
                      key={i}
                      className={`date-btn${selected ? " selected" : ""}`}
                      onClick={() => setDate(d)}
                      style={{ 
                        transition: "all 0.2s ease", 
                        cursor: "pointer",
                        transform: selected ? "scale(1.02)" : "scale(1)"
                      }}
                    >
                      <div className="day">{i === 0 ? "Auj." : DAYS[d.getDay()]}</div>
                      <div className="date">
                        {d.getDate()} {MONTHS[d.getMonth()]}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="section-title">Nombre de passagers</div>
              <div className="pax-row">
                <div>
                  <div className="pax-label">Passagers</div>
                  <div className="pax-sub">Adultes</div>
                </div>
                <div className="pax-ctrl">
                  <button
                    className="pax-btn"
                    onClick={() => setPax((p) => Math.max(1, p - 1))}
                    style={{ transition: "all 0.1s", cursor: "pointer" }}
                    onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    −
                  </button>
                  <div className="pax-count">{pax}</div>
                  <button
                    className="pax-btn"
                    onClick={() => setPax((p) => Math.min(8, p + 1))}
                    style={{ transition: "all 0.1s", cursor: "pointer" }}
                    onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className={`search-btn${!canSearch ? " disabled" : ""}`}
                onClick={() => canSearch && handleScreenChange("results")}
                style={{ 
                  transition: "all 0.2s ease",
                  transform: clickAnim ? "scale(0.98)" : "scale(1)"
                }}
              >
                Voir les trajets disponibles →
              </button>
            </div>
          </div>
        )}

        {screen === "results" && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <Header />
            <div className="screen">
              <button 
                className="back-btn" 
                onClick={() => handleScreenChange("home")}
                style={{ transition: "transform 0.1s", cursor: "pointer" }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                ← Retour
              </button>
              <div className="route-info" style={{ animation: "slideIn 0.3s ease-out" }}>
                <div>
                  <div className="route-from">Départ</div>
                  <div className="route-place">{dep}</div>
                </div>
                <div className="route-arrow">→</div>
                <div>
                  <div className="route-from">Destination</div>
                  <div className="route-place">{dest}</div>
                </div>
              </div>
              <div className="section-title" style={{ marginTop: 14 }}>
                Choisir votre transport
              </div>
              {trips.map((t, i) => (
                <div
                  key={i}
                  className={`trip-card${i === 0 ? " featured" : ""}`}
                  onClick={() => {
                    setTrip(t);
                    handleScreenChange("confirm");
                  }}
                  style={{ 
                    animation: `slideIn 0.3s ease-out ${i * 0.05}s backwards`,
                    transition: "transform 0.1s",
                    cursor: "pointer"
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                  onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div className="trip-top">
                    <span className="trip-company">{t.c}</span>
                    <span className={`trip-type${t.type === "VIP" ? " vip" : ""}`}>
                      {t.type}
                    </span>
                  </div>
                  <div className="trip-mid">
                    <div className="trip-time">{t.heure}</div>
                    <div className="trip-price">{t.prix.toLocaleString()} FCFA</div>
                  </div>
                  <div className="trip-footer">
                    <span className="trip-tag">✓ {t.tag}</span>
                    <span className="trip-tag">✓ {pax} place(s)</span>
                  </div>
                </div>
              ))}
              {trips.length === 0 && (
                <div style={{ color: "var(--dem-muted)", fontSize: 13, padding: 12, animation: "fadeIn 0.3s" }}>
                  Aucun trajet disponible pour {destDist}.
                </div>
              )}
            </div>
          </div>
        )}

        {screen === "confirm" && trip && date && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <Header />
            <div className="screen">
              <button 
                className="back-btn" 
                onClick={() => handleScreenChange("results")}
                style={{ transition: "transform 0.1s", cursor: "pointer" }}
              >
                ← Modifier
              </button>
              
              <div className="section-title">Votre nom complet</div>
              <input
                type="text"
                placeholder="Ex: Mamadou Diop"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  border: "1.5px solid var(--dem-border)",
                  background: "var(--dem-white)",
                  marginBottom: 16,
                  fontSize: 14,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  transition: "border 0.2s"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--dem-green)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "var(--dem-border)"}
              />

              <div className="confirm-card" style={{ animation: "slideIn 0.3s ease-out" }}>
                <div className="confirm-title">Résumé de la réservation</div>
                <div className="confirm-row">
                  <span className="confirm-key">Trajet</span>
                  <span className="confirm-val">
                    {dep} → {dest}
                  </span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-key">Date</span>
                  <span className="confirm-val">{formatDate(date)}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-key">Départ</span>
                  <span className="confirm-val">{trip.heure}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-key">Transport</span>
                  <span className="confirm-val">
                    {trip.c} ({trip.type})
                  </span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-key">Passagers</span>
                  <span className="confirm-val">{pax} passager(s)</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-key">Prix/place</span>
                  <span className="confirm-val">{trip.prix.toLocaleString()} FCFA</span>
                </div>
              </div>
              <div className="total-row" style={{ animation: "fadeIn 0.3s ease-out" }}>
                <span className="total-label">Total à payer</span>
                <span className="total-price">
                  {(trip.prix * pax).toLocaleString()} FCFA
                </span>
              </div>
              <button 
                className="pay-btn" 
                onClick={() => handleScreenChange("success")}
                style={{ transition: "transform 0.1s" }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Payer avec Wave / Orange Money
              </button>
              <button 
                className="pay-btn2" 
                onClick={() => handleScreenChange("success")}
                style={{ transition: "transform 0.1s" }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Payer en espèces à bord
              </button>
            </div>
          </div>
        )}

        {screen === "success" && trip && date && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <Header />
            <div className="success-screen">
              <div className="success-icon" style={{ animation: "bounce 0.5s ease-out" }}>✓</div>
              <div className="success-title" style={{ animation: "fadeIn 0.4s ease-out" }}>Réservation confirmée !</div>
              <div className="success-sub" style={{ animation: "fadeIn 0.5s ease-out" }}>
                Votre place est réservée.
                <br />
                Présentez ce ticket au chauffeur.
              </div>
              <div className="ticket-card" style={{ animation: "slideIn 0.4s ease-out" }}>
                <div className="ticket-num">N° de réservation</div>
                <div className="ticket-code">{ticketCode}</div>
                <div className="ticket-row">
                  <span className="tkey">Trajet</span>
                  <span className="tval">
                    {dep} → {dest}
                  </span>
                </div>
                <div className="ticket-row">
                  <span className="tkey">Date</span>
                  <span className="tval">{formatDate(date)}</span>
                </div>
                <div className="ticket-row">
                  <span className="tkey">Heure</span>
                  <span className="tval">{trip.heure}</span>
                </div>
                <div className="ticket-row">
                  <span className="tkey">Passagers</span>
                  <span className="tval">{pax} passager(s)</span>
                </div>
                <div className="ticket-row">
                  <span className="tkey">Transport</span>
                  <span className="tval">{trip.c}</span>
                </div>
              </div>
              <button
                className="home-again"
                onClick={async () => {
                  if (trip && date && dep && dest && nom) {
                    try {
                      await saveTicket({
                        nom: nom,
                        trajet: `${dep} → ${dest}`,
                        date: formatDate(date),
                        heure: trip.heure,
                        pickup: dep,
                        passagers: pax,
                        prix_total: `${(trip.prix * pax).toLocaleString()} FCFA`,
                        date_voyage: date.toISOString().split('T')[0],
                      });
                      console.log('Ticket sauvegardé dans Supabase');
                    } catch (error) {
                      console.error('Erreur:', error);
                      alert('Erreur lors de la sauvegarde');
                    }
                  }
                  setScreen("home");
                  setDest(null);
                  setDate(null);
                  setTrip(null);
                  setNom("");
                }}
                style={{ transition: "transform 0.1s" }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Nouvelle réservation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}