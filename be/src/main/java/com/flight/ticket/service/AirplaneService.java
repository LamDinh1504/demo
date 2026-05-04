package com.flight.ticket.service;

import com.flight.ticket.model.MayBay;
import com.flight.ticket.repository.MayBayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AirplaneService {
    @Autowired
    private MayBayRepository airplaneRepository;

    public List<MayBay> getAllAirplanes() {
        return airplaneRepository.findAll();
    }
}
