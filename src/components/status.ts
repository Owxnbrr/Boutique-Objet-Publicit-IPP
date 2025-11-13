// src/components/status.ts
export type OrderStatus = 'pending'|'paid'|'processing'|'shipped'|'cancelled'|'refunded';

export const STATUS_META: Record<OrderStatus, {label:string; badge:string; dot:string}> = {
  pending:    { label:'En attente',   badge:'bg-yellow-100 text-yellow-800',  dot:'bg-yellow-500' },
  paid:       { label:'Payée',        badge:'bg-green-100 text-green-800',    dot:'bg-green-500' },
  processing: { label:'Traitement',   badge:'bg-blue-100 text-blue-800',      dot:'bg-blue-500' },
  shipped:    { label:'Expédiée',     badge:'bg-violet-100 text-violet-800',  dot:'bg-violet-500' },
  cancelled:  { label:'Annulée',      badge:'bg-red-100 text-red-800',        dot:'bg-red-500' },
  refunded:   { label:'Remboursée',   badge:'bg-gray-100 text-gray-800',      dot:'bg-gray-500' },
};
