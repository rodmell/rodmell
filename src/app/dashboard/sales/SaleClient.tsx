"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  ChevronDown,
  BadgeDollarSign, 
  Edit,
  Wallet
} from "lucide-react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function SearchableSelect({ options, value, onChange, placeholder }: any) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const selected = options.find((o: any) => o.value === value);
    if (selected) setSearch(selected.label);
    else setSearch("");
  }, [value, options]);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Input 
          className="w-full bg-[#111] border-[#333] pr-10" 
          placeholder={placeholder} 
          value={search} 
          onChange={e => { setSearch(e.target.value); setOpen(true); onChange(""); }}
          onClick={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        <ChevronDown 
          className="absolute right-3 w-4 h-4 text-zinc-500 cursor-pointer pointer-events-none" 
        />
      </div>
      {open && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-[#1a1a1a] border border-[#333] rounded-sm shadow-xl">
          {options.filter((o:any) => o.label.toLowerCase().includes(search.toLowerCase())).map((o:any) => (
            <li 
              key={o.value} 
              className="px-3 py-2 text-sm text-zinc-300 hover:bg-[#333] hover:text-white cursor-pointer"
              onMouseDown={(e) => {
                // use onMouseDown to fire before onBlur
                e.preventDefault(); 
                onChange(o.value);
                setSearch(o.label);
                setOpen(false);
              }}
            >
              {o.label}
            </li>
          ))}
          {options.filter((o:any) => o.label.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <li className="px-3 py-2 text-sm text-zinc-500">No hay resultados</li>
          )}
        </ul>
      )}
    </div>
  );
}

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

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      clienteId: "", vehiculoId: "", precioVehiculo: "", 
      hasEfectivo: false, efectivo: "",
      hasCredito: false, credito: "", porcentajeQuebranto: "", quebranto: "0",
      hasAuto: false, autoPartePago: "", detalleAutoPartePago: "",
      formaPago: "", total: "", saldoPendiente: "0", observaciones: ""
    });
    setOpen(true);
  };

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
          <Button onClick={handleNew} className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Nueva Operación
          </Button>
          <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-3xl md:max-w-5xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Venta" : "Registrar Venta"}</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Completá los detalles de la venta. Los totales se calculan automáticamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* COLUMNA IZQUIERDA: Cliente y Vehículo */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-zinc-300">Cliente</label>
                      <SearchableSelect 
                        placeholder="Escribí para buscar..."
                        value={formData.clienteId}
                        onChange={(val: string) => setFormData({...formData, clienteId: val})}
                        options={customers.map(c => ({ value: c.id, label: `${c.nombreCompleto} (DNI: ${c.dni || "-"})` }))}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-zinc-300">Vehículo</label>
                      <SearchableSelect 
                        placeholder="Escribí para buscar..."
                        value={formData.vehiculoId}
                        onChange={(val: string) => {
                          setFormData({...formData, vehiculoId: val});
                          const v = vehicles.find(v => v.id === val);
                          if (v && v.precioVenta) {
                            setFormData(prev => ({...prev, vehiculoId: val, precioVehiculo: v.precioVenta.toString()}));
                          }
                        }}
                        options={vehicles.map(v => ({ value: v.id, label: `${v.marca} ${v.modelo} - ${v.dominio} ($${v.precioVenta})` }))}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-zinc-300">Precio del Vehículo Acordado</label>
                      <Input required type="number" className="bg-[#111] border-[#333] text-lg text-yellow-500 font-semibold" value={formData.precioVehiculo} onChange={e => setFormData({...formData, precioVehiculo: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2 col-span-2 mt-4">
                      <label className="text-sm font-medium text-zinc-300">String Forma de Pago (Editable)</label>
                      <Input required className="bg-[#111] border-[#333]" value={formData.formaPago} onChange={e => setFormData({...formData, formaPago: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Formas de Pago y Resumen */}
                <div className="space-y-6">
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
                            <Label className="text-xs text-zinc-500">Detalles</Label>
                            <Input className="bg-[#0a0a0a] border-[#333]" placeholder="Ej: VW Gol Trend" value={formData.detalleAutoPartePago} onChange={e => setFormData({...formData, detalleAutoPartePago: e.target.value})} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Total a Pagar</label>
                      <Input required type="number" className="bg-[#111] border-[#333] text-lg" value={formData.total} onChange={e => setFormData({...formData, total: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Saldo Pendiente</label>
                      <Input required type="number" className="bg-[#111] border-[#333] text-lg text-red-400" value={formData.saldoPendiente} onChange={e => setFormData({...formData, saldoPendiente: e.target.value})} />
                    </div>
                  </div>
                </div>

              </div>
              <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-8 py-6 text-lg font-bold">
                {loading ? "Procesando..." : (editingId ? "Actualizar Venta" : "Confirmar Venta")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Buscar por cliente, vehículo, forma de pago o Nº comprobante..." 
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
              <TableHead className="text-zinc-400">Nº Comp.</TableHead>
              <TableHead className="text-zinc-400 text-right">Total</TableHead>
              <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.filter(s => {
              const innerIds = [
                ...(s.pagos?.map((p: any) => p.comprobante || p.id.slice(-6).toUpperCase()) || []),
                ...(s.cuotas?.map((cu: any) => cu.comprobante || cu.id.slice(-6).toUpperCase()) || [])
              ].join(" ");
              return `${s.cliente?.nombreCompleto} ${s.vehiculo?.marca} ${s.vehiculo?.modelo} ${s.formaPago} ${s.comprobante || s.id.slice(-6).toUpperCase()} ${innerIds}`.toLowerCase().includes(searchTerm.toLowerCase());
            }).length === 0 ? (
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                  No hay ventas registradas
                </TableCell>
              </TableRow>
            ) : (
              sales.filter(s => {
                const innerIds = [
                  ...(s.pagos?.map((p: any) => p.comprobante || p.id.slice(-6).toUpperCase()) || []),
                  ...(s.cuotas?.map((cu: any) => cu.comprobante || cu.id.slice(-6).toUpperCase()) || [])
                ].join(" ");
                return `${s.cliente?.nombreCompleto} ${s.vehiculo?.marca} ${s.vehiculo?.modelo} ${s.formaPago} ${s.comprobante || s.id.slice(-6).toUpperCase()} ${innerIds}`.toLowerCase().includes(searchTerm.toLowerCase());
              }).map((s) => (
                <TableRow key={s.id} className="border-[#222] hover:bg-[#111]">
                  <TableCell className="text-zinc-300">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium text-white">{s.cliente?.nombreCompleto}</TableCell>
                  <TableCell className="text-zinc-300">{s.vehiculo?.marca} {s.vehiculo?.modelo}</TableCell>
                  <TableCell className="text-zinc-300">{s.formaPago}</TableCell>
                  <TableCell className="text-yellow-500 font-mono text-xs">{s.comprobante || s.id.slice(-6).toUpperCase()}</TableCell>
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
