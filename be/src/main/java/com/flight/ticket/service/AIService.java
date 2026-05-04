package com.flight.ticket.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class AIService {

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.model}")
    private String model;

    @Value("${ai.url}")
    private String apiUrl;

    public String getChatResponse(String userMessage) {
        RestTemplate restTemplate = new RestTemplate();

        // System Instruction to set the persona
        String systemInstruction = "Bạn là trợ lý ảo của hệ thống đặt vé máy bay Fly Viet. " +
                "Nhiệm vụ của bạn là hỗ trợ khách hàng tìm kiếm chuyến bay, giải đáp thắc mắc về giá vé, quy định hành lý và các dịch vụ khác. " +
                "Hãy trả lời một cách lịch sự, chuyên nghiệp và thân thiện bằng tiếng Việt. " +
                "Nếu không biết thông tin cụ thể, hãy hướng dẫn khách hàng liên hệ hotline 1900-1234.";

        // Build OpenAI-compatible Request Structure (used by OpenRouter)
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        
        List<Map<String, String>> messages = new ArrayList<>();
        
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemInstruction);
        messages.add(systemMessage);
        
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);
        
        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        // OpenRouter specific headers (optional but recommended)
        headers.set("HTTP-Referer", "http://localhost:3000"); // Update with your site URL
        headers.set("X-Title", "Fly Viet Assistant");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            System.out.println("Calling OpenRouter API for model: " + model);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Xin lỗi, hiện tại tôi đang gặp chút trục trặc kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hỗ trợ. Chi tiết: " + e.getMessage();
        }

        return "Tôi không thể xử lý yêu cầu này ngay bây giờ.";
    }
}
