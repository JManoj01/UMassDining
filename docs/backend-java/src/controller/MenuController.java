package com.umassdining.controller;

import com.umassdining.dto.MenuItemDTO;
import com.umassdining.enums.MealType;
import com.umassdining.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MenuController {

    private final MenuService menuService;

    /**
     * GET /api/menus
     * Get menu items with optional filters
     * 
     * Query params:
     * - date: Menu date (default: today)
     * - hall: Dining hall ID
     * - mealType: BREAKFAST, LUNCH, DINNER
     */
    @GetMapping
    public ResponseEntity<List<MenuItemDTO>> getMenuItems(
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String hall,
            @RequestParam(required = false) MealType mealType) {
        
        LocalDate menuDate = date != null ? date : LocalDate.now();
        List<MenuItemDTO> items = menuService.getMenuItems(menuDate, hall, mealType);
        return ResponseEntity.ok(items);
    }

    /**
     * GET /api/menus/search
     * Search menu items by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<MenuItemDTO>> searchMenu(@RequestParam String q) {
        List<MenuItemDTO> items = menuService.searchMenu(q);
        return ResponseEntity.ok(items);
    }

    /**
     * GET /api/menus/filtered
     * Get menu items filtered by dietary preferences
     */
    @GetMapping("/filtered")
    public ResponseEntity<List<MenuItemDTO>> getFilteredMenu(
            @RequestParam(required = false) List<String> include,
            @RequestParam(required = false) List<String> exclude) {
        List<MenuItemDTO> items = menuService.getFilteredMenu(include, exclude);
        return ResponseEntity.ok(items);
    }

    /**
     * GET /api/menus/today
     * Get all of today's menu items
     */
    @GetMapping("/today")
    public ResponseEntity<List<MenuItemDTO>> getTodaysMenu() {
        List<MenuItemDTO> items = menuService.getTodaysMenu();
        return ResponseEntity.ok(items);
    }
}
