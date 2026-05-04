package com.flight.ticket.repository;

import com.flight.ticket.model.QuyDinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuyDinhRepository extends JpaRepository<QuyDinh, Integer> {
}
