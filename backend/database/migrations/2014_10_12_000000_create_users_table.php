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
			$table->text('code')->nullable();
			$table->string('user_name')->unique()->nullable();
			$table->string('email')->unique();
			$table->string('phone_number')->nullable();
			$table->string('dob')->nullable();
			$table->string('gender')->nullable();
			$table->string('image')->nullable();
			$table->text('specialist')->nullable();
			$table->text('address')->nullable();
			$table->string('latitude')->nullable();
			$table->string('longitude')->nullable();
			$table->text('city')->nullable();
			$table->integer('state_id')->nullable();
			$table->text('zip')->nullable();
			$table->text('bio')->nullable();
			$table->integer('role_id')->default(2)->comment('1 => super-admin,2 => orvos doctor,3 => doctor,4 => medical assistant,5 => other');	
			$table->text('npi_number')->nullable();
			$table->text('caqh_id')->nullable();
			$table->text('provider_id')->nullable();
			$table->text('signature')->nullable();
			$table->text('documents')->nullable();
			$table->timestamp('email_verified_at')->nullable();
			$table->string('password')->nullable();
			$table->integer('status')->default(1)->comment('0 => inactive,1 => active');	
			$table->integer('expiry_reminder')->default(0)->comment('0 => no,1 => yes');	
			$table->string('timezone')->nullable();
			$table->string('country_code')->nullable();
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
