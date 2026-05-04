package com.flight.ticket.service;

import com.flight.ticket.model.CT_DatVe;
import com.flight.ticket.model.ChuyenBay;
import com.lowagie.text.Font;
import com.lowagie.text.*;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Currency;
import java.util.Locale;

@Service
public class TicketPdfService {

    private static final Color PRIMARY_COLOR = new Color(0, 51, 102); // Deep Blue
    private static final Color SECONDARY_COLOR = new Color(240, 240, 240); // Light Grey
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    public void generateTicketPdf(CT_DatVe ve, HttpServletResponse response) throws IOException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();

        // --- FONTS (Support Vietnamese Unicode) ---
        BaseFont baseFont = null;
        BaseFont baseFontBold = null;
        
        String[] fontPaths = {
            "C:\\Windows\\Fonts\\arial.ttf", // Windows
            "C:\\Windows\\Fonts\\arialbd.ttf", // Windows Bold
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", // Linux (Ubuntu/Debian)
            "/usr/share/fonts/dejavu/DejaVuSans.ttf", // Linux (Alpine/CentOS)
            "/usr/share/fonts/liberation/LiberationSans-Regular.ttf", // Linux
            "/usr/share/fonts/TTF/Arial.TTF" // Other Linux
        };

        String[] fontBoldPaths = {
            "C:\\Windows\\Fonts\\arialbd.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/TTF/ArialBD.TTF"
        };

        // Try to load regular font
        for (String path : fontPaths) {
            try {
                baseFont = BaseFont.createFont(path, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                if (baseFont != null) break;
            } catch (Exception ignored) {}
        }

        // Try to load bold font
        for (String path : fontBoldPaths) {
            try {
                baseFontBold = BaseFont.createFont(path, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                if (baseFontBold != null) break;
            } catch (Exception ignored) {}
        }

        // Fallback if no system fonts found
        if (baseFont == null) {
            try {
                baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            } catch (Exception e) {
                throw new IOException("Could not load any font for PDF generation", e);
            }
        }
        if (baseFontBold == null) {
            try {
                baseFontBold = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            } catch (Exception e) {
                baseFontBold = baseFont; // Last resort
            }
        }

        Font fontTitle = new Font(baseFontBold, 22, Font.NORMAL, PRIMARY_COLOR);
        Font fontSubtitle = new Font(baseFontBold, 14, Font.NORMAL, Color.GRAY);
        Font fontLabel = new Font(baseFont, 10, Font.NORMAL, Color.DARK_GRAY);
        Font fontValue = new Font(baseFontBold, 12, Font.NORMAL, Color.BLACK);
        Font fontWhite = new Font(baseFontBold, 12, Font.NORMAL, Color.WHITE);
        Font fontTiny = new Font(baseFont, 8, Font.ITALIC, Color.GRAY);
        Font fontBrand = new Font(baseFontBold, 26, Font.NORMAL, PRIMARY_COLOR);
        Font fontBrandRed = new Font(baseFontBold, 26, Font.NORMAL, new Color(204, 0, 0));

        // --- HEADER ---
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{2, 1});

        // Logo and Brand
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        Phrase logoPhrase = new Phrase();
        logoPhrase.add(new Chunk("FLY", fontBrand));
        logoPhrase.add(new Chunk("VIET", fontBrandRed));
        logoCell.addElement(logoPhrase);
        logoCell.addElement(new Paragraph("Vé Điện Tử & Thẻ Lên Máy Bay", fontTiny));
        headerTable.addCell(logoCell);

        // Ticket ID
        PdfPCell idCell = new PdfPCell(new Paragraph("MÃ VÉ: " + ve.getMaVe(), fontSubtitle));
        idCell.setBorder(Rectangle.NO_BORDER);
        idCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        headerTable.addCell(idCell);

        document.add(headerTable);
        document.add(new Paragraph("\n"));

        // --- ROUTE BAR ---
        ChuyenBay cb = ve.getMaChuyenBay();
        String origin = (cb != null && cb.getMaSanBayDi() != null) ? cb.getMaSanBayDi().getThanhPho() : "UNKNOWN";
        String dest = (cb != null && cb.getMaSanBayDen() != null) ? cb.getMaSanBayDen().getThanhPho() : "UNKNOWN";
        String originCode = (cb != null && cb.getMaSanBayDi() != null) ? cb.getMaSanBayDi().getMaIATA() : "???";
        String destCode = (cb != null && cb.getMaSanBayDen() != null) ? cb.getMaSanBayDen().getMaIATA() : "???";

        PdfPTable routeTable = new PdfPTable(3);
        routeTable.setWidthPercentage(100);
        routeTable.setWidths(new float[]{1, 1, 1});

        routeTable.addCell(createRouteCell(originCode, origin, Element.ALIGN_LEFT, fontTitle, fontSubtitle));
        PdfPCell arrowCell = new PdfPCell(new Paragraph(">>", fontTitle));
        arrowCell.setBorder(Rectangle.NO_BORDER);
        arrowCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        arrowCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        routeTable.addCell(arrowCell);
        routeTable.addCell(createRouteCell(destCode, dest, Element.ALIGN_RIGHT, fontTitle, fontSubtitle));

        document.add(routeTable);
        document.add(new Paragraph("\n"));

        // --- MAIN TICKET CARD ---
        PdfPTable mainCard = new PdfPTable(2);
        mainCard.setWidthPercentage(100);
        mainCard.setSpacingBefore(10);

        // Header of Card
        PdfPCell cardHeader = new PdfPCell(new Phrase("THÔNG TIN CHI TIẾT TICKET", fontWhite));
        cardHeader.setBackgroundColor(PRIMARY_COLOR);
        cardHeader.setColspan(2);
        cardHeader.setPadding(10);
        cardHeader.setBorder(Rectangle.NO_BORDER);
        mainCard.addCell(cardHeader);

        // Row 1: Flight & Date
        addPremiumCell(mainCard, "Số hiệu chuyến bay", cb != null ? "VN-" + cb.getMaChuyenBay() : "N/A", fontLabel, fontValue);
        addPremiumCell(mainCard, "Ngày khởi hành", cb != null ? cb.getNgayGioKhoiHanh().format(DATE_FORMAT) : "N/A", fontLabel, fontValue);

        // Row 2: Time & Seat
        addPremiumCell(mainCard, "Giờ lên máy bay", cb != null ? cb.getNgayGioKhoiHanh().format(TIME_FORMAT) : "N/A", fontLabel, fontValue);
        addPremiumCell(mainCard, "Số ghế (Seat)", ve.getSoGhe() != null ? ve.getSoGhe() : "CHỜ XẾP", fontLabel, fontValue);

        // Row 3: Class & Passenger Name
        addPremiumCell(mainCard, "Hạng vé (Class)", ve.getMaHangVe() != null ? ve.getMaHangVe().getTenHangVe() : "N/A", fontLabel, fontValue);
        addPremiumCell(mainCard, "Hành khách", ve.getHoTenHK(), fontLabel, fontValue);

        // Row 4: ID
        PdfPCell idFullCell = new PdfPCell();
        idFullCell.setColspan(2);
        idFullCell.setPadding(10);
        idFullCell.setBorderColor(Color.LIGHT_GRAY);
        Paragraph pid = new Paragraph("CCCD / HỘ CHIẾU (IDENTIFICATION)\n", fontLabel);
        pid.add(new Chunk(ve.getCccd(), fontValue));
        idFullCell.addElement(pid);
        mainCard.addCell(idFullCell);

        document.add(mainCard);

        // --- PRICING SECTION ---
        document.add(new Paragraph("\n"));
        PdfPTable priceTable = new PdfPTable(1);
        priceTable.setWidthPercentage(45);
        priceTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

        NumberFormat vnFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        vnFormat.setCurrency(Currency.getInstance("VND"));
        
        PdfPCell priceCell = new PdfPCell();
        priceCell.setBackgroundColor(SECONDARY_COLOR);
        priceCell.setPadding(15);
        priceCell.setBorderColor(PRIMARY_COLOR);
        priceCell.setBorderWidth(1f);
        
        Paragraph pTitle = new Paragraph("TỔNG TIỀN THANH TOÁN", fontLabel);
        pTitle.setAlignment(Element.ALIGN_RIGHT);
        pTitle.setSpacingAfter(5);
        priceCell.addElement(pTitle);
        
        Paragraph pAmount = new Paragraph(vnFormat.format(ve.getGiaVe() != null ? ve.getGiaVe() : BigDecimal.ZERO), fontTitle);
        pAmount.setAlignment(Element.ALIGN_RIGHT);
        priceCell.addElement(pAmount);
        
        priceTable.addCell(priceCell);
        
        document.add(priceTable);

        // --- FOOTER / TERMS ---
        document.add(new Paragraph("\n\n"));
        LineSeparator ls = new LineSeparator();
        ls.setLineColor(Color.LIGHT_GRAY);
        document.add(ls);
        
        Paragraph footer = new Paragraph("Lưu ý quan trọng (Important Notes):\n", fontLabel);
        footer.setSpacingBefore(10);
        footer.add(new Chunk("- Vui lòng có mặt tại quầy thủ tục ít nhất 120 phút trước giờ bay.\n", fontTiny));
        footer.add(new Chunk("- Mang theo vé điện tử này (bản in hoặc điện thoại) và giấy tờ tùy thân hợp lệ.\n", fontTiny));
        footer.add(new Chunk("- Cửa ra máy bay sẽ đóng 20 phút trước giờ khởi hành dự kiến.\n", fontTiny));
        footer.add(new Chunk("- Chúc quý khách có một chuyến bay tốt đẹp cùng FlyViet Airlines!", fontTiny));
        footer.setAlignment(Element.ALIGN_LEFT);
        document.add(footer);

        document.close();
    }

    private PdfPCell createRouteCell(String code, String city, int align, Font fontBig, Font fontSmall) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(align);
        
        Paragraph p = new Paragraph(code + "\n", fontBig);
        p.add(new Chunk(city, fontSmall));
        p.setAlignment(align);
        
        cell.addElement(p);
        return cell;
    }

    private void addPremiumCell(PdfPTable table, String label, String value, Font fLabel, Font fValue) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(10);
        cell.setBorderColor(Color.LIGHT_GRAY);
        
        Paragraph p = new Paragraph(label.toUpperCase() + "\n", fLabel);
        p.add(new Chunk(value != null ? value : "", fValue));
        
        cell.addElement(p);
        table.addCell(cell);
    }
}
