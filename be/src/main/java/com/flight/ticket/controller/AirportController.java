package com.flight.ticket.controller;

import com.flight.ticket.dto.AirportDto;
import com.flight.ticket.model.SanBay;
import com.flight.ticket.service.AirportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/airports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AirportController {

    @Autowired
    private AirportService airportService;

    @GetMapping
    public List<AirportDto> getAllAirports() {
        return airportService.getAllAirports();
    }

    @PostMapping
    public AirportDto addAirport(@RequestBody AirportDto airportDto) {
        return airportService.addAirport(airportDto);
    }

    @PutMapping("/{id}")
    public AirportDto updateAirport(@PathVariable int id, @RequestBody AirportDto airportDto) {
        return airportService.updateAirport(id, airportDto);
    }

    @DeleteMapping("/{id}")
    public void deleteAirport(@PathVariable int id) {
        airportService.deleteAirport(id);
    }
}
