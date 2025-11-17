// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

type OrderStatus = 'pending'|'paid'|'processing'|'shipped'|'cancelled'|'refunded';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#F59E0B',
  paid: '#10B981',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  cancelled: '#EF4444',
  refunded: '#6B7280',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  paid: 'Payée',
  processing: 'Traitement',
  shipped: 'Expédiée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

function hexToRgba(hex: string, alpha = 0.12) {
  const h = hex.replace('#','').trim();
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full.slice(0, 6), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, alpha))})`;
}

function StatusPill({ status }: { status: OrderStatus }) {
  const color = STATUS_COLORS[status] ?? '#9CA3AF';
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      className="status-pill"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '2px 8px',
        borderRadius: 999,
        fontWeight: 600,
        background: `${color}22`,
        color,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
      {label}
    </span>
  );
}

const T = {
  orders: { table: "orders", id: "id", createdAt: "created_at", total: "total", status: "status" },
  quotes: { table: "quotes", id: "id", createdAt: "created_at", email: "email", name: "name", productId: "product_id", quantity: "quantity" },
} as const;

const fmtEur = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
const dmy = (d: string | Date) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; };

export default function ClientDashboardPage() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");

  const [kpis, setKpis] = useState({ spent30: 0, orders30: 0, pending: 0, quotesOpen: 0 });
  const [series, setSeries] = useState<{ date: string; total: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: OrderStatus; value: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session} } = await supabase.auth.getSession();
        if (!session) { router.replace("/login?redirectedFrom=/dashboard"); return; }

        const email = session.user.email || "";
        setUserEmail(email);

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", session.user.id)
          .maybeSingle();
        setDisplayName(profile?.display_name || session.user.user_metadata?.full_name || "");

        const since = new Date(); since.setDate(since.getDate() - 30);

        const { data: orders, error: oErr } = await supabase
          .from(T.orders.table)
          .select(`${T.orders.id}, ${T.orders.createdAt}, ${T.orders.total}, ${T.orders.status}`)
          .gte(T.orders.createdAt, since.toISOString())
          .order(T.orders.createdAt, { ascending: true });
        if (oErr) throw oErr;
        const list = orders ?? [];

        const spent30 = list.reduce((s, r: any) => s + Number(r.total || 0), 0);
        const orders30 = list.length;
        const pending = list.filter((o: any) =>
          ['pending', 'processing'].includes(String(o.status))
        ).length;

        const byDay = new Map<string, number>();
        list.forEach((o: any) => {
          const k = dmy(o.created_at);
          byDay.set(k, (byDay.get(k) || 0) + Number(o.total || 0));
        });
        const days: { date: string; total: number }[] = [];
        for (let i = 30; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const k = dmy(d);
          days.push({ date: k, total: Math.round((byDay.get(k) || 0) * 100) / 100 });
        }

        const buckets = new Map<OrderStatus, number>();
        (list as any[]).forEach((o) => {
          const s = (o.status as OrderStatus) ?? 'pending';
          buckets.set(s, (buckets.get(s) || 0) + 1);
        });
        const status = Array.from(buckets.entries()).map(([name, value]) => ({ name, value }));

        const { data: quotes } = await supabase
          .from(T.quotes.table)
          .select(`${T.quotes.id}, ${T.quotes.createdAt}, ${T.quotes.email}, ${T.quotes.name}, ${T.quotes.productId}, ${T.quotes.quantity}`)
          .eq(T.quotes.email, email)
          .order(T.quotes.createdAt, { ascending: false })
          .limit(5);
        const quotesOpen = (quotes ?? []).length;

        const { data: last } = await supabase
          .from(T.orders.table)
          .select(`${T.orders.id}, ${T.orders.createdAt}, ${T.orders.total}, ${T.orders.status}, display_name`)
          .order(T.orders.createdAt, { ascending: false })
          .limit(8);

        setKpis({ spent30, orders30, pending, quotesOpen });
        setSeries(days);
        setStatusData(status);
        setRecentOrders(last ?? []);
        setRecentQuotes(quotes ?? []);
      } catch (e: any) {
        setErr(e.message ?? "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase, router]);

  return (
    <div className="dashboard">
      <div className="container">
        {loading && <div>Chargement…</div>}
        {err && !loading && <div style={{ color: "#ef4444" }}>{err}</div>}

        {!loading && !err && (
          <>
            <div className="header-row">
              <div>
                <h1 className="h1">Bonjour{displayName ? `, ${displayName}` : ""} 👋</h1>
                <p className="muted">Voici un aperçu de vos commandes et demandes.</p>
              </div>
              <div className="tools">
                <input className="input" placeholder="Rechercher…" style={{ width: 220 }} />
                <button className="btn btn-primary btn-md">Créer un devis</button>
              </div>
            </div>

            <section>
              <div className="grid-kpi">
                <div className="kpi">
                  <div className="label">Total payé (30j)</div>
                  <div className="value">{fmtEur(kpis.spent30)}</div>
                  <div className="sub">Toutes taxes comprises</div>
                </div>
                <div className="kpi">
                  <div className="label">Commandes (30j)</div>
                  <div className="value">{kpis.orders30}</div>
                  <div className="sub">Passées ces 30 jours</div>
                </div>
                <div className="kpi">
                  <div className="label">En attente</div>
                  <div className="value">{kpis.pending}</div>
                  <div className="sub">Paiement / préparation</div>
                </div>
                <div className="kpi">
                  <div className="label">Mes devis</div>
                  <div className="value">{kpis.quotesOpen}</div>
                  <div className="sub">Lié à {userEmail}</div>
                </div>
              </div>
            </section>

            <section>
              <div className="grid-main">
                <div className="card">
                  <p className="card-title">Dépenses (30 derniers jours)</p>
                  <div style={{ height: 288 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={series} margin={{ top: 6, right: 18, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3730a3" stopOpacity={0.55} />
                            <stop offset="95%" stopColor="#3730a3" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v:any)=>`${Math.round(Number(v)/100)}€`} width={50} />
                        <Tooltip formatter={(v:any)=>fmtEur(Number(v))} labelFormatter={(l)=>l} />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#3730a3"
                          strokeWidth={2}
                          fill="url(#grad)"
                          fillOpacity={1}
                          activeDot={{ r: 4, stroke: "#d3d3d3ff" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <p className="card-title">Répartition des statuts</p>
                  <div style={{ height: 288 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          isAnimationActive={false}
                        >
                          {statusData.map((d) => (
                            <Cell
                              key={d.name}
                              fill={STATUS_COLORS[d.name] ?? '#9CA3AF'}
                              stroke="#FFFFFF"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any, _n: any, ctx: any) => {
                            const name = ctx?.payload?.name as OrderStatus;
                            return [`${v}`, STATUS_LABELS[name] ?? name];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="grid-tables">
                <div className="card">
                  <p className="card-title">Mes dernières commandes</p>
                  <div style={{ overflowX: "auto" }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Date</th>
                          <th>Montant</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((o: any) => {
                          const s: OrderStatus = (o.status as OrderStatus) ?? 'pending';
                          const color = STATUS_COLORS[s] ?? '#9CA3AF';
                          const rowBg = hexToRgba(color, 0.12);

                          return (
                            <tr><a
                              key={o.id}
                              className="has-status-bg"
                              style={{ ['--row-bg' as any]: rowBg }}
                              href={`/order/${o.id}`}
                            >
                              <td>{o.display_name ?? `#${o.id}`}</td>
                              <td>{new Date(o.created_at).toLocaleString()}</td>
                              <td>{fmtEur(Number(o.total || 0))}</td>
                              <td><StatusPill status={s} /></td>
                            </a></tr>
                          );
                        })}
                        {!recentOrders.length && (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: 18 }}>
                              Aucune commande
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <p className="card-title">Mes derniers devis</p>
                  <div style={{ overflowX: "auto" }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>N°</th>
                          <th>Date</th>
                          <th>Produit</th>
                          <th>Qté</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentQuotes.map((q: any) => (
                          <tr key={q.id}>
                            <td>{`Q-${String(q.id).slice(0, 8)}`}</td>
                            <td>{new Date(q.created_at).toLocaleString()}</td>
                            <td>{q.product_id || "—"}</td>
                            <td>{String(q.quantity || 1)}</td>
                          </tr>
                        ))}
                        {!recentQuotes.length && (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: "18px" }}>
                              Aucun devis
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
