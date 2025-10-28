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
        Schema::create('clinic_groups', function (Blueprint $table) {
			$table->increments('id');
			$table->integer('user_id')->nullable();
			$table->text('code')->nullable();
			$table->string('name')->nullable();
			$table->text('description')->nullable();
			$table->string('image')->nullable();
			$table->boolean('active')->default(1);
			$table->boolean('is_archived')->default(0);
			$table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinic_groups');
    }
};
