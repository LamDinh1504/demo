package com.flight.ticket.controller;

import com.flight.ticket.model.QuyDinh;
import com.flight.ticket.service.QuyDinhService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quy-dinh")
@CrossOrigin(origins = "*", maxAge = 3600)
public class QuyDinhController {
    @Autowired
    private QuyDinhService quyDinhService;

    @GetMapping
    public QuyDinh getQuyDinh() {
        return quyDinhService.getQuyDinh();
    }

    @PutMapping
    public QuyDinh updateQuyDinh(@RequestBody QuyDinh newQuyDinh) {
        return quyDinhService.updateQuyDinh(newQuyDinh);
    }
}
