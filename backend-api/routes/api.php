<?php

use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BalanceController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\BillItemController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SettlementController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Users
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::get('/users/{id}/balances', [BalanceController::class, 'userBalances']);

    // Groups
    Route::get('/groups', [GroupController::class, 'index']);
    Route::post('/groups', [GroupController::class, 'store']);
    Route::get('/groups/{id}', [GroupController::class, 'show']);
    Route::put('/groups/{id}', [GroupController::class, 'update']);
    Route::delete('/groups/{id}', [GroupController::class, 'destroy']);
    Route::post('/groups/{id}/members', [GroupController::class, 'addMember']);
    Route::delete('/groups/{id}/members/{memberId}', [GroupController::class, 'removeMember']);
    Route::get('/groups/{id}/balances', [BalanceController::class, 'groupBalances']);

    // Bills
    Route::get('/bills', [BillController::class, 'index']);
    Route::post('/bills', [BillController::class, 'store']);
    Route::get('/bills/{id}', [BillController::class, 'show']);
    Route::put('/bills/{id}', [BillController::class, 'update']);
    Route::delete('/bills/{id}', [BillController::class, 'destroy']);
    Route::get('/bills/{id}/status', [BillController::class, 'status']);
    Route::post('/bills/{id}/extract', [BillController::class, 'extract']);

    // Bill Items
    Route::get('/bills/{id}/items', [BillItemController::class, 'index']);
    Route::post('/bills/{id}/items', [BillItemController::class, 'store']);
    Route::put('/items/{id}', [BillItemController::class, 'update']);
    Route::delete('/items/{id}', [BillItemController::class, 'destroy']);

    // Assignments
    Route::get('/items/{id}/assignments', [AssignmentController::class, 'index']);
    Route::post('/items/{id}/assignments', [AssignmentController::class, 'store']);
    Route::put('/assignments/{id}', [AssignmentController::class, 'update']);
    Route::delete('/assignments/{id}', [AssignmentController::class, 'destroy']);

    // Settlements
    Route::post('/settlements', [SettlementController::class, 'store']);
    Route::get('/settlements', [SettlementController::class, 'index']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
});
