package com.flight.ticket.controller;

import com.flight.ticket.dto.KhuyenMaiDto;
import com.flight.ticket.service.KhuyenMaiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class KhuyenMaiController {

    @Autowired
    private KhuyenMaiService khuyenMaiService;

    @GetMapping
    public List<KhuyenMaiDto> getAllPromotions() {
        return khuyenMaiService.getAllPromotions();
    }

    @GetMapping("/active")
    public List<KhuyenMaiDto> getActivePromotions() {
        return khuyenMaiService.getActivePromotions();
    }
}
