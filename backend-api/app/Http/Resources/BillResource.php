<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'uploaded_by' => $this->uploaded_by,
            'image_url' => $this->image_url,
            'merchant_name' => $this->merchant_name,
            'bill_date' => $this->bill_date?->toDateString(),
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->tax_amount,
            'tax_label' => $this->tax_label,
            'discount_amount' => $this->discount_amount,
            'discount_type' => $this->discount_type,
            'service_charge' => $this->service_charge,
            'tip_amount' => $this->tip_amount,
            'total' => $this->total,
            'tax_split_method' => $this->tax_split_method,
            'discount_split_method' => $this->discount_split_method,
            'status' => $this->status,
            'uploader' => new UserResource($this->whenLoaded('uploader')),
            'items' => BillItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
