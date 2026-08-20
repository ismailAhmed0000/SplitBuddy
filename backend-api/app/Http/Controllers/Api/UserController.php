<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(int $id): UserResource
    {
        return new UserResource(User::findOrFail($id));
    }

    public function update(UpdateUserRequest $request, int $id): UserResource
    {
        $user = User::findOrFail($id);

        $user->fill($request->safe()->except('password'));

        if ($request->filled('password')) {
            $user->password = $request->validated('password');
        }

        $user->save();

        return new UserResource($user);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:1']]);

        $users = User::query()
            ->where(function ($query) use ($request) {
                $term = '%'.$request->string('q').'%';
                $query->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            })
            ->limit(20)
            ->get();

        return response()->json(['data' => UserResource::collection($users)]);
    }
}
