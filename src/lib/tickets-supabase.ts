import { supabase } from './supabase';

export type Ticket = {
  id?: string;
  code: string;
  nom: string;
  trajet: string;
  date: string;
  heure: string;
  pickup: string;
  passagers: number;
  prix_total: string;
  statut: 'actif' | 'passé';
  date_voyage: string;
  created_at?: string;
};

export const saveTicket = async (ticket: Omit<Ticket, 'code' | 'statut' | 'id' | 'created_at'>) => {
  const code = `DEM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  
  const { data, error } = await supabase
    .from('tickets')
    .insert([{
      code,
      ...ticket,
      statut: 'actif'
    }])
    .select()
    .single();

  if (error) {
    console.error('Erreur saveTicket:', error);
    throw error;
  }
  return data;
};

export const getTickets = async (): Promise<Ticket[]> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur getTickets:', error);
    return [];
  }
  
  const updated = data.map(ticket => ({
    ...ticket,
    statut: ticket.date_voyage < today ? 'passé' : 'actif'
  }));
  
  return updated;
};

export const deleteTicket = async (code: string) => {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('code', code);

  if (error) {
    console.error('Erreur deleteTicket:', error);
    throw error;
  }
};