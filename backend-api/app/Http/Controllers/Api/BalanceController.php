<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\User;
use App\Services\BalanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BalanceController extends Controller
{
    public function __construct(private readonly BalanceService $balances) {}

    public function groupBalances(Request $request, int $id): JsonResponse
    {
        $group = Group::findOrFail($id);
        $userId = $request->user()->id;

        abort_unless(
            $group->created_by === $userId || $group->members()->where('user_id', $userId)->exists(),
            403,
            'You are not a member of this group.'
        );

        return response()->json(['data' => $this->balances->forGroup($group)]);
    }

    public function userBalances(Request $request, int $id): JsonResponse
    {
        abort_unless($request->user()->id === $id, 403, 'You may only view your own balances.');

        $user = User::findOrFail($id);

        return response()->json(['data' => $this->balances->forUser($user)]);
    }
}
