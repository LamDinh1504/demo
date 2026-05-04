package com.flight.ticket.repository;

import com.flight.ticket.model.HangHangKhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HangHangKhongRepository extends JpaRepository<HangHangKhong, Integer> {
}
