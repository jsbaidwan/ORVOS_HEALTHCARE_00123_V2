@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="flex justify-center">
        <div class="w-full max-w-md">
            <div class="bg-white shadow-md rounded-lg p-6">
                <h2 class="text-2xl font-semibold mb-6 text-center">{{ __('Login') }}</h2>

                <form method="POST" action="{{ route('login') }}">
                    @csrf

                    <!-- Email Input -->
                    <div class="mb-4">
                        <label for="email" class="block text-gray-700 text-sm font-bold mb-2">{{ __('Email Address') }}</label>

                        <input id="email" type="email" name="email" value="{{ old('email') }}"
                            class="w-full px-3 py-2 border @error('email') border-red-500 @else border-gray-300 @enderror rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required autocomplete="email" autofocus placeholder="Enter email">

                        @error('email')
                            <p class="text-red-500 text-xs mt-2">
                                <strong>{{ $message }}</strong>
                            </p>
                        @enderror
                    </div>

                    <!-- Password Input -->
                    <div class="mb-4">
                        <label for="password" class="block text-gray-700 text-sm font-bold mb-2">{{ __('Password') }}</label>

                        <input id="password" type="password" name="password"
                            class="w-full px-3 py-2 border @error('password') border-red-500 @else border-gray-300 @enderror rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required autocomplete="current-password" placeholder="Enter password">

                        @error('password')
                            <p class="text-red-500 text-xs mt-2">
                                <strong>{{ $message }}</strong>
                            </p>
                        @enderror
                    </div>

                    <!-- Remember Me -->
                    <div class="mb-4 flex items-center">
                        <input type="checkbox" name="remember" id="remember" 
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                               {{ old('remember') ? 'checked' : '' }}>
                        <label for="remember" class="ml-2 block text-sm text-gray-900">
                            {{ __('Remember Me') }}
                        </label>
                    </div>

                    <!-- Login Button & Forgot Password Link -->
                    <div class="flex items-center justify-between">
                        <button type="submit"
                            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {{ __('Login') }}
                        </button>

                        @if (Route::has('password.request'))
                            <a class="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800"
                                href="{{ route('password.request') }}">
                                {{ __('Forgot Your Password?') }}
                            </a>
                        @endif
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
