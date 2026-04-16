<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void 
     */
    public function up()
    {
        Schema::create('clinics', function (Blueprint $table) {
            $table->increments('id');
			$table->integer('clinic_group_id')->nullable();
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
			$table->integer('is_dicom_enabled')->default(0);
			$table->text('device_ids')->nullable();
			$table->integer('device_type_id')->nullable();
			$table->integer('is_patient_report_email_enabled')->default(0);
			$table->integer('is_fax_enabled')->default(0);
			$table->string('fax_number')->nullable();
			$table->integer('is_stow_enabled')->default(0);
			$table->string('stow_url')->nullable();
			$table->string('stow_username')->nullable();
			$table->string('stow_password')->nullable();
			$table->string('stow_get')->nullable();
			$table->string('stow_post')->nullable();
			$table->boolean('is_archived')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('clinics');
    }
};
