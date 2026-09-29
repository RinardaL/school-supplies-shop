package com.skolar.shop.web;

import com.skolar.shop.model.CustomerOrder;
import com.skolar.shop.repository.OrderRepository;
import com.skolar.shop.repository.ProductRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AdminController {

    private final ProductRepository products;
    private final OrderRepository orders;

    public AdminController(ProductRepository products, OrderRepository orders) {
        this.products = products;
        this.orders = orders;
    }

    /** Lets the admin panel check a login without a dedicated session endpoint. */
    @GetMapping("/auth/me")
    public Map<String, Object> me(Authentication auth) {
        return Map.of(
                "username", auth.getName(),
                "roles", auth.getAuthorities().stream().map(Object::toString).toList());
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return Map.of(
                "products", products.count(),
                "lowStock", products.countByStockLessThanEqual(5),
                "orders", orders.count(),
                "newOrders", orders.countByStatus(CustomerOrder.Status.NEW),
                "revenue", orders.revenue());
    }
}
