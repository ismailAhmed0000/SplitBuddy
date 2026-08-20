<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('bill_items')->cascadeOnDelete();
            $table->foreignId('group_member_id')->constrained('group_members')->cascadeOnDelete();
            $table->enum('share_type', ['equal', 'percentage', 'exact_amount'])->default('equal');
            $table->decimal('share_value', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
