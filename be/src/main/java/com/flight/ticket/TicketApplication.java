package com.flight.ticket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TicketApplication {

	public static void main(String[] args) {
		// Fix for Render's automatic PostgreSQL connection string (adds missing jdbc: prefix)
		String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
		if (dbUrl != null && dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("jdbc:")) {
			System.setProperty("spring.datasource.url", "jdbc:" + dbUrl);
		}
		
		SpringApplication.run(TicketApplication.class, args);
	}

}
