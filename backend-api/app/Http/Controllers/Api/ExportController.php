<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Services\BalanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ExportController extends Controller
{
    public function __construct(private readonly BalanceService $balances) {}

    /**
     * Ready-to-share "here's what you owe" messages for one or more
     * members of this group.
     */
    public function groupMessages(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'member_ids' => ['required', 'array', 'min:1'],
            'member_ids.*' => ['integer'],
        ]);

        $group = Group::with('payer.user')->findOrFail($id);
        $userId = $request->user()->id;

        abort_unless(
            $group->created_by === $userId || $group->members()->where('user_id', $userId)->exists(),
            403,
            'You are not a member of this group.'
        );

        $memberIds = $request->input('member_ids');
        $members = $group->members()->with('user')->whereIn('id', $memberIds)->get();

        if ($members->count() !== count($memberIds)) {
            throw ValidationException::withMessages([
                'member_ids' => ['One or more selected members do not belong to this group.'],
            ]);
        }

        $exports = $this->balances->exportMessages($group, $members);

        return response()->json([
            'data' => $exports,
            'combined_message' => $this->balances->combinedMessage($group, $exports),
        ]);
    }
}
