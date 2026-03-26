package com.kaafi.aqua.dto.request;

//import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockUpdateRequest {
    @NotNull(message = "Stock item ID is required")
    private Long stockItemId;
    
    @NotNull(message = "Quantity change is required")
    private Integer changeAmount;
    
    private String notes;
}