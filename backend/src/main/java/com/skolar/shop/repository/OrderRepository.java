package com.skolar.shop.repository;

import com.skolar.shop.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    long countByStatus(CustomerOrder.Status status);

    @Query("select coalesce(sum(o.total), 0) from CustomerOrder o where o.status <> com.skolar.shop.model.CustomerOrder.Status.CANCELLED")
    BigDecimal revenue();
}
