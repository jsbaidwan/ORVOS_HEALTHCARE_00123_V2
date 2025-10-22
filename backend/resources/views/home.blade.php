@extends('layouts.app')
@section('title', 'Dashboard')
@section('content')

<!--begin::Container-->
<div id="kt_content_container" class="p-5">
	<div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 text-white">
		<div class="card-header card-header-stretch">
			<div class="card-title">
				<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome {{ ucwords(Auth::user()->name) }}</h5>
			</div> 
			<div class="card-toolbar m-0">
				<ul role="tablist" class="nav nav-stretch fs-5 fw-semibold nav-line-tabs border-transparent"></ul>
			</div>
		</div>

		<!-- Card Body -->
		<div class="card-body pt-9 text-black">
			<div class="d-flex flex-wrap flex-sm-nowrap">
				<!-- Main Content -->
				<div class="flex-grow-1">
					<div class="d-flex justify-content-between align-items-start flex-wrap mb-2">
						<div class="d-flex flex-column">
							<div class="d-flex align-items-center mb-2 fs-3">
								{{ ucwords(Auth::user()->role->name) }}
							</div>
							<a href="{{ route('blogs.index') }}" class="text-blue-500 hover:text-blue-700">Blogs</a>
							 
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<!--end::Container-->

@endsection
