"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Plus, Search, Edit, Trash2, X, Star } from "lucide-react";
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

export default function VehicleClient({ vehicles }: { vehicles: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("AUTO");
  const [activeUbicacion, setActiveUbicacion] = useState("TODOS");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [portadaUrl, setPortadaUrl] = useState<string | null>(null);

  const [combustibleOptions, setCombustibleOptions] = useState([
    "Nafta", "Gas", "Hibrido", "Electrico"
  ]);

  const [condicionOptions, setCondicionOptions] = useState([
    "Por ingresar", "En Stock", "Okm", "Usado"
  ]);

  const [transmisionOptions, setTransmisionOptions] = useState([
    "Manual", "Automática"
  ]);

  const [formData, setFormData] = useState({
    tipo: "AUTO",
    marca: "",
    modelo: "",
    anio: "",
    dominio: "",
    chasis: "",
    color: "",
    kilometros: "",
    precioVenta: "",
    precioCosto: "",
    precioFactura: "",
    precioUSD: "",
    condicion: "Por ingresar",
    combustible: "Nafta",
    transmision: "Manual",
    destacado: false,
    descripcion: "",
    ubicacion: "CASA_CENTRAL",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  const handleCondicionChange = (val: string) => {
    if (val === "ADD_NEW") {
      const newVal = prompt("Ingrese la nueva condición:");
      if (newVal && newVal.trim() !== "") {
        const trimmed = newVal.trim();
        if (!condicionOptions.includes(trimmed)) {
          setCondicionOptions(prev => [...prev, trimmed]);
        }
        setFormData(prev => ({ ...prev, condicion: trimmed }));
      }
    } else {
      setFormData(prev => ({ ...prev, condicion: val }));
    }
  };

  const handleCombustibleChange = (val: string) => {
    if (val === "ADD_NEW") {
      const newVal = prompt("Ingrese el nuevo tipo de combustible:");
      if (newVal && newVal.trim() !== "") {
        const trimmed = newVal.trim();
        if (!combustibleOptions.includes(trimmed)) {
          setCombustibleOptions(prev => [...prev, trimmed]);
        }
        setFormData(prev => ({ ...prev, combustible: trimmed }));
      }
    } else {
      setFormData(prev => ({ ...prev, combustible: val }));
    }
  };

  const handleTransmisionChange = (val: string) => {
    if (val === "ADD_NEW") {
      const newVal = prompt("Ingrese el nuevo tipo de transmisión:");
      if (newVal && newVal.trim() !== "") {
        const trimmed = newVal.trim();
        if (!transmisionOptions.includes(trimmed)) {
          setTransmisionOptions(prev => [...prev, trimmed]);
        }
        setFormData(prev => ({ ...prev, transmision: trimmed }));
      }
    } else {
      setFormData(prev => ({ ...prev, transmision: val }));
    }
  };

  const handleToggleDestacado = async (vehicle: any) => {
    const isCurrentlyDestacado = vehicle.destacado || false;
    if (!isCurrentlyDestacado) {
      const currentDestacadosCount = vehicles.filter(v => v.destacado).length;
      if (currentDestacadosCount >= 3) {
        alert("Solo podés destacar hasta 3 vehículos. Desmarcá uno de los destacados actuales primero.");
        return;
      }
    }

    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destacado: !isCurrentlyDestacado }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Error al actualizar el estado destacado");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ tipo: "AUTO", marca: "", modelo: "", anio: "", dominio: "", chasis: "", color: "", kilometros: "", precioVenta: "", precioCosto: "", precioFactura: "", precioUSD: "", condicion: "Por ingresar", combustible: "Nafta", transmision: "Manual", destacado: false, descripcion: "", ubicacion: "CASA_CENTRAL" });
    setExistingPhotos([]);
    setPreviewUrls([]);
    setPortadaUrl(null);
    setFiles([]);
    setOpen(true);
  };

  const handleEdit = (v: any) => {
    // If the vehicle has a custom condition/combustible/transmission, add it to options dynamically
    if (v.condicion && !condicionOptions.includes(v.condicion)) {
      setCondicionOptions(prev => [...prev, v.condicion]);
    }
    if (v.combustible && !combustibleOptions.includes(v.combustible)) {
      setCombustibleOptions(prev => [...prev, v.combustible]);
    }
    if (v.transmision && !transmisionOptions.includes(v.transmision)) {
      setTransmisionOptions(prev => [...prev, v.transmision]);
    }

    setEditingId(v.id);
    setFormData({
      tipo: v.tipo || "AUTO",
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio.toString(),
      dominio: v.dominio,
      chasis: v.chasis || "",
      color: v.color || "",
      kilometros: v.kilometros?.toString() || "",
      precioVenta: v.precioVenta.toString(),
      precioCosto: v.precioCosto?.toString() || "",
      precioFactura: v.precioFactura?.toString() || "",
      precioUSD: v.precioUSD?.toString() || "",
      condicion: v.condicion || "Por ingresar",
      combustible: v.combustible || "Nafta",
      transmision: v.transmision || "Manual",
      destacado: v.destacado || false,
      descripcion: v.descripcion || "",
      ubicacion: v.ubicacion || "CASA_CENTRAL",
    });
    setExistingPhotos(v.fotos || []);
    setPortadaUrl(v.fotos && v.fotos.length > 0 ? v.fotos[0] : null);
    setPreviewUrls([]);
    setFiles([]);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este vehículo?")) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
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

  const removeExistingPhoto = (e: React.MouseEvent, urlToRemove: string) => {
    e.stopPropagation();
    setExistingPhotos(prev => prev.filter(url => url !== urlToRemove));
    if (portadaUrl === urlToRemove) {
      setPortadaUrl(null);
    }
  };

  const removeNewPhoto = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const urlToRemove = previewUrls[index];
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    if (portadaUrl === urlToRemove) {
      setPortadaUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uploadedPhotos: string[] = [];
      
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const fileData = new FormData();
          fileData.append("file", files[i]);
          
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: fileData,
          });
          
          if (uploadRes.ok) {
            const blob = await uploadRes.json();
            uploadedPhotos.push(blob.url);
          } else {
            alert(`Error al subir ${files[i].name}. Revisa Vercel Blob.`);
          }
        }
      }

      // If we are editing and no new files were added, we should keep the existing ones
      const finalPhotos = uploadedPhotos.length > 0 ? [...existingPhotos, ...uploadedPhotos] : [...existingPhotos];

      // Reorder to put portada at the beginning
      if (portadaUrl) {
        if (existingPhotos.includes(portadaUrl)) {
          const idx = finalPhotos.indexOf(portadaUrl);
          if (idx > -1) {
            finalPhotos.splice(idx, 1);
            finalPhotos.unshift(portadaUrl);
          }
        } else if (previewUrls.includes(portadaUrl)) {
          const previewIdx = previewUrls.indexOf(portadaUrl);
          if (previewIdx > -1 && uploadedPhotos[previewIdx]) {
            const url = uploadedPhotos[previewIdx];
            const finalIdx = finalPhotos.indexOf(url);
            if (finalIdx > -1) {
              finalPhotos.splice(finalIdx, 1);
              finalPhotos.unshift(url);
            }
          }
        }
      }

      const payload = { 
        ...formData, 
        anio: parseInt(formData.anio) || 0,
        kilometros: formData.kilometros ? parseInt(formData.kilometros) : null,
        precioVenta: parseFloat(formData.precioVenta) || 0,
        precioCosto: formData.precioCosto ? parseFloat(formData.precioCosto) : null,
        precioFactura: formData.precioFactura ? parseFloat(formData.precioFactura) : null,
        precioUSD: formData.precioUSD ? parseFloat(formData.precioUSD) : null,
        fotos: finalPhotos 
      };
      
      const url = editingId ? `/api/vehicles/${editingId}` : "/api/vehicles";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setOpen(false);
        setEditingId(null);
        setExistingPhotos([]);
        setPreviewUrls([]);
        setPortadaUrl(null);
        setFormData({ tipo: "AUTO", marca: "", modelo: "", anio: "", dominio: "", chasis: "", color: "", kilometros: "", precioVenta: "", precioCosto: "", precioFactura: "", precioUSD: "", condicion: "Por ingresar", combustible: "Nafta", transmision: "Manual", destacado: false, descripcion: "", ubicacion: "CASA_CENTRAL" });
        setFiles([]);
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
            <Car className="h-8 w-8 text-yellow-500" />
            Vehículos
          </h1>
          <p className="text-zinc-400 mt-1">Gestioná el inventario de Rodmell Automotores.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={handleNew} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Agregar Vehículo
          </Button>
          <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-2xl lg:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Vehículo" : "Nuevo Vehículo"}</DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingId ? "Modificá los datos del vehículo." : "Ingresá los datos del vehículo para agregarlo al stock."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-zinc-300">Tipo de Vehículo</label>
                  <select 
                    className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm text-white focus:outline-none focus:border-yellow-500"
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="AUTO">Automóvil / Camioneta</option>
                    <option value="MOTO">Motocicleta</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-zinc-300">Ubicación</label>
                  <select 
                    className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm text-white focus:outline-none focus:border-yellow-500"
                    value={formData.ubicacion}
                    onChange={e => setFormData({...formData, ubicacion: e.target.value})}
                  >
                    <option value="CASA_CENTRAL">Casa Central</option>
                    <option value="SUCURSAL_J_IBARRA">Sucursal J.Ibarra</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-zinc-300">Condición</label>
                  <select 
                    className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm text-white focus:outline-none focus:border-yellow-500"
                    value={formData.condicion}
                    onChange={e => handleCondicionChange(e.target.value)}
                  >
                    {condicionOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="ADD_NEW" className="text-yellow-500 font-semibold">+ Agregar nuevo...</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-zinc-300">Combustible</label>
                  <select 
                    className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm text-white focus:outline-none focus:border-yellow-500"
                    value={formData.combustible}
                    onChange={e => handleCombustibleChange(e.target.value)}
                  >
                    {combustibleOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="ADD_NEW" className="text-yellow-500 font-semibold">+ Agregar nuevo...</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Marca</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Modelo</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Año</label>
                  <Input required type="number" className="bg-[#111] border-[#333]" value={formData.anio} onChange={e => setFormData({...formData, anio: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Patente (Dominio)</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.dominio} onChange={e => setFormData({...formData, dominio: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Kilómetros</label>
                  <Input required type="number" className="bg-[#111] border-[#333]" value={formData.kilometros} onChange={e => setFormData({...formData, kilometros: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Precio de Venta</label>
                  <Input required type="number" className="bg-[#111] border-[#333]" value={formData.precioVenta} onChange={e => setFormData({...formData, precioVenta: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">$ Cdo. Info (Costo)</label>
                  <Input type="number" className="bg-[#111] border-[#333]" value={formData.precioCosto} onChange={e => setFormData({...formData, precioCosto: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">$ Factura</label>
                  <Input type="number" className="bg-[#111] border-[#333]" value={formData.precioFactura} onChange={e => setFormData({...formData, precioFactura: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Valor USD</label>
                  <Input type="number" className="bg-[#111] border-[#333]" value={formData.precioUSD} onChange={e => setFormData({...formData, precioUSD: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Color</label>
                  <Input className="bg-[#111] border-[#333]" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Chasis</label>
                  <Input className="bg-[#111] border-[#333]" value={formData.chasis} onChange={e => setFormData({...formData, chasis: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-zinc-300">Transmisión</label>
                  <select 
                    className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm text-white focus:outline-none focus:border-yellow-500"
                    value={formData.transmision}
                    onChange={e => handleTransmisionChange(e.target.value)}
                  >
                    {transmisionOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="ADD_NEW" className="text-yellow-500 font-semibold">+ Agregar nuevo...</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Descripción Pública</label>
                  <textarea 
                    className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white resize-none h-24 focus:outline-none focus:border-yellow-500 transition-colors" 
                    value={formData.descripcion} 
                    onChange={e => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Descripción detallada para el catálogo..."
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Galería de Imágenes</label>
                  <Input type="file" multiple accept="image/*" className="bg-[#111] border-[#333] cursor-pointer text-zinc-400 file:bg-[#222] file:text-white file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2" onChange={e => {
                    if (e.target.files) {
                      const fileArray = Array.from(e.target.files);
                      setFiles(prev => [...prev, ...fileArray]);
                      const urls = fileArray.map(f => URL.createObjectURL(f));
                      setPreviewUrls(prev => [...prev, ...urls]);
                      if (!portadaUrl && existingPhotos.length === 0 && urls.length > 0) {
                        setPortadaUrl(urls[0]);
                      }
                    }
                  }} />
                  {(existingPhotos.length > 0 || previewUrls.length > 0) && (
                    <div className="mt-4">
                      <p className="text-xs text-zinc-500 mb-2">Hacé click en una imagen para establecerla como <span className="text-yellow-500 font-bold">Portada</span> del catálogo o en la <span className="text-red-500 font-bold">X</span> para eliminarla:</p>
                      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 -mx-2">
                        {existingPhotos.map((photo, i) => (
                          <div 
                            key={`ext-${i}`} 
                            onClick={() => setPortadaUrl(photo)}
                            className={`relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-300 border-2 ${portadaUrl === photo ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-105' : 'border-[#333] hover:border-[#666]'}`}
                          >
                            <button onClick={(e) => removeExistingPhoto(e, photo)} type="button" className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white rounded-full p-1 z-20 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                            {portadaUrl === photo && (
                              <div className="absolute bottom-0 left-0 w-full bg-yellow-500 text-black text-[10px] font-bold text-center py-0.5 z-10">
                                PORTADA
                              </div>
                            )}
                            <img src={photo} alt="Vehículo" className="object-cover w-full h-full" />
                          </div>
                        ))}
                        {previewUrls.map((photo, i) => (
                          <div 
                            key={`new-${i}`} 
                            onClick={() => setPortadaUrl(photo)}
                            className={`relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-300 border-2 ${portadaUrl === photo ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-105' : 'border-[#333] hover:border-[#666]'}`}
                          >
                            <button onClick={(e) => removeNewPhoto(e, i)} type="button" className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white rounded-full p-1 z-20 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                            {portadaUrl === photo && (
                              <div className="absolute bottom-0 left-0 w-full bg-yellow-500 text-black text-[10px] font-bold text-center py-0.5 z-10">
                                PORTADA
                              </div>
                            )}
                            <img src={photo} alt="Nuevo Vehículo" className="object-cover w-full h-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6">
                {loading ? "Guardando..." : (editingId ? "Actualizar Vehículo" : "Guardar Vehículo")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex bg-[#111] p-1 rounded-lg border border-[#222]">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'AUTO' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'}`}
              onClick={() => setActiveTab('AUTO')}
            >
              Autos
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'MOTO' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'}`}
              onClick={() => setActiveTab('MOTO')}
            >
              Motos
            </button>
          </div>
          <div className="flex bg-[#111] p-1 rounded-lg border border-[#222]">
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeUbicacion === 'TODOS' ? 'bg-[#333] text-white' : 'text-zinc-400 hover:text-white'}`}
              onClick={() => setActiveUbicacion('TODOS')}
            >
              Todas
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeUbicacion === 'CASA_CENTRAL' ? 'bg-[#333] text-white' : 'text-zinc-400 hover:text-white'}`}
              onClick={() => setActiveUbicacion('CASA_CENTRAL')}
            >
              Casa Central
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeUbicacion === 'SUCURSAL_J_IBARRA' ? 'bg-[#333] text-white' : 'text-zinc-400 hover:text-white'}`}
              onClick={() => setActiveUbicacion('SUCURSAL_J_IBARRA')}
            >
              Sucursal J.Ibarra
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Buscar por marca, modelo o patente..." 
            className="pl-10 bg-[#0a0a0a] border-[#222] text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="text-zinc-400">Marca / Modelo</TableHead>
              <TableHead className="text-zinc-400">Año / KM</TableHead>
              <TableHead className="text-zinc-400">Patente</TableHead>
              <TableHead className="text-zinc-400">Destacado</TableHead>
              <TableHead className="text-zinc-400 text-right">$ Cdo. Info</TableHead>
              <TableHead className="text-zinc-400 text-right">$ Factura</TableHead>
              <TableHead className="text-zinc-400 text-right">USD</TableHead>
              <TableHead className="text-zinc-400 text-right">Total Venta</TableHead>
              <TableHead className="text-zinc-400">Condición</TableHead>
              <TableHead className="text-zinc-400">Ubicación</TableHead>
              <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.filter(v => 
              (v.tipo || "AUTO") === activeTab &&
              (activeUbicacion === "TODOS" || (v.ubicacion || "CASA_CENTRAL") === activeUbicacion) &&
              `${v.marca} ${v.modelo} ${v.dominio}`.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableCell colSpan={10} className="text-center py-8 text-zinc-500">
                  No hay vehículos registrados en esta categoría
                </TableCell>
              </TableRow>
            ) : (
              vehicles.filter(v => 
                (v.tipo || "AUTO") === activeTab &&
                (activeUbicacion === "TODOS" || (v.ubicacion || "CASA_CENTRAL") === activeUbicacion) &&
                `${v.marca} ${v.modelo} ${v.dominio}`.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((v) => (
                <TableRow key={v.id} className="border-[#222] hover:bg-[#111]">
                  <TableCell className="font-medium text-white">{v.marca} {v.modelo}</TableCell>
                  <TableCell className="text-zinc-300">{v.anio} <br/><span className="text-xs text-zinc-500">{v.kilometros} km</span></TableCell>
                  <TableCell className="text-zinc-300 uppercase">{v.dominio}</TableCell>
                  <TableCell>
                    <button 
                      onClick={() => handleToggleDestacado(v)}
                      className={`p-1.5 rounded transition-colors ${v.destacado ? 'text-yellow-500 hover:text-yellow-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                      title={v.destacado ? "Quitar destacado" : "Destacar vehículo (máx. 3)"}
                    >
                      <Star className={`w-5 h-5 ${v.destacado ? 'fill-yellow-500' : ''}`} />
                    </button>
                  </TableCell>
                  <TableCell className="text-right text-zinc-300">{v.precioCosto ? `$${v.precioCosto.toLocaleString()}` : '-'}</TableCell>
                  <TableCell className="text-right text-zinc-300">{v.precioFactura ? `$${v.precioFactura.toLocaleString()}` : '-'}</TableCell>
                  <TableCell className="text-right text-green-500 font-medium">{v.precioUSD ? `US$ ${v.precioUSD.toLocaleString()}` : '-'}</TableCell>
                  <TableCell className="text-right text-yellow-500 font-bold">${v.precioVenta.toLocaleString()}</TableCell>
                  <TableCell className="text-zinc-400 text-sm">{v.condicion || '-'}</TableCell>
                  <TableCell className="text-zinc-400 text-sm">{v.ubicacion === 'SUCURSAL_J_IBARRA' ? 'Suc. J.Ibarra' : 'Casa Central'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(v)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
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
