/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export const generateReceiptPDF = async (sale: any) => {
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

  // --- MARCA DE AGUA INSTITUCIONAL ---
  if (favicon.data) {
    doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
    const watermarkSize = 120;
    doc.addImage(favicon.data, "PNG", (pageWidth - watermarkSize) / 2, (pageHeight - watermarkSize) / 2, watermarkSize, watermarkSize);
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
  }

  // --- ENCABEZADO ---
  doc.setFillColor(0, 0, 0); // Black background to match logo
  doc.rect(0, 0, pageWidth, 35, "F");

  if (logo.data) {
    // Top left logo, preserving aspect ratio
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
  doc.text("Av. Libertador 1234, CABA", pageWidth - 15, 12, { align: "right" });
  doc.text("Tel: +54 9 11 1234-5678", pageWidth - 15, 17, { align: "right" });
  doc.text("contacto@rodmell.com.ar", pageWidth - 15, 22, { align: "right" });
  doc.text("CUIT: 30-12345678-9", pageWidth - 15, 27, { align: "right" });

  let y = 45;

  // --- TÍTULO Y NÚMERO DE COMPROBANTE ---
  writeText("COMPROBANTE DE OPERACIÓN", 15, y, 16, "helvetica", "bold", "#111111");
  const compNumber = `Nº: ${sale.id.slice(-6).toUpperCase()}`;
  doc.setFontSize(12);
  doc.setTextColor("#555555");
  doc.text(compNumber, pageWidth - 15, y, { align: "right" });
  y += 6;
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, pageWidth - 15, y, { align: "right" });
  y += 10;

  // Línea divisoria
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

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

  autoTable(doc, {
    startY: y,
    head: [["Concepto", "Descripción", "Importe"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 4 },
    columnStyles: { 2: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // --- RESUMEN DE SALDOS ---
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

  y += 50;

  // --- OBSERVACIONES ---
  if (sale.observaciones) {
    writeText("OBSERVACIONES:", 15, y, 10, "helvetica", "bold");
    writeText(sale.observaciones, 15, y + 6, 9, "helvetica", "normal");
    y += 20;
  }

  // --- FIRMAS ---
  // Ensure we don't go to next page, if so, add page
  if (y > pageHeight - 60) {
    doc.addPage();
    y = 30;
  } else {
    y = pageHeight - 60; // Force signatures to bottom
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

  // --- SELLO "PAGADO" DIAGONAL (Dibujado al final para que quede por encima) ---
  doc.setGState(new (doc as any).GState({ opacity: 0.10 }));
  doc.setFontSize(100);
  doc.setTextColor("#ef4444"); // Rojo
  doc.setFont("helvetica", "bolditalic");
  doc.text("PAGADO", pageWidth / 2, pageHeight / 2 + 20, { angle: 30, align: "center" });
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Descargar PDF
  doc.save(`Comprobante_${sale.id}.pdf`);
};
