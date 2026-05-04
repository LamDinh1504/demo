package com.flight.ticket.dto;

import lombok.Data;

@Data
public class PaymentRequestDto {
    private double amount;
    private Long bookingId; // Or other identifiers
}
