<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['item_id', 'group_member_id', 'share_type', 'share_value'])]
class Assignment extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'share_value' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<BillItem, $this>
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(BillItem::class, 'item_id');
    }

    /**
     * @return BelongsTo<GroupMember, $this>
     */
    public function groupMember(): BelongsTo
    {
        return $this->belongsTo(GroupMember::class);
    }
}
