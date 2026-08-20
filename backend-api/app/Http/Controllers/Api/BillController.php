<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBillRequest;
use App\Http\Requests\UpdateBillRequest;
use App\Http\Resources\BillResource;
use App\Models\Bill;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $bills = Bill::query()
            ->whereHas('group', fn ($query) => $query->where('created_by', $userId)
                ->orWhereHas('members', fn ($q) => $q->where('user_id', $userId)))
            ->when($request->filled('group_id'), fn ($query) => $query->where('group_id', $request->integer('group_id')))
            ->with('uploader')
            ->latest()
            ->get();

        return response()->json(['data' => BillResource::collection($bills)]);
    }

    public function store(StoreBillRequest $request): JsonResponse
    {
        $group = Group::findOrFail($request->validated('group_id'));

        $this->authorizeMembership($group, $request->user()->id);

        $bill = Bill::create([
            ...$request->validated(),
            'uploaded_by' => $request->user()->id,
        ])->refresh();

        return response()->json(['data' => new BillResource($bill->load('uploader'))], 201);
    }

    public function show(Request $request, int $id): BillResource
    {
        $bill = Bill::with('uploader', 'items.assignments', 'group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);

        return new BillResource($bill);
    }

    public function update(UpdateBillRequest $request, int $id): BillResource
    {
        $bill = Bill::with('group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);

        $bill->update($request->validated());

        return new BillResource($bill->load('uploader', 'items.assignments'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $bill = Bill::with('group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);

        $bill->delete();

        return response()->json(status: 204);
    }

    public function status(Request $request, int $id): JsonResponse
    {
        $bill = Bill::with('group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);

        return response()->json([
            'id' => $bill->id,
            'status' => $bill->status,
        ]);
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
