<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSettlementRequest;
use App\Http\Resources\SettlementResource;
use App\Models\Group;
use App\Models\Settlement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SettlementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['group_id' => ['required', 'integer', 'exists:groups,id']]);

        $group = Group::findOrFail($request->integer('group_id'));

        $this->authorizeMembership($group, $request->user()->id);

        $settlements = $group->settlements()
            ->with('payer', 'payee')
            ->latest('settled_at')
            ->get();

        return response()->json(['data' => SettlementResource::collection($settlements)]);
    }

    public function store(StoreSettlementRequest $request): JsonResponse
    {
        $group = Group::findOrFail($request->validated('group_id'));

        $this->authorizeMembership($group, $request->user()->id);

        foreach (['paid_by', 'paid_to'] as $field) {
            if (! $group->members()->whereKey($request->validated($field))->exists()) {
                throw ValidationException::withMessages([
                    $field => ["The selected {$field} does not belong to this group."],
                ]);
            }
        }

        $settlement = Settlement::create([
            ...$request->validated(),
            'settled_at' => $request->validated('settled_at') ?? now(),
        ]);

        return response()->json(['data' => new SettlementResource($settlement->load('payer', 'payee'))], 201);
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
