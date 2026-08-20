<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettlementResource extends JsonResource
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
            'paid_by' => $this->paid_by,
            'paid_to' => $this->paid_to,
            'amount' => $this->amount,
            'note' => $this->note,
            'settled_at' => $this->settled_at,
            'payer' => new GroupMemberResource($this->whenLoaded('payer')),
            'payee' => new GroupMemberResource($this->whenLoaded('payee')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
