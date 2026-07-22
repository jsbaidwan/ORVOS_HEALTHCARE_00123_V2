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
        Schema::create('pdf_templates', function (Blueprint $table) {
            $table->increments('id');
			$table->string('name')->nullable();
			$table->integer('user_id')->nullable();
			$table->bigInteger('clinic_id')->nullable();
			$table->bigInteger('pdf_template_category_id')->nullable();
			$table->integer('status')->default(1)->nullable();
			$table->longText('body')->nullable();
			$table->integer('screening_type_id')->default(0)->comment('1 => Diabetic Retinopathy,2 => Thyroid Eye Disease,3 => both');
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
        Schema::dropIfExists('pdf_templates');
    }
};
