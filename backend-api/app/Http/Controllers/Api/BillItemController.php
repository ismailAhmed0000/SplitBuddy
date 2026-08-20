<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBillItemRequest;
use App\Http\Requests\UpdateBillItemRequest;
use App\Http\Resources\BillItemResource;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillItemController extends Controller
{
    public function index(Request $request, int $id): JsonResponse
    {
        $bill = Bill::with('group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);

        $items = $bill->items()->with('assignments')->get();

        return response()->json(['data' => BillItemResource::collection($items)]);
    }

    public function store(StoreBillItemRequest $request, int $id): JsonResponse
    {
        $bill = Bill::with('group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);

        $data = $request->validated();
        $data['quantity'] ??= 1;
        $data['total_price'] ??= $data['quantity'] * $data['unit_price'];

        $item = $bill->items()->create($data);

        return response()->json(['data' => new BillItemResource($item)], 201);
    }

    public function update(UpdateBillItemRequest $request, int $id): BillItemResource
    {
        $item = BillItem::with('bill.group')->findOrFail($id);

        $this->authorizeMembership($item->bill->group, $request->user()->id);

        $item->update($request->validated());

        return new BillItemResource($item->load('assignments'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $item = BillItem::with('bill.group')->findOrFail($id);

        $this->authorizeMembership($item->bill->group, $request->user()->id);

        $item->delete();

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
