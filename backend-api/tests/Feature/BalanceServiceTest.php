<?php

namespace Tests\Feature;

use App\Models\Bill;
use App\Models\Group;
use App\Models\User;
use App\Services\BalanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BalanceServiceTest extends TestCase
{
    use RefreshDatabase;

    private function memberBalance(Group $group, int $memberId): array
    {
        return app(BalanceService::class)->forGroup($group)
            ->firstWhere('group_member_id', $memberId);
    }

    public function test_bill_is_credited_to_the_collector_not_the_uploader(): void
    {
        $uploader = User::factory()->create();
        $collectorUser = User::factory()->create();

        $group = Group::create(['name' => 'Dinner', 'created_by' => $uploader->id]);

        $uploaderMember = $group->members()->create(['user_id' => $uploader->id, 'name' => 'Uploader']);
        $collector = $group->members()->create(['user_id' => $collectorUser->id, 'name' => 'Collector']);
        $friend = $group->members()->create(['user_id' => null, 'name' => 'Friend']);

        // The tab's collector is someone other than whoever uploaded the receipt.
        $group->update(['payer_id' => $collector->id]);

        $bill = Bill::create([
            'group_id' => $group->id,
            'uploaded_by' => $uploader->id,
            'total' => 90,
            'status' => 'confirmed',
        ]);

        // One 90.00 item split equally across all three members.
        $item = $bill->items()->create([
            'name' => 'Shared platter',
            'quantity' => 1,
            'unit_price' => 90,
            'total_price' => 90,
            'final_price' => 90,
        ]);

        foreach ([$uploaderMember, $collector, $friend] as $member) {
            $item->assignments()->create(['group_member_id' => $member->id, 'share_type' => 'equal']);
        }

        // The uploader is now just another participant owing their 30.00 share.
        $this->assertEqualsWithDelta(-30.0, $this->memberBalance($group, $uploaderMember->id)['balance'], 0.001);
        $this->assertEqualsWithDelta(-30.0, $this->memberBalance($group, $friend->id)['balance'], 0.001);

        // The collector fronted the bill, so they're owed the other two shares.
        $this->assertEqualsWithDelta(60.0, $this->memberBalance($group, $collector->id)['balance'], 0.001);
    }

    public function test_falls_back_to_uploader_when_the_tab_has_no_collector(): void
    {
        $uploader = User::factory()->create();

        $group = Group::create(['name' => 'Dinner', 'created_by' => $uploader->id]);

        $uploaderMember = $group->members()->create(['user_id' => $uploader->id, 'name' => 'Uploader']);
        $friend = $group->members()->create(['user_id' => null, 'name' => 'Friend']);

        $bill = Bill::create([
            'group_id' => $group->id,
            'uploaded_by' => $uploader->id,
            'total' => 40,
            'status' => 'confirmed',
        ]);

        $item = $bill->items()->create([
            'name' => 'Shared platter',
            'quantity' => 1,
            'unit_price' => 40,
            'total_price' => 40,
            'final_price' => 40,
        ]);

        foreach ([$uploaderMember, $friend] as $member) {
            $item->assignments()->create(['group_member_id' => $member->id, 'share_type' => 'equal']);
        }

        $this->assertEqualsWithDelta(20.0, $this->memberBalance($group, $uploaderMember->id)['balance'], 0.001);
        $this->assertEqualsWithDelta(-20.0, $this->memberBalance($group, $friend->id)['balance'], 0.001);
    }
}
