"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BadgeDollarSign, Plus, Search, Trash2, Edit, Wallet, FileText } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function SaleClient({ sales, vehicles, customers, session }: { sales: any[], vehicles: any[], customers: any[], session: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    clienteId: "",
    vehiculoId: "",
    precioVehiculo: "",

    hasEfectivo: false,
    efectivo: "",

    hasCredito: false,
    credito: "",
    porcentajeQuebranto: "",
    quebranto: "0",

    hasAuto: false,
    autoPartePago: "",
    detalleAutoPartePago: "",

    formaPago: "",
    total: "",
    saldoPendiente: "0",
    observaciones: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Recalculate calculations automatically when inputs change
  useEffect(() => {
    const precioVehiculo = parseFloat(formData.precioVehiculo) || 0;
    const credito = formData.hasCredito ? (parseFloat(formData.credito) || 0) : 0;
    const porcentajeQuebranto = formData.hasCredito ? (parseFloat(formData.porcentajeQuebranto) || 0) : 0;
    
    // Calcular Quebranto (Crédito * (Porcentaje/100) * 1.21 de IVA)
    const calculadoQuebranto = credito * (porcentajeQuebranto / 100) * 1.21;
    const quebrantoStr = calculadoQuebranto.toFixed(2);

    // Total = Precio + Quebranto
    const calculadoTotal = precioVehiculo + calculadoQuebranto;

    // Pagos
    const pagoEfectivo = formData.hasEfectivo ? (parseFloat(formData.efectivo) || 0) : 0;
    const pagoAuto = formData.hasAuto ? (parseFloat(formData.autoPartePago) || 0) : 0;
    const totalPagado = pagoEfectivo + credito + pagoAuto;

    // Saldo Pendiente
    const calculadoSaldo = calculadoTotal - totalPagado;

    // Generar string Forma de Pago
    const formas = [];
    if (formData.hasEfectivo) formas.push("Efectivo");
    if (formData.hasCredito) formas.push("Crédito");
    if (formData.hasAuto) formas.push("Auto en Parte de Pago");
    const calculadoFormaPago = formas.join(" + ");

    setFormData(prev => ({
      ...prev,
      quebranto: quebrantoStr,
      total: calculadoTotal.toFixed(2),
      saldoPendiente: calculadoSaldo.toFixed(2),
      formaPago: prev.formaPago || calculadoFormaPago // Only auto-set if not manually overridden by user or we can just override it here constantly. Let's just update if it's generated.
    }));
  }, [
    formData.precioVehiculo,
    formData.hasEfectivo, formData.efectivo,
    formData.hasCredito, formData.credito, formData.porcentajeQuebranto,
    formData.hasAuto, formData.autoPartePago
  ]);

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({
      clienteId: s.clienteId,
      vehiculoId: s.vehiculoId,
      precioVehiculo: s.precioVehiculo.toString(),
      hasEfectivo: (s.efectivo && s.efectivo > 0) ? true : false,
      efectivo: s.efectivo ? s.efectivo.toString() : "",
      hasCredito: (s.credito && s.credito > 0) ? true : false,
      credito: s.credito ? s.credito.toString() : "",
      porcentajeQuebranto: s.porcentajeQuebranto ? s.porcentajeQuebranto.toString() : "",
      quebranto: s.quebranto ? s.quebranto.toString() : "0",
      hasAuto: (s.autoPartePago && s.autoPartePago > 0) ? true : false,
      autoPartePago: s.autoPartePago ? s.autoPartePago.toString() : "",
      detalleAutoPartePago: s.detalleAutoPartePago || "",
      formaPago: s.formaPago || "",
      total: s.total.toString(),
      saldoPendiente: s.saldoPendiente.toString(),
      observaciones: s.observaciones || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de anular esta venta? El vehículo y el cliente seguirán existiendo.")) return;
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al eliminar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        clienteId: formData.clienteId,
        vehiculoId: formData.vehiculoId,
        precioVehiculo: parseFloat(formData.precioVehiculo) || 0,
        formaPago: formData.formaPago,
        
        efectivo: formData.hasEfectivo ? (parseFloat(formData.efectivo) || 0) : null,
        credito: formData.hasCredito ? (parseFloat(formData.credito) || 0) : null,
        porcentajeQuebranto: formData.hasCredito ? (parseFloat(formData.porcentajeQuebranto) || 0) : null,
        quebranto: formData.hasCredito ? (parseFloat(formData.quebranto) || 0) : null,
        autoPartePago: formData.hasAuto ? (parseFloat(formData.autoPartePago) || 0) : null,
        detalleAutoPartePago: formData.hasAuto ? formData.detalleAutoPartePago : null,
        
        observaciones: formData.observaciones,
        total: parseFloat(formData.total) || 0,
        saldoPendiente: parseFloat(formData.saldoPendiente) || 0,
        vendedorId: session?.user?.id || "cl123", // Assuming cl123 as fallback, normally handled by session
      };
      
      const url = editingId ? `/api/sales/${editingId}` : "/api/sales";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setOpen(false);
        setEditingId(null);
        setFormData({ 
          clienteId: "", vehiculoId: "", precioVehiculo: "", 
          hasEfectivo: false, efectivo: "",
          hasCredito: false, credito: "", porcentajeQuebranto: "", quebranto: "0",
          hasAuto: false, autoPartePago: "", detalleAutoPartePago: "",
          formaPago: "", total: "", saldoPendiente: "0", observaciones: ""
        });
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Error al procesar la venta");
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleDownloadPDF = async (sale: any) => {
    // Dynamic import to avoid SSR issues with window/document
    const { generateReceiptPDF } = await import('@/lib/generateReceipt');
    generateReceiptPDF(sale);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <BadgeDollarSign className="h-8 w-8 text-yellow-500" />
            Ventas
          </h1>
          <p className="text-zinc-400 mt-1">Registrá y gestioná las operaciones concretadas.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Nueva Operación
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-[#222] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Venta" : "Registrar Venta"}</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Completá los detalles de la venta. Los totales se calculan automáticamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              
              {/* Cliente y Vehículo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-sm font-medium text-zinc-300">Cliente</label>
                  <select required className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white" value={formData.clienteId} onChange={e => setFormData({...formData, clienteId: e.target.value})}>
                    <option value="">Seleccione un cliente...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.nombreCompleto} (DNI: {c.dni})</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-sm font-medium text-zinc-300">Vehículo</label>
                  <select required className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white" value={formData.vehiculoId} onChange={e => setFormData({...formData, vehiculoId: e.target.value})}>
                    <option value="">Seleccione un vehículo...</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.dominio} (${v.precioVenta})</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Precio del Vehículo Acordado</label>
                  <Input required type="number" className="bg-[#111] border-[#333] text-lg text-yellow-500 font-semibold" value={formData.precioVehiculo} onChange={e => setFormData({...formData, precioVehiculo: e.target.value})} />
                </div>
              </div>

              {/* Formas de Pago */}
              <div className="space-y-4 border border-[#333] p-4 rounded-lg bg-[#111]/50">
                <h3 className="text-sm font-medium text-zinc-300 mb-2">Composición del Pago</h3>
                
                {/* EFECTIVO */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="chk-efectivo" checked={formData.hasEfectivo} onCheckedChange={(c) => setFormData({...formData, hasEfectivo: !!c})} className="border-zinc-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black" />
                    <Label htmlFor="chk-efectivo" className="text-zinc-300 cursor-pointer">Efectivo</Label>
                  </div>
                  {formData.hasEfectivo && (
                    <div className="pl-6 space-y-2">
                      <Label className="text-xs text-zinc-500">Monto en Efectivo</Label>
                      <Input type="number" className="bg-[#0a0a0a] border-[#333]" placeholder="0.00" value={formData.efectivo} onChange={e => setFormData({...formData, efectivo: e.target.value})} />
                    </div>
                  )}
                </div>

                {/* CREDITO */}
                <div className="flex flex-col space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="chk-credito" checked={formData.hasCredito} onCheckedChange={(c) => setFormData({...formData, hasCredito: !!c})} className="border-zinc-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black" />
                    <Label htmlFor="chk-credito" className="text-zinc-300 cursor-pointer">Crédito</Label>
                  </div>
                  {formData.hasCredito && (
                    <div className="pl-6 grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2 md:col-span-1">
                        <Label className="text-xs text-zinc-500">Monto del Crédito</Label>
                        <Input type="number" className="bg-[#0a0a0a] border-[#333]" placeholder="0.00" value={formData.credito} onChange={e => setFormData({...formData, credito: e.target.value})} />
                      </div>
                      <div className="space-y-2 col-span-2 md:col-span-1">
                        <Label className="text-xs text-zinc-500">% Quebranto</Label>
                        <Input type="number" className="bg-[#0a0a0a] border-[#333]" placeholder="10" value={formData.porcentajeQuebranto} onChange={e => setFormData({...formData, porcentajeQuebranto: e.target.value})} />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label className="text-xs text-zinc-500">Costo de Quebranto Calculado (+21% IVA)</Label>
                        <Input readOnly type="number" className="bg-[#222] border-[#444] text-zinc-400" value={formData.quebranto} />
                      </div>
                    </div>
                  )}
                </div>

                {/* AUTO PARTE DE PAGO */}
                <div className="flex flex-col space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="chk-auto" checked={formData.hasAuto} onCheckedChange={(c) => setFormData({...formData, hasAuto: !!c})} className="border-zinc-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black" />
                    <Label htmlFor="chk-auto" className="text-zinc-300 cursor-pointer">Auto en Parte de Pago</Label>
                  </div>
                  {formData.hasAuto && (
                    <div className="pl-6 grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2 md:col-span-1">
                        <Label className="text-xs text-zinc-500">Valor Reconocido</Label>
                        <Input type="number" className="bg-[#0a0a0a] border-[#333]" placeholder="0.00" value={formData.autoPartePago} onChange={e => setFormData({...formData, autoPartePago: e.target.value})} />
                      </div>
                      <div className="space-y-2 col-span-2 md:col-span-1">
                        <Label className="text-xs text-zinc-500">Detalles (Marca/Modelo/Patente)</Label>
                        <Input className="bg-[#0a0a0a] border-[#333]" placeholder="Ej: VW Gol Trend AB123CD" value={formData.detalleAutoPartePago} onChange={e => setFormData({...formData, detalleAutoPartePago: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">String Forma de Pago (Editable)</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.formaPago} onChange={e => setFormData({...formData, formaPago: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Total a Pagar</label>
                  <Input required type="number" className="bg-[#111] border-[#333] text-lg" value={formData.total} onChange={e => setFormData({...formData, total: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Saldo Pendiente</label>
                  <Input required type="number" className="bg-[#111] border-[#333] text-lg text-red-400" value={formData.saldoPendiente} onChange={e => setFormData({...formData, saldoPendiente: e.target.value})} />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6 py-6 text-lg font-bold">
                {loading ? "Procesando..." : (editingId ? "Actualizar Venta" : "Confirmar Venta")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Buscar por cliente, vehículo o forma de pago..." 
          className="pl-10 bg-[#0a0a0a] border-[#222] text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="text-zinc-400">Fecha</TableHead>
              <TableHead className="text-zinc-400">Cliente</TableHead>
              <TableHead className="text-zinc-400">Vehículo</TableHead>
              <TableHead className="text-zinc-400">Forma Pago</TableHead>
              <TableHead className="text-zinc-400 text-right">Total</TableHead>
              <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.filter(s => 
              `${s.cliente?.nombreCompleto} ${s.vehiculo?.marca} ${s.vehiculo?.modelo} ${s.formaPago}`.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                  No hay ventas registradas
                </TableCell>
              </TableRow>
            ) : (
              sales.filter(s => 
                `${s.cliente?.nombreCompleto} ${s.vehiculo?.marca} ${s.vehiculo?.modelo} ${s.formaPago}`.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((s) => (
                <TableRow key={s.id} className="border-[#222] hover:bg-[#111]">
                  <TableCell className="text-zinc-300">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium text-white">{s.cliente?.nombreCompleto}</TableCell>
                  <TableCell className="text-zinc-300">{s.vehiculo?.marca} {s.vehiculo?.modelo}</TableCell>
                  <TableCell className="text-zinc-300">{s.formaPago}</TableCell>
                  <TableCell className="text-right text-yellow-500 font-bold">${s.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleDownloadPDF(s)} className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors" title="Descargar Comprobante">
                        <FileText className="w-4 h-4" />
                      </button>
                      <Link href={`/dashboard/sales/${s.id}/payments`} className="p-1.5 text-zinc-400 hover:text-green-500 hover:bg-green-500/10 rounded transition-colors" title="Gestión de Pagos y Cuotas">
                        <Wallet className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleEdit(s)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
