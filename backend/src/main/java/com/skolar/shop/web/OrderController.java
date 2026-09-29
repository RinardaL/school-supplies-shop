package com.skolar.shop.web;

import com.skolar.shop.dto.Dtos.OrderItemRequest;
import com.skolar.shop.dto.Dtos.OrderRequest;
import com.skolar.shop.dto.Dtos.StatusRequest;
import com.skolar.shop.model.CustomerOrder;
import com.skolar.shop.model.OrderItem;
import com.skolar.shop.model.Product;
import com.skolar.shop.repository.OrderRepository;
import com.skolar.shop.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orders;
    private final ProductRepository products;

    public OrderController(OrderRepository orders, ProductRepository products) {
        this.orders = orders;
        this.products = products;
    }

    /** Public: place an order from the storefront cart. Stock is checked and reduced. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public CustomerOrder place(@Valid @RequestBody OrderRequest req) {
        CustomerOrder order = new CustomerOrder();
        order.setCustomerName(req.customerName().trim());
        order.setEmail(req.email().trim());
        order.setPhone(req.phone());
        order.setAddress(req.address().trim());
        order.setNote(req.note());

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest item : req.items()) {
            Product p = products.findById(item.productId())
                    .orElseThrow(() -> new ApiExceptionHandler.BadRequest("A product in your cart no longer exists"));
            if (p.getStock() < item.quantity()) {
                throw new ApiExceptionHandler.BadRequest("Only " + p.getStock() + " left of \"" + p.getName() + "\"");
            }
            p.setStock(p.getStock() - item.quantity());
            OrderItem line = new OrderItem(p, item.quantity());
            order.addItem(line);
            total = total.add(line.getLineTotal());
        }
        order.setTotal(total);
        return orders.save(order);
    }

    // ----- admin -----

    @GetMapping
    public List<CustomerOrder> all() {
        return orders.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public CustomerOrder one(@PathVariable Long id) {
        return orders.findById(id).orElseThrow(() -> new ApiExceptionHandler.NotFound("Order not found"));
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public CustomerOrder setStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest req) {
        CustomerOrder order = orders.findById(id).orElseThrow(() -> new ApiExceptionHandler.NotFound("Order not found"));
        CustomerOrder.Status next;
        try {
            next = CustomerOrder.Status.valueOf(req.status().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new ApiExceptionHandler.BadRequest("Unknown status: " + req.status());
        }
        // Cancelling puts the items back on the shelf.
        if (next == CustomerOrder.Status.CANCELLED && order.getStatus() != CustomerOrder.Status.CANCELLED) {
            for (OrderItem line : order.getItems()) {
                Product p = line.getProduct();
                if (p != null) {
                    p.setStock(p.getStock() + line.getQuantity());
                }
            }
        }
        order.setStatus(next);
        return orders.save(order);
    }
}
