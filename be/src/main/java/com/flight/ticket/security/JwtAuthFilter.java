package com.flight.ticket.security;

import com.flight.ticket.model.NguoiDung;
import com.flight.ticket.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;


@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/") || 
               path.startsWith("/api/hangve") || 
               path.startsWith("/api/airports") || 
               path.startsWith("/api/airlines") || 
               path.startsWith("/api/airplanes") ||
               path.startsWith("/api/bookings") ||
               path.startsWith("/api/revenue") ||
               path.startsWith("/api/quy-dinh") ||
               path.startsWith("/api/promotions");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        try {
            String jwt = parseJwt(request);
            System.out.println("[DEBUG] Processing " + method + " " + path);
            
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String email = jwtUtils.getUserNameFromJwtToken(jwt);
                System.out.println("[DEBUG] Valid Token for email: " + email);

                Optional<NguoiDung> userOpt = userRepository.findByEmail(email);
                List<SimpleGrantedAuthority> authorities;
                
                if (userOpt.isPresent()) {
                    NguoiDung user = userOpt.get();
                    String role = (user.getVaitro() != null && !user.getVaitro().isEmpty()) 
                                    ? user.getVaitro().trim().toUpperCase() 
                                    : "CLIENT";
                    System.out.println("[DEBUG] Found User in DB. Role: " + role);
                    authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
                } else {
                    System.out.println("[DEBUG] User email from token NOT found in DB. Falling back to ROLE_CLIENT.");
                    authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_CLIENT"));
                }

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("[DEBUG] SecurityContext set for " + email + " with " + authorities);
            } else if (jwt == null && !path.startsWith("/api/auth/")) {
                System.out.println("[DEBUG] No Token found in request header for protected path: " + path);
                System.out.println("[DEBUG] Authorization header value: " + request.getHeader("Authorization"));
            }
        } catch (Exception e) {
            System.err.println("[ERROR] JwtAuthFilter Error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
