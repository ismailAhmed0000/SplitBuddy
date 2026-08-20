<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssignmentResource extends JsonResource
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
            'item_id' => $this->item_id,
            'group_member_id' => $this->group_member_id,
            'share_type' => $this->share_type,
            'share_value' => $this->share_value,
            'group_member' => new GroupMemberResource($this->whenLoaded('groupMember')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
