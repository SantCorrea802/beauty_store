package com.gabriela.store.health;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "ok",
                "service", "hajuvi-backend"
        );
    }

    @GetMapping("/api/health/db")
    public ResponseEntity<Map<String, String>> databaseHealth() {
        try {
            Integer result = jdbcTemplate.queryForObject(
                    "SELECT 1",
                    Integer.class
            );

            if (!Integer.valueOf(1).equals(result)) {
                return databaseUnavailable();
            }

            return ResponseEntity.ok(Map.of(
                    "status", "ok",
                    "service", "hajuvi-backend",
                    "database", "ok"
            ));
        } catch (DataAccessException ex) {
            return databaseUnavailable();
        }
    }

    private ResponseEntity<Map<String, String>> databaseUnavailable() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "status", "error",
                        "service", "hajuvi-backend",
                        "database", "unavailable"
                ));
    }
}