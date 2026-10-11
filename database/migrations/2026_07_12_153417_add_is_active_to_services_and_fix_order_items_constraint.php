<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('duration_days');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->foreign('service_id')->references('id')->on('services')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->foreign('service_id')->references('id')->on('services')->cascadeOnDelete();
        });
    }
};