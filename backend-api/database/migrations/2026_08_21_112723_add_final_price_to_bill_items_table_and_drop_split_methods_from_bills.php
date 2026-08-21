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
        Schema::table('bill_items', function (Blueprint $table) {
            $table->decimal('final_price', 12, 2)->nullable()->after('total_price');
        });

        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn(['tax_split_method', 'discount_split_method']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bill_items', function (Blueprint $table) {
            $table->dropColumn('final_price');
        });

        Schema::table('bills', function (Blueprint $table) {
            $table->enum('tax_split_method', ['proportional', 'even'])->default('proportional');
            $table->enum('discount_split_method', ['proportional', 'even'])->default('proportional');
        });
    }
};
