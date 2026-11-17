"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, X, FolderArchive } from "lucide-react";
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

export default function CustomerClient({ customers }: { customers: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    dni: "",
    cuil: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [caratulaModalOpen, setCaratulaModalOpen] = useState(false);
  const [selectedCustomerForCaratula, setSelectedCustomerForCaratula] = useState<any>(null);

  const handleCaratulaCliente = async (cliente: any) => {
    if (!cliente.operaciones || cliente.operaciones.length === 0) {
      alert(`El cliente ${cliente.nombreCompleto} no posee operaciones registradas todavía.`);
      return;
    }
    if (cliente.operaciones.length === 1) {
      const op = cliente.operaciones[0];
      const opCompleta = { ...op, cliente };
      const { generateCaratulaPDF } = await import('@/lib/generateCaratula');
      generateCaratulaPDF(opCompleta);
      return;
    }
    setSelectedCustomerForCaratula(cliente);
    setCaratulaModalOpen(true);
  };

  const handleDownloadSingleCaratula = async (op: any, cliente: any) => {
    const opCompleta = { ...op, cliente };
    const { generateCaratulaPDF } = await import('@/lib/generateCaratula');
    generateCaratulaPDF(opCompleta);
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({
      nombreCompleto: c.nombreCompleto,
      dni: c.dni || "",
      cuil: c.cuil || "",
      telefono: c.telefono || "",
      email: c.email || "",
      direccion: c.direccion || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
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
      const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setOpen(false);
        setEditingId(null);
        setFormData({ nombreCompleto: "", dni: "", cuil: "", telefono: "", email: "", direccion: "" });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-yellow-500" />
            Clientes
          </h1>
          <p className="text-zinc-400 mt-1">Administrá la cartera de clientes de la concesionaria.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingId ? "Modificá los datos del cliente." : "Ingresá los datos del cliente para registrarlo en el sistema."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Nombre Completo</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.nombreCompleto} onChange={e => setFormData({...formData, nombreCompleto: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">DNI</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">CUIL / CUIT</label>
                  <Input className="bg-[#111] border-[#333]" value={formData.cuil} onChange={e => setFormData({...formData, cuil: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Teléfono</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Email</label>
                  <Input type="email" className="bg-[#111] border-[#333]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Dirección</label>
                  <Input className="bg-[#111] border-[#333]" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6">
                {loading ? "Guardando..." : (editingId ? "Actualizar Cliente" : "Guardar Cliente")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Buscador reactivo */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Buscar por nombre, DNI, CUIL, teléfono, email, dirección o Nº de comprobante..." 
          className="pl-10 pr-10 bg-[#0a0a0a] border-[#222] text-white"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            title="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabla con Paginación */}
      {(() => {
        const filteredCustomers = customers.filter(c => {
          if (!searchTerm.trim()) return true;
          const term = searchTerm.toLowerCase();
          const allComprobantes = c.operaciones?.flatMap((op: any) => [
            op.comprobante, 
            op.id?.slice(-6).toUpperCase(),
            op.vehiculo ? `${op.vehiculo.marca} ${op.vehiculo.modelo} ${op.vehiculo.dominio}` : "",
            ...op.pagos?.map((p: any) => p.comprobante || p.id?.slice(-6).toUpperCase()),
            ...op.cuotas?.map((cu: any) => cu.comprobante || cu.id?.slice(-6).toUpperCase())
          ]).filter(Boolean).join(" ") || "";
          
          const fullText = `${c.nombreCompleto} ${c.dni || ""} ${c.cuil || ""} ${c.telefono || ""} ${c.email || ""} ${c.direccion || ""} ${allComprobantes}`.toLowerCase();
          return fullText.includes(term);
        });

        const totalResults = filteredCustomers.length;
        const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));
        const safeCurrentPage = Math.min(currentPage, totalPages);
        const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalResults);
        const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

        return (
          <div className="space-y-4">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222] hover:bg-transparent">
                    <TableHead className="text-zinc-400">Nombre Completo</TableHead>
                    <TableHead className="text-zinc-400">DNI</TableHead>
                    <TableHead className="text-zinc-400">Teléfono</TableHead>
                    <TableHead className="text-zinc-400">Email</TableHead>
                    <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.length === 0 ? (
                    <TableRow className="border-[#222] hover:bg-transparent">
                      <TableCell colSpan={5} className="text-center py-10 text-zinc-500">
                        {searchTerm ? (
                          <div className="space-y-2">
                            <p>No se encontraron clientes que coincidan con &quot;{searchTerm}&quot;.</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                              className="border-[#333] text-zinc-300 hover:text-white"
                            >
                              Limpiar búsqueda
                            </Button>
                          </div>
                        ) : (
                          "No hay clientes registrados"
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCustomers.map((c) => (
                      <TableRow key={c.id} className="border-[#222] hover:bg-[#111] transition-colors">
                        <TableCell className="font-medium text-white">{c.nombreCompleto}</TableCell>
                        <TableCell className="text-zinc-300">{c.dni || "-"}</TableCell>
                        <TableCell className="text-zinc-300">{c.telefono || "-"}</TableCell>
                        <TableCell className="text-zinc-300">{c.email || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleCaratulaCliente(c)}
                              className={`p-1.5 rounded transition-colors ${
                                c.operaciones && c.operaciones.length > 0
                                  ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                  : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/30"
                              }`}
                              title={
                                c.operaciones && c.operaciones.length > 0
                                  ? `Carátula de Operación (${c.operaciones.length} ${c.operaciones.length === 1 ? "operación" : "operaciones"})`
                                  : "El cliente no tiene operaciones registradas"
                              }
                            >
                              <FolderArchive className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(c)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors" title="Editar cliente">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Eliminar cliente">
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

            {/* Controles de paginación */}
            {totalResults > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg">
                <div className="text-xs text-zinc-400">
                  Mostrando <span className="font-medium text-white">{startIndex + 1}</span> a{" "}
                  <span className="font-medium text-white">{endIndex}</span> de{" "}
                  <span className="font-medium text-white">{totalResults}</span> clientes
                  {searchTerm && <span className="text-zinc-500 ml-1">({customers.length} en total)</span>}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 mr-2">
                    Página <span className="font-semibold text-white">{safeCurrentPage}</span> de{" "}
                    <span className="font-semibold text-white">{totalPages}</span>
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="h-8 px-2.5 bg-[#111] border-[#333] text-zinc-300 hover:bg-[#222] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>

                  {/* Números de página */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                      .reduce((acc: (number | string)[], p, idx, arr) => {
                        if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) {
                          acc.push("...");
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) => (
                        typeof p === "string" ? (
                          <span key={`dots-${i}`} className="px-1 text-xs text-zinc-600">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                              safeCurrentPage === p
                                ? "bg-yellow-500 text-black font-bold"
                                : "bg-[#111] text-zinc-400 hover:bg-[#222] hover:text-white border border-[#333]"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="h-8 px-2.5 bg-[#111] border-[#333] text-zinc-300 hover:bg-[#222] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Modal para elegir operación cuando el cliente tiene más de una */}
      <Dialog open={caratulaModalOpen} onOpenChange={setCaratulaModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <FolderArchive className="w-5 h-5" />
              Seleccionar Carátula de Operación
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              El cliente <strong className="text-white">{selectedCustomerForCaratula?.nombreCompleto}</strong> tiene {selectedCustomerForCaratula?.operaciones?.length} operaciones registradas. Seleccioná cuál querés descargar:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-3 max-h-[60vh] overflow-y-auto pr-1">
            {selectedCustomerForCaratula?.operaciones?.map((op: any) => (
              <div
                key={op.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[#222] bg-[#111] hover:border-amber-500/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-yellow-500">
                      {op.comprobante || `OP-${op.id.slice(-6).toUpperCase()}`}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(op.createdAt).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white mt-0.5">
                    {op.vehiculo ? `${op.vehiculo.marca} ${op.vehiculo.modelo} (${op.vehiculo.anio})` : "Vehículo"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Total: <strong className="text-zinc-200">${(op.total || 0).toLocaleString("es-AR")}</strong>
                    {op.vehiculo?.dominio ? ` • Patente: ${op.vehiculo.dominio}` : ""}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleDownloadSingleCaratula(op, selectedCustomerForCaratula)}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs h-8 px-3 inline-flex items-center gap-1.5"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
