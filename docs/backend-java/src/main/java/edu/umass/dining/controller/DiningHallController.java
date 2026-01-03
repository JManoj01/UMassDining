package edu.umass.dining.controller;

import edu.umass.dining.dto.DiningHallDTO;
import edu.umass.dining.service.DiningHallService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dining-halls")
@RequiredArgsConstructor
public class DiningHallController {
    private final DiningHallService diningHallService;

    @GetMapping
    public List<DiningHallDTO> getAllDiningHalls() {
        return diningHallService.getAllDiningHalls();
    }
}
