package com.flight.ticket.service;

import com.flight.ticket.model.HangHangKhong;
import com.flight.ticket.repository.HangHangKhongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AirlineService {
    @Autowired
    private HangHangKhongRepository airlineRepository;

    public List<HangHangKhong> getAllAirlines() {
        return airlineRepository.findAll();
    }
}
