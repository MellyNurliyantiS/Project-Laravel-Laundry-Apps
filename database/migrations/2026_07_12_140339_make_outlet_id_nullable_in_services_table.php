<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['outlet_id']);
            $table->unsignedBigInteger('outlet_id')->nullable()->change();
            $table->foreign('outlet_id')->references('id')->on('outlets')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['outlet_id']);
            $table->unsignedBigInteger('outlet_id')->nullable(false)->change();
            $table->foreign('outlet_id')->references('id')->on('outlets')->cascadeOnDelete();
        });
    }
};