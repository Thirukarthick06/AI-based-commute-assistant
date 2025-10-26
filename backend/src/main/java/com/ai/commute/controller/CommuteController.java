package com.ai.commute.controller;

import com.ai.commute.model.AnalyzeResponse;
import com.ai.commute.model.SuggestionRequest;
import com.ai.commute.service.AnalyzeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CommuteController {

    private final AnalyzeService service;

    public CommuteController(AnalyzeService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status","ok","time", Instant.now().toString());
    }

    @PostMapping("/commute/analyze")
    public ResponseEntity<AnalyzeResponse> analyze(@RequestBody SuggestionRequest req) {
        if (req == null || req.from() == null || req.to() == null || req.from().isBlank() || req.to().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return ResponseEntity.ok(service.analyze(req));
        } catch (Exception e) {
            return ResponseEntity.status(502).build();
        }
    }
}
