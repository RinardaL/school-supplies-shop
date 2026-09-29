package com.skolar.shop.web;

import com.skolar.shop.dto.Dtos.CategoryRequest;
import com.skolar.shop.model.Category;
import com.skolar.shop.repository.CategoryRepository;
import com.skolar.shop.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categories;
    private final ProductRepository products;

    public CategoryController(CategoryRepository categories, ProductRepository products) {
        this.categories = categories;
        this.products = products;
    }

    public static String slugify(String name) {
        String n = Normalizer.normalize(name, Normalizer.Form.NFD).replaceAll("[^\\p{ASCII}]", "");
        return n.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    @GetMapping
    public List<Category> all() {
        return categories.findAllByOrderByNameAsc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category create(@Valid @RequestBody CategoryRequest req) {
        String slug = slugify(req.name());
        if (categories.findBySlug(slug).isPresent()) {
            throw new ApiExceptionHandler.BadRequest("A category with this name already exists");
        }
        return categories.save(new Category(req.name().trim(), slug, req.emoji()));
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @Valid @RequestBody CategoryRequest req) {
        Category c = categories.findById(id).orElseThrow(() -> new ApiExceptionHandler.NotFound("Category not found"));
        c.setName(req.name().trim());
        c.setSlug(slugify(req.name()));
        c.setEmoji(req.emoji());
        return categories.save(c);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Category c = categories.findById(id).orElseThrow(() -> new ApiExceptionHandler.NotFound("Category not found"));
        if (products.countByCategoryId(id) > 0) {
            throw new ApiExceptionHandler.BadRequest("Move or delete the products in this category first");
        }
        categories.delete(c);
    }
}
