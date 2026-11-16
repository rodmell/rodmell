"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  Search,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileText,
  Calendar,
  CheckCircle,
  Award,
  Filter,
  X,
  History,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  PAGADA: "text-green-400 border-green-500/30 bg-green-500/10",
  VENCIDA: "text-red-400 border-red-500/30 bg-red-500/10",
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function SearchableSelect({ options, value, onChange, placeholder }: any) {
  const [search, setSearch] = useState(() => {
    const found = options.find((o: any) => o.value === value);
    return found ? found.label : "";
  });
  const [open, setOpen] = useState(false);

  const handleSelect = (optionVal: string, optionLabel: string) => {
    onChange(optionVal);
    setSearch(optionLabel);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Input
          className="w-full bg-[#111] border-[#333] pr-10"
          placeholder={placeholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); if (!e.target.value) onChange(""); }}
          onClick={() => setOpen(true)}
          onBlur={() => setTimeout(() => {
            setOpen(false);
            const found = options.find((o: any) => o.value === value);
            setSearch(found ? found.label : "");
          }, 200)}
        />
        <ChevronDown className="absolute right-3 w-4 h-4 text-zinc-500 pointer-events-none" />
      </div>
      {open && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-[#1a1a1a] border border-[#333] rounded-sm shadow-xl">
          {options
            .filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()))
            .map((o: any) => (
              <li
                key={o.value}
                className="px-3 py-2 text-sm text-zinc-300 hover:bg-[#333] hover:text-white cursor-pointer"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(o.value, o.label); }}
              >
                {o.label}
              </li>
            ))}
          {options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <li className="px-3 py-2 text-sm text-zinc-500">No hay resultados</li>
          )}
        </ul>
      )}
    </div>
  );
}

type EstadoFiltro = "TODOS" | "PENDIENTE" | "PAGADA" | "VENCIDA";
type CreditTab = "ACTIVAS" | "SALDADAS" | "HISTORICOS" | "TODAS";

export default function CreditsClient({
  operacionesConCuotas,
  creditosHistoricos,
  clientes,
  session,
}: {
  operacionesConCuotas: any[];
  creditosHistoricos: any[];
  clientes: any[];
  session?: any;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState<EstadoFiltro>("TODOS");
  const [activeTab, setActiveTab] = useState<CreditTab>("ACTIVAS");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtro por Mes
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const [form, setForm] = useState({
    clienteId: "",
    descripcion: "",
    totalFinanciado: "",
    cantidadCuotas: "",
    valorCuota: "",
    intereses: "",
    fechaInicio: "",
    observaciones: "",
  });

  // Helper para verificar coincidencia con el mes seleccionado
  const dateMatchesMonth = (dateVal: any, monthStr: string) => {
    if (!monthStr || !dateVal) return false;
    const d = new Date(dateVal);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}` === monthStr;
  };

  // Helper para saber si una operación o crédito fue cargado o utilizado en el mes seleccionado
  const matchesMonthOperation = (op: any) => {
    if (!selectedMonth) return true;
    // Cargado en dicho mes
    if (dateMatchesMonth(op.createdAt, selectedMonth)) return true;
    // Utilizado en dicho mes (vencimiento o pago de alguna cuota)
    return op.cuotas?.some((c: any) => dateMatchesMonth(c.fechaVencimiento, selectedMonth) || dateMatchesMonth(c.fechaPago, selectedMonth));
  };

  const matchesMonthHistoric = (cr: any) => {
    if (!selectedMonth) return true;
    if (dateMatchesMonth(cr.createdAt || cr.fechaInicio, selectedMonth)) return true;
    return cr.cuotas?.some((c: any) => dateMatchesMonth(c.fechaVencimiento, selectedMonth) || dateMatchesMonth(c.fechaPago, selectedMonth));
  };

  // Helper para saber si un crédito está 100% saldado
  const isOperacionSaldada = (op: any) => {
    return op.cuotas?.length > 0 && op.cuotas.every((c: any) => c.estado === "PAGADA");
  };

  // Helper para evaluar el comportamiento crediticio del cliente en un crédito saldado
  const getCreditBehavior = (cuotas: any[]) => {
    if (!cuotas || cuotas.length === 0) return { label: "Sin datos", isGood: true };
    let conAtraso = 0;

    cuotas.forEach((c) => {
      if (c.fechaPago && c.fechaVencimiento) {
        const pago = new Date(c.fechaPago).getTime();
        const venc = new Date(c.fechaVencimiento).getTime();
        // Margen de gracia de 2 días
        if (pago > venc + 2 * 24 * 60 * 60 * 1000) {
          conAtraso++;
        }
      }
    });

    if (conAtraso === 0) {
      return {
        label: "Excelente — 100% al día en término",
        isGood: true,
      };
    } else {
      return {
        label: `Finalizado con ${conAtraso} cuota${conAtraso > 1 ? "s" : ""} demorada${conAtraso > 1 ? "s" : ""}`,
        isGood: false,
      };
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const allCuotasSistema = useMemo(() => {
    return operacionesConCuotas.flatMap((op: any) =>
      op.cuotas.map((c: any) => ({ ...c, _operacion: op }))
    );
  }, [operacionesConCuotas]);

  const allCuotasHistoricas = useMemo(() => {
    return creditosHistoricos.flatMap((cr: any) =>
      cr.cuotas.map((c: any) => ({ ...c, _credito: cr }))
    );
  }, [creditosHistoricos]);

  // Cuotas filtradas por el mes seleccionado
  const cuotasSistemaMes = useMemo(() => {
    if (!selectedMonth) return allCuotasSistema;
    return allCuotasSistema.filter((c: any) => 
      dateMatchesMonth(c.fechaVencimiento, selectedMonth) || dateMatchesMonth(c.fechaPago, selectedMonth)
    );
  }, [allCuotasSistema, selectedMonth]);

  const cuotasHistoricasMes = useMemo(() => {
    if (!selectedMonth) return allCuotasHistoricas;
    return allCuotasHistoricas.filter((c: any) => 
      dateMatchesMonth(c.fechaVencimiento, selectedMonth) || dateMatchesMonth(c.fechaPago, selectedMonth)
    );
  }, [allCuotasHistoricas, selectedMonth]);

  // KPIs
  const totalPendiente = useMemo(() => {
    if (selectedMonth) {
      return (
        cuotasSistemaMes.filter((c) => c.estado !== "PAGADA" && dateMatchesMonth(c.fechaVencimiento, selectedMonth)).reduce((s: number, c: any) => s + c.valor, 0) +
        cuotasHistoricasMes.filter((c) => c.estado !== "PAGADA" && dateMatchesMonth(c.fechaVencimiento, selectedMonth)).reduce((s: number, c: any) => s + c.valor, 0)
      );
    }
    return (
      allCuotasSistema.filter((c) => c.estado !== "PAGADA").reduce((s: number, c: any) => s + c.valor, 0) +
      allCuotasHistoricas.filter((c) => c.estado !== "PAGADA").reduce((s: number, c: any) => s + c.valor, 0)
    );
  }, [selectedMonth, cuotasSistemaMes, cuotasHistoricasMes, allCuotasSistema, allCuotasHistoricas]);

  const totalVencidas = useMemo(() => {
    if (selectedMonth) {
      return (
        cuotasSistemaMes.filter((c) => c.estado === "VENCIDA" && dateMatchesMonth(c.fechaVencimiento, selectedMonth)).length +
        cuotasHistoricasMes.filter((c) => c.estado === "VENCIDA" && dateMatchesMonth(c.fechaVencimiento, selectedMonth)).length
      );
    }
    return (
      allCuotasSistema.filter((c) => c.estado === "VENCIDA").length +
      allCuotasHistoricas.filter((c) => c.estado === "VENCIDA").length
    );
  }, [selectedMonth, cuotasSistemaMes, cuotasHistoricasMes, allCuotasSistema, allCuotasHistoricas]);

  const cobradoMes = useMemo(() => {
    const targetMonth = selectedMonth || currentMonthStr;
    return (
      allCuotasSistema
        .filter((c) => c.estado === "PAGADA" && dateMatchesMonth(c.fechaPago, targetMonth))
        .reduce((s: number, c: any) => s + c.valor, 0) +
      allCuotasHistoricas
        .filter((c) => c.estado === "PAGADA" && dateMatchesMonth(c.fechaPago, targetMonth))
        .reduce((s: number, c: any) => s + (c.montoPagado || c.valor), 0)
    );
  }, [selectedMonth, currentMonthStr, allCuotasSistema, allCuotasHistoricas]);

  // ── Búsqueda y Filtrado ────────────────────────────────────────────────────
  const matchesSearch = (text: string) =>
    text.toLowerCase().includes(search.toLowerCase());

  // Operaciones activas vs saldadas con filtro de búsqueda y estado
  const filteredOperacionesActivas = useMemo(() => {
    return operacionesConCuotas
      .filter((op: any) => !isOperacionSaldada(op))
      .filter((op: any) => matchesMonthOperation(op))
      .filter((op: any) => {
        const hayMatch = matchesSearch(`${op.cliente?.nombreCompleto || ""} ${op.cliente?.dni || ""} ${op.vehiculo?.marca || ""} ${op.vehiculo?.modelo || ""}`);
        if (!hayMatch) return false;
        if (filtro === "TODOS") return true;
        return op.cuotas.some((c: any) => c.estado === filtro);
      });
  }, [operacionesConCuotas, selectedMonth, search, filtro]);

  const filteredOperacionesSaldadas = useMemo(() => {
    return operacionesConCuotas
      .filter((op: any) => isOperacionSaldada(op))
      .filter((op: any) => matchesMonthOperation(op))
      .filter((op: any) => {
        const hayMatch = matchesSearch(`${op.cliente?.nombreCompleto || ""} ${op.cliente?.dni || ""} ${op.vehiculo?.marca || ""} ${op.vehiculo?.modelo || ""}`);
        return hayMatch;
      });
  }, [operacionesConCuotas, selectedMonth, search]);

  const filteredHistoricos = useMemo(() => {
    return creditosHistoricos
      .filter((cr: any) => matchesMonthHistoric(cr))
      .filter((cr: any) => {
        const hayMatch = matchesSearch(`${cr.cliente?.nombreCompleto || ""} ${cr.cliente?.dni || ""} ${cr.descripcion || ""}`);
        if (!hayMatch) return false;
        if (filtro === "TODOS") return true;
        return cr.cuotas.some((c: any) => c.estado === filtro);
      });
  }, [creditosHistoricos, selectedMonth, search, filtro]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNewCredit = () => {
    setForm({ clienteId: "", descripcion: "", totalFinanciado: "", cantidadCuotas: "", valorCuota: "", intereses: "", fechaInicio: "", observaciones: "" });
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalFinanciado: parseThousands(form.totalFinanciado),
          valorCuota: parseThousands(form.valorCuota),
          intereses: parseThousands(form.intereses) || 0,
          cantidadCuotas: parseInt(form.cantidadCuotas),
        }),
      });
      if (res.ok) {
        setOpenDialog(false);
        toast.success("Crédito histórico guardado correctamente");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  const handleDeleteCredito = async (id: string) => {
    if (!confirm("¿Eliminar este crédito histórico y todas sus cuotas?")) return;
    const res = await fetch(`/api/credits/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Crédito eliminado");
      router.refresh();
    } else {
      toast.error("Error al eliminar");
    }
  };

  const handleDownloadCuotaSistema = async (operacion: any, cuota: any) => {
    try {
      const { generateReceiptPDF } = await import("@/lib/generateReceipt");
      await generateReceiptPDF(operacion, "CUOTA", cuota, session?.user?.ubicacion);
      toast.success(`Comprobante de cuota #${cuota.numeroCuota} generado`);
    } catch (error) {
      console.error("Error al generar comprobante:", error);
      toast.error("Error al generar el comprobante");
    }
  };

  const handleDownloadCuotaHistorica = async (credito: any, cuota: any) => {
    try {
      const { generateReceiptPDF } = await import("@/lib/generateReceipt");
      const creditoSaleAdapter = {
        id: credito.id,
        isCreditoHistorico: true,
        descripcion: credito.descripcion,
        totalFinanciado: credito.totalFinanciado,
        cantidadCuotas: credito.cantidadCuotas,
        valorCuota: credito.valorCuota,
        intereses: credito.intereses,
        observaciones: credito.observaciones,
        createdAt: credito.createdAt || credito.fechaInicio,
        cliente: credito.cliente,
        vehiculo: {
          marca: credito.descripcion || "Crédito Histórico",
          modelo: "",
          anio: "-",
          dominio: "-",
          chasis: "-",
        },
      };
      const cuotaItemAdapter = {
        id: cuota.id,
        comprobante: `CH-${cuota.id.slice(-6).toUpperCase()}`,
        numeroCuota: cuota.numeroCuota,
        medioPago: "EFECTIVO",
        valor: cuota.montoPagado || cuota.valor,
        fechaPago: cuota.fechaPago || new Date(),
      };
      await generateReceiptPDF(creditoSaleAdapter, "CUOTA", cuotaItemAdapter, session?.user?.ubicacion);
      toast.success(`Comprobante de cuota #${cuota.numeroCuota} generado`);
    } catch (error) {
      console.error("Error al generar comprobante:", error);
      toast.error("Error al generar el comprobante");
    }
  };

  const handleMarkCuotaHistorica = async (cuota: any, credito: any) => {
    if (!confirm(`¿Confirmar pago de la cuota #${cuota.numeroCuota}? Se generará y descargará el comprobante de pago.`)) return;
    const fechaPago = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(`/api/credits/${cuota.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cuota-historica",
          estado: "PAGADA",
          fechaPago,
          montoPagado: cuota.valor,
        }),
      });
      if (res.ok) {
        toast.success(`Cuota #${cuota.numeroCuota} marcada como pagada`);
        await handleDownloadCuotaHistorica(credito, {
          ...cuota,
          estado: "PAGADA",
          fechaPago,
          montoPagado: cuota.valor,
        });
        router.refresh();
      } else {
        toast.error("Error al marcar cuota");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleExportPDF = async () => {
    const { generateCreditsPDF } = await import("@/lib/generateCreditsPDF");
    generateCreditsPDF(filtro, operacionesConCuotas, creditosHistoricos);
  };

  const selectedMonthLabel = useMemo(() => {
    if (!selectedMonth) return "Todos los meses (Histórico general)";
    const [y, m] = selectedMonth.split("-").map(Number);
    return `${MONTH_NAMES[m - 1]} ${y}`;
  }, [selectedMonth]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header con botón nuevo y Filtro por Mes */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#222] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-yellow-500" />
            Créditos y Financiaciones
          </h1>
          <p className="text-zinc-400 mt-1">Seguimiento centralizado de cuotas, planes activos e historial de saldados.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Mes */}
          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#222] p-1.5 rounded-lg">
            <Calendar className="w-4 h-4 text-yellow-500 ml-2" />
            <span className="text-xs text-zinc-400 font-semibold uppercase hidden sm:inline">Mes:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#111] border border-[#333] text-white text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-yellow-500 transition-colors cursor-pointer [color-scheme:dark]"
            />

            {selectedMonth && (
              <button
                onClick={() => setSelectedMonth("")}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-[#222] transition-colors"
                title="Quitar filtro de mes"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {selectedMonth !== currentMonthStr && (
              <button
                onClick={() => setSelectedMonth(currentMonthStr)}
                className="text-xs text-yellow-500 hover:text-yellow-400 font-medium px-2 py-1 transition-colors"
                title="Ir al mes actual"
              >
                Mes actual
              </button>
            )}
          </div>

          <Button
            onClick={handleNewCredit}
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md px-4 py-2"
          >
            <Plus className="w-4 h-4" /> Cargar Crédito Histórico
          </Button>
        </div>
      </div>

      {/* Indicador de Filtro de Mes Activo */}
      {selectedMonth && (
        <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-lg text-sm">
          <div className="flex items-center gap-2 text-yellow-400">
            <Filter className="w-4 h-4" />
            <span>Mostrando solo datos cargados o utilizados en el mes de: <strong className="text-white">{selectedMonthLabel}</strong></span>
          </div>
          <button
            onClick={() => setSelectedMonth("")}
            className="text-xs text-zinc-400 hover:text-white underline ml-2"
          >
            Ver todos los meses
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">
              {selectedMonth ? `Total Adeudado (${selectedMonthLabel})` : "Total Adeudado Global"}
            </p>
            <p className="text-xl font-bold text-yellow-500">${totalPendiente.toLocaleString("es-AR")}</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">
              {selectedMonth ? `Cuotas Vencidas (${selectedMonthLabel})` : "Total Cuotas Vencidas"}
            </p>
            <p className="text-xl font-bold text-red-400">{totalVencidas}</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-md bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">
              {selectedMonth ? `Cobrado en ${selectedMonthLabel}` : "Cobrado Este Mes"}
            </p>
            <p className="text-xl font-bold text-green-400">${cobradoMes.toLocaleString("es-AR")}</p>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación: Activos / Saldados / Históricos / Todos */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#222] pb-3">
        <button
          onClick={() => setActiveTab("ACTIVAS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "ACTIVAS"
              ? "bg-yellow-500 text-black"
              : "bg-[#111] text-zinc-400 hover:text-white border border-[#2b2b2b]"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Planes Activos</span>
          <span className={`px-1.5 py-0.2 rounded-full text-xs font-mono ${
            activeTab === "ACTIVAS" ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-300"
          }`}>
            {filteredOperacionesActivas.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("SALDADAS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "SALDADAS"
              ? "bg-green-500 text-black"
              : "bg-[#111] text-zinc-400 hover:text-white border border-[#2b2b2b]"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Cancelados / Saldados (Histórico)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-xs font-mono ${
            activeTab === "SALDADAS" ? "bg-black/20 text-black" : "bg-green-500/20 text-green-400 border border-green-500/30"
          }`}>
            {filteredOperacionesSaldadas.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("HISTORICOS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "HISTORICOS"
              ? "bg-blue-500 text-white"
              : "bg-[#111] text-zinc-400 hover:text-white border border-[#2b2b2b]"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Créditos Históricos (Manuales)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-xs font-mono ${
            activeTab === "HISTORICOS" ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-300"
          }`}>
            {filteredHistoricos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("TODAS")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "TODAS"
              ? "bg-zinc-200 text-black"
              : "bg-[#111] text-zinc-400 hover:text-white border border-[#2b2b2b]"
          }`}
        >
          <span>Ver Todos</span>
        </button>
      </div>

      {/* Buscador & Filtro de estado */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por cliente, DNI o vehículo..."
            className="pl-10 bg-[#0a0a0a] border-[#222] text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["TODOS", "PENDIENTE", "VENCIDA", "PAGADA"] as EstadoFiltro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold border transition-colors ${
                filtro === f
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "bg-transparent text-zinc-400 border-[#333] hover:border-zinc-500"
              }`}
            >
              {f === "TODOS" ? "Todos" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <Button
          onClick={handleExportPDF}
          className="bg-[#222] hover:bg-[#333] text-white border border-[#444]"
          title="Exportar a PDF con el filtro actual"
        >
          <FileText className="w-4 h-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      {/* ── SECCIÓN 1: PLANES DE CUOTAS DEL SISTEMA ACTIVOS ── */}
      {(activeTab === "ACTIVAS" || activeTab === "TODAS") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block animate-pulse" />
              Planes de Cuotas Activos (En Curso con Saldo Pendiente)
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              {filteredOperacionesActivas.length} crédito{filteredOperacionesActivas.length !== 1 ? "s" : ""} activo{filteredOperacionesActivas.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredOperacionesActivas.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-8 text-center text-zinc-500 text-sm">
              No hay planes de cuotas activos en este momento{selectedMonth ? ` para ${selectedMonthLabel}` : ""}.
            </div>
          ) : (
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222] hover:bg-transparent">
                    <TableHead className="text-zinc-400 w-8" />
                    <TableHead className="text-zinc-400">Cliente</TableHead>
                    <TableHead className="text-zinc-400">Vehículo</TableHead>
                    <TableHead className="text-zinc-400 text-center">Cuotas</TableHead>
                    <TableHead className="text-zinc-400 text-right">Total Financiado</TableHead>
                    <TableHead className="text-zinc-400 text-right">Saldo Pendiente</TableHead>
                    <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperacionesActivas.map((op: any) => {
                    const isOpen = expanded.has(op.id);
                    const cuotas = filtro === "TODOS" ? op.cuotas : op.cuotas.filter((c: any) => c.estado === filtro);
                    const pendiente = op.cuotas.filter((c: any) => c.estado !== "PAGADA").reduce((s: number, c: any) => s + c.valor, 0);
                    const pagadas = op.cuotas.filter((c: any) => c.estado === "PAGADA").length;

                    return (
                      <>
                        <TableRow key={op.id} className="border-[#222] hover:bg-[#111] cursor-pointer" onClick={() => toggleExpand(op.id)}>
                          <TableCell>
                            {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                          </TableCell>
                          <TableCell className="font-medium text-white">
                            <div>
                              <span>{op.cliente?.nombreCompleto}</span>
                              {op.cliente?.dni && <p className="text-xs text-zinc-500 font-mono">DNI: {op.cliente.dni}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {op.vehiculo?.marca} {op.vehiculo?.modelo} {op.vehiculo?.anio}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-zinc-300 text-sm font-mono">{pagadas}/{op.cuotas.length}</span>
                          </TableCell>
                          <TableCell className="text-right text-yellow-500 font-mono">${op.credito?.toLocaleString("es-AR") ?? "-"}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono text-sm font-bold text-red-400">
                              ${pendiente.toLocaleString("es-AR")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              href={`/dashboard/sales/${op.id}/payments`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-zinc-400 hover:text-green-500 hover:bg-green-500/10 rounded transition-colors inline-block"
                              title="Ir a cobrar en la billetera"
                            >
                              <Wallet className="w-4 h-4" />
                            </Link>
                          </TableCell>
                        </TableRow>

                        {isOpen && cuotas.map((c: any) => (
                          <TableRow key={c.id} className="border-[#222] bg-[#050505] hover:bg-[#0d0d0d]">
                            <TableCell />
                            <TableCell colSpan={2} className="pl-6 text-xs text-zinc-500">
                              Cuota #{c.numeroCuota} — Vence: {new Date(c.fechaVencimiento).toLocaleDateString("es-AR")}
                              {c.fechaPago && <span className="ml-2 text-green-500">Pagada: {new Date(c.fechaPago).toLocaleDateString("es-AR")}</span>}
                              {c.medioPago && <span className="ml-2 text-zinc-400">({c.medioPago})</span>}
                              {c.comprobante && <span className="ml-2 text-yellow-500 font-mono">Nº {c.comprobante}</span>}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${ESTADO_COLORS[c.estado]}`}>
                                {c.estado}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-zinc-300 font-mono text-xs">${c.valor.toLocaleString("es-AR")}</TableCell>
                            <TableCell />
                            <TableCell className="text-right">
                              {c.estado === "PAGADA" ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadCuotaSistema(op, c);
                                  }}
                                  className="px-2.5 py-1 text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 rounded transition-colors inline-flex items-center gap-1.5"
                                  title="Descargar Comprobante de Pago"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Comprobante</span>
                                </button>
                              ) : (
                                <Link
                                  href={`/dashboard/sales/${op.id}/payments`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-2.5 py-1 text-xs text-zinc-400 border border-zinc-700/50 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/10 rounded transition-colors inline-flex items-center gap-1.5"
                                  title="Ir a cobrar en billetera"
                                >
                                  <Wallet className="w-3.5 h-3.5" />
                                  <span>Cobrar</span>
                                </Link>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ── SECCIÓN 2: CRÉDITOS CANCELADOS / SALDADOS (HISTÓRICO Y COMPORTAMIENTO) ── */}
      {(activeTab === "SALDADAS" || activeTab === "TODAS") && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Créditos Cancelados / Saldados (Histórico de Comportamiento del Cliente)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Planes de cuotas 100% pagados. Analizá el historial y comportamiento de pago del cliente.
              </p>
            </div>
            <span className="text-xs text-zinc-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full font-mono self-start sm:self-auto">
              {filteredOperacionesSaldadas.length} crédito{filteredOperacionesSaldadas.length !== 1 ? "s" : ""} saldado{filteredOperacionesSaldadas.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredOperacionesSaldadas.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-8 text-center text-zinc-500 text-sm">
              No hay créditos cancelados / saldados registrados{selectedMonth ? ` para ${selectedMonthLabel}` : ""}.
            </div>
          ) : (
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222] hover:bg-transparent">
                    <TableHead className="text-zinc-400 w-8" />
                    <TableHead className="text-zinc-400">Cliente</TableHead>
                    <TableHead className="text-zinc-400">Vehículo</TableHead>
                    <TableHead className="text-zinc-400 text-center">Cuotas</TableHead>
                    <TableHead className="text-zinc-400 text-right">Total Financiado</TableHead>
                    <TableHead className="text-zinc-400">Comportamiento del Cliente</TableHead>
                    <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperacionesSaldadas.map((op: any) => {
                    const isOpen = expanded.has(op.id);
                    const behavior = getCreditBehavior(op.cuotas);
                    // Último pago
                    const ultimasCuotas = [...op.cuotas].sort((a: any, b: any) => {
                      const da = a.fechaPago ? new Date(a.fechaPago).getTime() : 0;
                      const db = b.fechaPago ? new Date(b.fechaPago).getTime() : 0;
                      return db - da;
                    });
                    const fechaCancelacion = ultimasCuotas[0]?.fechaPago
                      ? new Date(ultimasCuotas[0].fechaPago).toLocaleDateString("es-AR")
                      : "Completado";

                    return (
                      <>
                        <TableRow key={op.id} className="border-[#222] hover:bg-[#111] cursor-pointer" onClick={() => toggleExpand(op.id)}>
                          <TableCell>
                            {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                          </TableCell>
                          <TableCell className="font-medium text-white">
                            <div>
                              <span>{op.cliente?.nombreCompleto}</span>
                              <p className="text-xs text-zinc-500 font-mono">DNI: {op.cliente?.dni || "-"}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {op.vehiculo?.marca} {op.vehiculo?.modelo} {op.vehiculo?.anio}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold border text-green-400 border-green-500/30 bg-green-500/10">
                              {op.cuotas.length}/{op.cuotas.length} Pagadas
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-green-400 font-mono font-bold">
                            ${op.credito?.toLocaleString("es-AR") ?? "-"}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                behavior.isGood
                                  ? "text-green-400 border-green-500/30 bg-green-500/10"
                                  : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                              }`}>
                                {behavior.isGood ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3 text-yellow-500" />}
                                {behavior.label}
                              </span>
                              <p className="text-[10px] text-zinc-500">Cancelado: {fechaCancelacion}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              href={`/dashboard/sales/${op.id}/payments`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-zinc-400 hover:text-green-500 hover:bg-green-500/10 rounded transition-colors inline-block"
                              title="Ver historial de pagos completo en billetera"
                            >
                              <Wallet className="w-4 h-4" />
                            </Link>
                          </TableCell>
                        </TableRow>

                        {isOpen && op.cuotas.map((c: any) => (
                          <TableRow key={c.id} className="border-[#222] bg-[#050505] hover:bg-[#0d0d0d]">
                            <TableCell />
                            <TableCell colSpan={2} className="pl-6 text-xs text-zinc-400">
                              Cuota #{c.numeroCuota} — Vencimiento: {new Date(c.fechaVencimiento).toLocaleDateString("es-AR")}
                              {c.fechaPago && (
                                <span className="ml-2 text-green-400 font-medium">
                                  Pagada: {new Date(c.fechaPago).toLocaleDateString("es-AR")}
                                </span>
                              )}
                              {c.medioPago && <span className="ml-2 text-zinc-500">({c.medioPago})</span>}
                              {c.comprobante && <span className="ml-2 text-yellow-500 font-mono">Nº {c.comprobante}</span>}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold border text-green-400 border-green-500/30 bg-green-500/10">
                                PAGADA
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-zinc-300 font-mono text-xs">
                              ${c.valor.toLocaleString("es-AR")}
                            </TableCell>
                            <TableCell />
                            <TableCell className="text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadCuotaSistema(op, c);
                                }}
                                className="px-2.5 py-1 text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 rounded transition-colors inline-flex items-center gap-1.5"
                                title="Descargar Comprobante de Pago"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Comprobante</span>
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ── SECCIÓN 3: CRÉDITOS HISTÓRICOS CARGADOS MANUALMENTE ── */}
      {(activeTab === "HISTORICOS" || activeTab === "TODAS") && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Créditos Históricos Cargados Manualmente
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              {filteredHistoricos.length} crédito{filteredHistoricos.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredHistoricos.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-8 text-center text-zinc-500 text-sm">
              No hay créditos históricos cargados todavía{selectedMonth ? ` para ${selectedMonthLabel}` : ""}.
            </div>
          ) : (
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222] hover:bg-transparent">
                    <TableHead className="text-zinc-400 w-8" />
                    <TableHead className="text-zinc-400">Cliente</TableHead>
                    <TableHead className="text-zinc-400">Descripción / Vehículo</TableHead>
                    <TableHead className="text-zinc-400 text-center">Cuotas</TableHead>
                    <TableHead className="text-zinc-400 text-right">Total Financiado</TableHead>
                    <TableHead className="text-zinc-400 text-right">Pendiente</TableHead>
                    <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistoricos.map((cr: any) => {
                    const isOpen = expanded.has(cr.id);
                    const cuotas = filtro === "TODOS" ? cr.cuotas : cr.cuotas.filter((c: any) => c.estado === filtro);
                    const pendiente = cr.cuotas.filter((c: any) => c.estado !== "PAGADA").reduce((s: number, c: any) => s + c.valor, 0);
                    const pagadas = cr.cuotas.filter((c: any) => c.estado === "PAGADA").length;

                    return (
                      <>
                        <TableRow key={cr.id} className="border-[#222] hover:bg-[#111] cursor-pointer" onClick={() => toggleExpand(cr.id)}>
                          <TableCell>
                            {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                          </TableCell>
                          <TableCell className="font-medium text-white">{cr.cliente?.nombreCompleto}</TableCell>
                          <TableCell className="text-zinc-300">{cr.descripcion}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-zinc-300 text-sm font-mono">{pagadas}/{cr.cuotas.length}</span>
                          </TableCell>
                          <TableCell className="text-right text-yellow-500 font-mono">${cr.totalFinanciado.toLocaleString("es-AR")}</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-mono text-sm font-bold ${pendiente > 0 ? "text-red-400" : "text-green-400"}`}>
                              ${pendiente.toLocaleString("es-AR")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteCredito(cr.id); }}
                              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              title="Eliminar crédito"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TableCell>
                        </TableRow>

                        {isOpen && cuotas.map((c: any) => (
                          <TableRow key={c.id} className="border-[#222] bg-[#050505] hover:bg-[#0d0d0d]">
                            <TableCell />
                            <TableCell colSpan={2} className="pl-6 text-xs text-zinc-500">
                              Cuota #{c.numeroCuota} — Vence: {new Date(c.fechaVencimiento).toLocaleDateString("es-AR")}
                              {c.fechaPago && <span className="ml-2 text-green-500">Pagada: {new Date(c.fechaPago).toLocaleDateString("es-AR")}</span>}
                              <span className="ml-2 text-yellow-500 font-mono">Nº CH-{c.id.slice(-6).toUpperCase()}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${ESTADO_COLORS[c.estado]}`}>
                                {c.estado}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-zinc-300 font-mono text-xs">${c.valor.toLocaleString("es-AR")}</TableCell>
                            <TableCell />
                            <TableCell className="text-right">
                              {c.estado === "PAGADA" ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadCuotaHistorica(cr, c);
                                  }}
                                  className="px-2.5 py-1 text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 rounded transition-colors inline-flex items-center gap-1.5"
                                  title="Descargar Comprobante de Pago"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Comprobante</span>
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkCuotaHistorica(c, cr);
                                  }}
                                  className="px-2.5 py-1 text-xs text-green-400 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 rounded transition-colors inline-flex items-center gap-1.5"
                                  title="Marcar como pagada y generar comprobante"
                                >
                                  <span>Marcar Pagada</span>
                                </button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ── Dialog Nuevo Crédito Histórico ── */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-lg rounded-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-500" /> Cargar Crédito Histórico
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Ingresá los datos de un crédito que ya tenés vigente (de antes del sistema).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Cliente *</Label>
              <SearchableSelect
                placeholder="Buscá el cliente..."
                value={form.clienteId}
                onChange={(val: string) => setForm((p) => ({ ...p, clienteId: val }))}
                options={clientes.map((c: any) => ({ value: c.id, label: `${c.nombreCompleto} (DNI: ${c.dni || "-"})` }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Descripción / Vehículo *</Label>
              <Input
                required
                className="bg-[#111] border-[#333]"
                placeholder="Ej: Toyota Corolla 2019, Spark, etc."
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Total Financiado *</Label>
                <Input
                  required
                  type="text"
                  className="bg-[#111] border-[#333]"
                  placeholder="0"
                  value={form.totalFinanciado}
                  onChange={(e) => setForm((p) => ({ ...p, totalFinanciado: formatThousands(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Intereses ($)</Label>
                <Input
                  type="text"
                  className="bg-[#111] border-[#333]"
                  placeholder="0"
                  value={form.intereses}
                  onChange={(e) => setForm((p) => ({ ...p, intereses: formatThousands(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Cant. de Cuotas *</Label>
                <Input
                  required
                  type="number"
                  min={1}
                  className="bg-[#111] border-[#333]"
                  placeholder="12"
                  value={form.cantidadCuotas}
                  onChange={(e) => setForm((p) => ({ ...p, cantidadCuotas: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Valor por Cuota *</Label>
                <Input
                  required
                  type="text"
                  className="bg-[#111] border-[#333]"
                  placeholder="0"
                  value={form.valorCuota}
                  onChange={(e) => setForm((p) => ({ ...p, valorCuota: formatThousands(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Fecha de Inicio (1° cuota) *</Label>
              <Input
                required
                type="date"
                className="bg-[#111] border-[#333] text-white"
                value={form.fechaInicio}
                onChange={(e) => setForm((p) => ({ ...p, fechaInicio: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Observaciones</Label>
              <Input
                className="bg-[#111] border-[#333]"
                placeholder="Opcional..."
                value={form.observaciones}
                onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !form.clienteId}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-5"
            >
              {loading ? "Guardando..." : "Cargar Crédito"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
