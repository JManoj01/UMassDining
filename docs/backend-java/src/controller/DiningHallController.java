package com.umassdining.controller;

import com.umassdining.model.DiningHall;
import com.umassdining.repository.DiningHallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dining-halls")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DiningHallController {

    private final DiningHallRepository diningHallRepository;

    /**
     * GET /api/dining-halls
     * Get all dining halls
     */
    @GetMapping
    public ResponseEntity<List<DiningHall>> getAllDiningHalls() {
        List<DiningHall> halls = diningHallRepository.findAll();
        return ResponseEntity.ok(halls);
    }

    /**
     * GET /api/dining-halls/{id}
     * Get a specific dining hall by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<DiningHall> getDiningHall(@PathVariable String id) {
        return diningHallRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/dining-halls/search
     * Search dining halls by location
     */
    @GetMapping("/search")
    public ResponseEntity<List<DiningHall>> searchByLocation(@RequestParam String location) {
        List<DiningHall> halls = diningHallRepository.findByLocationContainingIgnoreCase(location);
        return ResponseEntity.ok(halls);
    }
}
