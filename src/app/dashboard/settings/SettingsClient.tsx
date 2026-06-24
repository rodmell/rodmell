"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, UserPlus, Edit, Trash2, Filter } from "lucide-react";
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
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  SELLER: "Vendedor",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
};

const ROLE_COLORS: Record<string, string> = {
  SELLER: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  ADMIN: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  MANAGER: "text-green-400 border-green-500/30 bg-green-500/10",
};

export default function SettingsClient({ users, logs: initialLogs }: { users: any[], logs: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // User forms
  const [formData, setFormData] = useState({
    name: "", username: "", password: "", role: "SELLER", phone: "",
  });
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editData, setEditData] = useState({
    name: "", username: "", password: "", role: "SELLER", phone: "",
  });

  // Activity Logs Filters
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  useEffect(() => {
    const fetchLogs = async () => {
      setLogsLoading(true);
      try {
        const query = new URLSearchParams();
        if (filterUserId) query.append("userId", filterUserId);
        if (filterStartDate) query.append("startDate", filterStartDate);
        if (filterEndDate) query.append("endDate", filterEndDate);

        const res = await fetch(`/api/activity?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch logs", error);
      }
      setLogsLoading(false);
    };

    fetchLogs();
  }, [filterUserId, filterStartDate, filterEndDate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setOpen(false);
        setFormData({ name: "", username: "", password: "", role: "SELLER", phone: "" });
        toast.success("Usuario creado correctamente");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al crear el usuario");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  const handleEdit = (u: any) => {
    setSelectedUser(u);
    setEditData({ name: u.name, username: u.username, password: "", role: u.role, phone: u.phone || "" });
    setOpenEdit(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setOpenEdit(false);
        setSelectedUser(null);
        toast.success("Usuario actualizado");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al actualizar el usuario");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  const handleDeleteUser = async (u: any) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${u.name}" (@${u.username})? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Usuario eliminado");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al eliminar el usuario");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Configuración</h1>
          <p className="text-zinc-400 mt-1">Gestión de usuarios y registro de actividad del sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* USERS SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Usuarios del Sistema</h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-[#111] border border-[#333] hover:bg-[#222] text-white font-medium">
                <UserPlus className="w-4 h-4 mr-2" /> Nuevo Usuario
              </DialogTrigger>
              <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
                <DialogHeader>
                  <DialogTitle>Crear Usuario</DialogTitle>
                  <DialogDescription className="text-zinc-400">Añadí un nuevo acceso al sistema Rodmell.</DialogDescription>
                </DialogHeader>
                <UserForm data={formData} setData={setFormData} onSubmit={handleSubmit} submitLabel="Crear Usuario" loading={loading} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#222] hover:bg-transparent">
                  <TableHead className="text-zinc-400">Usuario</TableHead>
                  <TableHead className="text-zinc-400">Rol</TableHead>
                  <TableHead className="text-zinc-400">Creado</TableHead>
                  <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-[#222] hover:bg-[#111]">
                    <TableCell className="font-medium text-white">
                      <div>{u.name}</div>
                      <div className="text-xs text-zinc-500">@{u.username} {u.phone ? `· ${u.phone}` : ""}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[u.role] || "text-zinc-300 border-zinc-700 bg-zinc-800"}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(u)}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ACTIVITY LOGS SECTION */}
        <div className="space-y-4 flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Registro de Actividades</h2>
          </div>

          {/* Filters */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Usuario</label>
                <select 
                  className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white outline-none"
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                >
                  <option value="">Todos los usuarios</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Desde</label>
                <Input 
                  type="date" 
                  className="bg-[#111] border-[#333] text-sm"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Hasta</label>
                <Input 
                  type="date" 
                  className="bg-[#111] border-[#333] text-sm"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden flex-1 min-h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222] hover:bg-transparent">
                    <TableHead className="text-zinc-400">Acción</TableHead>
                    <TableHead className="text-zinc-400">Usuario</TableHead>
                    <TableHead className="text-zinc-400">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsLoading ? (
                    <TableRow className="border-[#222] hover:bg-transparent">
                      <TableCell colSpan={3} className="text-center py-8 text-zinc-500">Cargando actividades...</TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow className="border-[#222] hover:bg-transparent">
                      <TableCell colSpan={3} className="text-center py-8 text-zinc-500">No hay registros de actividad para estos filtros.</TableCell>
                    </TableRow>
                  ) : (
                    logs.map((l) => (
                      <TableRow key={l.id} className="border-[#222] hover:bg-[#111]">
                        <TableCell>
                          <div className="font-medium text-white text-sm">{l.action}</div>
                          <div className="text-xs text-zinc-400 max-w-[250px] truncate" title={l.details}>{l.details}</div>
                        </TableCell>
                        <TableCell className="text-zinc-300 text-sm whitespace-nowrap">{l.user?.name}</TableCell>
                        <TableCell className="text-zinc-500 text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT USER DIALOG */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription className="text-zinc-400">Modificá los datos de @{selectedUser?.username}.</DialogDescription>
          </DialogHeader>
          <UserForm data={editData} setData={setEditData} onSubmit={handleUpdateUser} submitLabel="Guardar Cambios" loading={loading} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

const UserForm = ({ data, setData, onSubmit, submitLabel, loading }: any) => (
  <form onSubmit={onSubmit} className="space-y-4 mt-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium text-zinc-300">Nombre Completo</label>
        <Input required className="bg-[#111] border-[#333]" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Usuario (Login)</label>
        <Input required className="bg-[#111] border-[#333]" value={data.username} onChange={e => setData({ ...data, username: e.target.value })} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Teléfono</label>
        <Input className="bg-[#111] border-[#333]" placeholder="+54 9 11..." value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} />
      </div>
      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium text-zinc-300">
          Contraseña {submitLabel === "Guardar Cambios" && <span className="text-zinc-500">(dejar vacío para no cambiar)</span>}
        </label>
        <Input type="password" required={submitLabel !== "Guardar Cambios"} className="bg-[#111] border-[#333]" value={data.password} onChange={e => setData({ ...data, password: e.target.value })} />
      </div>
      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium text-zinc-300">Rol</label>
        <select required className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white outline-none" value={data.role} onChange={e => setData({ ...data, role: e.target.value })}>
          <option value="SELLER" className="bg-[#111]">Vendedor</option>
          <option value="ADMIN" className="bg-[#111]">Administrador</option>
          <option value="MANAGER" className="bg-[#111]">Gerente</option>
        </select>
      </div>
    </div>
    <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-2">
      {loading ? "Guardando..." : submitLabel}
    </Button>
  </form>
);
