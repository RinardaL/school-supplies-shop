package com.skolar.shop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

/** Request bodies. Records keep them short; validation runs in the controllers. */
public final class Dtos {

    private Dtos() {}

    public record ProductRequest(
            @NotBlank @Size(max = 120) String name,
            @Size(max = 2000) String description,
            @NotNull @DecimalMin(value = "0.00") BigDecimal price,
            @NotNull @Min(0) Integer stock,
            @Size(max = 8) String emoji,
            @Size(max = 16) String color,
            @Size(max = 500) String imageUrl,
            Boolean featured,
            Long categoryId) {}

    public record CategoryRequest(
            @NotBlank @Size(max = 60) String name,
            @Size(max = 8) String emoji) {}

    public record OrderItemRequest(
            @NotNull Long productId,
            @NotNull @Min(1) @Max(99) Integer quantity) {}

    public record OrderRequest(
            @NotBlank @Size(max = 120) String customerName,
            @NotBlank @Email @Size(max = 160) String email,
            @Size(max = 40) String phone,
            @NotBlank @Size(max = 500) String address,
            @Size(max = 1000) String note,
            @NotEmpty List<@Valid OrderItemRequest> items) {}

    public record StatusRequest(@NotBlank String status) {}
}
