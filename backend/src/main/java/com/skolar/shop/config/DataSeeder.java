package com.skolar.shop.config;

import com.skolar.shop.model.Category;
import com.skolar.shop.model.Product;
import com.skolar.shop.repository.CategoryRepository;
import com.skolar.shop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/** Fills an empty database with a small school-supplies catalogue. */
@Configuration
public class DataSeeder {

    @Value("${app.seed}")
    private boolean seed;

    @Bean
    CommandLineRunner seedData(CategoryRepository categories, ProductRepository products) {
        return args -> {
            if (!seed || categories.count() > 0) return;

            Map<String, Category> cats = new LinkedHashMap<>();
            cats.put("notebooks", categories.save(new Category("Notebooks & Paper", "notebooks", "📓")));
            cats.put("writing", categories.save(new Category("Pens & Pencils", "writing", "✏️")));
            cats.put("art", categories.save(new Category("Art Supplies", "art", "🎨")));
            cats.put("bags", categories.save(new Category("Backpacks & Cases", "bags", "🎒")));
            cats.put("math", categories.save(new Category("Math & Science", "math", "📐")));
            cats.put("organize", categories.save(new Category("Organization", "organize", "🗂️")));

            add(products, cats.get("notebooks"), "A4 Spiral Notebook, 120 pages", "Lined pages with a hard cover that survives a whole school year in a backpack.", "2.90", 120, "📓", "#FDE68A", true, 20);
            add(products, cats.get("notebooks"), "Squared Exercise Book, 5-pack", "Five 40-page squared exercise books for maths and science.", "4.50", 80, "📒", "#BBF7D0", false);
            add(products, cats.get("notebooks"), "Sticky Notes, 6 neon colours", "Six pads of 100 sheets. Sticks to books, walls and monitors.", "3.20", 150, "🗒️", "#FBCFE8", false);
            add(products, cats.get("writing"), "Ballpoint Pens, 10-pack (blue)", "Smooth-writing 0.7 mm pens with a comfortable rubber grip.", "3.80", 200, "🖊️", "#BFDBFE", true);
            add(products, cats.get("writing"), "HB Pencils, 12-pack", "Pre-sharpened wooden pencils with erasers. Break-resistant lead.", "2.40", 175, "✏️", "#FED7AA", false);
            add(products, cats.get("writing"), "Highlighter Set, 4 pastel colours", "Chisel tip, no bleed-through on thin paper.", "4.20", 90, "🖍️", "#D9F99D", false);
            add(products, cats.get("writing"), "Eraser & Sharpener Set", "Dust-free eraser and a two-hole metal sharpener with a lid.", "1.90", 140, "🧽", "#E9D5FF", false);
            add(products, cats.get("art"), "Watercolour Set, 24 colours", "Includes two brushes and a mixing palette in the lid.", "8.90", 45, "🎨", "#FECACA", true, 25);
            add(products, cats.get("art"), "Coloured Pencils, 36 colours", "Soft, blendable cores in a metal tin.", "9.50", 60, "🌈", "#A7F3D0", false, 30);
            add(products, cats.get("art"), "Glue Sticks, 3-pack", "Washable, solvent-free and safe for young students.", "2.60", 130, "🧴", "#FEF3C7", false);
            add(products, cats.get("art"), "Safety Scissors", "Rounded tips, stainless steel blades, fits left and right hands.", "2.30", 4, "✂️", "#C7D2FE", false);
            add(products, cats.get("bags"), "Classic School Backpack, 25 L", "Padded laptop sleeve, two bottle pockets and reflective strips.", "34.90", 18, "🎒", "#BAE6FD", true, 15);
            add(products, cats.get("bags"), "Pencil Case, double zip", "Two compartments with elastic loops for 20 pens.", "6.40", 70, "👝", "#FBCFE8", false);
            add(products, cats.get("bags"), "Lunch Bag, insulated", "Keeps lunch cool for five hours. Wipe-clean lining.", "11.90", 3, "🥪", "#FDE68A", false);
            add(products, cats.get("math"), "Scientific Calculator", "240 functions, two-line display, allowed in most exams.", "18.50", 25, "🧮", "#E0E7FF", true);
            add(products, cats.get("math"), "Geometry Set", "Ruler, two set squares, protractor and compass in a hard case.", "5.90", 55, "📐", "#CCFBF1", false);
            add(products, cats.get("organize"), "Ring Binder A4, 2 rings", "Holds 250 sheets. Available in navy blue.", "3.70", 65, "📁", "#DBEAFE", false);
            add(products, cats.get("organize"), "Index Dividers, 12 tabs", "Colour-coded tabs that fit any A4 binder.", "2.10", 95, "🔖", "#FCE7F3", false);
            add(products, cats.get("organize"), "Weekly Planner 2026/27", "One week per page, with exam and holiday trackers.", "7.80", 40, "📅", "#FEF9C3", false, 10);
        };
    }

    private static void add(ProductRepository repo, Category c, String name, String desc, String price,
                            int stock, String emoji, String color, boolean featured) {
        add(repo, c, name, desc, price, stock, emoji, color, featured, 0);
    }

    private static void add(ProductRepository repo, Category c, String name, String desc, String price,
                            int stock, String emoji, String color, boolean featured, int discount) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(new BigDecimal(price));
        p.setStock(stock);
        p.setEmoji(emoji);
        p.setColor(color);
        p.setFeatured(featured);
        p.setDiscountPercent(discount);
        p.setCategory(c);
        repo.save(p);
    }
}
