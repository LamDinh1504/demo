package com.flight.ticket.controller;

import com.flight.ticket.model.HangHangKhong;
import com.flight.ticket.service.AirlineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/airlines")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AirlineController {
    @Autowired
    private AirlineService airlineService;

    @GetMapping
    public List<HangHangKhong> getAllAirlines() {
        return airlineService.getAllAirlines();
    }
}
