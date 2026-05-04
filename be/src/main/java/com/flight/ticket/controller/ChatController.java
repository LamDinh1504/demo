package com.flight.ticket.controller;

import com.flight.ticket.dto.ChatRequest;
import com.flight.ticket.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Update this with your frontend URL in production
public class ChatController {

    @Autowired
    private AIService aiService;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        String response = aiService.getChatResponse(request.getMessage());
        return ResponseEntity.ok(Map.of("reply", response));
    }
}
