/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";

export const generateCaratulaPDF = async (sale: any, userLocation?: string) => {
  // Inicializamos el documento A4 portrait (210 x 297 mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Helper para escribir texto
  const writeText = (
    text: string,
    x: number,
    y: number,
    size: number,
    font = "helvetica",
    style = "normal",
    color = "#000000",
    align: "left" | "center" | "right" = "left"
  ) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    if (align === "center") {
      doc.text(text, x, y, { align: "center" });
    } else if (align === "right") {
      doc.text(text, x, y, { align: "right" });
    } else {
      doc.text(text, x, y);
    }
  };

  // Helper para cargar imagen
  const loadImage = async (url: string): Promise<{ data: string; w: number; h: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve({ data: canvas.toDataURL("image/png"), w: img.width, h: img.height });
      };
      img.onerror = () => resolve({ data: "", w: 0, h: 0 });
      img.src = url;
    });
  };

  const logo = await loadImage("/logo.png");
  const favicon = await loadImage("/favicon.png");

  // Marca de agua de fondo
  if (favicon.data) {
    doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
    const watermarkSize = 130;
    doc.addImage(
      favicon.data,
      "PNG",
      (pageWidth - watermarkSize) / 2,
      (pageHeight - watermarkSize) / 2 + 10,
      watermarkSize,
      watermarkSize
    );
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
  }

  // Marco perimetral institucional de carpeta física (Doble filete)
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.8);
  doc.rect(7, 7, pageWidth - 14, pageHeight - 14);
  doc.setDrawColor(235, 235, 235);
  doc.setLineWidth(0.3);
  doc.rect(8.5, 8.5, pageWidth - 17, pageHeight - 17);

  // ─────────────────────────────────────────────────────────────
  // 1. ENCABEZADO INSTITUCIONAL
  // ─────────────────────────────────────────────────────────────
  doc.setFillColor(15, 15, 15);
  doc.rect(margin, margin, contentWidth, 26, "F");

  // Franja dorada decorativa inferior del encabezado
  doc.setFillColor(234, 179, 8); // yellow-500
  doc.rect(margin, margin + 25, contentWidth, 1.2, "F");

  if (logo.data) {
    const maxH = 19;
    const ratio = logo.w / logo.h;
    const w = maxH * ratio;
    doc.addImage(logo.data, "PNG", margin + 5, margin + 3.5, w, maxH);
  } else {
    writeText("RODMELL AUTOS", margin + 6, margin + 11, 15, "helvetica", "bold", "#eab308");
    writeText("Concesionaria Oficial", margin + 6, margin + 17, 8, "helvetica", "normal", "#ffffff");
  }

  // Datos sucursal
  let address = "Las Heras y Gral Paz";
  if (userLocation === "SUCURSAL_J_IBARRA") {
    address = "Juan Felipe Ibarra 136, Frías, Sgo. del Estero";
  }

  writeText(address, pageWidth - margin - 6, margin + 8, 8, "helvetica", "normal", "#ffffff", "right");
  writeText("Mail: rodmellautomotores@gmail.com", pageWidth - margin - 6, margin + 13, 8, "helvetica", "normal", "#d1d5db", "right");
  writeText("CUIT: 20.31057572.1", pageWidth - margin - 6, margin + 18, 8, "helvetica", "normal", "#d1d5db", "right");
  writeText("CARPETA DE OPERACIÓN / LEGAJO FÍSICO", pageWidth - margin - 6, margin + 23, 7.5, "helvetica", "bold", "#eab308", "right");

  let currentY = margin + 31;

  // ─────────────────────────────────────────────────────────────
  // 2. BANNER DE TÍTULO DE CARÁTULA
  // ─────────────────────────────────────────────────────────────
  doc.setFillColor(245, 245, 247);
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 14, 1.5, 1.5, "FD");

  // Barra de acento izquierda
  doc.setFillColor(234, 179, 8);
  doc.rect(margin, currentY, 3, 14, "F");

  writeText("CARÁTULA DE OPERACIÓN", margin + 6, currentY + 6, 11, "helvetica", "bold", "#111111");
  writeText("PORTADA DE EXPEDIENTE — COPIA ADMINISTRATIVA DE RESPALDO", margin + 6, currentY + 11, 7, "helvetica", "normal", "#666666");

  const opId = sale.comprobante || (sale.id ? `OP-${sale.id.slice(-6).toUpperCase()}` : "OP-S/N");
  writeText(`Nº: ${opId}`, pageWidth - margin - 6, currentY + 6, 11, "helvetica", "bold", "#111111", "right");

  const fechaOp = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString("es-AR") : new Date().toLocaleDateString("es-AR");
  const vendedorNombre = sale.vendedor?.name || sale.vendedorNombre || "Administración";
  writeText(`Fecha: ${fechaOp}  |  Asesor: ${vendedorNombre}`, pageWidth - margin - 6, currentY + 11, 7.5, "helvetica", "normal", "#555555", "right");

  currentY += 18;

  // ─────────────────────────────────────────────────────────────
  // 3. BLOQUES: DATOS DEL CLIENTE Y VEHÍCULO (2 Columnas)
  // ─────────────────────────────────────────────────────────────
  const colW = (contentWidth - 4) / 2;
  const colH = 37;

  // Columna Izquierda: Cliente
  doc.setFillColor(252, 252, 252);
  doc.setDrawColor(215, 215, 220);
  doc.roundedRect(margin, currentY, colW, colH, 1.5, 1.5, "FD");

  // Cabecera Cliente
  doc.setFillColor(235, 237, 240);
  doc.rect(margin, currentY, colW, 7, "F");
  writeText("DATOS DEL CLIENTE / TITULAR", margin + 4, currentY + 5, 8, "helvetica", "bold", "#1f2937");

  const cliente = sale.cliente || {};
  const cY = currentY + 12;
  writeText("Nombre:", margin + 4, cY, 7.5, "helvetica", "bold", "#374151");
  writeText(cliente.nombreCompleto || "-", margin + 22, cY, 8, "helvetica", "normal", "#111111");

  writeText("DNI / CUIT:", margin + 4, cY + 5, 7.5, "helvetica", "bold", "#374151");
  writeText(cliente.dni || cliente.cuil || "-", margin + 22, cY + 5, 7.5, "helvetica", "normal", "#111111");

  writeText("Teléfono:", margin + 4, cY + 10, 7.5, "helvetica", "bold", "#374151");
  writeText(cliente.telefono || "-", margin + 22, cY + 10, 7.5, "helvetica", "normal", "#111111");

  writeText("Email:", margin + 4, cY + 15, 7.5, "helvetica", "bold", "#374151");
  writeText(cliente.email || "-", margin + 22, cY + 15, 7.5, "helvetica", "normal", "#111111");

  writeText("Dirección:", margin + 4, cY + 20, 7.5, "helvetica", "bold", "#374151");
  const direccionStr = [cliente.direccion, cliente.ciudad].filter(Boolean).join(", ") || "-";
  writeText(direccionStr, margin + 22, cY + 20, 7.5, "helvetica", "normal", "#111111");

  // Columna Derecha: Vehículo
  const colX2 = margin + colW + 4;
  doc.setFillColor(252, 252, 252);
  doc.setDrawColor(215, 215, 220);
  doc.roundedRect(colX2, currentY, colW, colH, 1.5, 1.5, "FD");

  // Cabecera Vehículo
  doc.setFillColor(235, 237, 240);
  doc.rect(colX2, currentY, colW, 7, "F");
  writeText("VEHÍCULO OBJETO DE LA OPERACIÓN", colX2 + 4, currentY + 5, 8, "helvetica", "bold", "#1f2937");

  const vehiculo = sale.vehiculo || {};
  writeText("Unidad:", colX2 + 4, cY, 7.5, "helvetica", "bold", "#374151");
  const vehiculoDesc = `${vehiculo.marca || ""} ${vehiculo.modelo || ""}`.trim() || "-";
  writeText(vehiculoDesc, colX2 + 20, cY, 8, "helvetica", "bold", "#111111");

  writeText("Año:", colX2 + 4, cY + 5, 7.5, "helvetica", "bold", "#374151");
  writeText(vehiculo.anio ? String(vehiculo.anio) : "-", colX2 + 20, cY + 5, 7.5, "helvetica", "normal", "#111111");

  writeText("Color:", colX2 + 40, cY + 5, 7.5, "helvetica", "bold", "#374151");
  writeText(vehiculo.color || "-", colX2 + 52, cY + 5, 7.5, "helvetica", "normal", "#111111");

  writeText("Dominio:", colX2 + 4, cY + 10, 7.5, "helvetica", "bold", "#374151");
  // Recuadro estilo patente
  const domStr = vehiculo.dominio || "-";
  doc.setFillColor(240, 240, 240);
  doc.setDrawColor(180, 180, 180);
  doc.roundedRect(colX2 + 20, cY + 7, 24, 4.5, 0.8, 0.8, "FD");
  writeText(domStr.toUpperCase(), colX2 + 32, cY + 10.5, 7.5, "helvetica", "bold", "#000000", "center");

  writeText("Km:", colX2 + 48, cY + 10, 7.5, "helvetica", "bold", "#374151");
  writeText(vehiculo.kilometros ? `${vehiculo.kilometros.toLocaleString("es-AR")} km` : "-", colX2 + 56, cY + 10, 7.5, "helvetica", "normal", "#111111");

  writeText("Chasis:", colX2 + 4, cY + 15, 7.5, "helvetica", "bold", "#374151");
  writeText(vehiculo.chasis || "-", colX2 + 20, cY + 15, 7, "helvetica", "normal", "#111111");

  writeText("Motor:", colX2 + 4, cY + 20, 7.5, "helvetica", "bold", "#374151");
  writeText(vehiculo.motor || "-", colX2 + 20, cY + 20, 7, "helvetica", "normal", "#111111");

  currentY += colH + 4;

  // ─────────────────────────────────────────────────────────────
  // 4. PLANTEO INICIAL DE LA OPERACIÓN Y ESTRUCTURA DE PAGO
  //    (El corazón solicitado por el audio del cliente)
  // ─────────────────────────────────────────────────────────────
  const finH = 58;
  doc.setFillColor(252, 252, 252);
  doc.setDrawColor(215, 215, 220);
  doc.roundedRect(margin, currentY, contentWidth, finH, 1.5, 1.5, "FD");

  // Barra de título de la sección
  doc.setFillColor(20, 20, 20);
  doc.rect(margin, currentY, contentWidth, 7, "F");
  doc.setFillColor(234, 179, 8);
  doc.rect(margin, currentY, 2.5, 7, "F");
  writeText("PLANTEO INICIAL DE LA OPERACIÓN — ESQUEMA Y FORMA DE PAGO", margin + 5, currentY + 5, 8.5, "helvetica", "bold", "#ffffff");

  // Divisor vertical central
  const midX = margin + contentWidth / 2;
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.4);
  doc.line(midX, currentY + 7, midX, currentY + finH);

  // --- Subcolumna Izquierda: COMPOSICIÓN DEL PRECIO TOTAL ---
  const leftX = margin + 4;
  let pY = currentY + 13;
  writeText("COMPOSICIÓN DEL TOTAL", leftX, pY, 7.5, "helvetica", "bold", "#b45309");
  pY += 5;

  const precioBase = sale.precioVehiculo || 0;
  writeText("Precio Base del Vehículo:", leftX, pY, 7.5, "helvetica", "normal", "#4b5563");
  writeText(`$${precioBase.toLocaleString("es-AR")}`, midX - 6, pY, 7.5, "helvetica", "bold", "#111111", "right");
  pY += 4.5;

  if (sale.quebranto && sale.quebranto > 0) {
    const porcQ = sale.porcentajeQuebranto ? ` (${sale.porcentajeQuebranto}%)` : "";
    writeText(`Quebranto Financiero${porcQ}:`, leftX, pY, 7.5, "helvetica", "normal", "#4b5563");
    writeText(`$${sale.quebranto.toLocaleString("es-AR")}`, midX - 6, pY, 7.5, "helvetica", "normal", "#111111", "right");
    pY += 4.5;
  }

  if (sale.gastosTransferencia && sale.gastosTransferencia > 0) {
    writeText("Gastos de Transferencia:", leftX, pY, 7.5, "helvetica", "normal", "#4b5563");
    writeText(`$${sale.gastosTransferencia.toLocaleString("es-AR")}`, midX - 6, pY, 7.5, "helvetica", "normal", "#111111", "right");
    pY += 4.5;
  }

  if (sale.gastosPatente && sale.gastosPatente > 0) {
    writeText("Gastos de Patente:", leftX, pY, 7.5, "helvetica", "normal", "#4b5563");
    writeText(`$${sale.gastosPatente.toLocaleString("es-AR")}`, midX - 6, pY, 7.5, "helvetica", "normal", "#111111", "right");
    pY += 4.5;
  }

  if (sale.gastosPrendarios && sale.gastosPrendarios > 0) {
    writeText("Gastos Prendarios / Inscripción:", leftX, pY, 7.5, "helvetica", "normal", "#4b5563");
    writeText(`$${sale.gastosPrendarios.toLocaleString("es-AR")}`, midX - 6, pY, 7.5, "helvetica", "normal", "#111111", "right");
    pY += 4.5;
  }

  // Recuadro Total Operación
  doc.setFillColor(254, 243, 199); // yellow-100
  doc.setDrawColor(234, 179, 8);
  doc.roundedRect(leftX, currentY + finH - 11, midX - leftX - 4, 8, 1, 1, "FD");
  writeText("TOTAL OPERACIÓN:", leftX + 3, currentY + finH - 6, 8, "helvetica", "bold", "#78350f");
  const totalVal = sale.total || 0;
  writeText(`$${totalVal.toLocaleString("es-AR")}`, midX - 6, currentY + finH - 5.8, 9.5, "helvetica", "bold", "#000000", "right");

  // --- Subcolumna Derecha: CÓMO SE PLANTEÓ EL PAGO (DESGLOSE) ---
  const rightX = midX + 4;
  let payY = currentY + 13;
  writeText("ESQUEMA DE PAGO ACORDADO", rightX, payY, 7.5, "helvetica", "bold", "#047857");
  payY += 5;

  // 1. Efectivo / Transferencia
  const efectivoVal = sale.efectivo || 0;
  writeText("• Entrega en Efectivo / Transf.:", rightX, payY, 7.5, "helvetica", "normal", "#374151");
  writeText(efectivoVal > 0 ? `$${efectivoVal.toLocaleString("es-AR")}` : "$0", pageWidth - margin - 6, payY, 7.5, "helvetica", "bold", "#111111", "right");
  payY += 4.5;

  // 2. Auto en Parte de Pago
  const autoPartePagoVal = sale.autoPartePago || 0;
  writeText("• Auto en Parte de Pago:", rightX, payY, 7.5, "helvetica", "normal", "#374151");
  writeText(autoPartePagoVal > 0 ? `$${autoPartePagoVal.toLocaleString("es-AR")}` : "$0", pageWidth - margin - 6, payY, 7.5, "helvetica", "bold", "#111111", "right");
  payY += 3.5;

  if (sale.detalleAutoPartePago) {
    writeText(`  Detalle: ${sale.detalleAutoPartePago}`, rightX + 2, payY, 6.5, "helvetica", "italic", "#6b7280");
    payY += 4;
  } else {
    payY += 1;
  }

  // 3. Crédito / Financiación
  const creditoVal = sale.credito || 0;
  writeText("• Financiación / Crédito:", rightX, payY, 7.5, "helvetica", "normal", "#374151");
  writeText(creditoVal > 0 ? `$${creditoVal.toLocaleString("es-AR")}` : "$0", pageWidth - margin - 6, payY, 7.5, "helvetica", "bold", "#111111", "right");
  payY += 3.5;

  // Plan de cuotas si existe
  const cantidadCuotas = sale.cuotas && sale.cuotas.length > 0 ? sale.cuotas.length : null;
  if (cantidadCuotas) {
    const valorPrimerCuota = sale.cuotas[0]?.valor || 0;
    writeText(`  Plan: ${cantidadCuotas} cuotas de ~$${valorPrimerCuota.toLocaleString("es-AR")}`, rightX + 2, payY, 6.5, "helvetica", "italic", "#6b7280");
    payY += 4;
  } else if (sale.formaPago) {
    writeText(`  Condición: ${sale.formaPago}`, rightX + 2, payY, 6.5, "helvetica", "italic", "#6b7280");
    payY += 4;
  } else {
    payY += 1;
  }

  // Saldo Pendiente Box
  const saldoVal = sale.saldoPendiente || 0;
  doc.setFillColor(243, 244, 246);
  doc.setDrawColor(209, 213, 219);
  doc.roundedRect(rightX, currentY + finH - 11, pageWidth - margin - rightX - 2, 8, 1, 1, "FD");
  writeText("SALDO PENDIENTE:", rightX + 3, currentY + finH - 6, 7.5, "helvetica", "bold", "#374151");
  writeText(`$${saldoVal.toLocaleString("es-AR")}`, pageWidth - margin - 6, currentY + finH - 5.8, 9, "helvetica", "bold", saldoVal > 0 ? "#dc2626" : "#15803d", "right");

  currentY += finH + 4;

  // ─────────────────────────────────────────────────────────────
  // 5. OBSERVACIONES Y ACUERDOS ESPECIALES
  // ─────────────────────────────────────────────────────────────
  const obsH = 15;
  doc.setFillColor(252, 252, 252);
  doc.setDrawColor(215, 215, 220);
  doc.roundedRect(margin, currentY, contentWidth, obsH, 1.5, 1.5, "FD");

  doc.setFillColor(240, 240, 243);
  doc.rect(margin, currentY, contentWidth, 5.5, "F");
  writeText("OBSERVACIONES / CONDICIONES PARTICULARES PACTADAS", margin + 4, currentY + 4, 7.5, "helvetica", "bold", "#1f2937");

  const obsText = sale.observaciones || "Sin observaciones adicionales registradas. Operación sujeta a verificación documental y entrega formal según lo pactado.";
  doc.setFontSize(7);
  doc.setTextColor("#374151");
  const splitObs = doc.splitTextToSize(obsText, contentWidth - 8);
  doc.text(splitObs, margin + 4, currentY + 9.5);

  currentY += obsH + 4;

  // ─────────────────────────────────────────────────────────────
  // 6. CONTROL DOCUMENTAL DE LEGAJO / FOLIO FÍSICO (CHECKLIST)
  //    (Pensado especialmente para la carpetita/folio en caja)
  // ─────────────────────────────────────────────────────────────
  const checkH = 26;
  doc.setFillColor(252, 252, 252);
  doc.setDrawColor(215, 215, 220);
  doc.roundedRect(margin, currentY, contentWidth, checkH, 1.5, 1.5, "FD");

  doc.setFillColor(240, 240, 243);
  doc.rect(margin, currentY, contentWidth, 5.5, "F");
  writeText("CONTROL DE DOCUMENTACIÓN DE CARPETA (CHECKLIST DE LEGAJO FÍSICO)", margin + 4, currentY + 4, 7.5, "helvetica", "bold", "#1f2937");

  const checkItemsLeft = [
    "[   ]  Fotocopia DNI / CUIL del Titular",
    "[   ]  Formulario 08 Firmado y Certificado",
    "[   ]  Título de Propiedad Automotor Original",
    "[   ]  Cédula de Identificación (Verde / Azul)",
  ];

  const checkItemsRight = [
    "[   ]  Verificación Policial (Formulario 12)",
    "[   ]  Informe de Dominio / Libre Deuda Multas y Rentas",
    "[   ]  Constancia de Seguro Automotor Vigente",
    "[   ]  Recibos de Pago / Pagarés / Mutuo Firmado",
  ];

  let ckY = currentY + 9.5;
  checkItemsLeft.forEach((it) => {
    writeText(it, margin + 4, ckY, 6.8, "courier", "bold", "#374151");
    ckY += 3.8;
  });

  ckY = currentY + 9.5;
  checkItemsRight.forEach((it) => {
    writeText(it, midX + 4, ckY, 6.8, "courier", "bold", "#374151");
    ckY += 3.8;
  });

  currentY += checkH + 5;

  // ─────────────────────────────────────────────────────────────
  // 7. SECTOR DE FIRMAS DE APERTURA DE EXPEDIENTE
  // ─────────────────────────────────────────────────────────────
  const sigBoxH = 26;
  doc.setFillColor(252, 252, 252);
  doc.setDrawColor(215, 215, 220);
  doc.roundedRect(margin, currentY, contentWidth, sigBoxH, 1.5, 1.5, "FD");

  const sigColW = (contentWidth - 16) / 3;
  const sigLineY = currentY + 16;

  // Firma 1: Comprador
  const s1X = margin + 4;
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.3);
  doc.line(s1X, sigLineY, s1X + sigColW, sigLineY);
  writeText("Firma del Comprador / Titular", s1X + sigColW / 2, sigLineY + 3.5, 7, "helvetica", "bold", "#111111", "center");
  writeText(`Acl: ${cliente.nombreCompleto || ""}`, s1X + sigColW / 2, sigLineY + 6.5, 6.5, "helvetica", "normal", "#4b5563", "center");
  writeText(`DNI: ${cliente.dni || ""}`, s1X + sigColW / 2, sigLineY + 9.5, 6.5, "helvetica", "normal", "#4b5563", "center");

  // Firma 2: Vendedor
  const s2X = s1X + sigColW + 4;
  doc.line(s2X, sigLineY, s2X + sigColW, sigLineY);
  writeText("Firma Asesor Comercial", s2X + sigColW / 2, sigLineY + 3.5, 7, "helvetica", "bold", "#111111", "center");
  writeText(`Acl: ${vendedorNombre}`, s2X + sigColW / 2, sigLineY + 6.5, 6.5, "helvetica", "normal", "#4b5563", "center");
  writeText("Rodmell Automotores", s2X + sigColW / 2, sigLineY + 9.5, 6.5, "helvetica", "normal", "#4b5563", "center");

  // Firma 3: Administración / Concesionaria
  const s3X = s2X + sigColW + 4;
  doc.line(s3X, sigLineY, s3X + sigColW, sigLineY);
  writeText("Firma Autorizada / Administración", s3X + sigColW / 2, sigLineY + 3.5, 7, "helvetica", "bold", "#111111", "center");
  writeText("Concesionaria Rodmell Autos", s3X + sigColW / 2, sigLineY + 6.5, 6.5, "helvetica", "normal", "#4b5563", "center");
  writeText("Aprobación de Legajo", s3X + sigColW / 2, sigLineY + 9.5, 6.5, "helvetica", "normal", "#4b5563", "center");

  currentY += sigBoxH + 4;

  // ─────────────────────────────────────────────────────────────
  // 8. PIE DE PÁGINA
  // ─────────────────────────────────────────────────────────────
  const footStr = `Documento de Resguardo Físico para Legajo de Operación — Rodmell Automotores — Emitido el ${new Date().toLocaleString("es-AR")}`;
  writeText(footStr, pageWidth / 2, pageHeight - 9, 6.5, "helvetica", "italic", "#9ca3af", "center");

  // Guardar / Descargar PDF
  const safeClientName = (cliente.nombreCompleto || "Cliente").replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `Caratula_${opId}_${safeClientName}.pdf`;
  doc.save(fileName);
};
