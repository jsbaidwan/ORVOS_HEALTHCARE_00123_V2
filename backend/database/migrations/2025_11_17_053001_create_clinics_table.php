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
        Schema::create('clinics', function (Blueprint $table) {
			$table->increments('id');
			$table->string('clinic_group_id')->nullable();
			$table->string('user_id')->nullable();
            $table->string('name')->nullable();
            $table->string('slug')->nullable();
            $table->string('code')->nullable();
            $table->string('poc_email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('latitude')->nullable();
            $table->string('longitude')->nullable();
			$table->text('city')->nullable();
			$table->integer('state_id')->nullable();
			$table->text('zip')->nullable();
            $table->text('description')->nullable();
            $table->integer('status')->default(1)->comment('0 => inactive,1 => active');
            $table->string('doi')->nullable();
            $table->text('files')->nullable();
			$table->string('image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinics');
    }
};
