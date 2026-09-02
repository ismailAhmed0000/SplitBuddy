<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Group;
use App\Models\GroupMember;
use App\Models\User;
use Illuminate\Support\Collection;

class BalanceService
{
    /**
     * The amount of an item's total a single assignment is responsible for.
     */
    public function shareOf(Assignment $assignment, float $itemTotal, int $assignmentCount): float
    {
        return match ($assignment->share_type) {
            'equal' => $itemTotal / $assignmentCount,
            'percentage' => $itemTotal * ((float) $assignment->share_value / 100),
            'exact_amount' => (float) $assignment->share_value,
        };
    }

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
                    $share = $this->shareOf($assignment, $itemTotal, $assignments->count());

                    $memberOwed[$assignment->group_member_id] = ($memberOwed[$assignment->group_member_id] ?? 0.0) + $share;
                }
            }

            foreach ($memberOwed as $memberId => $total) {
                $balances[$memberId] = ($balances[$memberId] ?? 0.0) - $total;
                $balances[$payer->id] = ($balances[$payer->id] ?? 0.0) + $total;
            }
        }

        // Snapshot each member's share of the bills before settlements are
        // applied, so the UI can show a fixed "amount owed" that doesn't
        // drop to zero once something is marked as paid.
        $grossBalances = $balances;

        foreach ($group->settlements as $settlement) {
            $amount = (float) $settlement->amount;
            $balances[$settlement->paid_by] = ($balances[$settlement->paid_by] ?? 0.0) + $amount;
            $balances[$settlement->paid_to] = ($balances[$settlement->paid_to] ?? 0.0) - $amount;
        }

        return $members->map(function ($member) use ($balances, $grossBalances, $group) {
            $balance = round($balances[$member->id] ?? 0.0, 2);

            return [
                'group_member_id' => $member->id,
                'user_id' => $member->user_id,
                'name' => $member->name,
                'balance' => $balance,
                'gross_balance' => round($grossBalances[$member->id] ?? 0.0, 2),
                'is_payer' => $group->payer_id === $member->id,
                'status' => $balance < 0 ? 'pending' : 'paid',
            ];
        })->values();
    }

    /**
     * Every bill in the group where this member has at least one item
     * assignment, with what they were assigned and their share of each.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function billsForMember(Group $group, GroupMember $member): Collection
    {
        $bills = $group->bills()->with('items.assignments')->latest()->get();

        return $bills
            ->map(function ($bill) use ($member) {
                $items = $bill->items->filter(
                    fn ($item) => $item->assignments->contains('group_member_id', $member->id)
                );

                if ($items->isEmpty()) {
                    return null;
                }

                $assignedItems = $items->map(function ($item) use ($member) {
                    $assignment = $item->assignments->firstWhere('group_member_id', $member->id);
                    $itemTotal = (float) ($item->final_price ?? $item->total_price);
                    $amount = $this->shareOf($assignment, $itemTotal, $item->assignments->count());

                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'amount' => round($amount, 2),
                    ];
                })->values();

                return [
                    'id' => $bill->id,
                    'merchant_name' => $bill->merchant_name,
                    'bill_date' => $bill->bill_date?->toDateString(),
                    'status' => $bill->status,
                    'items' => $assignedItems,
                    'total' => round($assignedItems->sum('amount'), 2),
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * A ready-to-share text message summarizing what this member currently
     * owes: itemized by bill (confirmed bills only, since only those count
     * toward balances), with dates, plus who to pay.
     *
     * @return array<string, mixed>
     */
    public function exportMessage(Group $group, GroupMember $member): array
    {
        $balance = $this->forGroup($group)->firstWhere('group_member_id', $member->id);
        $amountOwed = round(abs(min(0.0, $balance['balance'] ?? 0.0)), 2);

        $bills = $group->bills()
            ->where('status', 'confirmed')
            ->with('items.assignments')
            ->orderByDesc('bill_date')
            ->get();

        $lines = [];

        foreach ($bills as $bill) {
            $items = $bill->items->filter(
                fn ($item) => $item->assignments->contains('group_member_id', $member->id)
            );

            foreach ($items as $item) {
                $assignment = $item->assignments->firstWhere('group_member_id', $member->id);
                $itemTotal = (float) ($item->final_price ?? $item->total_price);
                $amount = round($this->shareOf($assignment, $itemTotal, $item->assignments->count()), 2);

                $lines[] = [
                    'item_name' => $item->name,
                    'amount' => $amount,
                    'bill_name' => $bill->merchant_name ?? 'Receipt',
                    'bill_date' => $bill->bill_date?->toDateString(),
                    'bill_date_formatted' => $bill->bill_date?->format('M j, Y'),
                ];
            }
        }

        $payer = $group->payer;

        return [
            'group_member_id' => $member->id,
            'name' => $member->name,
            'amount_owed' => $amountOwed,
            'items' => $lines,
            'message' => $this->composeMessage($group, $member, $amountOwed, $lines, $payer),
        ];
    }

    /**
     * @param  GroupMember[]|Collection<int, GroupMember>  $members
     * @return Collection<int, array<string, mixed>>
     */
    public function exportMessages(Group $group, iterable $members): Collection
    {
        return collect($members)->map(fn ($member) => $this->exportMessage($group, $member))->values();
    }

    /**
     * One shared message covering every selected member's outstanding
     * amount and items, for posting once (e.g. in a group chat) instead of
     * sending each person their own message.
     *
     * @param  Collection<int, array<string, mixed>>  $exports  Results from exportMessage(), in the order they should appear.
     */
    public function combinedMessage(Group $group, Collection $exports): string
    {
        $owing = $exports->filter(fn ($export) => $export['amount_owed'] > 0.0)->values();

        if ($owing->isEmpty()) {
            return "Everyone selected is all settled up in {$group->name}. \u{1F389}";
        }

        $text = "Here's who owes what for {$group->name}:\n";

        foreach ($owing as $export) {
            $text .= "\n{$export['name']} \u{2014} MVR ".number_format((float) $export['amount_owed'], 2)."\n";

            foreach ($export['items'] as $line) {
                $suffix = $line['bill_date_formatted']
                    ? " ({$line['bill_name']}, {$line['bill_date_formatted']})"
                    : " ({$line['bill_name']})";

                $text .= "  \u{2022} {$line['item_name']} \u{2014} MVR ".number_format((float) $line['amount'], 2)."{$suffix}\n";
            }
        }

        $payer = $group->payer;
        if ($payer) {
            $text .= "\nPlease send to {$payer->name}";

            $bankBits = array_filter([$payer->user?->bank_name, $payer->user?->bank_account_number]);
            if ($bankBits !== []) {
                $text .= ' — '.implode(', ', $bankBits);
            }
        }

        return $text;
    }

    /**
     * @param  array<int, array<string, mixed>>  $lines
     */
    private function composeMessage(Group $group, GroupMember $member, float $amountOwed, array $lines, ?GroupMember $payer): string
    {
        if ($amountOwed <= 0.0) {
            return "Hi {$member->name}, you're all settled up in {$group->name}. \u{1F389}";
        }

        $text = "Hi {$member->name},\n\nHere's what you owe for {$group->name}:\n\n";

        foreach ($lines as $line) {
            $suffix = $line['bill_date_formatted']
                ? " ({$line['bill_name']}, {$line['bill_date_formatted']})"
                : " ({$line['bill_name']})";

            $text .= "\u{2022} {$line['item_name']} \u{2014} MVR ".number_format((float) $line['amount'], 2)."{$suffix}\n";
        }

        $text .= "\nTotal owed: MVR ".number_format($amountOwed, 2);

        if ($payer && $payer->id !== $member->id) {
            $text .= "\n\nPlease pay {$payer->name}";

            $bankBits = array_filter([$payer->user?->bank_name, $payer->user?->bank_account_number]);
            if ($bankBits !== []) {
                $text .= ' — '.implode(', ', $bankBits);
            }
        }

        return $text;
    }

    /**
     * Per-group net balance for every group the user belongs to, plus the
     * total across all of them.
     *
     * @return array<string, mixed>
     */
    public function forUser(User $user): array
    {
        $memberships = $user->groupMemberships()->with('group.payer')->get();

        $groups = $memberships->map(function ($membership) {
            $mine = $this->forGroup($membership->group)
                ->firstWhere('group_member_id', $membership->id);

            return [
                'group_id' => $membership->group_id,
                'group_name' => $membership->group->name,
                'group_member_id' => $membership->id,
                'balance' => $mine['balance'] ?? 0.0,
                'status' => $mine['status'] ?? 'paid',
                'is_payer' => $membership->group->payer_id === $membership->id,
                'payer_id' => $membership->group->payer_id,
                'payer_name' => $membership->group->payer?->name,
            ];
        })->values();

        return [
            'groups' => $groups,
            'overall_balance' => round((float) $groups->sum('balance'), 2),
        ];
    }
}
