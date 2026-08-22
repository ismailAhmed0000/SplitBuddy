<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBillParticipantRequest;
use App\Http\Resources\GroupMemberResource;
use App\Models\Assignment;
use App\Models\Bill;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BillParticipantController extends Controller
{
    public function store(StoreBillParticipantRequest $request, int $id): JsonResponse
    {
        $bill = Bill::with('group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);
        $this->authorizeGroupMember($bill->group, $request->validated('group_member_id'));

        $bill->participants()->syncWithoutDetaching([$request->validated('group_member_id')]);

        $member = $bill->participants()->whereKey($request->validated('group_member_id'))->first();

        return response()->json(['data' => new GroupMemberResource($member->load('user'))], 201);
    }

    public function destroy(Request $request, int $id, int $participantId): JsonResponse
    {
        $bill = Bill::with('group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);

        DB::transaction(function () use ($bill, $participantId) {
            Assignment::whereIn('item_id', $bill->items()->pluck('id'))
                ->where('group_member_id', $participantId)
                ->delete();

            $bill->participants()->detach($participantId);
        });

        return response()->json(status: 204);
    }

    private function authorizeMembership(Group $group, int $userId): void
    {
        abort_unless(
            $group->created_by === $userId || $group->members()->where('user_id', $userId)->exists(),
            403,
            'You are not a member of this group.'
        );
    }

    private function authorizeGroupMember(Group $group, int $groupMemberId): void
    {
        if (! $group->members()->whereKey($groupMemberId)->exists()) {
            throw ValidationException::withMessages([
                'group_member_id' => ['The selected group member does not belong to this group.'],
            ]);
        }
    }
}
