package com.flight.ticket.controller;

import com.flight.ticket.model.CT_DatVe;
import com.flight.ticket.repository.CT_DatVeRepository;
import com.flight.ticket.service.TicketPdfService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*") // Adjust to your frontend URL
public class TicketController {

    @Autowired
    private CT_DatVeRepository ticketRepository;

    @Autowired
    private TicketPdfService ticketPdfService;

    @GetMapping("/download/{maVe}")
    public void downloadTicket(@PathVariable int maVe, HttpServletResponse response) throws IOException {
        CT_DatVe ve = ticketRepository.findById(maVe)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé với mã: " + maVe));

        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=Ticket_" + maVe + ".pdf";
        response.setHeader(headerKey, headerValue);

        ticketPdfService.generateTicketPdf(ve, response);
    }
}
