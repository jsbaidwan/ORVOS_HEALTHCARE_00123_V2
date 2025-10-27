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
        Schema::create('permissions', function (Blueprint $table) {
			$table->increments('id')->comment('primary key for table');
			$table->integer('role_id');
			$table->integer('module_id')->comment('Module id from \Helper::roleModules() function.');
			$table->integer('read')->comment('0 => no, 1 => yes')->default(0);
			$table->integer('write')->comment('0 => no, 1 => yes')->default(0);
			$table->integer('create')->comment('0 => no, 1 => yes')->default(0);
			$table->integer('delete')->comment('0 => no, 1 => yes')->default(0);
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
        Schema::dropIfExists('permissions');
    }
};
