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
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->string('image_url')->nullable();
            $table->string('merchant_name')->nullable();
            $table->date('bill_date')->nullable();
            $table->decimal('subtotal', 12, 2)->nullable();
            $table->decimal('tax_amount', 12, 2)->nullable();
            $table->string('tax_label')->nullable();
            $table->decimal('discount_amount', 12, 2)->nullable();
            $table->enum('discount_type', ['flat', 'percentage'])->nullable();
            $table->decimal('service_charge', 12, 2)->nullable();
            $table->decimal('tip_amount', 12, 2)->nullable();
            $table->decimal('total', 12, 2)->nullable();
            $table->enum('tax_split_method', ['proportional', 'even'])->default('proportional');
            $table->enum('discount_split_method', ['proportional', 'even'])->default('proportional');
            $table->enum('status', ['processing', 'parsed', 'confirmed', 'failed'])->default('processing');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
