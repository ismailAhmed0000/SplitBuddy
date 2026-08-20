<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssignmentRequest;
use App\Http\Requests\UpdateAssignmentRequest;
use App\Http\Resources\AssignmentResource;
use App\Models\Assignment;
use App\Models\BillItem;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AssignmentController extends Controller
{
    public function index(Request $request, int $id): JsonResponse
    {
        $item = BillItem::with('bill.group')->findOrFail($id);

        $this->authorizeMembership($item->bill->group, $request->user()->id);

        $assignments = $item->assignments()->with('groupMember')->get();

        return response()->json(['data' => AssignmentResource::collection($assignments)]);
    }

    public function store(StoreAssignmentRequest $request, int $id): JsonResponse
    {
        $item = BillItem::with('bill.group')->findOrFail($id);
        $group = $item->bill->group;

        $this->authorizeMembership($group, $request->user()->id);
        $this->authorizeGroupMember($group, $request->validated('group_member_id'));

        $assignment = $item->assignments()->create($request->validated());

        return response()->json(['data' => new AssignmentResource($assignment->load('groupMember'))], 201);
    }

    public function update(UpdateAssignmentRequest $request, int $id): AssignmentResource
    {
        $assignment = Assignment::with('item.bill.group')->findOrFail($id);
        $group = $assignment->item->bill->group;

        $this->authorizeMembership($group, $request->user()->id);

        if ($request->filled('group_member_id')) {
            $this->authorizeGroupMember($group, $request->validated('group_member_id'));
        }

        $assignment->update($request->validated());

        return new AssignmentResource($assignment->load('groupMember'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $assignment = Assignment::with('item.bill.group')->findOrFail($id);

        $this->authorizeMembership($assignment->item->bill->group, $request->user()->id);

        $assignment->delete();

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
