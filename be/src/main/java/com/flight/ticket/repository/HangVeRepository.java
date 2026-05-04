package com.flight.ticket.repository;

import com.flight.ticket.model.HangVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HangVeRepository extends JpaRepository<HangVe, Integer> {
}
