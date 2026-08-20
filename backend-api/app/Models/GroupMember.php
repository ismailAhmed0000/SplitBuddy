<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['group_id', 'user_id', 'name'])]
class GroupMember extends Model
{
    /**
     * @return BelongsTo<Group, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Assignment, $this>
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * @return HasMany<Settlement, $this>
     */
    public function settlementsPaid(): HasMany
    {
        return $this->hasMany(Settlement::class, 'paid_by');
    }

    /**
     * @return HasMany<Settlement, $this>
     */
    public function settlementsReceived(): HasMany
    {
        return $this->hasMany(Settlement::class, 'paid_to');
    }
}
