<?php

namespace App\Services;

use App\Models\Bill;

class BillItemPriceCalculator
{
    /**
     * Fold each item's share of tax, service charge, and tip (added) and
     * discount (subtracted) into its final_price, proportional to how much
     * of the bill's raw subtotal that item represents. Once this runs,
     * splitting an item's final_price among its assignees already accounts
     * for tax/discount — no separate distribution step is needed downstream.
     */
    public function recalculate(Bill $bill): void
    {
        $items = $bill->items()->get();
        $subtotal = (float) $items->sum('total_price');

        if ($subtotal <= 0.0) {
            foreach ($items as $item) {
                $item->final_price = $item->total_price;
                $item->save();
            }

            return;
        }

        $discount = $bill->discount_type === 'percentage'
            ? $subtotal * ((float) $bill->discount_amount / 100)
            : (float) $bill->discount_amount;

        $extra = (float) $bill->tax_amount + (float) $bill->service_charge + (float) $bill->tip_amount;
        $netAdjustment = $extra - $discount;

        foreach ($items as $item) {
            $ratio = (float) $item->total_price / $subtotal;
            $item->final_price = round((float) $item->total_price + $netAdjustment * $ratio, 2);
            $item->save();
        }
    }
}
