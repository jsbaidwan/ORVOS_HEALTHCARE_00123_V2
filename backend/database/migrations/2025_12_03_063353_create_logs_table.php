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
        Schema::create('logs', function (Blueprint $table) {
            $table->increments('id');
			$table->unsignedBigInteger('user_id')->nullable();
			$table->string('url')->nullable();
			$table->text('text')->nullable();
			$table->string('method')->nullable();
			$table->string('ip')->nullable();
			$table->string('agent')->nullable();
			$table->string('module')->nullable();
			$table->unsignedBigInteger('module_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
