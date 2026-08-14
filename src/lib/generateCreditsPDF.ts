/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateCreditsPDF = (
  filtro: string,
  operacionesConCuotas: any[],
  creditosHistoricos: any[]
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const writeText = (text: string, x: number, y: number, size: number, font = "helvetica", style = "normal", color = "#000000") => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.text(text, x, y);
  };

  const drawDecorations = (pageNumber: number, totalPages: number) => {
    // --- ENCABEZADO ---
    doc.setFillColor(0, 0, 0); // Black background
    doc.rect(0, 0, pageWidth, 35, "F");

    writeText("RODMELL AUTOS", 15, 15, 20, "helvetica", "bold", "#eab308");
    writeText("Concesionaria Oficial - Módulo de Créditos", 15, 22, 10, "helvetica", "normal", "#ffffff");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#ffffff");
    
    doc.text("Mail: rodmellautomotores@gmail.com", pageWidth - 15, 15, { align: "right" });
    doc.text("CUIT: 20.31057572.1", pageWidth - 15, 22, { align: "right" });

    let decorY = 45;

    // --- TÍTULO ---
    let titulo = "REPORTE DE CRÉDITOS Y CUOTAS";
    if (filtro !== "TODOS") {
      titulo += ` (ESTADO: ${filtro})`;
    }
    writeText(titulo, 15, decorY, 14, "helvetica", "bold", "#111111");
    
    doc.setFontSize(10);
    doc.setTextColor("#555555");
    const fechaStr = new Date().toLocaleString("es-AR");
    doc.text(`Fecha de emisión: ${fechaStr} - Pág ${pageNumber}/${totalPages}`, pageWidth - 15, decorY, { align: "right" });
    decorY += 10;

    // Línea divisoria
    doc.setDrawColor(200, 200, 200);
    doc.line(15, decorY, pageWidth - 15, decorY);
  };

  let startY = 65;

  const tableData: any[] = [];

  // Recopilar cuotas del sistema
  operacionesConCuotas.forEach((op: any) => {
    const cuotas = filtro === "TODOS" ? op.cuotas : op.cuotas.filter((c: any) => c.estado === filtro);
    cuotas.forEach((c: any) => {
      tableData.push([
        "SISTEMA",
        op.cliente?.nombreCompleto || "-",
        `${op.vehiculo?.marca} ${op.vehiculo?.modelo} ${op.vehiculo?.anio}`,
        c.numeroCuota,
        `$${c.valor.toLocaleString("es-AR")}`,
        new Date(c.fechaVencimiento).toLocaleDateString("es-AR"),
        c.estado,
        c.fechaPago ? new Date(c.fechaPago).toLocaleDateString("es-AR") : "-"
      ]);
    });
  });

  // Recopilar cuotas históricas
  creditosHistoricos.forEach((cr: any) => {
    const cuotas = filtro === "TODOS" ? cr.cuotas : cr.cuotas.filter((c: any) => c.estado === filtro);
    cuotas.forEach((c: any) => {
      tableData.push([
        "HISTÓRICO",
        cr.cliente?.nombreCompleto || "-",
        cr.descripcion,
        c.numeroCuota,
        `$${c.valor.toLocaleString("es-AR")}`,
        new Date(c.fechaVencimiento).toLocaleDateString("es-AR"),
        c.estado,
        c.fechaPago ? new Date(c.fechaPago).toLocaleDateString("es-AR") : "-"
      ]);
    });
  });

  // Sort by due date (vencimiento)
  tableData.sort((a, b) => {
    const dateA = a[5].split("/").reverse().join("-");
    const dateB = b[5].split("/").reverse().join("-");
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  if (tableData.length === 0) {
    writeText("No hay cuotas que coincidan con el filtro seleccionado.", 15, startY, 12, "helvetica", "normal");
  } else {
    autoTable(doc, {
      startY: startY,
      head: [["Tipo", "Cliente", "Vehículo / Descripción", "Cuota", "Valor", "Vencimiento", "Estado", "Fecha Pago"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
      columnStyles: { 
        0: { cellWidth: 25 },
        4: { halign: "right" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" }
      },
      margin: { top: 60, left: 15, right: 15 },
      didDrawPage: (data) => {
        // Leave the decoration drawing for later so we know total pages
      }
    });
  }

  // Apply decorations to all pages
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawDecorations(i, pageCount);
  }

  doc.save(`Reporte_Creditos_${filtro}_${new Date().getTime()}.pdf`);
};
