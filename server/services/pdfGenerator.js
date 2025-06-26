import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import db from '../database/init.js';
import { format, getDaysInMonth, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export const generatePDF = async (year, month) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  
  // Title
  page.drawText('FEUILLE DE PRÉSENCE MENSUELLE', {
    x: width / 2 - 150,
    y: height - 40,
    size: 16,
    font: boldFont
  });
  
  page.drawText(`${getMonthName(month)} ${year}`, {
    x: width / 2 - 50,
    y: height - 60,
    size: 14,
    font: boldFont
  });
  
  // Get data
  const pupils = db.prepare('SELECT * FROM pupils ORDER BY class_group, last_name, first_name').all();
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-31`;
  const absences = db.prepare(`
    SELECT * FROM absences 
    WHERE date BETWEEN ? AND ?
  `).all(startDate, endDate);
  
  // Grid dimensions
  const startY = height - 100;
  const rowHeight = 12;
  const nameColWidth = 150;
  const dayColWidth = 15;
  const gridWidth = nameColWidth + (31 * dayColWidth);
  
  // Headers
  let currentX = 50;
  
  // Row number header
  page.drawText('N°', {
    x: currentX,
    y: startY,
    size: 8,
    font: boldFont
  });
  currentX += 30;
  
  // Name header
  page.drawText('Nom et prénom(s) des élèves', {
    x: currentX,
    y: startY,
    size: 8,
    font: boldFont
  });
  currentX += nameColWidth;
  
  // Day headers
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  for (let day = 1; day <= 31; day++) {
    if (day <= daysInMonth) {
      page.drawText(day.toString(), {
        x: currentX + 2,
        y: startY,
        size: 6,
        font: boldFont
      });
      
      // Draw weekday
      const date = new Date(year, month - 1, day);
      const weekday = getWeekdayShort(getDay(date));
      page.drawText(weekday, {
        x: currentX + 1,
        y: startY - 8,
        size: 5,
        font: font
      });
    }
    currentX += dayColWidth;
  }
  
  // Draw pupils and absences
  let currentY = startY - 25;
  pupils.slice(0, 30).forEach((pupil, index) => {
    currentX = 50;
    
    // Row number
    page.drawText((index + 1).toString(), {
      x: currentX + 10,
      y: currentY,
      size: 8,
      font: font
    });
    currentX += 30;
    
    // Name
    const fullName = `${pupil.last_name} ${pupil.first_name}`;
    page.drawText(fullName.length > 25 ? fullName.substring(0, 25) + '...' : fullName, {
      x: currentX + 2,
      y: currentY,
      size: 8,
      font: font
    });
    currentX += nameColWidth;
    
    // Absences for each day
    for (let day = 1; day <= 31; day++) {
      if (day <= daysInMonth) {
        const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayAbsences = absences.filter(a => a.pupil_id === pupil.id && a.date === dateStr);
        
        // AM
        const amAbsence = dayAbsences.find(a => a.half_day === 'AM');
        if (amAbsence && amAbsence.status !== 'P') {
          page.drawText(amAbsence.status, {
            x: currentX + 1,
            y: currentY + 3,
            size: 6,
            font: font,
            color: getStatusColor(amAbsence.status)
          });
        }
        
        // PM
        const pmAbsence = dayAbsences.find(a => a.half_day === 'PM');
        if (pmAbsence && pmAbsence.status !== 'P') {
          page.drawText(pmAbsence.status, {
            x: currentX + 8,
            y: currentY + 3,
            size: 6,
            font: font,
            color: getStatusColor(pmAbsence.status)
          });
        }
        
        // Draw divider between AM and PM
        page.drawLine({
          start: { x: currentX + 7, y: currentY - 2 },
          end: { x: currentX + 7, y: currentY + 8 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8)
        });
        
        // Weekend background
        const date = new Date(year, month - 1, day);
        if (getDay(date) === 0 || getDay(date) === 6) {
          page.drawRectangle({
            x: currentX,
            y: currentY - 2,
            width: dayColWidth,
            height: rowHeight,
            color: rgb(0.9, 0.9, 0.9)
          });
        }
      }
      currentX += dayColWidth;
    }
    
    currentY -= rowHeight;
  });
  
  // Draw grid lines
  drawGrid(page, 50, startY - 25, gridWidth + 30, pupils.length * rowHeight, dayColWidth, rowHeight);
  
  // Signature section
  const signatureY = 50;
  page.drawText('Visa et date de contrôle:', {
    x: 50,
    y: signatureY,
    size: 10,
    font: font
  });
  
  page.drawText('Signature du directeur:', {
    x: 300,
    y: signatureY,
    size: 10,
    font: font
  });
  
  page.drawText('Date:', {
    x: 550,
    y: signatureY,
    size: 10,
    font: font
  });
  
  return await pdfDoc.save();
};

const drawGrid = (page, x, y, width, height, colWidth, rowHeight) => {
  // Vertical lines
  for (let i = 0; i <= Math.ceil(width / colWidth); i++) {
    page.drawLine({
      start: { x: x + (i * colWidth), y: y },
      end: { x: x + (i * colWidth), y: y + height },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7)
    });
  }
  
  // Horizontal lines
  for (let i = 0; i <= Math.ceil(height / rowHeight); i++) {
    page.drawLine({
      start: { x: x, y: y + (i * rowHeight) },
      end: { x: x + width, y: y + (i * rowHeight) },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7)
    });
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'E': return rgb(0, 0.7, 0); // Green
    case 'O': return rgb(0.8, 0, 0); // Red
    case 'C': return rgb(0, 0, 0.8); // Blue
    default: return rgb(0, 0, 0); // Black
  }
};

const getMonthName = (month) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[parseInt(month) - 1];
};

const getWeekdayShort = (day) => {
  const days = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
  return days[day];
};