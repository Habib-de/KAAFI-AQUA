package com.kaafi.aqua.dto.request;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TankRestockRequest {
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1 liter")
    private Integer amountLiters;
    
    private String notes;
}