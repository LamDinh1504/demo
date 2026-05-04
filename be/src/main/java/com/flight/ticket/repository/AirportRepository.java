package com.flight.ticket.repository;

import com.flight.ticket.model.SanBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AirportRepository extends JpaRepository<SanBay, Integer> {
}
