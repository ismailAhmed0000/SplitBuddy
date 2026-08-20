<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['group_id', 'paid_by', 'paid_to', 'amount', 'note', 'settled_at'])]
class Settlement extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'settled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Group, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * @return BelongsTo<GroupMember, $this>
     */
    public function payer(): BelongsTo
    {
        return $this->belongsTo(GroupMember::class, 'paid_by');
    }

    /**
     * @return BelongsTo<GroupMember, $this>
     */
    public function payee(): BelongsTo
    {
        return $this->belongsTo(GroupMember::class, 'paid_to');
    }
}
