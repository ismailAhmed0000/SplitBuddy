<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBillRequest;
use App\Http\Requests\UpdateBillRequest;
use App\Http\Resources\BillResource;
use App\Models\Bill;
use App\Models\Group;
use App\Models\User;
use App\Services\BillExtractionService;
use App\Services\BillItemPriceCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

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

    /**
     * The name a freshly auto-created tab carries until extraction fills in
     * the merchant name.
     */
    public const NEW_TAB_NAME = 'New tab';

    public function store(StoreBillRequest $request): JsonResponse
    {
        $group = $request->filled('group_id')
            ? Group::findOrFail($request->validated('group_id'))
            : $this->createTabFor($request->user());

        $this->authorizeMembership($group, $request->user()->id);

        if ($group->payer_id === null) {
            $uploaderMember = $group->members()->where('user_id', $request->user()->id)->first();

            if ($uploaderMember) {
                $group->update(['payer_id' => $uploaderMember->id]);
            }
        }

        $file = $request->file('image');
        $path = $file->store('bills', 'public');

        $bill = Bill::create([
            'group_id' => $group->id,
            'uploaded_by' => $request->user()->id,
            'image_url' => Storage::disk('public')->url($path),
            'status' => 'processing',
        ])->refresh();

        $this->runExtraction($bill, $file->getRealPath(), $file->getMimeType());

        return response()->json([
            'data' => new BillResource($bill->fresh(['uploader', 'items.assignments', 'participants.user'])),
        ], 201);
    }

    public function extract(Request $request, int $id): BillResource
    {
        $bill = Bill::with('group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);

        abort_unless($bill->image_url, 422, 'This bill has no image to extract from.');

        $disk = Storage::disk('public');
        $path = Str::after($bill->image_url, '/storage/');

        abort_unless($disk->exists($path), 404, 'The receipt image could not be found.');

        $bill->items()->delete();
        $bill->update(['status' => 'processing']);

        $this->runExtraction($bill, $disk->path($path), $disk->mimeType($path));

        return new BillResource($bill->fresh(['uploader', 'items.assignments', 'participants.user']));
    }

    private function runExtraction(Bill $bill, string $imagePath, string $mediaType): void
    {
        try {
            $data = app(BillExtractionService::class)->extract($imagePath, $mediaType);

            $bill->update([
                'merchant_name' => $data['merchant_name'],
                'bill_date' => $data['bill_date'],
                'subtotal' => $data['subtotal'],
                'tax_amount' => $data['tax_amount'],
                'tax_label' => $data['tax_label'],
                'discount_amount' => $data['discount_amount'],
                'discount_type' => $data['discount_type'],
                'service_charge' => $data['service_charge'],
                'tip_amount' => $data['tip_amount'],
                'total' => $data['total'],
                'status' => 'parsed',
            ]);

            foreach ($data['items'] as $item) {
                $bill->items()->create([
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                ]);
            }

            app(BillItemPriceCalculator::class)->recalculate($bill);

            $this->nameTabAfterMerchant($bill->fresh('group'));
        } catch (Throwable $e) {
            Log::error('Bill extraction failed', ['bill_id' => $bill->id, 'error' => $e->getMessage()]);
            $bill->update(['status' => 'failed']);
        }
    }

    /**
     * Give an auto-created tab a real name once we know the merchant, so a
     * tab reads like its receipt instead of the "New tab" placeholder.
     */
    private function nameTabAfterMerchant(Bill $bill): void
    {
        $group = $bill->group;

        if ($group && $bill->merchant_name && $group->name === self::NEW_TAB_NAME) {
            $group->update(['name' => $bill->merchant_name]);
        }
    }

    /**
     * A tab is a one-bill container: created for the uploader, who becomes
     * its first member and the payer (the collector others pay back).
     */
    private function createTabFor(User $user): Group
    {
        $group = Group::create([
            'name' => self::NEW_TAB_NAME,
            'created_by' => $user->id,
        ]);

        $group->members()->create([
            'user_id' => $user->id,
            'name' => $user->name,
        ]);

        return $group;
    }

    public function show(Request $request, int $id): BillResource
    {
        $bill = Bill::with('uploader', 'items.assignments', 'participants.user', 'group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);

        return new BillResource($bill);
    }

    public function update(UpdateBillRequest $request, int $id): BillResource
    {
        $bill = Bill::with('group')->findOrFail($id);

        $this->authorizeMembership($bill->group, $request->user()->id);

        $bill->update($request->validated());
        app(BillItemPriceCalculator::class)->recalculate($bill);

        return new BillResource($bill->fresh(['uploader', 'items.assignments', 'participants.user']));
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
