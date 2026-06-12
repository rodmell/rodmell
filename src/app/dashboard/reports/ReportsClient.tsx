"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BarChart3, TrendingUp, Users, Car } from "lucide-react";
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

export default function ReportsClient({ sales, vehicles, customers }: { sales: any[], vehicles: any[], customers: any[] }) {
  
  // Calculate total revenue (pagos sueltos + cuotas pagadas)
  const calculateRecaudado = (sale: any) => {
    const pagos = sale.pagos?.reduce((sum: number, p: any) => sum + p.importe, 0) || 0;
    const cuotas = sale.cuotas?.filter((c: any) => c.estado === "PAGADA").reduce((sum: number, c: any) => sum + c.valor, 0) || 0;
    return pagos + cuotas;
  };

  const totalRevenue = sales.reduce((acc, sale) => acc + calculateRecaudado(sale), 0);
  
  // Group sales by month
  const monthlySales = Array.from({ length: 12 }, (_, i) => {
    const monthSales = sales.filter(s => new Date(s.createdAt).getMonth() === i);
    return {
      name: new Date(0, i).toLocaleString('es', { month: 'short' }).toUpperCase(),
      total: monthSales.reduce((acc, s) => acc + calculateRecaudado(s), 0),
      operaciones: monthSales.length
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Reportes y Estadísticas</h1>
          <p className="text-zinc-400 mt-1">Métricas de rendimiento y ventas de la concesionaria.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Ingresos Totales</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Ventas Concretadas</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{sales.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Vehículos en Stock</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Car className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{vehicles.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Clientes Registrados</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Users className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{customers.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Ingresos Mensuales</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip cursor={{fill: '#111'}} contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} />
                <Bar dataKey="total" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Volumen de Operaciones</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} />
                <Line type="monotone" dataKey="operaciones" stroke="#eab308" strokeWidth={3} dot={{fill: '#eab308', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
