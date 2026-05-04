package com.flight.ticket.controller;

import com.flight.ticket.dto.FlightDto;
import com.flight.ticket.model.ChuyenBay;
import com.flight.ticket.service.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FlightController {

    @Autowired
    private FlightService flightService;

    @GetMapping
    public List<FlightDto> getAllFlights() {
        return flightService.getAllFlights();
    }

    @GetMapping("/search")
    public List<FlightDto> searchFlights(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Boolean isDirect,
            @RequestParam(required = false) Integer airlineId) {
        return flightService.searchFlights(origin, destination, date, isDirect, airlineId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightDto> getFlightById(@PathVariable Integer id) {
        return flightService.getFlightById(id)
                .map(f -> ResponseEntity.ok(flightService.mapToDto(f)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ChuyenBay createFlight(@RequestBody ChuyenBay flight) {
        return flightService.createFlight(flight);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChuyenBay> updateFlight(@PathVariable Integer id,
            @RequestBody ChuyenBay flightDetails) {
        return ResponseEntity.ok(flightService.updateFlight(id, flightDetails));
    }

    @PostMapping("/create")
    public ChuyenBay createFlightComplex(@RequestBody com.flight.ticket.dto.CreateFlightDto flightDto) {
        return flightService.createFlightComplex(flightDto);
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ChuyenBay> updateFlightComplex(@PathVariable Integer id,
            @RequestBody com.flight.ticket.dto.CreateFlightDto flightDetails) {
        return ResponseEntity.ok(flightService.updateFlightComplex(id, flightDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable Integer id) {
        flightService.deleteFlight(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/booked-seats")
    public ResponseEntity<List<String>> getBookedSeats(@PathVariable Integer id) {
        return ResponseEntity.ok(flightService.getBookedSeats(id));
    }
}