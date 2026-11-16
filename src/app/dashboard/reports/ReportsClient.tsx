"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Users, Car, CheckCircle2, Search, Calendar, Filter, X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function ReportsClient({ sales, vehicles, customers }: { sales: any[], vehicles: any[], customers: any[] }) {
  const [historySearch, setHistorySearch] = useState("");
  // Selected month format: "YYYY-MM" or "" for all
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Helper to calculate total revenue collected for a sale across all time
  const calculateRecaudado = (sale: any) => {
    const autoPartePago = sale.autoPartePago || 0;
    const pagos = sale.pagos?.reduce((sum: number, p: any) => sum + p.importe, 0) || 0;
    const cuotas = sale.cuotas?.filter((c: any) => c.estado === "PAGADA").reduce((sum: number, c: any) => sum + c.valor, 0) || 0;
    return autoPartePago + pagos + cuotas;
  };

  // Generate all movements flat list
  const allMovements = useMemo(() => {
    return sales.flatMap(sale => {
      const movs = [];

      if (sale.autoPartePago && sale.autoPartePago > 0) {
        movs.push({
          id: `autopago-${sale.id}`,
          fecha: new Date(sale.createdAt),
          tipo: "Auto en Parte de Pago",
          monto: sale.autoPartePago,
          descripcion: sale.detalleAutoPartePago || "Entrega de vehículo",
          cliente: sale.cliente?.nombreCompleto || 'Cliente Eliminado'
        });
      }

      const pagos = sale.pagos?.map((p: any) => ({
        id: `pago-${p.id}`,
        fecha: new Date(p.fecha),
        tipo: p.observaciones === "Pago Inicial" ? "Efectivo (Pago Inicial)" : (p.medioPago === "SENA" ? "SEÑA" : "Abono"),
        monto: p.importe,
        descripcion: `${sale.vehiculo?.marca || ''} ${sale.vehiculo?.modelo || ''}`,
        cliente: sale.cliente?.nombreCompleto || 'Cliente Eliminado'
      })) || [];

      const cuotasPagadas = sale.cuotas?.filter((c: any) => c.estado === "PAGADA").map((c: any) => ({
        id: `cuota-${c.id}`,
        fecha: new Date(c.fechaPago || c.updatedAt || c.fechaVencimiento),
        tipo: `Cuota ${c.numeroCuota}`,
        monto: c.valor,
        descripcion: `${sale.vehiculo?.marca || ''} ${sale.vehiculo?.modelo || ''}`,
        cliente: sale.cliente?.nombreCompleto || 'Cliente Eliminado'
      })) || [];

      return [...movs, ...pagos, ...cuotasPagadas];
    }).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }, [sales]);

  // Filtered movements by month
  const movementsFilteredByMonth = useMemo(() => {
    if (!selectedMonth) return allMovements;
    const [selYear, selMonth] = selectedMonth.split("-").map(Number);
    return allMovements.filter(m => {
      return m.fecha.getFullYear() === selYear && m.fecha.getMonth() === (selMonth - 1);
    });
  }, [allMovements, selectedMonth]);

  // Filtered movements by search inside the selected month
  const displayedMovements = useMemo(() => {
    if (!historySearch.trim()) return movementsFilteredByMonth;
    const term = historySearch.toLowerCase();
    return movementsFilteredByMonth.filter((mov) => {
      return (
        mov.fecha.toLocaleDateString().includes(term) ||
        mov.cliente.toLowerCase().includes(term) ||
        mov.tipo.toLowerCase().includes(term) ||
        mov.descripcion.toLowerCase().includes(term) ||
        mov.monto.toString().includes(term)
      );
    });
  }, [movementsFilteredByMonth, historySearch]);

  // Filtered sales by month
  const salesFilteredByMonth = useMemo(() => {
    if (!selectedMonth) return sales;
    const [selYear, selMonth] = selectedMonth.split("-").map(Number);
    return sales.filter(s => {
      const d = new Date(s.createdAt);
      return d.getFullYear() === selYear && d.getMonth() === (selMonth - 1);
    });
  }, [sales, selectedMonth]);

  // Total revenue calculated according to month selection
  const totalRevenue = useMemo(() => {
    if (!selectedMonth) {
      return sales.reduce((acc, sale) => acc + calculateRecaudado(sale), 0);
    }
    // For selected month, sum of all movements that occurred in that month
    return movementsFilteredByMonth.reduce((acc, mov) => acc + mov.monto, 0);
  }, [selectedMonth, sales, movementsFilteredByMonth]);

  // Chart data:
  // If selectedMonth is set, show daily breakdown for that month.
  // If selectedMonth is empty, show 12-month annual breakdown.
  const chartData = useMemo(() => {
    if (!selectedMonth) {
      // 12 months overview
      return Array.from({ length: 12 }, (_, i) => {
        const monthSales = sales.filter(s => new Date(s.createdAt).getMonth() === i);
        // Movements in this month
        const monthMovs = allMovements.filter(m => m.fecha.getMonth() === i);
        return {
          name: new Date(0, i).toLocaleString('es', { month: 'short' }).toUpperCase(),
          total: monthMovs.reduce((acc, m) => acc + m.monto, 0),
          operaciones: monthSales.length
        };
      });
    }

    // Daily breakdown for the selected month
    const [selYear, selMonth] = selectedMonth.split("-").map(Number);
    const daysInMonth = new Date(selYear, selMonth, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayMovs = movementsFilteredByMonth.filter(m => m.fecha.getDate() === day);
      const daySales = salesFilteredByMonth.filter(s => new Date(s.createdAt).getDate() === day);

      return {
        name: `Día ${day}`,
        total: dayMovs.reduce((acc, m) => acc + m.monto, 0),
        operaciones: daySales.length
      };
    });
  }, [selectedMonth, sales, allMovements, movementsFilteredByMonth, salesFilteredByMonth]);

  // Selected month label for headings
  const selectedMonthLabel = useMemo(() => {
    if (!selectedMonth) return "Anual (Todos los meses)";
    const [y, m] = selectedMonth.split("-").map(Number);
    return `${MONTH_NAMES[m - 1]} ${y}`;
  }, [selectedMonth]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header con Filtro por Mes */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <BarChart3 className="h-8 w-8 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Reportes y Estadísticas</h1>
            <p className="text-zinc-400 mt-1">
              Métricas de rendimiento y ventas de la concesionaria.
            </p>
          </div>
        </div>

        {/* Barra de Filtro de Mes */}
        <div className="flex flex-wrap items-center gap-2.5 bg-[#0a0a0a] border border-[#222] p-2 rounded-xl">
          <div className="flex items-center gap-2 px-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-yellow-500" />
            <span>Filtrar Mes:</span>
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#111] border border-[#333] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow-500 transition-colors cursor-pointer [color-scheme:dark]"
          />

          {selectedMonth && (
            <button
              onClick={() => setSelectedMonth("")}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-[#1a1a1a] hover:bg-[#222] px-2.5 py-1.5 rounded-lg border border-[#333] transition-colors"
              title="Quitar filtro de mes"
            >
              <X className="w-3.5 h-3.5" />
              Ver Todos
            </button>
          )}

          {selectedMonth !== currentMonthStr && (
            <button
              onClick={() => setSelectedMonth(currentMonthStr)}
              className="text-xs text-yellow-500 hover:text-yellow-400 font-medium px-2 py-1.5 transition-colors"
            >
              Ir a este mes
            </button>
          )}
        </div>
      </div>

      {/* Indicador de filtro activo */}
      {selectedMonth && (
        <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 rounded-lg text-sm">
          <div className="flex items-center gap-2 text-yellow-400 font-medium">
            <Filter className="w-4 h-4 text-yellow-500" />
            <span>Datos filtrados para el mes de: <strong className="text-white">{selectedMonthLabel}</strong></span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {movementsFilteredByMonth.length} movimientos registrados en este mes
          </span>
        </div>
      )}

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">
              {selectedMonth ? `Ingresos (${selectedMonthLabel})` : "Ingresos Totales"}
            </h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mt-2">
            {selectedMonth ? "Cobrado durante el mes seleccionado" : "Histórico general acumulado"}
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">
              {selectedMonth ? `Ventas (${selectedMonthLabel})` : "Ventas Concretadas"}
            </h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{salesFilteredByMonth.length}</p>
          <p className="text-xs text-zinc-500 mt-2">
            {selectedMonth ? `Ventas pactadas en ${selectedMonthLabel}` : `${sales.length} ventas en total`}
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">Vehículos en Stock</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Car className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{vehicles.length}</p>
          <p className="text-xs text-zinc-500 mt-2">Unidades disponibles para venta</p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">Clientes Registrados</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Users className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{customers.length}</p>
          <p className="text-xs text-zinc-500 mt-2">Cartera total de clientes</p>
        </div>
      </div>

      {/* Gráficos según el mes seleccionado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                {selectedMonth ? `Ingresos Diarios — ${selectedMonthLabel}` : "Ingresos Mensuales"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {selectedMonth ? "Recaudación día por día en el mes seleccionado" : "Evolución de recaudación mes a mes"}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-[#111] border border-[#333] rounded-md text-yellow-500 font-medium">
              {selectedMonth ? "Vista Diaria" : "Vista Anual"}
            </span>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} interval={selectedMonth ? 2 : 0} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip 
                  cursor={{fill: '#111'}} 
                  contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Ingresos"]} 
                />
                <Bar dataKey="total" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                {selectedMonth ? `Volumen de Operaciones — ${selectedMonthLabel}` : "Volumen de Operaciones"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {selectedMonth ? "Cantidad de ventas pactadas día a día" : "Cantidad de ventas mes a mes"}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-[#111] border border-[#333] rounded-md text-yellow-500 font-medium">
              {selectedMonth ? "Vista Diaria" : "Vista Anual"}
            </span>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} interval={selectedMonth ? 2 : 0} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} 
                  formatter={(value: any) => [`${value} ventas`, "Operaciones"]}
                />
                <Line type="monotone" dataKey="operaciones" stroke="#eab308" strokeWidth={3} dot={{fill: '#eab308', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos Diarios — Filtrado por el mes seleccionado */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#111] rounded-lg border border-[#333]">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Historial de Movimientos
                {selectedMonth && (
                  <span className="text-xs font-normal text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                    {selectedMonthLabel}
                  </span>
                )}
              </h3>
              <p className="text-zinc-400 text-sm">
                Registro detallado de ingresos (pagos iniciales, cuotas y autos en parte de pago)
                {selectedMonth ? ` del mes de ${selectedMonthLabel}.` : "."}
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              placeholder="Buscar por fecha, cliente, concepto..." 
              className="w-full pl-10 pr-4 py-2 bg-[#111] border border-[#333] rounded-md text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#222] text-zinc-400">
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Concepto</th>
                <th className="pb-3 font-medium">Detalle Venta</th>
                <th className="pb-3 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {displayedMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500">
                    {historySearch 
                      ? "No hay resultados para la búsqueda especificada." 
                      : (selectedMonth 
                          ? `No se registraron movimientos en ${selectedMonthLabel}.`
                          : "No hay movimientos registrados.")}
                  </td>
                </tr>
              ) : (
                displayedMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-[#111] transition-colors group">
                    <td className="py-4 text-zinc-300">
                      {mov.fecha.toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-4 font-medium text-white">
                      {mov.cliente}
                    </td>
                    <td className="py-4 text-zinc-300">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-400">
                      {mov.descripcion}
                    </td>
                    <td className="py-4 text-right font-bold text-green-500 font-mono">
                      +${mov.monto.toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {displayedMovements.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#222] flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-400 gap-2">
            <span>
              Total movimientos: <strong className="text-white">{displayedMovements.length}</strong>
            </span>
            <span>
              Suma recaudada en este listado: <strong className="text-green-400 font-mono text-sm">
                ${displayedMovements.reduce((sum, m) => sum + m.monto, 0).toLocaleString("es-AR")}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
