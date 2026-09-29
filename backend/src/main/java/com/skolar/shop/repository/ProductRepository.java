package com.skolar.shop.repository;

import com.skolar.shop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
            select p from Product p
            where (:slug is null or p.category.slug = :slug)
              and (:offersOnly = false or p.discountPercent > 0)
              and (:q is null or lower(p.name) like lower(concat('%', :q, '%'))
                   or lower(p.description) like lower(concat('%', :q, '%')))
            order by p.featured desc, p.discountPercent desc, p.createdAt desc
            """)
    List<Product> search(@Param("slug") String slug, @Param("q") String q, @Param("offersOnly") boolean offersOnly);

    long countByStockLessThanEqual(int threshold);

    long countByDiscountPercentGreaterThan(int percent);

    long countByCategoryId(Long categoryId);
}
