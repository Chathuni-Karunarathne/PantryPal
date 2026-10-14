package com.pantrypal.backend.inventory.entity;

import com.pantrypal.backend.inventory.service.InventoryException;
import java.math.BigDecimal;
import java.math.RoundingMode;

public enum MeasurementUnit {
    G("mass", 1), KG("mass", 1000), ML("volume", 1), L("volume", 1000), PCS("count", 1);

    private final String dimension;
    private final BigDecimal factor;

    MeasurementUnit(String dimension, int factor) {
        this.dimension = dimension;
        this.factor = BigDecimal.valueOf(factor);
    }

    public BigDecimal convert(BigDecimal quantity, MeasurementUnit target) {
        if (!dimension.equals(target.dimension)) {
            throw new InventoryException(400, "INCOMPATIBLE_UNIT", "Choose a unit compatible with the ingredient's unit.");
        }
        try {
            return quantity.multiply(factor).divide(target.factor, 6, RoundingMode.UNNECESSARY);
        } catch (ArithmeticException exception) {
            throw new InventoryException(400, "INVALID_QUANTITY", "The converted quantity supports up to six decimal places.");
        }
    }
}
