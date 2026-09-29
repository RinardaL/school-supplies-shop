package com.skolar.shop.web;

import com.skolar.shop.dto.Dtos.ProductRequest;
import com.skolar.shop.model.Category;
import com.skolar.shop.model.Product;
import com.skolar.shop.repository.CategoryRepository;
import com.skolar.shop.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository products;
    private final CategoryRepository categories;

    public ProductController(ProductRepository products, CategoryRepository categories) {
        this.products = products;
        this.categories = categories;
    }

    /** Public: list products, optionally filtered by category slug and search text. */
    @GetMapping
    public List<Product> list(@RequestParam(required = false) String category,
                              @RequestParam(required = false) String q) {
        String slug = (category == null || category.isBlank()) ? null : category;
        String term = (q == null || q.isBlank()) ? null : q.trim();
        return products.search(slug, term);
    }

    @GetMapping("/{id}")
    public Product one(@PathVariable Long id) {
        return products.findById(id).orElseThrow(() -> new ApiExceptionHandler.NotFound("Product not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@Valid @RequestBody ProductRequest req) {
        Product p = new Product();
        apply(p, req);
        return products.save(p);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        Product p = products.findById(id).orElseThrow(() -> new ApiExceptionHandler.NotFound("Product not found"));
        apply(p, req);
        return products.save(p);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Product p = products.findById(id).orElseThrow(() -> new ApiExceptionHandler.NotFound("Product not found"));
        products.delete(p);
    }

    private void apply(Product p, ProductRequest req) {
        p.setName(req.name().trim());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setStock(req.stock());
        p.setEmoji(req.emoji() == null || req.emoji().isBlank() ? "📦" : req.emoji());
        p.setColor(req.color() == null || req.color().isBlank() ? "#E0E7FF" : req.color());
        p.setImageUrl(req.imageUrl() == null || req.imageUrl().isBlank() ? null : req.imageUrl().trim());
        p.setFeatured(Boolean.TRUE.equals(req.featured()));
        if (req.categoryId() != null) {
            Category c = categories.findById(req.categoryId())
                    .orElseThrow(() -> new ApiExceptionHandler.BadRequest("Category not found"));
            p.setCategory(c);
        } else {
            p.setCategory(null);
        }
    }
}
