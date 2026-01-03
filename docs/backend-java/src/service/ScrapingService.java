package com.umassdining.service;

import com.umassdining.model.MenuItem;
import com.umassdining.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScrapingService {

    private final MenuItemRepository menuItemRepository;

    private static final Map<String, String> DINING_HALLS = Map.of(
        "worcester", "https://umassdining.com/locations-menus/worcester",
        "franklin", "https://umassdining.com/locations-menus/franklin",
        "berkshire", "https://umassdining.com/locations-menus/berkshire",
        "hampshire", "https://umassdining.com/locations-menus/hampshire"
    );

    private static final List<Pattern> FOOD_PATTERNS = Arrays.asList(
        Pattern.compile("\\b(chicken|beef|pork|fish|salmon|tofu|turkey)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(pizza|pasta|burger|sandwich|wrap|salad|soup|rice|curry)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(eggs?|pancakes?|waffles?|oatmeal|bacon)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(grilled|roasted|baked|fried|steamed)\\b", Pattern.CASE_INSENSITIVE)
    );

    private static final List<String> MEAT_KEYWORDS = Arrays.asList(
        "beef", "chicken", "pork", "bacon", "ham", "sausage", "pepperoni",
        "turkey", "lamb", "steak", "meatball", "prosciutto", "salami"
    );

    private static final List<String> SEAFOOD_KEYWORDS = Arrays.asList(
        "fish", "salmon", "tuna", "shrimp", "crab", "lobster", "clam"
    );

    private static final List<String> DAIRY_KEYWORDS = Arrays.asList(
        "milk", "cheese", "butter", "cream", "yogurt", "mozzarella", "cheddar"
    );

    /**
     * Scheduled scraping job - runs daily at 6 AM
     */
    @Scheduled(cron = "${scraping.schedule.cron:0 0 6 * * *}")
    public void scheduledScrape() {
        log.info("Starting scheduled menu scrape");
        scrapeAllHalls();
    }

    /**
     * Scrape all dining halls
     */
    public List<MenuItem> scrapeAllHalls() {
        List<MenuItem> allItems = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Check if already scraped today
        if (menuItemRepository.existsByMenuDate(today)) {
            log.info("Menu already exists for today, skipping scrape");
            return allItems;
        }

        for (Map.Entry<String, String> hall : DINING_HALLS.entrySet()) {
            try {
                List<MenuItem> items = scrapeHall(hall.getKey(), hall.getValue(), today);
                allItems.addAll(items);
                log.info("Scraped {} items from {}", items.size(), hall.getKey());
                
                // Rate limiting
                Thread.sleep(2000);
            } catch (Exception e) {
                log.error("Error scraping {}: {}", hall.getKey(), e.getMessage());
            }
        }

        if (!allItems.isEmpty()) {
            menuItemRepository.saveAll(allItems);
            log.info("Saved {} total menu items", allItems.size());
        }

        return allItems;
    }

    /**
     * Scrape a single dining hall
     */
    private List<MenuItem> scrapeHall(String hallId, String url, LocalDate date) throws IOException {
        List<MenuItem> items = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        Document doc = Jsoup.connect(url)
            .userAgent("UMass Dining Recommendation Bot/1.0")
            .timeout(30000)
            .get();

        String currentMeal = "dinner";
        String currentCategory = "Entrees";

        // Parse menu sections
        Elements sections = doc.select(".menu-section, .meal-section, .food-item, p, li");

        for (Element element : sections) {
            String text = element.text().trim();

            // Detect meal type
            if (text.toLowerCase().contains("breakfast")) currentMeal = "breakfast";
            else if (text.toLowerCase().contains("lunch")) currentMeal = "lunch";
            else if (text.toLowerCase().contains("dinner")) currentMeal = "dinner";

            // Detect category
            currentCategory = detectCategory(text, currentCategory);

            // Check if this looks like a food item
            if (isLikelyFoodItem(text)) {
                String key = hallId + "-" + currentMeal + "-" + text.toLowerCase();
                if (!seen.contains(key)) {
                    seen.add(key);

                    MenuItem item = new MenuItem();
                    item.setName(text);
                    item.setDiningHallId(hallId);
                    item.setMealType(MenuItem.MealType.valueOf(currentMeal.toUpperCase()));
                    item.setCategory(currentCategory);
                    item.setMenuDate(date);
                    item.setTags(inferDietaryTags(text));

                    items.add(item);
                }
            }
        }

        return items;
    }

    private boolean isLikelyFoodItem(String text) {
        if (text.length() < 4 || text.length() > 80) return false;
        return FOOD_PATTERNS.stream().anyMatch(p -> p.matcher(text).find());
    }

    private String detectCategory(String text, String current) {
        String lower = text.toLowerCase();
        if (lower.contains("grill")) return "Grill";
        if (lower.contains("pizza")) return "Pizza";
        if (lower.contains("pasta") || lower.contains("italian")) return "Pasta";
        if (lower.contains("salad")) return "Salad Bar";
        if (lower.contains("deli")) return "Deli";
        if (lower.contains("dessert") || lower.contains("bakery")) return "Desserts";
        if (lower.contains("international") || lower.contains("global")) return "Global";
        return current;
    }

    private List<String> inferDietaryTags(String text) {
        List<String> tags = new ArrayList<>();
        String lower = text.toLowerCase();

        boolean hasMeat = MEAT_KEYWORDS.stream().anyMatch(lower::contains);
        boolean hasSeafood = SEAFOOD_KEYWORDS.stream().anyMatch(lower::contains);
        boolean hasDairy = DAIRY_KEYWORDS.stream().anyMatch(lower::contains);

        if (!hasMeat && !hasSeafood) {
            tags.add("vegetarian");
            if (!hasDairy && !lower.contains("egg")) {
                tags.add("vegan");
                tags.add("dairy-free");
            }
        }

        if (lower.contains("gluten-free") || lower.contains("gf")) {
            tags.add("gluten-free");
        }

        return tags;
    }
}
