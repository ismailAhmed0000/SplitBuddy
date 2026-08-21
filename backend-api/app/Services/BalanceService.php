<?php

namespace App\Services;

use App\Models\Group;
use App\Models\User;
use Illuminate\Support\Collection;

class BalanceService
{
    /**
     * Net balance per group member: positive means the group owes them
     * money, negative means they owe the group money.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function forGroup(Group $group): Collection
    {
        $members = $group->members;

        /** @var array<int, float> $balances */
        $balances = $members->mapWithKeys(fn ($member) => [$member->id => 0.0])->all();

        $bills = $group->bills()
            ->where('status', 'confirmed')
            ->with('items.assignments')
            ->get();

        foreach ($bills as $bill) {
            $payer = $members->firstWhere('user_id', $bill->uploaded_by);

            // A bill whose uploader isn't a member of this group can't be
            // credited to anyone, so it's excluded from the ledger.
            if (! $payer) {
                continue;
            }

            // Each item's final_price already has its share of tax, discount,
            // service charge, and tip folded in (see BillItemPriceCalculator),
            // so splitting it among its assignees is all that's needed here.
            $memberOwed = [];

            foreach ($bill->items as $item) {
                $assignments = $item->assignments;

                if ($assignments->isEmpty()) {
                    continue;
                }

                $itemTotal = (float) ($item->final_price ?? $item->total_price);

                foreach ($assignments as $assignment) {
                    $share = match ($assignment->share_type) {
                        'equal' => $itemTotal / $assignments->count(),
                        'percentage' => $itemTotal * ((float) $assignment->share_value / 100),
                        'exact_amount' => (float) $assignment->share_value,
                    };

                    $memberOwed[$assignment->group_member_id] = ($memberOwed[$assignment->group_member_id] ?? 0.0) + $share;
                }
            }

            foreach ($memberOwed as $memberId => $total) {
                $balances[$memberId] = ($balances[$memberId] ?? 0.0) - $total;
                $balances[$payer->id] = ($balances[$payer->id] ?? 0.0) + $total;
            }
        }

        foreach ($group->settlements as $settlement) {
            $amount = (float) $settlement->amount;
            $balances[$settlement->paid_by] = ($balances[$settlement->paid_by] ?? 0.0) + $amount;
            $balances[$settlement->paid_to] = ($balances[$settlement->paid_to] ?? 0.0) - $amount;
        }

        return $members->map(fn ($member) => [
            'group_member_id' => $member->id,
            'user_id' => $member->user_id,
            'name' => $member->name,
            'balance' => round($balances[$member->id] ?? 0.0, 2),
        ])->values();
    }

    /**
     * Per-group net balance for every group the user belongs to, plus the
     * total across all of them.
     *
     * @return array<string, mixed>
     */
    public function forUser(User $user): array
    {
        $memberships = $user->groupMemberships()->with('group')->get();

        $groups = $memberships->map(function ($membership) {
            $mine = $this->forGroup($membership->group)
                ->firstWhere('group_member_id', $membership->id);

            return [
                'group_id' => $membership->group_id,
                'group_name' => $membership->group->name,
                'group_member_id' => $membership->id,
                'balance' => $mine['balance'] ?? 0.0,
            ];
        })->values();

        return [
            'groups' => $groups,
            'overall_balance' => round((float) $groups->sum('balance'), 2),
        ];
    }
}
