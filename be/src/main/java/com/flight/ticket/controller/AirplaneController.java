package com.flight.ticket.controller;

import com.flight.ticket.model.MayBay;
import com.flight.ticket.service.AirplaneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/airplanes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AirplaneController {
    @Autowired
    private AirplaneService airplaneService;

    @GetMapping
    public List<MayBay> getAllAirplanes() {
        return airplaneService.getAllAirplanes();
    }
}
