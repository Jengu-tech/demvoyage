import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getTickets, deleteTicket, type Ticket } from "@/lib/tickets-supabase";

export const Route = createFileRoute("/tickets")({
  component: TicketsPage,
});

function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const loadTickets = async () => {
      const data = await getTickets();
      setTickets(data);
    };
    loadTickets();
  }, []);

  const handleDelete = async (code: string) => {
    try {
      await deleteTicket(code);
      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const actifs = tickets.filter(t => t.statut === "actif");
  const passes = tickets.filter(t => t.statut === "passé");

  return (
    <div className="dem">
      <div className="app">
        <div className="header" style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0 0 24px 24px",
          animation: "fadeIn 0.4s ease-out"
        }}>
          <div className="logo-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.png" style={{ height: 32, width: 32, borderRadius: 8 }} />
              <div>
                <div className="logo" style={{ fontSize: 20, lineHeight: 1.2 }}>
                  DEM<span>.</span>
                </div>
                <div className="slogan" style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                  Niou Dem
                </div>
              </div>
            </div>
            <a href="/" style={{ textDecoration: "none" }}>
              <div className="avatar" style={{ transition: "transform 0.2s", cursor: "pointer" }}>←</div>
            </a>
          </div>
        </div>

        <div className="screen">
          <h2 style={{ color: "var(--dem-gold)", marginBottom: 20, fontSize: 20, animation: "slideIn 0.3s ease-out" }}>
            Mes Tickets
          </h2>

          {tickets.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--dem-muted)", animation: "fadeIn 0.3s" }}>
              Aucun ticket pour le moment
            </div>
          )}

          {actifs.length > 0 && (
            <>
              <div className="section-title" style={{ color: "var(--dem-green)", animation: "fadeIn 0.3s" }}>
                Voyages à venir
              </div>
              {actifs.map((ticket, i) => (
                <TicketCard key={ticket.code} ticket={ticket} onDelete={handleDelete} index={i} />
              ))}
            </>
          )}

          {passes.length > 0 && (
            <>
              <div className="section-title" style={{ color: "var(--dem-muted)", marginTop: 24, animation: "fadeIn 0.3s" }}>
                Voyages passés
              </div>
              {passes.map((ticket, i) => (
                <TicketCard key={ticket.code} ticket={ticket} onDelete={handleDelete} index={i} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket, onDelete, index }: { ticket: Ticket; onDelete: (code: string) => void; index: number }) {
  const isActif = ticket.statut === "actif";
  const [hover, setHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);

  return (
    <div
      style={{
        borderLeft: `4px solid ${isActif ? "var(--dem-green)" : "var(--dem-muted)"}`,
        opacity: isActif ? 1 : 0.6,
        marginBottom: 12,
        background: "var(--dem-white)",
        borderRadius: 12,
        padding: 12,
        transition: "all 0.2s ease",
        animation: `slideIn 0.3s ease-out ${index * 0.05}s backwards`,
        transform: hover ? "translateX(4px)" : "translateX(0)",
        cursor: "pointer"
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--dem-muted)" }}>{ticket.code}</span>
        <button
          onClick={() => onDelete(ticket.code)}
          style={{
            background: "none",
            border: "none",
            color: "var(--dem-muted)",
            fontSize: 14,
            cursor: "pointer",
            transition: "transform 0.1s",
            transform: deleteHover ? "scale(1.1)" : "scale(1)"
          }}
          onMouseEnter={() => setDeleteHover(true)}
          onMouseLeave={() => setDeleteHover(false)}
        >
          🗑️
        </button>
      </div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{ticket.nom}</div>
      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 8 }}>{ticket.trajet}</div>
      <div style={{ fontSize: 12, color: "var(--dem-muted)", marginBottom: 4 }}>
        {ticket.date} · {ticket.heure}
      </div>
      <div style={{ fontSize: 12, color: "var(--dem-muted)" }}>
        {ticket.passagers} passager(s) · {ticket.prix_total}
      </div>
    </div>
  );
}