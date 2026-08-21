<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddBuddyRequest;
use App\Http\Resources\BuddyResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuddyController extends Controller
{
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

    public function destroy(Request $request, int $id): JsonResponse
    {
        $buddy = $request->user()->buddies()->findOrFail($id);
        $buddy->delete();

        return response()->json(status: 204);
    }
}
