const STORAGE_KEY = 'dem_tickets';

export type Ticket = {
  code: string;
  nom: string;
  trajet: string;
  date: string;
  heure: string;
  pickup: string;
  passagers: number;
  prix_total: string;
  statut: 'actif' | 'passé';
  dateVoyage: string;
};

export const saveTicket = (ticket: Omit<Ticket, 'code' | 'statut'>) => {
  const tickets = getTickets();
  const code = `DEM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const newTicket: Ticket = {
    ...ticket,
    code,
    statut: 'actif',
  };
  tickets.push(newTicket);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  return newTicket;
};

export const getTickets = (): Ticket[] => {
  const tickets = localStorage.getItem(STORAGE_KEY);
  if (!tickets) return [];
  
  const parsed = JSON.parse(tickets);
  const today = new Date().toISOString().split('T')[0];
  
  const updated = parsed.map((t: Ticket) => ({
    ...t,
    statut: t.dateVoyage < today ? 'passé' : 'actif'
  }));
  
  if (JSON.stringify(parsed) !== JSON.stringify(updated)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  
  return updated;
};

export const deleteTicket = (code: string) => {
  const tickets = getTickets().filter(t => t.code !== code);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
};