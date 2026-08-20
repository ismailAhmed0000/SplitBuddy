<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddGroupMemberRequest;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Http\Resources\GroupMemberResource;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $groups = Group::query()
            ->where('created_by', $userId)
            ->orWhereHas('members', fn ($query) => $query->where('user_id', $userId))
            ->with('creator')
            ->withCount('members')
            ->get();

        return response()->json(['data' => GroupResource::collection($groups)]);
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        $group = Group::create([
            'name' => $request->validated('name'),
            'created_by' => $request->user()->id,
        ]);

        $group->members()->create([
            'user_id' => $request->user()->id,
            'name' => $request->user()->name,
        ]);

        return response()->json(['data' => new GroupResource($group->load('creator', 'members'))], 201);
    }

    public function show(Request $request, int $id): GroupResource
    {
        $group = Group::with('creator', 'members.user')->findOrFail($id);

        $this->authorizeMembership($group, $request->user()->id);

        return new GroupResource($group);
    }

    public function update(UpdateGroupRequest $request, int $id): GroupResource
    {
        $group = Group::findOrFail($id);

        abort_unless($group->created_by === $request->user()->id, 403, 'Only the group creator can update this group.');

        $group->update($request->validated());

        return new GroupResource($group->load('creator', 'members'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $group = Group::findOrFail($id);

        abort_unless($group->created_by === $request->user()->id, 403, 'Only the group creator can delete this group.');

        $group->delete();

        return response()->json(status: 204);
    }

    public function addMember(AddGroupMemberRequest $request, int $id): JsonResponse
    {
        $group = Group::findOrFail($id);

        abort_unless(
            $group->created_by === $request->user()->id || $group->members()->where('user_id', $request->user()->id)->exists(),
            403,
            'Only group members can add other members.'
        );

        $member = $group->members()->create($request->validated());

        return response()->json(['data' => new GroupMemberResource($member->load('user'))], 201);
    }

    public function removeMember(Request $request, int $id, int $memberId): JsonResponse
    {
        $group = Group::findOrFail($id);

        abort_unless($group->created_by === $request->user()->id, 403, 'Only the group creator can remove members.');

        $member = $group->members()->findOrFail($memberId);
        $member->delete();

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
}
