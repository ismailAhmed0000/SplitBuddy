<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddBuddyRequest;
use App\Http\Resources\BuddyResource;
use App\Http\Resources\UserResource;
use App\Models\GroupMember;
use App\Models\User;
use App\Services\BalanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuddyController extends Controller
{
    public function __construct(private readonly BalanceService $balances) {}

    public function index(Request $request): JsonResponse
    {
        $buddies = $request->user()->buddies()
            ->with('buddyUser')
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = '%'.$request->string('q').'%';
                $query->whereHas('buddyUser', function ($query) use ($term) {
                    $query->where('name', 'like', $term)
                        ->orWhere('username', 'like', $term);
                });
            })
            ->get();

        return response()->json(['data' => BuddyResource::collection($buddies)]);
    }

    public function store(AddBuddyRequest $request): JsonResponse
    {
        $buddyUser = User::where('username', $request->validated('username'))->firstOrFail();

        abort_if($buddyUser->id === $request->user()->id, 422, 'You cannot add yourself as a buddy.');

        $existing = $request->user()->buddies()->where('buddy_user_id', $buddyUser->id)->first();

        if ($existing) {
            return response()->json(['data' => new BuddyResource($existing->load('buddyUser'))]);
        }

        $buddy = $request->user()->buddies()->create(['buddy_user_id' => $buddyUser->id]);

        return response()->json(['data' => new BuddyResource($buddy->load('buddyUser'))], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $buddy = $request->user()->buddies()->with('buddyUser')->findOrFail($id);
        $userId = $request->user()->id;

        // Only groups the current user shares with this buddy are visible here.
        $sharedMemberships = GroupMember::where('user_id', $buddy->buddy_user_id)
            ->whereHas('group', fn ($query) => $query->where('created_by', $userId)
                ->orWhereHas('members', fn ($q) => $q->where('user_id', $userId)))
            ->with('group')
            ->get();

        $totalBalance = 0.0;
        $bills = collect();

        foreach ($sharedMemberships as $member) {
            $groupBalance = $this->balances->forGroup($member->group)->firstWhere('group_member_id', $member->id);
            $totalBalance += $groupBalance['balance'] ?? 0.0;

            $groupBills = $this->balances->billsForMember($member->group, $member)->map(function ($bill) use ($member) {
                $bill['group_id'] = $member->group_id;
                $bill['group_name'] = $member->group->name;

                return $bill;
            });

            $bills = $bills->concat($groupBills);
        }

        return response()->json(['data' => [
            'id' => $buddy->id,
            'user' => new UserResource($buddy->buddyUser),
            'balance' => round($totalBalance, 2),
            'bills' => $bills->sortByDesc('id')->values(),
        ]]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $buddy = $request->user()->buddies()->findOrFail($id);
        $buddy->delete();

        return response()->json(status: 204);
    }
}
