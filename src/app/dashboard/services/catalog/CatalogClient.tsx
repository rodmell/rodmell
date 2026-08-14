"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  Plus,
  Search,
  Trash2,
  Edit,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatThousands, parseThousands } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const TIPOS_SERVICIO = [
  { value: "ACCESORIO", label: "🔧 Accesorio" },
  { value: "POLARIZADO", label: "🪟 Polarizado" },
  { value: "GNC", label: "⛽ GNC" },
  { value: "ALARMA", label: "🔔 Alarma" },
  { value: "SERVICE", label: "🛠 Service" },
  { value: "OTROS", label: "📦 Otros" },
];

const TIPO_LABELS: Record<string, string> = {
  ACCESORIO: "🔧 Accesorio",
  POLARIZADO: "🪟 Polarizado",
  GNC: "⛽ GNC",
  ALARMA: "🔔 Alarma",
  SERVICE: "🛠 Service",
  OTROS: "📦 Otros",
};

const emptyForm = {
  tipo: "ACCESORIO",
  descripcion: "",
  monto: "",
};

export default function CatalogClient({ catalog }: { catalog: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const filtered = catalog.filter((item) =>
    `${item.tipo} ${item.descripcion}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setOpenDialog(true);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      tipo: item.tipo,
      descripcion: item.descripcion,
      monto: formatThousands(item.monto),
    });
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        monto: parseThousands(form.monto),
      };
      const url = editingId ? `/api/catalog-services/${editingId}` : "/api/catalog-services";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setOpenDialog(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Error al guardar");
      }
    } catch {
      alert("Error de conexión");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/catalog-services/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Error al eliminar");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/services" className="p-2 bg-[#111] hover:bg-[#222] text-zinc-400 hover:text-white rounded-lg transition-colors border border-[#333]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Wrench className="h-8 w-8 text-yellow-500" />
              Catálogo de P&S
            </h1>
            <p className="text-zinc-400 mt-1">Administrá productos, servicios y sus precios por defecto.</p>
          </div>
        </div>
        <Button
          onClick={handleNew}
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-sm px-4 py-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Buscar por tipo o descripción..."
          className="pl-10 bg-[#0a0a0a] border-[#222] text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="text-zinc-400">Tipo</TableHead>
              <TableHead className="text-zinc-400">Descripción / Nombre</TableHead>
              <TableHead className="text-zinc-400 text-right">Precio por defecto</TableHead>
              <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableCell colSpan={4} className="text-center py-10 text-zinc-500">
                  <Wrench className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                  No hay productos en el catálogo
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="border-[#222] hover:bg-[#111]">
                  <TableCell>
                    <span className="text-sm text-zinc-300">{TIPO_LABELS[item.tipo] || item.tipo}</span>
                  </TableCell>
                  <TableCell className="font-medium text-white">{item.descripcion}</TableCell>
                  <TableCell className="text-right text-yellow-500 font-bold font-mono">
                    ${item.monto.toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Eliminar"
                      >
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

      {/* ── Dialog Nuevo / Editar Producto ── */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-md rounded-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-yellow-500" />
              {editingId ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Cargá el precio y la descripción para autocompletar luego.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Tipo de Producto/Servicio *</Label>
              <div className="relative">
                <select
                  required
                  className="w-full bg-[#111] border border-[#333] text-white rounded-sm px-3 py-2 text-sm appearance-none"
                  value={form.tipo}
                  onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
                >
                  {TIPOS_SERVICIO.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Descripción / Nombre del Producto *</Label>
              <Input
                required
                className="bg-[#111] border-[#333]"
                placeholder="Ej: Polarizado intermedio 20%"
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Precio por defecto *</Label>
              <Input
                required
                type="text"
                className="bg-[#111] border-[#333]"
                placeholder="0"
                value={form.monto}
                onChange={(e) => setForm((p) => ({ ...p, monto: formatThousands(e.target.value) }))}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-5 mt-4"
            >
              {loading ? "Guardando..." : editingId ? "Actualizar Producto" : "Guardar Producto"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Eliminar del catálogo"
        description="¿Estás seguro de eliminar este producto/servicio del catálogo? Esta acción no se puede deshacer."
        onConfirm={() => {
          if (itemToDelete) handleDelete(itemToDelete);
        }}
      />
    </div>
  );
}
