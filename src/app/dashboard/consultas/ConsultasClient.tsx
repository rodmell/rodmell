"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquareText,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  Copy,
  Download,
  Phone,
  Mail,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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

export default function ConsultasClient({
  consultas,
  users,
  session,
}: {
  consultas: any[];
  users: any[];
  session?: any;
}) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [openConvertModal, setOpenConvertModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Selected for edit or convert
  const [editingId, setEditingId] = useState<string | null>(null);
  const [convertingConsulta, setConvertingConsulta] = useState<any | null>(null);

  // Form data for Consulta (create/edit)
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    quienAtendio: session?.user?.name || "",
    interes: "",
    observaciones: "",
    estado: "PENDIENTE",
  });

  // Form data for converting to customer
  const [convertData, setConvertData] = useState({
    nombreCompleto: "",
    telefono: "",
    email: "",
    dni: "",
    cuil: "",
    direccion: "",
    observaciones: "",
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      nombre: "",
      telefono: "",
      email: "",
      quienAtendio: session?.user?.name || (users[0]?.name || ""),
      interes: "",
      observaciones: "",
      estado: "PENDIENTE",
    });
    setOpenModal(true);
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({
      nombre: c.nombre,
      telefono: c.telefono || "",
      email: c.email || "",
      quienAtendio: c.quienAtendio || "",
      interes: c.interes || "",
      observaciones: c.observaciones || "",
      estado: c.estado || "PENDIENTE",
    });
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro de consulta?")) return;
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Consulta eliminada correctamente");
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/inquiries/${editingId}` : "/api/inquiries";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setOpenModal(false);
        setEditingId(null);
        toast.success(editingId ? "Consulta actualizada" : "Nueva consulta registrada");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al procesar la solicitud");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  // Convert to customer handlers
  const handleOpenConvert = (c: any) => {
    setConvertingConsulta(c);
    setConvertData({
      nombreCompleto: c.nombre,
      telefono: c.telefono || "",
      email: c.email || "",
      dni: "",
      cuil: "",
      direccion: "",
      observaciones: `Registrado desde Consulta #${c.id.slice(-6).toUpperCase()}${c.interes ? ` (Interés: ${c.interes})` : ""}${c.observaciones ? ` - ${c.observaciones}` : ""}`,
    });
    setOpenConvertModal(true);
  };

  const handleConfirmConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingConsulta) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/inquiries/${convertingConsulta.id}/convert-to-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(convertData),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`¡Cliente "${data.cliente.nombreCompleto}" creado con éxito!`);
        setOpenConvertModal(false);
        setConvertingConsulta(null);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al convertir consulta");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  // Promotion helpers
  const handleCopyPhones = (list: any[]) => {
    const phones = list
      .map((c) => c.telefono?.replace(/[^0-9+]/g, ""))
      .filter((p) => Boolean(p && p.length >= 6));

    if (phones.length === 0) {
      toast.error("No hay teléfonos válidos en la lista actual");
      return;
    }

    navigator.clipboard.writeText(phones.join(", "));
    toast.success(`¡${phones.length} teléfonos copiados al portapapeles! Listo para WhatsApp o CRM.`);
  };

  const handleCopyEmails = (list: any[]) => {
    const emails = list
      .map((c) => c.email?.trim())
      .filter((e) => Boolean(e && e.includes("@")));

    if (emails.length === 0) {
      toast.error("No hay correos válidos en la lista actual");
      return;
    }

    navigator.clipboard.writeText(emails.join(", "));
    toast.success(`¡${emails.length} correos copiados al portapapeles! Listo para campañas de email.`);
  };

  const handleExportCSV = (list: any[]) => {
    if (list.length === 0) {
      toast.error("No hay registros para exportar");
      return;
    }

    const headers = ["Fecha", "Nombre", "Telefono", "Email", "Quien Atendio", "Interes", "Estado", "Observaciones"];
    const rows = list.map((c) => [
      `"${new Date(c.createdAt).toLocaleDateString("es-AR")}"`,
      `"${(c.nombre || "").replace(/"/g, '""')}"`,
      `"${(c.telefono || "").replace(/"/g, '""')}"`,
      `"${(c.email || "").replace(/"/g, '""')}"`,
      `"${(c.quienAtendio || "").replace(/"/g, '""')}"`,
      `"${(c.interes || "").replace(/"/g, '""')}"`,
      `"${(c.estado || "").replace(/"/g, '""')}"`,
      `"${(c.observaciones || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Consultas_Rodmell_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Base de datos de consultas exportada en CSV");
  };

  // Filtered inquiries
  const filteredInquiries = consultas.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const searchString = `${c.nombre || ""} ${c.telefono || ""} ${c.email || ""} ${c.quienAtendio || ""} ${c.interes || ""} ${c.observaciones || ""} ${c.estado || ""}`.toLowerCase();
    return searchString.includes(term);
  });

  const totalResults = filteredInquiries.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalResults);
  const paginatedInquiries = filteredInquiries.slice(startIndex, endIndex);

  const convertedCount = consultas.filter((c) => c.estado === "CLIENTE" || c.clienteId).length;
  const pendingCount = consultas.filter((c) => c.estado !== "CLIENTE" && !c.clienteId).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#222] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <MessageSquareText className="h-8 w-8 text-yellow-500" />
            Consultas y Prospectos
          </h1>
          <p className="text-zinc-400 mt-1">
            Base de datos para promociones, marketing y conversión directa a clientes.
          </p>
        </div>

        <Button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md px-4 py-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nueva Consulta
        </Button>
      </div>

      {/* KPI Cards & Marketing Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <MessageSquareText className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Total Consultas Registradas</p>
            <p className="text-2xl font-bold text-white">{consultas.length}</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20">
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Prospectos Activos (BD Promociones)</p>
            <p className="text-2xl font-bold text-blue-400">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-md bg-green-500/10 border border-green-500/20">
            <UserCheck className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Convertidos a Clientes</p>
            <p className="text-2xl font-bold text-green-400">{convertedCount}</p>
          </div>
        </div>
      </div>

      {/* Barra de herramientas para Promociones y Búsqueda */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por nombre, teléfono, email, quién atendió o vehículo de interés..."
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

        {/* Botones de acción rápida para promociones */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyPhones(filteredInquiries)}
            className="bg-[#111] border-[#333] text-zinc-300 hover:text-white hover:bg-[#222] text-xs h-9"
            title="Copiar teléfonos filtrados para difusión por WhatsApp"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
            Copiar Teléfonos
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyEmails(filteredInquiries)}
            className="bg-[#111] border-[#333] text-zinc-300 hover:text-white hover:bg-[#222] text-xs h-9"
            title="Copiar emails filtrados para campañas de correo"
          >
            <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Copiar Emails
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCSV(filteredInquiries)}
            className="bg-[#111] border-[#333] text-zinc-300 hover:text-white hover:bg-[#222] text-xs h-9"
            title="Exportar base de datos a archivo CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-green-400" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Tabla con Paginación de 10 por página */}
      <div className="space-y-4">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableHead className="text-zinc-400">Fecha</TableHead>
                <TableHead className="text-zinc-400">Nombre</TableHead>
                <TableHead className="text-zinc-400">Contacto</TableHead>
                <TableHead className="text-zinc-400">Quién Atendió</TableHead>
                <TableHead className="text-zinc-400">Interés / Vehículo</TableHead>
                <TableHead className="text-zinc-400">Estado</TableHead>
                <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInquiries.length === 0 ? (
                <TableRow className="border-[#222] hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center py-10 text-zinc-500">
                    {searchTerm ? (
                      <div className="space-y-2">
                        <p>No se encontraron consultas que coincidan con &quot;{searchTerm}&quot;.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("");
                            setCurrentPage(1);
                          }}
                          className="border-[#333] text-zinc-300 hover:text-white"
                        >
                          Limpiar filtro
                        </Button>
                      </div>
                    ) : (
                      "No hay consultas registradas todavía."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInquiries.map((c) => {
                  const isConverted = c.estado === "CLIENTE" || Boolean(c.clienteId);

                  return (
                    <TableRow key={c.id} className="border-[#222] hover:bg-[#111] transition-colors">
                      <TableCell className="text-zinc-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        <div>
                          <span>{c.nombre}</span>
                          {c.observaciones && (
                            <p className="text-[11px] text-zinc-500 truncate max-w-xs">{c.observaciones}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300 text-xs">
                        <div className="space-y-1">
                          {c.telefono ? (
                            <a
                              href={`https://wa.me/${c.telefono.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-green-400 transition-colors"
                              title="Enviar WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-green-500" />
                              <span>{c.telefono}</span>
                            </a>
                          ) : (
                            <span className="text-zinc-600">Sin teléfono</span>
                          )}
                          {c.email && (
                            <div>
                              <a
                                href={`mailto:${c.email}`}
                                className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-blue-400 transition-colors"
                                title="Enviar correo"
                              >
                                <Mail className="w-3 h-3 text-blue-400" />
                                <span className="truncate max-w-[150px] inline-block">{c.email}</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300 text-xs">
                        <span className="px-2 py-0.5 rounded bg-[#181818] border border-[#2b2b2b] text-zinc-300">
                          {c.quienAtendio || "Sin asignar"}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-300 text-xs font-medium">
                        {c.interes || <span className="text-zinc-600">-</span>}
                      </TableCell>
                      <TableCell>
                        {isConverted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border text-green-400 border-green-500/30 bg-green-500/10">
                            <CheckCircle className="w-3 h-3" />
                            Cliente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border text-yellow-400 border-yellow-500/30 bg-yellow-500/10">
                            <Sparkles className="w-3 h-3" />
                            Prospecto
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Cargar como Cliente */}
                          {isConverted ? (
                            <Link
                              href="/dashboard/customers"
                              className="px-2.5 py-1 text-xs text-green-400 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 rounded transition-colors inline-flex items-center gap-1"
                              title="Ver cliente en el módulo de clientes"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Ver Cliente</span>
                            </Link>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleOpenConvert(c)}
                              className="px-2.5 py-1 text-xs bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-black border border-yellow-500/30 rounded transition-colors inline-flex items-center gap-1 h-7"
                              title="Cargar y registrar como cliente en el sistema"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Cargar como Cliente</span>
                            </Button>
                          )}

                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors"
                            title="Editar consulta"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Eliminar consulta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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
              <span className="font-medium text-white">{totalResults}</span> consultas
              {searchTerm && <span className="text-zinc-500 ml-1">({consultas.length} en total)</span>}
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="h-8 px-2.5 bg-[#111] border-[#333] text-zinc-300 hover:bg-[#222] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>

              {/* Botones de página */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                  .reduce((acc: (number | string)[], p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === "string" ? (
                      <span key={`dots-${i}`} className="px-1 text-xs text-zinc-600">
                        ...
                      </span>
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
                  )}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="h-8 px-2.5 bg-[#111] border-[#333] text-zinc-300 hover:bg-[#222] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar Consulta */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Consulta" : "Nueva Consulta / Contacto"}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Registrá los datos de la persona para seguimiento o promociones.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nombre Completo *</label>
              <Input
                required
                placeholder="Ej: Juan Pérez"
                className="bg-[#111] border-[#333] text-white"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Teléfono</label>
                <Input
                  placeholder="Ej: 341 555-1234"
                  className="bg-[#111] border-[#333] text-white"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Email</label>
                <Input
                  type="email"
                  placeholder="Ej: juan@gmail.com"
                  className="bg-[#111] border-[#333] text-white"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Quién Atendió</label>
                <select
                  className="w-full h-10 px-3 bg-[#111] border border-[#333] rounded-md text-sm text-white focus:outline-none focus:border-yellow-500"
                  value={formData.quienAtendio}
                  onChange={(e) => setFormData({ ...formData, quienAtendio: e.target.value })}
                >
                  <option value="">Seleccionar asesor...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                  {formData.quienAtendio && !users.some((u) => u.name === formData.quienAtendio) && (
                    <option value={formData.quienAtendio}>{formData.quienAtendio}</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Vehículo / Interés</label>
                <Input
                  placeholder="Ej: Hilux 2021, Financiación..."
                  className="bg-[#111] border-[#333] text-white"
                  value={formData.interes}
                  onChange={(e) => setFormData({ ...formData, interes: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Observaciones / Notas</label>
              <textarea
                rows={3}
                placeholder="Detalle de la consulta, requerimientos, presupuesto pactado..."
                className="w-full p-2.5 bg-[#111] border border-[#333] rounded-md text-sm text-white focus:outline-none focus:border-yellow-500 resize-none"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold mt-4"
            >
              {loading ? "Guardando..." : editingId ? "Actualizar Consulta" : "Guardar Consulta"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Cargar Consulta Directamente como Cliente */}
      <Dialog open={openConvertModal} onOpenChange={setOpenConvertModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-yellow-500" />
              Cargar como Cliente
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Registrá a esta persona en la cartera de Clientes del sistema utilizando los datos recopilados en la consulta.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmConvert} className="space-y-4 mt-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nombre Completo *</label>
              <Input
                required
                className="bg-[#111] border-[#333] text-white"
                value={convertData.nombreCompleto}
                onChange={(e) => setConvertData({ ...convertData, nombreCompleto: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">DNI (Opcional)</label>
                <Input
                  placeholder="Número de DNI"
                  className="bg-[#111] border-[#333] text-white"
                  value={convertData.dni}
                  onChange={(e) => setConvertData({ ...convertData, dni: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">CUIL / CUIT (Opcional)</label>
                <Input
                  placeholder="CUIL / CUIT"
                  className="bg-[#111] border-[#333] text-white"
                  value={convertData.cuil}
                  onChange={(e) => setConvertData({ ...convertData, cuil: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Teléfono</label>
                <Input
                  className="bg-[#111] border-[#333] text-white"
                  value={convertData.telefono}
                  onChange={(e) => setConvertData({ ...convertData, telefono: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Email</label>
                <Input
                  type="email"
                  className="bg-[#111] border-[#333] text-white"
                  value={convertData.email}
                  onChange={(e) => setConvertData({ ...convertData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Dirección (Opcional)</label>
              <Input
                placeholder="Calle, número, localidad"
                className="bg-[#111] border-[#333] text-white"
                value={convertData.direccion}
                onChange={(e) => setConvertData({ ...convertData, direccion: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Observaciones</label>
              <Input
                className="bg-[#111] border-[#333] text-white"
                value={convertData.observaciones}
                onChange={(e) => setConvertData({ ...convertData, observaciones: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold mt-4"
            >
              {loading ? "Registrando cliente..." : "Registrar y Vincular Cliente"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

