package com.flight.ticket.controller;

import com.flight.ticket.dto.PaymentRequestDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import com.flight.ticket.repository.DatVeRepository;
import com.flight.ticket.model.DatVe;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @Autowired
    private DatVeRepository datVeRepository;

    @PostMapping("/vnpay")
    public ResponseEntity<?> createVnpayPayment(@RequestBody PaymentRequestDto paymentDTO, HttpServletRequest request) {
        String vnp_TmnCode = "OLZU4JLT";
        String vnp_HashSecret = "ERSNK23MUZJ8QTKM76LPWN07W7X1D3LM";
        String vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        String vnp_ReturnUrl = "http://localhost:5173/payment/vnpay-return";

        // Random số cho TxnRef (kèm bookingId để dễ xử lý)
        String vnp_TxnRef = paymentDTO.getBookingId() + "_" + String.valueOf(10000000 + new Random().nextInt(90000000));
        // Lấy IP
        String ipAddr = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(ipAddr)) {
            ipAddr = "127.0.0.1";
        }

        // Tạo ngày giờ tạo và hết hạn theo múi giờ Việt Nam (GMT+7)
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String vnp_CreateDate = now.format(formatter);
        String vnp_ExpireDate = now.plusMinutes(15).format(formatter);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf((long) (paymentDTO.getAmount() * 100)));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang #" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", ipAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Sắp xếp tham số theo thứ tự alphabet
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        boolean first = true;
        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                if (!first) {
                    hashData.append('&');
                    query.append('&');
                }
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(fieldValue);

                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8).replace("+", "%20"));

                first = false;
            }
        }

        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData.toString()).toUpperCase();
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);

        String paymentUrl = vnp_Url + "?" + query.toString();

        System.out.println("VNPay CreateDate: " + vnp_CreateDate);
        System.out.println("VNPay ExpireDate: " + vnp_ExpireDate);
        System.out.println("VNPay Payment URL: " + paymentUrl);

        Map<String, Object> result = new HashMap<>();
        result.put("code", "00");
        result.put("message", "success");
        result.put("data", paymentUrl);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(HttpServletRequest request) {
        try {
            String vnp_HashSecret = "ERSNK23MUZJ8QTKM76LPWN07W7X1D3LM";
            Map<String, String> fields = new HashMap<>();
            for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = params.nextElement();
                String fieldValue = request.getParameter(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            if (fields.containsKey("vnp_SecureHashType")) {
                fields.remove("vnp_SecureHashType");
            }
            if (fields.containsKey("vnp_SecureHash")) {
                fields.remove("vnp_SecureHash");
            }

            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();

            boolean first = true;
            for (String fieldName : fieldNames) {
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    if (!first) {
                        hashData.append('&');
                    }
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(fieldValue);
                    first = false;
                }
            }

            String signValue = hmacSHA512(vnp_HashSecret, hashData.toString()).toUpperCase();
            if (signValue.equals(vnp_SecureHash)) {
                if ("00".equals(request.getParameter("vnp_ResponseCode"))) {
                    // Thanh toan thanh cong
                    String vnp_TxnRef = request.getParameter("vnp_TxnRef");
                    try {
                        String[] parts = vnp_TxnRef.split("_");
                        int bookingId = Integer.parseInt(parts[0]);
                        DatVe datVe = datVeRepository.findById(bookingId).orElse(null);
                        if (datVe != null && "Chưa thanh toán".equals(datVe.getTrangThai())) {
                            datVe.setTrangThai("Đã thanh toán");
                            datVeRepository.save(datVe);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return ResponseEntity.ok(Map.of("code", "00", "message", "success"));
                } else {
                    return ResponseEntity.ok(Map.of("code", "01", "message", "failed"));
                }
            } else {
                return ResponseEntity.ok(Map.of("code", "97", "message", "invalid signature"));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("code", "99", "message", "unknown error"));
        }
    }

    // Hàm tạo chữ ký HMAC SHA512
    public static String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (Exception ex) {
            return "";
        }
    }
}
