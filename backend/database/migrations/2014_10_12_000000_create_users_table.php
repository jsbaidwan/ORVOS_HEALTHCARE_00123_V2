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
        Schema::create('users', function (Blueprint $table) {
			$table->increments('id');
            $table->string('first_name');
			$table->string('last_name');
			$table->string('username');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
			$table->integer('role_id')->default(3);
			$table->integer('gender')->nullable();
			$table->integer('active')->default(1)->comment('1 => Yes, 0 => No');
			$table->string('timezone')->nullable();
			$table->string('country_code')->nullable();
			$table->string('image')->nullable();
			$table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
