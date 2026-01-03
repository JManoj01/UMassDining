package edu.umass.dining.controller;

import edu.umass.dining.dto.MenuItemDTO;
import edu.umass.dining.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {
    private final MenuService menuService;

    @GetMapping
    public List<MenuItemDTO> getMenus(
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String date,
            @RequestParam(value = "hall", required = false) Long hallId
    ) {
        String queryDate = (date != null) ? date : LocalDate.now().toString();
        return menuService.getMenus(queryDate, hallId);
    }
}
