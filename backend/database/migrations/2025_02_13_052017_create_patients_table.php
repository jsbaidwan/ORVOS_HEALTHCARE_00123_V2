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
        Schema::create('patients', function (Blueprint $table) {
			$table->increments('id');
			$table->string('study_id')->nullable()->unique();
			$table->text('slug')->nullable();
			$table->integer('clinic_id');
			$table->text('p_code')->nullable();
			$table->integer('user_id')->nullable(); // Allow user_id to be null
			// $table->integer('user_id');
      		$table->string('email')->nullable();
			$table->string('dob')->nullable();
			$table->integer('gender')->nullable();
			$table->integer('phone')->nullable();
			$table->string('first_name')->default('Unknown'); // or nullable() if optional
			// $table->string('first_name');
			$table->string('last_name')->default('Unknown'); // or nullable() if optional
			// $table->string('last_name');
			$table->string('ehr')->nullable();
			$table->string('address')->nullable();
			$table->string('latitude')->nullable()->change();  // Default value of '0' if not provided
			// $table->string('latitude');
			$table->string('longitude')->nullable()->change();  // Default value of '0' if not provided
			$table->string('longitude');
			$table->string('city')->nullable();
			$table->integer('state_id')->nullable();
			$table->string('zip')->nullable();
			$table->string('p_insurance_name')->nullable();
			$table->string('p_insurance_group_no')->nullable();
			$table->string('p_insurance_member_no')->nullable();
			$table->string('s_insurance_name')->nullable();
			$table->string('s_insurance_group_no')->nullable();
			$table->string('s_insurance_member_no')->nullable();
			$table->string('l_eye')->default(0)->comment('0 => no,1 => yes');
			$table->text('l_eye_images')->nullable();
			$table->string('r_eye')->default(0)->comment('0 => no,1 => yes');
			$table->text('r_eye_images')->nullable();
			$table->integer('medical_condition_id')->nullable();
			$table->text('medical_history')->nullable();
			$table->string('note')->nullable();
			$table->string('diagnosis_status')->default(0)->comment('0 => Pending,1 => Completed');
			$table->integer('remark_by')->nullable()->comment('Remark by Orvos Doctor(User Id)');
			$table->string('remark_status')->default(0)->comment('0 => Pending,1 => Seen');
			$table->text('remark_result')->nullable();
			$table->dateTime('remark_at')->nullable();
			$table->integer('follow_up')->default('0');
			$table->integer('is_pdf_report_downloaded')->default(1)->comment('1 => Pending,2 => Downloaded');
			$table->unsignedBigInteger('pdf_report_downloaded_by')->nullable()->comment('User ID who downloaded the PDF');
			$table->integer('is_report_sent')->default(0)->comment('0 => No,1 => Yes');
			$table->unsignedBigInteger('report_sent_by')->nullable()->comment('User ID who sent the Report');
			$table->dateTime('report_sent_at')->nullable();
			$table->integer('fax_status')->default(0)->comment('0 => pending,1 => sending , 2 => delivered , 3 => failed');
			$table->string('fax_job_id')->nullable();
			$table->unsignedBigInteger('fax_sent_by')->nullable()->comment('User ID who sent the Fax');
			$table->dateTime('fax_sent_at')->nullable();
			$table->text('fax_json')->nullable();
			$table->text('dicom_json')->nullable();
			$table->string('dos')->nullable();
			$table->integer('is_dicom_file_send')->default(0)->comment('0 => pending,1 => sending , 2 => sent , 3 => failed');
			$table->dateTime('dicom_file_sent_at')->nullable();
			$table->text('dicom_file_status')->nullable();
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
        Schema::dropIfExists('patients');
    }
};

