<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->appNotifications()
            ->latest()
            ->get();

        return response()->json(['data' => NotificationResource::collection($notifications)]);
    }

    public function markRead(Request $request, int $id): NotificationResource
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);

        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return new NotificationResource($notification);
    }
}
