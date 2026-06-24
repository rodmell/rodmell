/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export const generateReceiptPDF = async (sale: any, type: "VENTA" | "PAGO" | "CUOTA" = "VENTA", item?: any) => {
  // Inicializamos el documento A4
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper para escribir texto
  const writeText = (text: string, x: number, y: number, size: number, font = "helvetica", style = "normal", color = "#000000") => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.text(text, x, y);
  };

  // Helper para cargar imagen
  const loadImage = async (url: string): Promise<{data: string, w: number, h: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve({ data: canvas.toDataURL('image/png'), w: img.width, h: img.height });
      };
      img.onerror = () => resolve({ data: "", w: 0, h: 0 }); // Resolve empty on error
      img.src = url;
    });
  };

  const logo = await loadImage("/logo.png");
  const favicon = await loadImage("/favicon.png");

  const idValue = item ? item.comprobante || item.id : sale.comprobante || sale.id;

  const drawWatermark = () => {
    if (favicon.data) {
      doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
      const watermarkSize = 180;
      doc.addImage(favicon.data, "PNG", (pageWidth - watermarkSize) / 2, (pageHeight - watermarkSize) / 2, watermarkSize, watermarkSize);
      doc.setGState(new (doc as any).GState({ opacity: 1 }));
    }
  };

  // Override addPage to draw watermark behind content
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = function(...args: any[]) {
    originalAddPage(...args);
    drawWatermark();
    return this;
  };

  // Draw watermark for the first page
  drawWatermark();

  const drawDecorations = (pageNumber: number, totalPages: number) => {

    // --- ENCABEZADO ---
    doc.setFillColor(0, 0, 0); // Black background to match logo
    doc.rect(0, 0, pageWidth, 35, "F");

    if (logo.data) {
      const maxH = 25;
      const ratio = logo.w / logo.h;
      const w = maxH * ratio;
      doc.addImage(logo.data, "PNG", 15, 5, w, maxH);
    } else {
      writeText("RODMELL AUTOS", 15, 15, 20, "helvetica", "bold", "#eab308");
      writeText("Concesionaria Oficial", 15, 22, 10, "helvetica", "normal", "#ffffff");
    }
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#ffffff");
    doc.text("Juan Felipe ibarra 136, Frias, Santiago del Estero", pageWidth - 15, 14, { align: "right" });
    doc.text("Mail: rodmellautomotores@gmail.com", pageWidth - 15, 20, { align: "right" });
    doc.text("CUIT: 20.31057572.1", pageWidth - 15, 26, { align: "right" });

    let decorY = 45;

    // --- TÍTULO Y NÚMERO DE COMPROBANTE ---
    const titulos = {
      VENTA: "COMPROBANTE DE OPERACIÓN",
      PAGO: "COMPROBANTE DE PAGO",
      CUOTA: "COMPROBANTE DE CUOTA"
    };
    
    writeText(titulos[type], 15, decorY, 16, "helvetica", "bold", "#111111");
    
    const compNumber = `Nº: ${idValue.length > 8 ? idValue.slice(-6).toUpperCase() : idValue}`;
    doc.setFontSize(12);
    doc.setTextColor("#555555");
    doc.text(compNumber, pageWidth - 15, decorY, { align: "right" });
    decorY += 6;
    doc.setFontSize(10);
    const fechaStr = item ? new Date(item.fecha || item.fechaPago || item.createdAt || new Date()).toLocaleString() : new Date(sale.createdAt || new Date()).toLocaleString();
    doc.text(`Fecha: ${fechaStr} - Pág ${pageNumber}/${totalPages}`, pageWidth - 15, decorY, { align: "right" });
    decorY += 10;

    // Línea divisoria
    doc.setDrawColor(200, 200, 200);
    doc.line(15, decorY, pageWidth - 15, decorY);

    // --- SELLO "PAGADO" DIAGONAL (Dibujado al final para que quede por encima) ---
    doc.setGState(new (doc as any).GState({ opacity: 0.20 })); // Más intenso
    doc.setFontSize(100);
    doc.setTextColor("#ef4444"); // Rojo
    doc.setFont("helvetica", "bolditalic");
    doc.text("PAGADO", pageWidth / 2, pageHeight / 2 + 20, { angle: 30, align: "center" });
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
  };

  let y = 72; // Start content below header

  // --- INFORMACIÓN DEL CLIENTE Y VEHÍCULO (Grid) ---
  doc.setFillColor(245, 245, 245);
  doc.rect(15, y, (pageWidth - 35) / 2, 40, "F");
  doc.rect(pageWidth / 2 + 2.5, y, (pageWidth - 35) / 2, 40, "F");

  // Cliente
  writeText("INFORMACIÓN DEL CLIENTE", 20, y + 8, 10, "helvetica", "bold");
  writeText(`Nombre: ${sale.cliente?.nombreCompleto || "-"}`, 20, y + 15, 9, "helvetica", "normal");
  writeText(`DNI: ${sale.cliente?.dni || "-"}`, 20, y + 21, 9);
  writeText(`Tel: ${sale.cliente?.telefono || "-"}`, 20, y + 27, 9);
  writeText(`Email: ${sale.cliente?.email || "-"}`, 20, y + 33, 9);

  // Vehículo
  const halfX = pageWidth / 2 + 7.5;
  writeText("INFORMACIÓN DEL VEHÍCULO", halfX, y + 8, 10, "helvetica", "bold");
  writeText(`Marca y Modelo: ${sale.vehiculo?.marca || ""} ${sale.vehiculo?.modelo || ""}`, halfX, y + 15, 9, "helvetica", "normal");
  writeText(`Año: ${sale.vehiculo?.anio || "-"}`, halfX, y + 21, 9);
  writeText(`Dominio: ${sale.vehiculo?.dominio || "-"}`, halfX, y + 27, 9);
  writeText(`Chasis: ${sale.vehiculo?.chasis || "-"}`, halfX, y + 33, 9);
  
  y += 48;

  // --- DETALLE DE LA OPERACIÓN ---
  writeText("DETALLE DE LA OPERACIÓN", 15, y, 12, "helvetica", "bold");
  y += 5;

  const tableData = [];
  
  if (type === "VENTA") {
    tableData.push(["Precio Base Vehículo", `Venta de ${sale.vehiculo?.marca} ${sale.vehiculo?.modelo}`, `$${sale.precioVehiculo?.toLocaleString()}`]);
    
    if (sale.efectivo && sale.efectivo > 0) {
      tableData.push(["Pago en Efectivo", "Abono inicial en efectivo", `-$${sale.efectivo.toLocaleString()}`]);
    }
    if (sale.credito && sale.credito > 0) {
      tableData.push(["Crédito", "Monto financiado", `-$${sale.credito.toLocaleString()}`]);
    }
    if (sale.quebranto && sale.quebranto > 0) {
      tableData.push(["Costo de Quebranto", `Recargo por financiación (${sale.porcentajeQuebranto}%)`, `$${sale.quebranto.toLocaleString()}`]);
    }
    if (sale.autoPartePago && sale.autoPartePago > 0) {
      tableData.push(["Auto en Parte de Pago", sale.detalleAutoPartePago || "Entrega de vehículo", `-$${sale.autoPartePago.toLocaleString()}`]);
    }
  } else if (type === "PAGO") {
    tableData.push([`Pago: ${item.medioPago === "SENA" ? "Seña" : item.medioPago}`, item.observaciones || "Abono a cuenta", `$${item.importe.toLocaleString()}`]);
  } else if (type === "CUOTA") {
    tableData.push([`Cuota Nº ${item.numeroCuota}`, `Pago de cuota mediante ${item.medioPago || "EFECTIVO"}`, `$${item.valor.toLocaleString()}`]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Concepto", "Descripción", "Importe"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 4 },
    columnStyles: { 2: { halign: "right" } },
    margin: { top: 75, left: 15, right: 15 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  if (type === "VENTA") {
    // --- RESUMEN DE SALDOS ---
    if (y + 40 > pageHeight - 60) {
      doc.addPage();
      y = 75;
    }

    const tableWidth = 85;
    const startX = pageWidth - 15 - tableWidth;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(startX, y, tableWidth, 38, "F");

    // Condición de pago en la izquierda
    writeText("CONDICIONES DE PAGO:", 15, y + 8, 10, "helvetica", "bold");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const splitCond = doc.splitTextToSize(sale.formaPago || "No especificada", startX - 25);
    doc.text(splitCond, 15, y + 14);

    // Caja de resumen
    writeText("RESUMEN", startX + 5, y + 8, 10, "helvetica", "bold");
    
    writeText("Total a Pagar:", startX + 5, y + 16, 10, "helvetica", "normal");
    doc.text(`$${sale.total?.toLocaleString()}`, startX + tableWidth - 5, y + 16, { align: "right" });

    const abonado = (sale.total || 0) - (sale.saldoPendiente || 0);
    writeText("Monto Abonado:", startX + 5, y + 24, 10, "helvetica", "normal");
    doc.text(`$${abonado.toLocaleString()}`, startX + tableWidth - 5, y + 24, { align: "right" });

    writeText("Saldo Pendiente:", startX + 5, y + 32, 10, "helvetica", "bold");
    doc.text(`$${sale.saldoPendiente?.toLocaleString()}`, startX + tableWidth - 5, y + 32, { align: "right" });

    y += 45;

    // --- OBSERVACIONES ---
    if (sale.observaciones) {
      if (y + 20 > pageHeight - 60) {
        doc.addPage();
        y = 75;
      }
      writeText("OBSERVACIONES:", 15, y, 10, "helvetica", "bold");
      writeText(sale.observaciones, 15, y + 6, 9, "helvetica", "normal");
      y += 20;
    }
  } else {
    y += 20;
  }

  // --- FIRMAS ---
  if (y > pageHeight - 75) {
    doc.addPage();
    y = 75;
  } else {
    y = pageHeight - 55; // Force signatures to bottom area
  }

  const sigY = y + 15;
  doc.setDrawColor(100, 100, 100);
  
  // Cliente
  doc.line(20, sigY, 70, sigY);
  doc.text("Firma del Cliente", 45, sigY + 5, { align: "center" });
  doc.text(`Aclaración: ${sale.cliente?.nombreCompleto || ""}`, 45, sigY + 10, { align: "center" });
  doc.text(`DNI: ${sale.cliente?.dni || ""}`, 45, sigY + 15, { align: "center" });

  // Vendedor
  doc.line(80, sigY, 130, sigY);
  doc.text("Firma del Vendedor", 105, sigY + 5, { align: "center" });
  doc.text("Aclaración:", 105, sigY + 10, { align: "center" });

  // Concesionaria
  doc.line(140, sigY, 190, sigY);
  doc.text("Firma Autorizada", 165, sigY + 5, { align: "center" });
  doc.text("RODMELL AUTOS", 165, sigY + 10, { align: "center" });

  // --- FOOTER ---
  doc.setFontSize(7);
  doc.setTextColor("#777777");
  const legalText = "Este comprobante acredita la recepción del pago detallado en el presente documento y constituye constancia válida de la operación registrada por la concesionaria. El documento pierde validez en caso de alteraciones o enmiendas.";
  const splitText = doc.splitTextToSize(legalText, pageWidth - 30);
  doc.text(splitText, 15, pageHeight - 15);

  // Apply decorations to all pages
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawDecorations(i, pageCount);
  }

  // Descargar PDF
  doc.save(`Comprobante_${idValue}.pdf`);
};
