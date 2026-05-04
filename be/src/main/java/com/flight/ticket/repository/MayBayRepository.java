package com.flight.ticket.repository;

import com.flight.ticket.model.MayBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MayBayRepository extends JpaRepository<MayBay, Integer> {
}
